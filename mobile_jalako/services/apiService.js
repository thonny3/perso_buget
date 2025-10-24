import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, debugApiConfig } from '../config/apiConfig';

// Déboguer la configuration API
debugApiConfig();

// Créer une instance axios avec configuration par défaut
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  async (config) => {
    console.log('🚀 API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
    
    const token = await getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token ajouté à la requête');
    } else {
      console.log('⚠️ Aucun token trouvé');
    }
    return config;
  },
  (error) => {
    console.log('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.log('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      code: error.code,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      console.log('🔐 Token expiré, déconnexion...');
      await clearStoredToken();
    }
    
    return Promise.reject(error);
  }
);

// Fonctions utilitaires pour le stockage local
const getStoredToken = async () => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return null;
  }
};

const setStoredToken = async (token) => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du token:', error);
  }
};

const clearStoredToken = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.error('Erreur lors de la suppression du token:', error);
  }
};

// Services d'authentification
export const authService = {
  // Connexion
  login: async (credentials) => {
    console.log('🔐 Tentative de connexion avec:', { email: credentials.email });
    
    try {
      console.log('📡 Envoi de la requête de login...');
      const response = await apiClient.post('/auth/login', credentials);
      
      console.log('✅ Réponse de login reçue:', response.data);
      const { token, user } = response.data;
      
      // Stocker le token
      if (token) {
        console.log('💾 Sauvegarde du token...');
        await setStoredToken(token);
        console.log('✅ Token sauvegardé');
      } else {
        console.log('⚠️ Aucun token dans la réponse');
      }
      
      return { success: true, data: { token, user } };
    } catch (error) {
      console.log('❌ Erreur de login:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erreur de connexion',
      };
    }
  },

  // Inscription
  register: async (userData) => {
    console.log('📝 Tentative d\'inscription avec:', { email: userData.email });
    
    try {
      console.log('📡 Envoi de la requête d\'inscription...');
      const response = await apiClient.post('/auth/register', userData);
      
      console.log('✅ Réponse d\'inscription reçue:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.log('❌ Erreur d\'inscription:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erreur d\'inscription',
      };
    }
  },

  // Déconnexion
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      await clearStoredToken();
    }
  },

  // Vérifier le token
  verifyToken: async () => {
    try {
      const response = await apiClient.get('/auth/verify');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: 'Token invalide' };
    }
  },

  // Obtenir les informations de l'utilisateur connecté
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/verify');
      return { success: true, data: response.data.user };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la récupération des informations utilisateur' };
    }
  },
};

// Services mot de passe oublié / réinitialisation
export const forgotPasswordService = {
  // Envoyer un email avec lien de réinitialisation
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Impossible d\'envoyer l\'email',
      };
    }
  },

  // Réinitialiser avec token (depuis email)
  resetPassword: async (token, newPassword) => {
    try {
      const response = await apiClient.post('/auth/reset-password', { token, newPassword });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Réinitialisation impossible',
      };
    }
  },

  // Demander un code OTP
  requestOtp: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password-otp', { email });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Impossible d\'envoyer le code',
      };
    }
  },

  // Réinitialiser avec OTP
  resetWithOtp: async (email, otp, newPassword) => {
    try {
      const response = await apiClient.post('/auth/reset-password-otp', { email, otp, newPassword });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Code invalide ou expiré',
      };
    }
  },
};

