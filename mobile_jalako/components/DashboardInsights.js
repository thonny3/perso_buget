import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { dashboardService, authService } from '../services/apiService';

const DashboardInsights = ({ onNavigate }) => {
  const [dashboardData, setDashboardData] = useState({
    debtOverview: {
      total: 0,
      active: 0,
      overdue: 0,
      completed: 0,
      initialTotal: 0,
      remainingTotal: 0
    },
    subscriptionOverview: {
      total: 0,
      active: 0,
      inactive: 0,
      activeMonthlyCost: 0
    },
    subscriptionFrequency: [],
    budgetOverview: []
  });
  const [loading, setLoading] = useState(true);
  const [userDevise, setUserDevise] = useState('EUR');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const userResult = await authService.getCurrentUser();
      if (userResult.success && userResult.data.devise) {
        setUserDevise(userResult.data.devise);
      }
      
      const data = await dashboardService.getSummary();
      if (data) {
        setDashboardData({
          debtOverview: data.debtOverview || {
            total: 0,
            active: 0,
            overdue: 0,
            completed: 0,
            initialTotal: 0,
            remainingTotal: 0
          },
          subscriptionOverview: data.subscriptionOverview || {
            total: 0,
            active: 0,
            inactive: 0,
            activeMonthlyCost: 0
          },
          subscriptionFrequency: data.subscriptionFrequency || [],
          budgetOverview: data.budgetOverview || []
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

  const formatFrequencyLabel = (freq) => {
    const f = (freq || '').toString().toLowerCase();
    if (f.includes('mens')) return 'Mensuel';
    if (f.includes('trimes')) return 'Trimestriel';
    if (f.includes('semes')) return 'Semestriel';
    if (f.includes('ann')) return 'Annuel';
    return 'Autre';
  };

  const initialAmount = dashboardData.debtOverview?.initialTotal || 0;
  const remainingAmount = dashboardData.debtOverview?.remainingTotal || 0;
  const paidAmount = Math.max(initialAmount - remainingAmount, 0);
  const hasDebtData = initialAmount > 0 || remainingAmount > 0;
  const remainingPercent = initialAmount > 0 ? Math.min(100, (remainingAmount / initialAmount) * 100) : 0;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des aperçus...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Feather name="activity" size={24} color="#3b82f6" />
        <Text style={styles.headerTitle}>Aperçu</Text>
      </View>

      {/* Dettes */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Dettes</Text>
          {onNavigate && (
            <TouchableOpacity onPress={() => onNavigate('dettes')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {hasDebtData ? (
          <>
            {/* Progression Montant Initial vs Restant */}
            <View style={styles.debtProgressContainer}>
              <View style={styles.debtProgressBar}>
                <View style={styles.debtInitialTrack} />
                <View
                  style={[
                    styles.debtRemainingTrack,
                    { width: `${remainingPercent}%` }
                  ]}
                />
              </View>
              <View style={styles.debtLegend}>
                <View style={styles.debtLegendItem}>
                  <View style={[styles.debtLegendDot, styles.debtLegendInitial]} />
                  <View>
                    <Text style={styles.debtLegendLabel}>Montant initial</Text>
                    <Text style={styles.debtLegendValue}>{formatCurrency(initialAmount)}</Text>
                  </View>
                </View>
                <View style={styles.debtLegendItem}>
                  <View style={[styles.debtLegendDot, styles.debtLegendRemaining]} />
                  <View>
                    <Text style={styles.debtLegendLabel}>Montant restant</Text>
                    <Text style={styles.debtLegendValue}>{formatCurrency(remainingAmount)}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Statistiques */}
            <View style={styles.debtStats}>
              <View style={styles.debtStatItem}>
                <Text style={styles.debtStatLabel}>Actives</Text>
                <Text style={styles.debtStatValue}>{dashboardData.debtOverview.active}</Text>
              </View>
              <View style={styles.debtStatDivider} />
              <View style={styles.debtStatItem}>
                <Text style={styles.debtStatLabel}>En retard</Text>
                <Text style={[styles.debtStatValue, styles.debtStatValueWarning]}>
                  {dashboardData.debtOverview.overdue}
                </Text>
              </View>
              <View style={styles.debtStatDivider} />
              <View style={styles.debtStatItem}>
                <Text style={styles.debtStatLabel}>Terminées</Text>
                <Text style={[styles.debtStatValue, styles.debtStatValueSuccess]}>
                  {dashboardData.debtOverview.completed}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="credit-card" size={32} color="#9ca3af" />
            <Text style={styles.emptyText}>Aucune dette</Text>
          </View>
        )}
      </View>

      {/* Abonnements */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Abonnements</Text>
            <Text style={styles.cardSubtitle}>Coût mensuel actif</Text>
          </View>
          {onNavigate && (
            <TouchableOpacity onPress={() => onNavigate('abonnements')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {dashboardData.subscriptionOverview.total > 0 ? (
          <>
            <View style={styles.subscriptionCostContainer}>
              <Text style={styles.subscriptionCost}>
                {formatCurrency(dashboardData.subscriptionOverview.activeMonthlyCost)}
              </Text>
              <Text style={styles.subscriptionCostLabel}>par mois</Text>
            </View>

            <View style={styles.subscriptionStats}>
              <View style={styles.subscriptionStatItem}>
                <View style={styles.subscriptionStatBadgeActive}>
                  <Text style={styles.subscriptionStatLabel}>Actifs</Text>
                  <Text style={styles.subscriptionStatValue}>
                    {dashboardData.subscriptionOverview.active}
                  </Text>
                </View>
              </View>
              <View style={styles.subscriptionStatItem}>
                <View style={styles.subscriptionStatBadgeInactive}>
                  <Text style={styles.subscriptionStatLabel}>Inactifs</Text>
                  <Text style={styles.subscriptionStatValue}>
                    {dashboardData.subscriptionOverview.inactive}
                  </Text>
                </View>
              </View>
            </View>

            {/* Graphique de fréquence */}
            {dashboardData.subscriptionFrequency.length > 0 && (
              <View style={styles.frequencyChart}>
                <Text style={styles.frequencyChartTitle}>Répartition par fréquence</Text>
                <View style={styles.frequencyBars}>
                  {dashboardData.subscriptionFrequency.slice(0, 4).map((item, index) => {
                    const maxValue = Math.max(...dashboardData.subscriptionFrequency.map(i => i.value || 0), 1);
                    const percentage = ((item.value || 0) / maxValue) * 100;
                    return (
                      <View key={index} style={styles.frequencyBarItem}>
                        <Text style={styles.frequencyBarLabel}>{formatFrequencyLabel(item.name || item.freq)}</Text>
                        <View style={styles.frequencyBarContainer}>
                          <View style={[styles.frequencyBarFill, { width: `${percentage}%` }]} />
                        </View>
                        <Text style={styles.frequencyBarValue}>{item.value || 0}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="repeat" size={32} color="#9ca3af" />
            <Text style={styles.emptyText}>Aucun abonnement</Text>
          </View>
        )}
      </View>

      {/* Budgets */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Budgets</Text>
          {onNavigate && (
            <TouchableOpacity onPress={() => onNavigate('budget')}>
              <Text style={styles.seeAllText}>Gérer</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {dashboardData.budgetOverview.length > 0 ? (
          <View style={styles.budgetList}>
            {dashboardData.budgetOverview.slice(0, 3).map((item, index) => (
              <View key={index} style={styles.budgetItem}>
                <View style={styles.budgetItemHeader}>
                  <Text style={styles.budgetItemLabel}>
                    {item.category || 'Budget'} {item.month ? `(${item.month})` : ''}
                  </Text>
                  <Text style={styles.budgetItemPercent}>{Math.round(item.percent || 0)}%</Text>
                </View>
                <View style={styles.budgetProgressBar}>
                  <View 
                    style={[
                      styles.budgetProgressFill,
                      { 
                        width: `${Math.min(item.percent || 0, 100)}%`,
                        backgroundColor: (item.percent || 0) > 100 ? '#ef4444' : 
                                       (item.percent || 0) > 80 ? '#f59e0b' : '#22c55e'
                      }
                    ]} 
                  />
                </View>
                <View style={styles.budgetItemFooter}>
                  <Text style={styles.budgetItemSpent}>
                    Dépensé: {formatCurrency(item.spent || 0)}
                  </Text>
                  <Text style={styles.budgetItemRemaining}>
                    Restant: {formatCurrency(item.remaining || 0)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="pie-chart" size={32} color="#9ca3af" />
            <Text style={styles.emptyText}>Aucun budget défini</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  seeAllText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  // Dettes
  debtProgressContainer: {
    marginBottom: 16,
  },
  debtProgressBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e0e7ff',
    overflow: 'hidden',
    position: 'relative',
  },
  debtInitialTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#2563eb',
    opacity: 0.35,
  },
  debtRemainingTrack: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#fb923c',
  },
  debtLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  debtLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  debtLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  debtLegendInitial: {
    backgroundColor: '#3b82f6',
  },
  debtLegendRemaining: {
    backgroundColor: '#f97316',
  },
  debtLegendLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  debtLegendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  debtStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  debtStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  debtStatDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  debtStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  debtStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  debtStatValueWarning: {
    color: '#ef4444',
  },
  debtStatValueSuccess: {
    color: '#22c55e',
  },
  // Abonnements
  subscriptionCostContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
  },
  subscriptionCost: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10b981',
  },
  subscriptionCostLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  subscriptionStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  subscriptionStatItem: {
    flex: 1,
  },
  subscriptionStatBadgeActive: {
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  subscriptionStatBadgeInactive: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  subscriptionStatLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  subscriptionStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  frequencyChart: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  frequencyChartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  frequencyBars: {
    gap: 12,
  },
  frequencyBarItem: {
    marginBottom: 8,
  },
  frequencyBarLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  frequencyBarContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 4,
  },
  frequencyBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  frequencyBarValue: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'right',
  },
  // Budgets
  budgetList: {
    gap: 16,
  },
  budgetItem: {
    marginBottom: 12,
  },
  budgetItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  budgetItemPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  budgetProgressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 6,
  },
  budgetProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetItemSpent: {
    fontSize: 11,
    color: '#6b7280',
  },
  budgetItemRemaining: {
    fontSize: 11,
    color: '#6b7280',
  },
});

export default DashboardInsights;

