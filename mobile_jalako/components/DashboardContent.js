import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { dashboardService, authService } from '../services/apiService';

const DashboardContent = () => {
  const [dashboardData, setDashboardData] = useState({
    recentTransactions: [],
    expenseCategories: []
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
        setDashboardData({
          recentTransactions: data.recentTransactions || [],
          expenseCategories: data.expenseCategories || []
        });
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

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  const monthlyBudget = dashboardData.expenseCategories.map((category, index) => {
    const budget = 100; // Budget par défaut, à adapter selon vos besoins
    const spent = category.value || 0;
    const percentage = Math.min((spent / budget) * 100, 100);
    
    return {
      category: category.name || 'Autres',
      budget: budget,
      spent: spent,
      percentage: Math.round(percentage)
    };
  });

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'income':
        return <Feather name="arrow-up-right" size={20} color="#22c55e" />;
      case 'expense':
        return <Feather name="arrow-down-right" size={20} color="#ef4444" />;
      case 'transfer':
        return <Feather name="target" size={20} color="#3b82f6" />;
      default:
        return <Feather name="arrow-up-right" size={20} color="#6b7280" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'income':
        return '#22c55e';
      case 'expense':
        return '#ef4444';
      case 'transfer':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Transactions récentes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transactions Récentes</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.transactionsList}>
          {dashboardData.recentTransactions.length > 0 ? (
            dashboardData.recentTransactions.slice(0, 5).map((transaction, index) => (
              <View key={index} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <View style={[styles.transactionIcon, { backgroundColor: getTransactionColor(transaction.type) + '20' }]}>
                    {getTransactionIcon(transaction.type)}
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>{transaction.name || 'Transaction'}</Text>
                    <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                  </View>
                </View>
                <Text style={[styles.transactionAmount, { color: getTransactionColor(transaction.type) }]}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.noDataContainer}>
              <Feather name="file-text" size={32} color="#9ca3af" />
              <Text style={styles.noDataText}>Aucune transaction récente</Text>
            </View>
          )}
        </View>
      </View>

      {/* Budget mensuel */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Budget Mensuel</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Gérer</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.budgetList}>
          {monthlyBudget.length > 0 ? (
            monthlyBudget.map((item, index) => (
              <View key={index} style={styles.budgetItem}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetCategory}>{item.category}</Text>
                  <Text style={styles.budgetAmount}>{formatCurrency(item.spent)} / {formatCurrency(item.budget)}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${item.percentage}%`,
                        backgroundColor: item.percentage >= 100 ? '#ef4444' : '#22c55e'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{item.percentage}% utilisé</Text>
              </View>
            ))
          ) : (
            <View style={styles.noDataContainer}>
              <Feather name="pie-chart" size={32} color="#9ca3af" />
              <Text style={styles.noDataText}>Aucun budget défini</Text>
            </View>
          )}
        </View>
      </View>

      {/* Objectif d'épargne */}
      <View style={styles.savingsGoal}>
        <View style={styles.savingsHeader}>
          <Text style={styles.savingsTitle}>Objectif d'épargne 2024</Text>
          <Text style={styles.savingsSubtitle}>Vous êtes sur la bonne voie !</Text>
        </View>
        <View style={styles.savingsAmount}>
          <Text style={styles.savingsValue}>12,890€ / 15,000€</Text>
          <Text style={styles.savingsPercentage}>86% atteint</Text>
        </View>
        <View style={styles.savingsProgress}>
          <View style={styles.savingsProgressBar}>
            <View style={[styles.savingsProgressFill, { width: '86%' }]} />
          </View>
        </View>
      </View>

      {/* Date actuelle */}
      <View style={styles.dateCard}>
        <Feather name="calendar" size={20} color="#6b7280" />
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  transactionsList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  budgetList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  budgetItem: {
    marginBottom: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  budgetAmount: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
  },
  savingsGoal: {
    backgroundColor: '#059669',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  savingsHeader: {
    marginBottom: 16,
  },
  savingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  savingsSubtitle: {
    fontSize: 14,
    color: '#d1fae5',
  },
  savingsAmount: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  savingsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  savingsPercentage: {
    fontSize: 14,
    color: '#d1fae5',
  },
  savingsProgress: {
    marginBottom: 8,
  },
  savingsProgressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
  },
  savingsProgressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noDataText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
});

export default DashboardContent;
