import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { dashboardService, authService } from '../services/apiService';

const DashboardStats = () => {
  const [dashboardData, setDashboardData] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    goalsAchieved: 0,
    revenueData: [],
    expenseCategories: [],
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [userDevise, setUserDevise] = useState('EUR'); // Devise par défaut

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Récupérer d'abord les informations de l'utilisateur pour obtenir sa devise
      const userResult = await authService.getCurrentUser();
      if (userResult.success && userResult.data.devise) {
        setUserDevise(userResult.data.devise);
      }
      
      const data = await dashboardService.getSummary();
      if (data) {
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const deviseAffichage = userDevise === 'MGA' ? 'Ar' : userDevise;
    return Number(amount || 0).toLocaleString('fr-FR') + ' ' + deviseAffichage;
  };

  const statsData = [
    {
      title: 'Solde Total',
      value: formatCurrency(dashboardData.totalBalance),
      change: '',
      changeType: 'positive',
      icon: 'layers',
      color: '#3b82f6'
    },
    {
      title: 'Revenus du mois',
      value: formatCurrency(dashboardData.monthlyIncome),
      change: '',
      changeType: 'positive',
      icon: 'trending-up',
      color: '#22c55e'
    },
    {
      title: 'Dépenses du mois',
      value: formatCurrency(dashboardData.monthlyExpenses),
      change: '',
      changeType: 'negative',
      icon: 'credit-card',
      color: '#f97316'
    },
    {
      title: 'Objectifs atteints',
      value: dashboardData.goalsAchieved.toString(),
      change: '',
      changeType: 'positive',
      icon: 'target',
      color: '#a855f7'
    }
  ];

  const renderStatCard = (stat, index) => (
    <View key={index} style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={styles.statInfo}>
          <Text style={styles.statTitle}>{stat.title}</Text>
          <Text style={styles.statValue}>{stat.value}</Text>
          <View style={styles.statChange}>
            <Text style={[
              styles.changeText,
              stat.changeType === 'positive' ? styles.positiveChange : 
              stat.changeType === 'negative' ? styles.negativeChange : styles.neutralChange
            ]}>
              {stat.change}
            </Text>
            <Text style={styles.changeLabel}>
              {stat.changeType === 'neutral' ? 'utilisé' : 'vs mois dernier'}
            </Text>
          </View>
        </View>
        <View style={[styles.iconContainer, { backgroundColor: stat.color }]}>
          <Feather name={stat.icon} size={24} color="#fff" />
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        {/* Section Principale */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
          <View style={styles.statsGrid}>
            {statsData.map((stat, index) => renderStatCard(stat, index))}
          </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'column',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  positiveChange: {
    color: '#22c55e',
  },
  negativeChange: {
    color: '#ef4444',
  },
  neutralChange: {
    color: '#6b7280',
  },
  changeLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default DashboardStats;
