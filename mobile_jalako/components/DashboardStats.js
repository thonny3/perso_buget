import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const DashboardStats = () => {
  const statsData = [
    {
      title: 'Solde Total',
      value: '25,430 €',
      change: '+12.5%',
      changeType: 'positive',
      icon: 'wallet',
      color: '#3b82f6'
    },
    {
      title: 'Revenus ce mois',
      value: '8,520 €',
      change: '+8.2%',
      changeType: 'positive',
      icon: 'trending-up',
      color: '#22c55e'
    },
    {
      title: 'Dépenses ce mois',
      value: '3,240 €',
      change: '-15.1%',
      changeType: 'negative',
      icon: 'credit-card',
      color: '#f97316'
    },
    {
      title: 'Épargne',
      value: '12,890 €',
      change: '+5.4%',
      changeType: 'positive',
      icon: 'piggy-bank',
      color: '#a855f7'
    },
    {
      title: 'Budget mensuel',
      value: '4,500 €',
      change: '72%',
      changeType: 'neutral',
      icon: 'pie-chart',
      color: '#06b6d4'
    },
    {
      title: 'Investissements',
      value: '5,200 €',
      change: '+3.2%',
      changeType: 'positive',
      icon: 'trending-up',
      color: '#8b5cf6'
    },
    {
      title: 'Dettes',
      value: '1,800 €',
      change: '-8.5%',
      changeType: 'positive',
      icon: 'credit-card',
      color: '#ef4444'
    },
    {
      title: 'Objectifs',
      value: '3/5',
      change: '60%',
      changeType: 'neutral',
      icon: 'target',
      color: '#f59e0b'
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

  return (
    <View style={styles.container}>
        {/* Section Principale */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
          <View style={styles.statsGrid}>
            {statsData.slice(0, 4).map((stat, index) => renderStatCard(stat, index))}
          </View>
        </View>

        {/* Section Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget & Planification</Text>
          <View style={styles.statsGrid}>
            {statsData.slice(4, 6).map((stat, index) => renderStatCard(stat, index + 4))}
          </View>
        </View>

        {/* Section Financière */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Situation financière</Text>
          <View style={styles.statsGrid}>
            {statsData.slice(6, 8).map((stat, index) => renderStatCard(stat, index + 6))}
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '48%',
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
});

export default DashboardStats;
