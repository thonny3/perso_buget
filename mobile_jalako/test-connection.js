// Script de test de connectivité pour l'application mobile
import { API_CONFIG, debugApiConfig } from './config/apiConfig.js';

// Déboguer la configuration
debugApiConfig();

// Test de connectivité simple
const testConnection = async () => {
  console.log('🔍 Test de connectivité...');
  console.log('URL de base:', API_CONFIG.BASE_URL);
  
  try {
    // Test 1: Ping simple
    console.log('📡 Test 1: Ping...');
    const pingResponse = await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/api/ping`);
    const pingData = await pingResponse.json();
    console.log('✅ Ping réussi:', pingData);
    
    // Test 2: Health check
    console.log('📡 Test 2: Health check...');
    const healthResponse = await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check réussi:', healthData);
    
    // Test 3: Auth test (sans token)
    console.log('📡 Test 3: Auth test...');
    const authResponse = await fetch(`${API_CONFIG.BASE_URL}/auth/test`);
    const authData = await authResponse.json();
    console.log('✅ Auth test réussi:', authData);
    
    console.log('🎉 Tous les tests de connectivité ont réussi !');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur de connectivité:', error);
    console.error('Détails:', {
      message: error.message,
      code: error.code,
      cause: error.cause
    });
    return false;
  }
};

// Test de login
const testLogin = async () => {
  console.log('🔐 Test de login...');
  
  const testCredentials = {
    email: 'test@example.com',
    password: 'password123'
  };
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCredentials)
    });
    
    const data = await response.json();
    console.log('📨 Réponse login:', data);
    
    if (response.ok) {
      console.log('✅ Login réussi');
    } else {
      console.log('⚠️ Login échoué (normal si utilisateur n\'existe pas):', data);
    }
    
    return response.ok;
    
  } catch (error) {
    console.error('❌ Erreur lors du test de login:', error);
    return false;
  }
};

// Exécuter les tests
const runTests = async () => {
  console.log('🚀 Début des tests de connectivité...');
  
  const connectionOk = await testConnection();
  
  if (connectionOk) {
    await testLogin();
  }
  
  console.log('🏁 Tests terminés');
};

// Exporter pour utilisation
export { testConnection, testLogin, runTests };

// Exécuter automatiquement si ce script est lancé directement
if (typeof window === 'undefined') {
  runTests();
}
