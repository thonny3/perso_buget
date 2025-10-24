import { Platform } from 'react-native';

// Configuration des URLs API selon la plateforme
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Mode développement - utiliser l'IP du réseau local
    if (Platform.OS === 'android') {
      // Pour Android (émulateur ou appareil physique)
      return 'http://192.168.1.28:3002/api';
    } else if (Platform.OS === 'ios') {
      // Pour iOS Simulator ou appareil physique
      return 'http://192.168.1.28:3002/api';
    } else {
      // Pour web ou autres plateformes
      return 'http://192.168.1.28:3002/api';
    }
  } else {
    // Mode production - remplacez par votre URL de production
    return 'http://192.168.1.28:3002/api';
  }
};

// Configuration de l'API
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// URLs spécifiques pour les endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_TRANSACTIONS: '/transactions/recent',
    MONTHLY_BUDGET: '/budget/monthly',
    SAVINGS_GOALS: '/goals/savings',
  },
  ACCOUNTS: {
    LIST: '/accounts',
    CREATE: '/accounts',
    UPDATE: (id) => `/accounts/${id}`,
    DELETE: (id) => `/accounts/${id}`,
  },
  TRANSACTIONS: {
    LIST: '/transactions',
    CREATE: '/transactions',
    UPDATE: (id) => `/transactions/${id}`,
    DELETE: (id) => `/transactions/${id}`,
  },
  SHARED_ACCOUNTS: {
    LIST_BY_USER: (id_user) => `/comptes-partages/user/${id_user}`,
    LIST_BY_ACCOUNT: (id_compte) => `/comptes-partages/compte/${id_compte}`,
    CREATE: '/comptes-partages',
    UPDATE: (id) => `/comptes-partages/${id}`,
    DELETE: (id) => `/comptes-partages/${id}`,
  },
};

// Fonction pour obtenir l'URL complète
export const getFullUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Fonction pour déboguer la configuration
export const debugApiConfig = () => {
  console.log('🔧 Configuration API:');
  console.log('Platform:', Platform.OS);
  console.log('Base URL:', API_CONFIG.BASE_URL);
  console.log('Mode:', __DEV__ ? 'Development' : 'Production');
};
