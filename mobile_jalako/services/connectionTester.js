import { Platform } from 'react-native';

// URLs à tester pour Android
const ANDROID_URLS = [
  'http://192.168.1.28:8081/api',  // Serveur backend actuel
  'http://10.0.2.2:8081/api',       // Émulateur Android standard
  'http://localhost:8081/api',       // Alternative locale
  'http://127.0.0.1:8081/api',      // Alternative locale
];

// URLs à tester pour iOS
const IOS_URLS = [
  'http://192.168.1.28:8081/api',  // Serveur backend actuel
  'http://localhost:8081/api',       // Port 8081
  'http://127.0.0.1:8081/api',      // Port 8081
];

// Test de connectivité pour une URL donnée
const testUrl = async (url, timeout = 5000) => {
  try {
    console.log(`🔍 Test de connectivité: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log(`✅ URL fonctionnelle: ${url}`);
      return { success: true, url, status: response.status };
    } else {
      console.log(`⚠️ URL répond mais erreur: ${url} (${response.status})`);
      return { success: false, url, status: response.status, error: 'HTTP_ERROR' };
    }
  } catch (error) {
    console.log(`❌ URL échouée: ${url} - ${error.message}`);
    return { 
      success: false, 
      url, 
      error: error.message,
      code: error.code || 'UNKNOWN'
    };
  }
};

// Test de toutes les URLs disponibles
export const testAllUrls = async () => {
  console.log('🚀 Démarrage du test de connectivité...');
  console.log(`📱 Plateforme: ${Platform.OS}`);
  
  const urlsToTest = Platform.OS === 'android' ? ANDROID_URLS : IOS_URLS;
  const results = [];
  
  for (const url of urlsToTest) {
    const result = await testUrl(url);
    results.push(result);
    
    // Si on trouve une URL qui fonctionne, on peut s'arrêter
    if (result.success) {
      console.log(`🎉 URL fonctionnelle trouvée: ${url}`);
      break;
    }
  }
  
  const workingUrl = results.find(r => r.success);
  
  if (workingUrl) {
    console.log(`✅ Connectivité réussie avec: ${workingUrl.url}`);
    return {
      success: true,
      workingUrl: workingUrl.url,
      allResults: results
    };
  } else {
    console.log('❌ Aucune URL fonctionnelle trouvée');
    return {
      success: false,
      allResults: results,
      suggestions: [
        'Vérifiez que le serveur backend est démarré sur le port 8081',
        'Vérifiez que le port 8081 est ouvert',
        'Essayez de redémarrer l\'émulateur',
        'Vérifiez votre configuration réseau'
      ]
    };
  }
};

// Obtenir l'IP locale de la machine
export const getLocalIP = async () => {
  try {
    // Cette méthode ne fonctionne que sur certaines plateformes
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.log('❌ Impossible d\'obtenir l\'IP locale:', error.message);
    return null;
  }
};

// Test rapide de connectivité
export const quickConnectivityTest = async () => {
  console.log('⚡ Test rapide de connectivité...');
  
  const baseUrl = 'http://192.168.1.28:8081/api';
  
  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      timeout: 3000,
    });
    
    if (response.ok) {
      console.log('✅ Connectivité rapide réussie');
      return { success: true, url: baseUrl };
    } else {
      console.log('⚠️ Connectivité rapide échouée:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log('❌ Connectivité rapide échouée:', error.message);
    return { success: false, error: error.message };
  }
};
