import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AnimatedSidebar from './AnimatedSidebar';

const DashboardSidebar = ({ isVisible, onClose, onNavigate, currentScreen, onLogout }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'home',
      description: 'Accueil'
    },
    {
      id: 'portefeuille',
      label: 'Portefeuille',
      icon: 'wallet',
      description: 'Mon portefeuille'
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: 'credit-card',
      description: 'Mes transactions'
    },
    {
      id: 'budget',
      label: 'Budget',
      icon: 'pie-chart',
      description: 'Gestion budget'
    },
    {
      id: 'depenses',
      label: 'Dépenses',
      icon: 'trending-down',
      description: 'Mes dépenses'
    },
    {
      id: 'revenus',
      label: 'Revenus',
      icon: 'trending-up',
      description: 'Mes revenus'
    },
    {
      id: 'objectifs',
      label: 'Objectifs',
      icon: 'target',
      description: 'Mes objectifs'
    },
    {
      id: 'transferts',
      label: 'Transferts',
      icon: 'arrow-left-right',
      description: 'Transférer et historique'
    },
    {
      id: 'abonnements',
      label: 'Abonnements',
      icon: 'refresh-cw',
      description: 'Mes abonnements'
    },
    {
      id: 'alertes',
      label: 'Alertes',
      icon: 'bell',
      description: 'Notifications'
    }
  ];

  const handleItemPress = (itemId) => {
    onNavigate(itemId);
    onClose();
  };

  return (
    <AnimatedSidebar isVisible={isVisible} onClose={onClose}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoText}>MyJalako</Text>
              <Text style={styles.logoSubtext}>Gestion financière</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Navigation</Text>
            {menuItems.slice(0, 5).map((item) => {
              const isActive = currentScreen === item.id;
              
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleItemPress(item.id)}
                  style={[styles.menuItem, isActive && styles.activeMenuItem]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIcon, isActive && styles.activeMenuIcon]}>
                    <Feather 
                      name={item.icon} 
                      size={20} 
                      color={isActive ? '#fff' : '#6b7280'} 
                    />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={[styles.menuLabel, isActive && styles.activeMenuLabel]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.menuDescription, isActive && styles.activeMenuDescription]}>
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Gestion</Text>
            {menuItems.slice(5, 8).map((item) => {
              const isActive = currentScreen === item.id;
              
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleItemPress(item.id)}
                  style={[styles.menuItem, isActive && styles.activeMenuItem]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIcon, isActive && styles.activeMenuIcon]}>
                    <Feather 
                      name={item.icon} 
                      size={20} 
                      color={isActive ? '#fff' : '#6b7280'} 
                    />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={[styles.menuLabel, isActive && styles.activeMenuLabel]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.menuDescription, isActive && styles.activeMenuDescription]}>
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Autres</Text>
            {menuItems.slice(8).map((item) => {
              const isActive = currentScreen === item.id;
              
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleItemPress(item.id)}
                  style={[styles.menuItem, isActive && styles.activeMenuItem]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIcon, isActive && styles.activeMenuIcon]}>
                    <Feather 
                      name={item.icon} 
                      size={20} 
                      color={isActive ? '#fff' : '#6b7280'} 
                    />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={[styles.menuLabel, isActive && styles.activeMenuLabel]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.menuDescription, isActive && styles.activeMenuDescription]}>
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Feather name="log-out" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
    </AnimatedSidebar>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
  },
  logoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#065f46',
  },
  logoSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  activeMenuItem: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activeMenuIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuItemText: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  activeMenuLabel: {
    color: '#fff',
  },
  menuDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  activeMenuDescription: {
    color: '#d1fae5',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 12,
  },
});

export default DashboardSidebar;
