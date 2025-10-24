import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import DashboardStats from './DashboardStats';
import DashboardContent from './DashboardContent';
import DashboardCharts from './DashboardCharts';
import PortefeuilleScreen from './screens/PortefeuilleScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import BudgetScreen from './screens/BudgetScreen';
import DepensesScreen from './screens/DepensesScreen';
import RevenusScreen from './screens/RevenusScreen';
import AnimatedScreen from './AnimatedScreen';
import ConnectionDebugger from './ConnectionDebugger';
import LogViewer from './LogViewer';
import { dashboardService, authService } from '../services/apiService';

const Dashboard = ({ onLogout }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugVisible, setDebugVisible] = useState(false);
  const [logsVisible, setLogsVisible] = useState(false);

  const handleMenuPress = () => {
    setSidebarVisible(true);
  };

  const handleSidebarClose = () => {
    setSidebarVisible(false);
  };

  const handleNavigate = (screenId) => {
    setCurrentScreen(screenId);
    setSidebarVisible(false);
    console.log('Navigate to:', screenId);
  };

  const handleNotificationPress = () => {
    console.log('Notifications pressed');
  };

  const handleSearchPress = () => {
    console.log('Search pressed');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      onLogout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      onLogout(); // Déconnecter quand même
    }
  };

  // Charger les données utilisateur au montage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const result = await authService.verifyToken();
        if (result.success) {
          setUserData(result.data.user);
        } else {
          onLogout();
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        onLogout();
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [onLogout]);

  const getTitleForScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return 'Tableau de bord';
      case 'portefeuille':
        return '';
      case 'transactions':
        return '';
      case 'budget':
        return '';
      case 'depenses':
        return '';
      case 'revenus':
        return '';
      case 'objectifs':
        return '';
      case 'transferts':
        return '';
      case 'abonnements':
        return '';
      default:
        return '';
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <>
            <DashboardStats />
            <DashboardCharts />
            <DashboardContent />
          </>
        );
      case 'portefeuille':
        return <PortefeuilleScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'transactions':
        return <TransactionsScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'budget':
        return <BudgetScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'depenses':
        return <DepensesScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'revenus':
        return <RevenusScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'objectifs':
        return <BudgetScreen />; // Temporaire, à remplacer par ObjectifsScreen
      case 'transferts':
        return <TransactionsScreen />; // Temporaire, à remplacer par TransfertsScreen
      case 'abonnements':
        return <BudgetScreen />; // Temporaire, à remplacer par AbonnementsScreen
      default:
        return (
          <>
            <DashboardStats />
            <DashboardCharts />
            <DashboardContent />
          </>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentScreen === 'dashboard' && (
        <DashboardHeader
          onMenuPress={handleMenuPress}
          onNotificationPress={handleNotificationPress}
          onSearchPress={handleSearchPress}
          userName={userData?.nom || userData?.prenom || 'Utilisateur'}
          title={getTitleForScreen()}
        />
      )}
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <AnimatedScreen isActive={true}>
          {renderCurrentScreen()}
        </AnimatedScreen>
      </ScrollView>
      
      <DashboardSidebar
        isVisible={sidebarVisible}
        onClose={handleSidebarClose}
        onNavigate={handleNavigate}
        currentScreen={currentScreen}
        onLogout={handleLogout}
      />

      {/* Boutons de debug (visible seulement en développement) */}
      {__DEV__ && (
        <View style={styles.debugButtons}>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => setDebugVisible(true)}
          >
            <Text style={styles.debugButtonText}>🔧 Debug</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.debugButton, { backgroundColor: '#3b82f6' }]}
            onPress={() => setLogsVisible(true)}
          >
            <Text style={styles.debugButtonText}>📋 Logs</Text>
          </TouchableOpacity>
        </View>
      )}

      <ConnectionDebugger
        visible={debugVisible}
        onClose={() => setDebugVisible(false)}
      />

      <LogViewer
        visible={logsVisible}
        onClose={() => setLogsVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  debugButtons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    gap: 8,
  },
  debugButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Dashboard;
