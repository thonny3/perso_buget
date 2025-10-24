import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { API_CONFIG, debugApiConfig } from '../config/apiConfig';
import { authService } from '../services/apiService';

const ConnectionDebugger = ({ visible, onClose }) => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test, status, message, data = null) => {
    const result = {
      id: Date.now(),
      test,
      status, // 'success', 'error', 'warning'
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev]);
  };

  const runConnectivityTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    addResult('Configuration', 'info', 'Début des tests de connectivité');
    
    // Test 1: Configuration API
    try {
      debugApiConfig();
      addResult('Configuration API', 'success', `URL: ${API_CONFIG.BASE_URL}`);
    } catch (error) {
      addResult('Configuration API', 'error', `Erreur: ${error.message}`);
    }

    // Test 2: Ping simple
    try {
      const pingUrl = API_CONFIG.BASE_URL.replace('/api', '') + '/api/ping';
      addResult('Ping Test', 'info', `Test: ${pingUrl}`);
      
      const response = await fetch(pingUrl, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult('Ping Test', 'success', 'Serveur accessible', data);
      } else {
        addResult('Ping Test', 'error', `Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      addResult('Ping Test', 'error', `Erreur réseau: ${error.message}`);
    }

    // Test 3: Health check
    try {
      const healthUrl = API_CONFIG.BASE_URL.replace('/api', '') + '/api/health';
      addResult('Health Check', 'info', `Test: ${healthUrl}`);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult('Health Check', 'success', 'Serveur en bonne santé', data);
      } else {
        addResult('Health Check', 'error', `Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      addResult('Health Check', 'error', `Erreur réseau: ${error.message}`);
    }

    // Test 4: Auth endpoint
    try {
      const authUrl = API_CONFIG.BASE_URL + '/auth/test';
      addResult('Auth Test', 'info', `Test: ${authUrl}`);
      
      const response = await fetch(authUrl, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult('Auth Test', 'success', 'Endpoint auth accessible', data);
      } else {
        addResult('Auth Test', 'error', `Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      addResult('Auth Test', 'error', `Erreur réseau: ${error.message}`);
    }

    // Test 5: Login test (avec des credentials de test)
    try {
      const loginUrl = API_CONFIG.BASE_URL + '/auth/login';
      addResult('Login Test', 'info', `Test: ${loginUrl}`);
      
      const testCredentials = {
        email: 'test@example.com',
        password: 'testpassword'
      };
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCredentials),
        timeout: 10000
      });
      
      const data = await response.json();
      
      if (response.ok) {
        addResult('Login Test', 'success', 'Login réussi (utilisateur test existe)', data);
      } else if (response.status === 404) {
        addResult('Login Test', 'warning', 'Login échoué - utilisateur test n\'existe pas (normal)', data);
      } else {
        addResult('Login Test', 'error', `Erreur login: ${response.status}`, data);
      }
    } catch (error) {
      addResult('Login Test', 'error', `Erreur réseau: ${error.message}`);
    }

    // Test 6: Test avec authService
    try {
      addResult('AuthService Test', 'info', 'Test du service d\'authentification');
      
      const result = await authService.login({
        email: 'test@example.com',
        password: 'testpassword'
      });
      
      if (result.success) {
        addResult('AuthService Test', 'success', 'AuthService fonctionne', result);
      } else {
        addResult('AuthService Test', 'warning', 'AuthService répond mais login échoué (normal)', result);
      }
    } catch (error) {
      addResult('AuthService Test', 'error', `Erreur AuthService: ${error.message}`);
    }

    setIsRunning(false);
    addResult('Tests', 'info', 'Tous les tests terminés');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'info': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🔍 Debug Connexion</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity 
            style={[styles.button, isRunning && styles.buttonDisabled]} 
            onPress={runConnectivityTests}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>
              {isRunning ? '🔄 Test en cours...' : '🚀 Lancer les tests'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
            <Text style={styles.clearText}>🗑️ Effacer</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.results}>
          {testResults.map((result) => (
            <View key={result.id} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultIcon}>{getStatusIcon(result.status)}</Text>
                <Text style={styles.resultTest}>{result.test}</Text>
                <Text style={styles.resultTime}>{result.timestamp}</Text>
              </View>
              <Text style={[styles.resultMessage, { color: getStatusColor(result.status) }]}>
                {result.message}
              </Text>
              {result.data && (
                <Text style={styles.resultData}>
                  {JSON.stringify(result.data, null, 2)}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: '#6B7280',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearText: {
    color: '#fff',
    fontWeight: '600',
  },
  results: {
    flex: 1,
  },
  resultItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E5E7EB',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  resultTest: {
    flex: 1,
    fontWeight: '600',
    color: '#1F2937',
  },
  resultTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  resultMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  resultData: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 4,
  },
});

export default ConnectionDebugger;