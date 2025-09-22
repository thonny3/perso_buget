import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal } from 'react-native';

const LogViewer = ({ visible, onClose }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (visible) {
      // Capturer les logs de la console
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      console.log = (...args) => {
        originalLog(...args);
        addLog('LOG', args.join(' '));
      };

      console.error = (...args) => {
        originalError(...args);
        addLog('ERROR', args.join(' '));
      };

      console.warn = (...args) => {
        originalWarn(...args);
        addLog('WARN', args.join(' '));
      };

      return () => {
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
      };
    }
  }, [visible]);

  const addLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), { type, message, timestamp }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'ERROR': return '#ef4444';
      case 'WARN': return '#f59e0b';
      case 'LOG': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'ERROR': return '❌';
      case 'WARN': return '⚠️';
      case 'LOG': return '📝';
      default: return 'ℹ️';
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📋 Logs de l'Application</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={clearLogs} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Effacer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.logContainer} showsVerticalScrollIndicator={true}>
          {logs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucun log pour le moment</Text>
              <Text style={styles.emptySubtext}>Les logs apparaîtront ici en temps réel</Text>
            </View>
          ) : (
            logs.map((log, index) => (
              <View key={index} style={styles.logItem}>
                <View style={styles.logHeader}>
                  <Text style={styles.logIcon}>{getLogIcon(log.type)}</Text>
                  <Text style={[styles.logType, { color: getLogColor(log.type) }]}>
                    {log.type}
                  </Text>
                  <Text style={styles.logTimestamp}>{log.timestamp}</Text>
                </View>
                <Text style={styles.logMessage}>{log.message}</Text>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {logs.length} log{logs.length > 1 ? 's' : ''} affiché{logs.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#4b5563',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f9fafb',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '700',
  },
  logContainer: {
    flex: 1,
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  logItem: {
    backgroundColor: '#374151',
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4b5563',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  logType: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
  },
  logTimestamp: {
    fontSize: 10,
    color: '#9ca3af',
    marginLeft: 'auto',
  },
  logMessage: {
    fontSize: 12,
    color: '#f9fafb',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#374151',
    borderTopWidth: 1,
    borderTopColor: '#4b5563',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default LogViewer;
