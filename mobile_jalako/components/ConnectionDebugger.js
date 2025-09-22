import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { API_CONFIG } from '../config/apiConfig';
import { authService } from '../services/apiService';
import { runFullConnectivityTest } from '../utils/networkTest';
import { testAllUrls, quickConnectivityTest } from '../services/connectionTester';

const ConnectionDebugger = ({ visible, onClose }) => {
  const [connectionStatus, setConnectionStatus] = useState('Vérification...');
  const [apiUrl, setApiUrl] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [urlTestResults, setUrlTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (visible) {
      setApiUrl(API_CONFIG.BASE_URL);
      testConnection();
    }
  }, [visible]);

  const testConnection = async () => {
    try {
      setConnectionStatus('Test de connexion...');
      setTestResult('Démarrage des tests...');
      setIsTesting(true);
      
      // Test rapide d'abord
      const quickTest = await quickConnectivityTest();
      if (quickTest.success) {
        setConnectionStatus('✅ Connexion rapide réussie');
        setTestResult(`URL fonctionnelle: ${quickTest.url}`);
        setIsTesting(false);
        return;
      }
      
      // Si le test rapide échoue, tester toutes les URLs
      setConnectionStatus('Test de toutes les URLs...');
      const allResults = await testAllUrls();
      
      if (allResults.success) {
        setConnectionStatus('✅ URL fonctionnelle trouvée');
        setTestResult(`URL recommandée: ${allResults.workingUrl}`);
        setUrlTestResults(allResults.allResults);
      } else {
        setConnectionStatus('❌ Aucune URL fonctionnelle');
        setTestResult('Toutes les URLs testées ont échoué');
        setUrlTestResults(allResults.allResults);
      }
      
      setIsTesting(false);
    } catch (error) {
      setConnectionStatus('❌ Erreur de test');
      setTestResult(`Erreur: ${error.message}`);
      setIsTesting(false);
    }
  };

  const testLogin = async () => {
    try {
      setConnectionStatus('Test de login...');
      
      const result = await authService.login({
        email: 'test@example.com',
        password: 'test123'
      });
      
      if (result.success) {
        setTestResult('✅ Login API fonctionne');
      } else {
        setTestResult(`❌ Login API: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Erreur Login: ${error.message}`);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🔧 Debug Connexion</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>URL API:</Text>
            <Text style={styles.value}>{apiUrl}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Statut:</Text>
            <Text style={styles.status}>{connectionStatus}</Text>
          </View>

          {testResult && (
            <View style={styles.section}>
              <Text style={styles.label}>Résultat du test:</Text>
              <Text style={styles.result}>{testResult}</Text>
            </View>
          )}

          {/* Résultats des tests d'URLs */}
          {urlTestResults.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.label}>📊 Résultats des tests d'URLs:</Text>
              <ScrollView style={styles.urlResultsList} showsVerticalScrollIndicator={false}>
                {urlTestResults.map((result, index) => (
                  <View key={index} style={styles.urlResultItem}>
                    <Text style={styles.urlResultIcon}>
                      {result.success ? '✅' : '❌'}
                    </Text>
                    <View style={styles.urlResultContent}>
                      <Text style={styles.urlResultUrl}>{result.url}</Text>
                      <Text style={styles.urlResultStatus}>
                        {result.success 
                          ? `Status: ${result.status}` 
                          : `Erreur: ${result.error || result.code}`
                        }
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.buttons}>
            <TouchableOpacity 
              onPress={testConnection} 
              style={[styles.button, isTesting && styles.buttonDisabled]}
              disabled={isTesting}
            >
              <Text style={styles.buttonText}>
                {isTesting ? '⏳ Test en cours...' : '🔄 Tester Connexion'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={testLogin} style={styles.button}>
              <Text style={styles.buttonText}>🔐 Tester Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.help}>
            <Text style={styles.helpTitle}>💡 Solutions possibles:</Text>
            <Text style={styles.helpText}>• Vérifiez que votre serveur backend est démarré</Text>
            <Text style={styles.helpText}>• Vérifiez l'URL dans config/apiConfig.js</Text>
            <Text style={styles.helpText}>• Pour Android: utilisez 10.0.2.2:3000</Text>
            <Text style={styles.helpText}>• Pour iOS: utilisez localhost:3000</Text>
            <Text style={styles.helpText}>• Pour device physique: utilisez votre IP locale</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: '#6b7280',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
  },
  result: {
    fontSize: 14,
    color: '#374151',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  help: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  urlResultsList: {
    maxHeight: 150,
    marginTop: 8,
  },
  urlResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 4,
  },
  urlResultIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  urlResultContent: {
    flex: 1,
  },
  urlResultUrl: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  urlResultStatus: {
    fontSize: 10,
    color: '#666',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ConnectionDebugger;
