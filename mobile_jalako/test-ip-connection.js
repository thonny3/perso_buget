// Test de connectivité avec l'IP 192.168.1.28
const API_BASE_URL = 'http://192.168.1.28:8081/api';

const testConnection = async () => {
  console.log('🔍 Test de connectivité avec 192.168.1.28...');
  console.log('URL de base:', API_BASE_URL);
  
  try {
    // Test 1: Ping simple
    console.log('📡 Test 1: Ping...');
    const pingResponse = await fetch('http://192.168.1.28:8081/api/ping');
    const pingData = await pingResponse.json();
    console.log('✅ Ping réussi:', pingData);
    
    // Test 2: Health check
    console.log('📡 Test 2: Health check...');
    const healthResponse = await fetch('http://192.168.1.28:8081/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check réussi:', healthData);
    
    // Test 3: Auth test
    console.log('📡 Test 3: Auth test...');
    const authResponse = await fetch('http://192.168.1.28:8081/api/auth/test');
    const authData = await authResponse.json();
    console.log('✅ Auth test réussi:', authData);
    
    // Test 4: Login test
    console.log('📡 Test 4: Login test...');
    const loginResponse = await fetch('http://192.168.1.28:8081/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@jalako.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('📨 Réponse login:', loginData);
    
    if (loginResponse.ok) {
      console.log('✅ Login réussi');
    } else {
      console.log('⚠️ Login échoué (normal si credentials incorrects):', loginData);
    }
    
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

// Exécuter le test
testConnection();
