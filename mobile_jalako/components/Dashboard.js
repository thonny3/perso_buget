import React, { useState, useEffect, useRef } from 'react';
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
import BottomNavigation from './BottomNavigation';
import AddFormScreen from './AddFormScreen';
import NotificationScreen from './NotificationScreen';
import ProfileScreen from './ProfileScreen';
import { dashboardService, authService } from '../services/apiService';

const Dashboard = ({ onLogout }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugVisible, setDebugVisible] = useState(false);
  const [logsVisible, setLogsVisible] = useState(false);
  const [addFormVisible, setAddFormVisible] = useState(false);
  const refreshPortefeuilleRef = useRef(null);
  const refreshRevenusRef = useRef(null);

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

  const handleBottomTabPress = (tabId) => {
    console.log('Bottom tab pressed:', tabId);
    switch (tabId) {
      case 'home':
        setCurrentScreen('dashboard');
        break;
      case 'budget':
        setCurrentScreen('budget');
        break;
      case 'add':
        setAddFormVisible(true);
        break;
      case 'notifications':
        setCurrentScreen('alertes');
        break;
      case 'profile':
        setCurrentScreen('profile');
        break;
      default:
        break;
    }
  };

  const handleNotificationPress = () => {
    console.log('Notifications pressed');
  };

  const handleSearchPress = () => {
    console.log('Search pressed');
  };

  const handleAddFormSuccess = (data) => {
    console.log('Add form success:', data);
    // Recharger les données si nécessaire
    if (currentScreen === 'portefeuille' && refreshPortefeuilleRef.current) {
      console.log('Rechargement des comptes...');
      refreshPortefeuilleRef.current();
    } else if (currentScreen === 'revenus' && refreshRevenusRef.current) {
      console.log('Rechargement des revenus...');
      refreshRevenusRef.current();
    }
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
      case 'dettes':
        return 'Dettes';
      case 'portefeuille':
        return 'Portefeuille';
      case 'investissements':
        return 'Investissements';
      case 'depenses':
        return 'Dépenses';
      case 'revenus':
        return 'Revenus';
      case 'transactions':
        return 'Transactions';
      case 'transferts':
        return 'Transferts';
      case 'budget':
        return 'Budget';
      case 'objectifs':
        return 'Objectifs';
      case 'abonnements':
        return 'Abonnements';
      case 'alertes':
        return 'Alertes';
      case 'ia':
        return 'Insights IA';
      default:
        return 'Tableau de bord';
    }
  };

  const getActiveTabForCurrentScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return 'home';
      case 'budget':
        return 'budget';
      case 'alertes':
        return 'notifications';
      case 'profile':
        return 'profile';
      default:
        return 'home';
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
      case 'dettes':
        return <BudgetScreen onBack={() => setCurrentScreen('dashboard')} />; // Temporaire, à remplacer par DettesScreen
      case 'portefeuille':
        return <PortefeuilleScreen 
          onBack={() => setCurrentScreen('dashboard')} 
          onRefreshCallback={(callback) => refreshPortefeuilleRef.current = callback}
        />;
      case 'investissements':
        return <BudgetScreen onBack={() => setCurrentScreen('dashboard')} />; // Temporaire, à remplacer par InvestissementsScreen
      case 'depenses':
        return <DepensesScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'revenus':
        return <RevenusScreen 
          onBack={() => setCurrentScreen('dashboard')} 
          onRefreshCallback={(callback) => refreshRevenusRef.current = callback}
        />;
      case 'transactions':
        return <TransactionsScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'transferts':
        return <TransactionsScreen onBack={() => setCurrentScreen('dashboard')} />; // Temporaire, à remplacer par TransfertsScreen
      case 'budget':
        return <BudgetScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'objectifs':
        return <BudgetScreen onBack={() => setCurrentScreen('dashboard')} />; // Temporaire, à remplacer par ObjectifsScreen
      case 'abonnements':
        return <BudgetScreen onBack={() => setCurrentScreen('dashboard')} />; // Temporaire, à remplacer par AbonnementsScreen
      case 'alertes':
        return <NotificationScreen onBack={() => setCurrentScreen('dashboard')} />
      case 'profile':
        return <ProfileScreen onBack={() => setCurrentScreen('dashboard')} onLogout={handleLogout} />
      case 'ia':
        return <BudgetScreen onBack={() => setCurrentScreen('dashboard')} />; // Temporaire, à remplacer par IAScreen
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

      {/* Add Form Screen */}
      <AddFormScreen
        visible={addFormVisible}
        onClose={() => setAddFormVisible(false)}
        currentScreen={currentScreen}
        onSuccess={handleAddFormSuccess}
      />

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={getActiveTabForCurrentScreen()}
        onTabPress={handleBottomTabPress}
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
