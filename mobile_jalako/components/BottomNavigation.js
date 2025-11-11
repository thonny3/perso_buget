import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';

const BottomNavigation = ({ activeTab, onTabPress }) => {
  const tabs = [
    {
      id: 'home',
      icon: 'home',
      label: 'Accueil',
    },
    {
      id: 'budget',
      icon: 'pie-chart',
      label: 'Budget',
    },
    {
      id: 'add',
      icon: 'plus',
      label: 'Ajouter',
      isCenter: true,
    },
    {
      id: 'notifications',
      icon: 'bell',
      label: 'Notifications',
    },
    {
      id: 'profile',
      icon: 'user',
      label: 'Profil',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              tab.isCenter && styles.centerTab,
              activeTab === tab.id && styles.activeTab,
            ]}
            onPress={() => onTabPress(tab.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              tab.isCenter && styles.centerIconContainer,
              activeTab === tab.id && !tab.isCenter && styles.activeIconContainer,
            ]}>
              <Feather
                name={tab.icon}
                size={tab.isCenter ? 24 : 22}
                color={
                  tab.isCenter
                    ? '#ffffff'
                    : activeTab === tab.id
                    ? '#059669'
                    : '#6b7280'
                }
              />
            </View>
            {!tab.isCenter && (
              <Text
                style={[
                  styles.label,
                  activeTab === tab.id && styles.activeLabel,
                ]}
              >
                {tab.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#ffffff',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  centerTab: {
    flex: 0,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#059669',
    marginTop: -20,
    shadowColor: '#059669',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeTab: {
    // Styles pour l'onglet actif (sauf le centre)
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  centerIconContainer: {
    marginBottom: 0,
  },
  activeIconContainer: {
    // Styles pour l'icône active
  },
  label: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#059669',
    fontWeight: '600',
  },
});

export default BottomNavigation;

