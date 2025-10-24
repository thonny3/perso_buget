import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { authService } from '../services/apiService';

const ProfileScreen = ({ onBack, onLogout }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const result = await authService.getCurrentUser();
      if (result.success) {
        setUserData(result.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: confirmLogout }
      ]
    );
  };

  const confirmLogout = async () => {
    try {
      await authService.logout();
      onLogout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      onLogout(); // Déconnecter quand même
    }
  };

  const profileOptions = [
    {
      id: 'edit-profile',
      icon: 'edit-3',
      title: 'Modifier le profil',
      subtitle: 'Mettre à jour vos informations',
      color: '#3b82f6',
    },
    {
      id: 'settings',
      icon: 'settings',
      title: 'Paramètres',
      subtitle: 'Préférences et configuration',
      color: '#6b7280',
    },
    {
      id: 'security',
      icon: 'shield',
      title: 'Sécurité',
      subtitle: 'Mot de passe et authentification',
      color: '#f59e0b',
    },
    {
      id: 'help',
      icon: 'help-circle',
      title: 'Aide et support',
      subtitle: 'FAQ et contact',
      color: '#059669',
    },
    {
      id: 'about',
      icon: 'info',
      title: 'À propos',
      subtitle: 'Version et informations',
      color: '#7c3aed',
    },
  ];

  const handleOptionPress = (optionId) => {
    switch (optionId) {
      case 'edit-profile':
        Alert.alert('Modifier le profil', 'Fonctionnalité à venir');
        break;
      case 'settings':
        Alert.alert('Paramètres', 'Fonctionnalité à venir');
        break;
      case 'security':
        Alert.alert('Sécurité', 'Fonctionnalité à venir');
        break;
      case 'help':
        Alert.alert('Aide et support', 'Fonctionnalité à venir');
        break;
      case 'about':
        Alert.alert('À propos', 'MyJalako v1.0.0\nApplication de gestion de budget personnel');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Feather name="user" size={40} color="#ffffff" />
            </View>
          </View>
          <Text style={styles.userName}>
            {userData ? `${userData.nom} ${userData.prenom}` : 'Utilisateur'}
          </Text>
          <Text style={styles.userEmail}>
            {userData?.email || 'email@example.com'}
          </Text>
          <Text style={styles.userCurrency}>
            Devise: {userData?.devise || 'MGA'}
          </Text>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsSection}>
          {profileOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionItem}
              onPress={() => handleOptionPress(option.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                <Feather name={option.icon} size={20} color="#ffffff" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Feather name="log-out" size={20} color="#dc2626" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  userCurrency: {
    fontSize: 14,
    color: '#9ca3af',
  },
  optionsSection: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginLeft: 8,
  },
});

export default ProfileScreen;
