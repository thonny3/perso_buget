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
import AbonnementsScreen from './screens/AbonnementsScreen';
import ObjectifsScreen from './screens/ObjectifsScreen';
import DepensesScreen from './screens/DepensesScreen';
import RevenusScreen from './screens/RevenusScreen';
import InvestissementsScreen from './screens/InvestissementsScreen';
import DettesScreen from './screens/DettesScreen';
import AnimatedScreen from './AnimatedScreen';
import BottomNavigation from './BottomNavigation';
import AddFormScreen from './AddFormScreen';
import EditFormScreen from './EditFormScreen';
import AddContributionScreen from './AddContributionScreen';
import ContributionsScreen from './ContributionsScreen';
import NotificationScreen from './NotificationScreen';
import ProfileScreen from './ProfileScreen';
import { dashboardService, authService } from '../services/apiService';
import { Feather } from '@expo/vector-icons';

const Dashboard = ({ onLogout }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editFormMode, setEditFormMode] = useState(null); // 'revenu' | 'budget'
  const [contribFormVisible, setContribFormVisible] = useState(false);
  const [contribParams, setContribParams] = useState(null);
  const [contribListVisible, setContribListVisible] = useState(false);
  const [contribListParams, setContribListParams] = useState(null);
  const refreshPortefeuilleRef = useRef(null);
  const refreshRevenusRef = useRef(null);
  const refreshDepensesRef = useRef(null);
  const refreshDettesRef = useRef(null);
  const refreshBudgetRef = useRef(null);
  const refreshObjectifsRef = useRef(null);

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

  const navigateFromObjectifs = (screen, params) => {
    if (screen === 'EditFormScreen') {
      handleEditFormOpen(params.objectifData, 'objectif');
    } else if (screen === 'AddContributionScreen') {
      setContribParams(params || {});
      setContribFormVisible(true);
    } else if (screen === 'AddFormScreen') {
      setCurrentScreen('objectifs');
      setAddFormVisible(true);
    } else if (screen === 'ContributionsScreen') {
      setContribListParams(params || {});
      setContribListVisible(true);
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
    } else if (currentScreen === 'depenses' && refreshDepensesRef.current) {
      console.log('Rechargement des dépenses...');
      refreshDepensesRef.current();
    } else if (currentScreen === 'dettes' && refreshDettesRef.current) {
      console.log('Rechargement des dettes...');
      refreshDettesRef.current();
    } else if (currentScreen === 'budget' && refreshBudgetRef.current) {
      console.log('Rechargement des budgets...');
      refreshBudgetRef.current();
    } else if (currentScreen === 'objectifs' && refreshObjectifsRef.current) {
      console.log('Rechargement des objectifs...');
      refreshObjectifsRef.current();
    }
    setAddFormVisible(false);
  };

  const handleEditFormOpen = (data, mode = 'revenu') => {
    console.log('Opening edit form with data:', data, 'mode:', mode);
    setEditFormMode(mode);
    setEditFormData(data);
    setEditFormVisible(true);
  };

  const handleEditFormClose = () => {
    setEditFormVisible(false);
    setEditFormData(null);
  };

  const handleEditFormSuccess = (data) => {
    console.log('Edit form success:', data);
    // Recharger les données si nécessaire
    if (editFormMode === 'revenu' && refreshRevenusRef.current) {
      console.log('Rechargement des revenus...');
      refreshRevenusRef.current();
    } else if (editFormMode === 'budget' && refreshBudgetRef.current) {
      console.log('Rechargement des budgets...');
      refreshBudgetRef.current();
    }
    handleEditFormClose();
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
      case 'ia':
        return 'chat';
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
        return <DettesScreen 
          onBack={() => setCurrentScreen('dashboard')} 
          onRefreshCallback={(callback) => refreshDettesRef.current = callback}
        />;
      case 'portefeuille':
        return <PortefeuilleScreen 
          onBack={() => setCurrentScreen('dashboard')} 
          onRefreshCallback={(callback) => refreshPortefeuilleRef.current = callback}
        />;
      case 'investissements':
        return <InvestissementsScreen 
          onBack={() => setCurrentScreen('dashboard')} 
          onRefreshCallback={() => {}}
          onAddPress={() => {
            setAddFormVisible(true);
            setCurrentScreen('investissements');
          }}
        />
      case 'depenses':
        return <DepensesScreen 
          onBack={() => setCurrentScreen('dashboard')} 
          onRefreshCallback={(callback) => refreshDepensesRef.current = callback}
        />;
      case 'revenus':
        return <RevenusScreen 
          onBack={() => setCurrentScreen('dashboard')} 
          onRefreshCallback={(callback) => refreshRevenusRef.current = callback}
          navigation={{
            navigate: (screen, params) => {
              if (screen === 'EditFormScreen') {
                handleEditFormOpen(params.revenuData);
              }
            },
            goBack: handleEditFormClose
          }}
        />;
      case 'transactions':
        return <TransactionsScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'transferts':
        return <TransactionsScreen onBack={() => setCurrentScreen('dashboard')} />; // Temporaire, à remplacer par TransfertsScreen
      case 'budget':
        return <BudgetScreen 
          onBack={() => setCurrentScreen('dashboard')} 
          onRefreshCallback={(callback) => (refreshBudgetRef.current = callback)}
          navigation={{
            navigate: (screen, params) => {
              if (screen === 'EditFormScreen') {
                handleEditFormOpen(params.budgetData, 'budget');
              }
            },
            goBack: handleEditFormClose,
          }}
        />;
      case 'objectifs':
        return <ObjectifsScreen 
          onBack={() => setCurrentScreen('dashboard')} 
          onRefreshCallback={(callback) => (refreshObjectifsRef.current = callback)}
          navigation={{
            navigate: navigateFromObjectifs,
            goBack: handleEditFormClose,
          }}
        />;
      case 'abonnements':
        return <AbonnementsScreen onBack={() => setCurrentScreen('dashboard')} />;
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

      

      {/* Add Form Screen */}
      <AddFormScreen
        visible={addFormVisible}
        onClose={() => setAddFormVisible(false)}
        currentScreen={currentScreen}
        onSuccess={handleAddFormSuccess}
      />

      {/* Edit Form Screen */}
      {editFormVisible && editFormData && (
        <EditFormScreen
          navigation={{
            goBack: handleEditFormClose
          }}
          route={{
            params: {
              revenuData: editFormMode === 'revenu' ? editFormData : undefined,
              budgetData: editFormMode === 'budget' ? editFormData : undefined,
              objectifData: editFormMode === 'objectif' ? editFormData : undefined,
              onSuccess: handleEditFormSuccess,
            }
          }}
        />
      )}

      {/* Add Contribution Screen */}
      {contribFormVisible && (
        <AddContributionScreen
          navigation={{
            goBack: () => setContribFormVisible(false),
          }}
          route={{ params: { ...contribParams } }}
        />
      )}

      {contribListVisible && (
        <ContributionsScreen
          navigation={{
            goBack: () => setContribListVisible(false),
          }}
          route={{ params: { ...contribListParams } }}
        />
      )}


      {/* Bouton flottant Chatbot */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.chatFab}
        onPress={() => setChatVisible(true)}
      >
        <Feather name="message-circle" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Panneau/Modal Chatbot */}
      {chatVisible && (
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Assistant IA</Text>
            <TouchableOpacity onPress={() => setChatVisible(false)} style={styles.chatClose}>
              <Feather name="x" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.chatBody}>
            <Text style={styles.chatHint}>
              Démarrez une conversation: "Analyse mes dépenses", "Prévois mon budget", ...
            </Text>
          </View>
        </View>
      )}

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
  chatFab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 20,
  },
  chatContainer: {
    position: 'absolute',
    right: 16,
    bottom: 160,
    left: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 30,
  },
  chatHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatTitle: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 16,
  },
  chatClose: {
    padding: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  chatBody: {
    padding: 16,
  },
  chatHint: {
    color: '#6b7280',
    fontSize: 14,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});

export default Dashboard;
