import { API_CONFIG } from '../config/apiConfig';

// Test de connectivité réseau
export const testNetworkConnectivity = async () => {
  console.log('🌐 Test de connectivité réseau...');
  
  try {
    // Test 1: Ping simple
    console.log('📡 Test 1: Ping du serveur...');
    const pingResponse = await fetch(`${API_CONFIG.BASE_URL}/ping`, {
      method: 'GET',
      timeout: 5000,
    });
    
    if (pingResponse.ok) {
      console.log('✅ Ping réussi');
    } else {
      console.log('⚠️ Ping échoué:', pingResponse.status);
    }
  } catch (error) {
    console.log('❌ Erreur de ping:', error.message);
  }

  try {
    // Test 2: Health check
    console.log('📡 Test 2: Health check...');
    const healthResponse = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      timeout: 5000,
    });
    
    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log('✅ Health check réussi:', data);
    } else {
      console.log('⚠️ Health check échoué:', healthResponse.status);
    }
  } catch (error) {
    console.log('❌ Erreur health check:', error.message);
  }

  try {
    // Test 3: Test de l'endpoint d'auth
    console.log('📡 Test 3: Test endpoint auth...');
    const authResponse = await fetch(`${API_CONFIG.BASE_URL}/auth/test`, {
      method: 'GET',
      timeout: 5000,
    });
    
    console.log('📊 Status auth endpoint:', authResponse.status);
  } catch (error) {
    console.log('❌ Erreur auth endpoint:', error.message);
  }
};

// Test de résolution DNS
export const testDNSResolution = async () => {
  console.log('🔍 Test de résolution DNS...');
  
  const baseUrl = API_CONFIG.BASE_URL;
  const hostname = baseUrl.replace(/^https?:\/\//, '').split('/')[0];
  
  console.log('🌐 Hostname à résoudre:', hostname);
  console.log('🔗 URL complète:', baseUrl);
  
  try {
    const response = await fetch(baseUrl, {
      method: 'HEAD',
      timeout: 10000,
    });
    
    console.log('✅ DNS résolu avec succès');
    console.log('📊 Status:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
  } catch (error) {
    console.log('❌ Erreur de résolution DNS:', error.message);
    console.log('🔍 Code d\'erreur:', error.code);
    console.log('🔍 Type d\'erreur:', error.name);
  }
};

// Test complet de connectivité
export const runFullConnectivityTest = async () => {
  console.log('🚀 Démarrage du test de connectivité complet...');
  console.log('📋 Configuration actuelle:', {
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    platform: require('react-native').Platform.OS
  });
  
  await testDNSResolution();
  await testNetworkConnectivity();
  
  console.log('🏁 Test de connectivité terminé');
};
