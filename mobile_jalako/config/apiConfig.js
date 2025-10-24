import { Platform } from 'react-native';

// Configuration des URLs API selon la plateforme
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Mode développement
    if (Platform.OS === 'android') {
      // Pour Android Emulator - essayer plusieurs options
      const androidUrls = [
        'http://192.168.1.28:8081/api',  // Serveur backend actuel (port 8081)
      
      ];
      
      // Retourner la première URL (on testera la connectivité plus tard)
      return androidUrls[0];
    } else if (Platform.OS === 'ios') {
      // Pour iOS Simulator
      return 'http://192.168.1.28:8081/api';
    } else {
      // Pour web ou autres plateformes
      return 'http://192.168.1.28:8081/api';
    }
  } else {
    // Mode production - remplacez par votre URL de production
    return 'http://192.168.1.28:8081/api';
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