// Services des données du dashboard
export const dashboardService = {
  // Obtenir les statistiques complètes du dashboard
  getStats: async () => {
    try {
      const response = await apiClient.get('/dashboard/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des statistiques',
      };
    }
  },

  // Obtenir toutes les données du dashboard
  getDashboardData: async () => {
    try {
      const response = await apiClient.get('/dashboard/data');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des données du dashboard',
      };
    }
  },

  // Obtenir le contenu du dashboard (graphiques, transactions, etc.)
  getDashboardContent: async () => {
    try {
      const response = await apiClient.get('/dashboard/content');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement du contenu du dashboard',
      };
    }
  },

  // Obtenir le solde total de tous les comptes
  getTotalBalance: async () => {
    try {
      const response = await apiClient.get('/comptes/mycompte/user');
      if (response.data && Array.isArray(response.data)) {
        const totalBalance = response.data.reduce((sum, account) => sum + (parseFloat(account.solde) || 0), 0);
        return { success: true, data: { totalBalance } };
      }
      return { success: true, data: { totalBalance: 0 } };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement du solde total',
      };
    }
  },

  // Obtenir les revenus du mois
  getMonthlyRevenues: async (month = null) => {
    try {
      const params = month ? `?month=${month}` : '';
      const response = await apiClient.get(`/revenus/monthly${params}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des revenus',
      };
    }
  },

  // Obtenir les dépenses du mois
  getMonthlyExpenses: async (month = null) => {
    try {
      const params = month ? `?month=${month}` : '';
      const response = await apiClient.get(`/depenses/monthly${params}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des dépenses',
      };
    }
  },

  // Obtenir les objectifs atteints
  getAchievedGoals: async () => {
    try {
      const response = await apiClient.get('/objectifs/achieved');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des objectifs atteints',
      };
    }
  },

  // Obtenir les dépenses par catégorie pour une période
  getExpensesByCategory: async (period = 'octobre-2025') => {
    try {
      const response = await apiClient.get(`/depenses/by-category?period=${period}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des dépenses par catégorie',
      };
    }
  },

  // Obtenir les transactions récentes
  getRecentTransactions: async (limit = 10) => {
    try {
      const response = await apiClient.get(`/transactions/recent?limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des transactions',
      };
    }
  },

  // Obtenir le budget mensuel
  getMonthlyBudget: async () => {
    try {
      const response = await apiClient.get('/budget/monthly');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement du budget',
      };
    }
  },

  // Obtenir les objectifs d'épargne
  getSavingsGoals: async () => {
    try {
      const response = await apiClient.get('/objectifs');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des objectifs',
      };
    }
  },

  // Obtenir le résumé du dashboard (méthode principale)
  getSummary: async () => {
    try {
      const response = await apiClient.get('/dashboard/summary');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement du résumé:', error);
      return {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        goalsAchieved: 0,
        revenueData: [],
        expenseCategories: [],
        recentTransactions: []
      };
    }
  },

  // Obtenir les données complètes du dashboard
  getDashboardData: async () => {
    try {
      const [
        totalBalanceResult,
        monthlyRevenuesResult,
        monthlyExpensesResult,
        achievedGoalsResult,
        expensesByCategoryResult,
        recentTransactionsResult,
        monthlyBudgetResult,
        savingsGoalsResult
      ] = await Promise.all([
        dashboardService.getTotalBalance(),
        dashboardService.getMonthlyRevenues(),
        dashboardService.getMonthlyExpenses(),
        dashboardService.getAchievedGoals(),
        dashboardService.getExpensesByCategory(),
        dashboardService.getRecentTransactions(5),
        dashboardService.getMonthlyBudget(),
        dashboardService.getSavingsGoals()
      ]);

      return {
        success: true,
        data: {
          totalBalance: totalBalanceResult.data?.totalBalance || 0,
          monthlyRevenues: monthlyRevenuesResult.data || [],
          monthlyExpenses: monthlyExpensesResult.data || [],
          achievedGoals: achievedGoalsResult.data || [],
          expensesByCategory: expensesByCategoryResult.data || [],
          recentTransactions: recentTransactionsResult.data || [],
          monthlyBudget: monthlyBudgetResult.data || [],
          savingsGoals: savingsGoalsResult.data || []
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Erreur lors du chargement des données du dashboard',
      };
    }
  },
};

// Services des comptes
export const accountService = {
  // Obtenir tous les comptes de l'utilisateur authentifié
  getMyAccounts: async () => {
    try {
      const response = await apiClient.get('/comptes/mycompte/user');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des comptes',
      };
    }
  },

  // Obtenir tous les comptes
  getAccounts: async () => {
    try {
      const response = await apiClient.get('/comptes');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des comptes',
      };
    }
  },

  // Obtenir un compte par ID
  getAccountById: async (id) => {
    try {
      const response = await apiClient.get(`/comptes/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement du compte',
      };
    }
  },

  // Créer un nouveau compte
  createAccount: async (accountData) => {
    try {
      const response = await apiClient.post('/comptes', accountData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la création du compte',
      };
    }
  },

  // Mettre à jour un compte
  updateAccount: async (id, accountData) => {
    try {
      const response = await apiClient.put(`/comptes/${id}`, accountData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la mise à jour du compte',
      };
    }
  },

  // Supprimer un compte
  deleteAccount: async (id) => {
    try {
      await apiClient.delete(`/comptes/${id}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la suppression du compte',
      };
    }
  },

  // Partager un compte
  shareAccount: async (id, shareData) => {
    try {
      const response = await apiClient.post(`/comptes-partages`, {
        id_compte: id,
        email: shareData.email,
        role: shareData.role
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du partage du compte',
      };
    }
  },

  // Obtenir les comptes partagés
  getSharedAccounts: async (id) => {
    try {
      const response = await apiClient.get(`/comptes-partages/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des comptes partagés',
      };
    }
  },
};

// Services des transactions
export const transactionService = {
  // Obtenir toutes les transactions
  getTransactions: async (filters = {}) => {
    try {
      const response = await apiClient.get('/transactions', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des transactions',
      };
    }
  },

  // Créer une nouvelle transaction
  createTransaction: async (transactionData) => {
    try {
      const response = await apiClient.post('/transactions', transactionData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la création de la transaction',
      };
    }
  },

  // Mettre à jour une transaction
  updateTransaction: async (id, transactionData) => {
    try {
      const response = await apiClient.put(`/transactions/${id}`, transactionData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la mise à jour de la transaction',
      };
    }
  },

  // Supprimer une transaction
  deleteTransaction: async (id) => {
    try {
      await apiClient.delete(`/transactions/${id}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la suppression de la transaction',
      };
    }
  },
};

// Services des revenus
export const revenuesService = {
  // Obtenir tous les revenus
  getRevenues: async () => {
    try {
      const response = await apiClient.get('/revenus');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des revenus',
      };
    }
  },

  // Créer un nouveau revenu
  createRevenue: async (revenueData) => {
    try {
      const response = await apiClient.post('/revenus', revenueData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la création du revenu',
      };
    }
  },

  // Mettre à jour un revenu
  updateRevenue: async (id, revenueData) => {
    try {
      const response = await apiClient.put(`/revenus/${id}`, revenueData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la mise à jour du revenu',
      };
    }
  },

  // Supprimer un revenu
  deleteRevenue: async (id) => {
    try {
      await apiClient.delete(`/revenus/${id}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la suppression du revenu',
      };
    }
  },

  // Obtenir un revenu par ID
  getRevenueById: async (id) => {
    try {
      const response = await apiClient.get(`/revenus/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement du revenu',
      };
    }
  },
};

// Services des catégories
export const categoryService = {
  // Obtenir les catégories de dépenses
  getCategoriesDepenses: async () => {
    try {
      const response = await apiClient.get('/categories/depenses');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des catégories de dépenses',
      };
    }
  },

  // Obtenir les catégories de revenus
  getCategoriesRevenus: async () => {
    try {
      const response = await apiClient.get('/categories/revenus');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des catégories de revenus',
      };
    }
  },

  // Obtenir toutes les catégories (dépenses par défaut pour le budget)
  getCategories: async () => {
    try {
      const response = await apiClient.get('/categories/depenses');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des catégories',
      };
    }
  },

  // Créer une nouvelle catégorie de dépense
  createCategoryDepense: async (categoryData) => {
    try {
      const response = await apiClient.post('/categories/depenses', categoryData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la création de la catégorie',
      };
    }
  },

  // Créer une nouvelle catégorie de revenu
  createCategoryRevenu: async (categoryData) => {
    try {
      const response = await apiClient.post('/categories/revenus', categoryData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la création de la catégorie',
      };
    }
  },
};

// Services des budgets
export const budgetService = {
  // Obtenir tous les budgets
  getAllBudgets: async () => {
    try {
      const response = await apiClient.get('/budgets');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des budgets',
      };
    }
  },

  // Obtenir un budget par ID
  getBudgetById: async (id) => {
    try {
      const response = await apiClient.get(`/budgets/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement du budget',
      };
    }
  },

  // Créer un nouveau budget
  createBudget: async (budgetData) => {
    try {
      const response = await apiClient.post('/budgets', budgetData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la création du budget',
      };
    }
  },

  // Mettre à jour un budget
  updateBudget: async (id, budgetData) => {
    try {
      const response = await apiClient.put(`/budgets/${id}`, budgetData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la mise à jour du budget',
      };
    }
  },

  // Supprimer un budget
  deleteBudget: async (id) => {
    try {
      await apiClient.delete(`/budgets/${id}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la suppression du budget',
      };
    }
  },

  // Obtenir le budget mensuel
  getMonthlyBudget: async (month) => {
    try {
      const response = await apiClient.get(`/budgets/monthly?month=${month}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement du budget mensuel',
      };
    }
  },
};

// Services des dépenses
export const depensesService = {
  // Obtenir toutes les dépenses
  getDepenses: async (filters = {}) => {
    try {
      const response = await apiClient.get('/depenses', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des dépenses',
      };
    }
  },

  // Créer une nouvelle dépense
  createDepense: async (depenseData) => {
    try {
      const response = await apiClient.post('/depenses', depenseData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la création de la dépense',
      };
    }
  },

  // Mettre à jour une dépense
  updateDepense: async (id, depenseData) => {
    try {
      const response = await apiClient.put(`/depenses/${id}`, depenseData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la mise à jour de la dépense',
      };
    }
  },

  // Supprimer une dépense
  deleteDepense: async (id) => {
    try {
      await apiClient.delete(`/depenses/${id}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la suppression de la dépense',
      };
    }
  },

  // Obtenir une dépense par ID
  getDepenseById: async (id) => {
    try {
      const response = await apiClient.get(`/depenses/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement de la dépense',
      };
    }
  },
};

export default apiClient;
