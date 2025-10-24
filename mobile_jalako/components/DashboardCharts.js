import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, Animated, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { dashboardService, authService } from '../services/apiService';

const { width: screenWidth } = Dimensions.get('window');

const DashboardCharts = () => {
  const [dashboardData, setDashboardData] = useState({
    revenueData: [],
    expenseCategories: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [userDevise, setUserDevise] = useState('EUR'); // Devise par défaut
  const [animatedValues] = useState({
    revenueBar: new Animated.Value(0),
    expenseBar: new Animated.Value(0),
    chartOpacity: new Animated.Value(0)
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (dashboardData.revenueData.length > 0) {
      animateChart();
    }
  }, [dashboardData.revenueData]);

  const animateChart = () => {
    Animated.parallel([
      Animated.timing(animatedValues.chartOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues.revenueBar, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }),
      Animated.timing(animatedValues.expenseBar, {
        toValue: 1,
        duration: 1200,
        delay: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

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
          revenueData: data.revenueData || [],
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

  const getCurrentMonthLabel = () => {
    return new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const renderRevenueVsExpensesChart = () => {
    if (!dashboardData.revenueData || dashboardData.revenueData.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Feather name="bar-chart-2" size={48} color="#9ca3af" />
          <Text style={styles.noDataText}>Aucune donnée disponible</Text>
          <Text style={styles.noDataSubtext}>Les données apparaîtront ici une fois que vous aurez ajouté des revenus et dépenses</Text>
        </View>
      );
    }

    const chartData = dashboardData.revenueData.slice(-6); // 6 derniers mois
    const maxValue = Math.max(
      ...chartData.map(d => Math.max(d.revenue || 0, d.expenses || 0))
    );

    const getMonthName = (monthStr) => {
      const months = {
        '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
        '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Aoû',
        '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc'
      };
      return months[monthStr] || monthStr;
    };

    return (
      <Animated.View style={[styles.chartContainer, { opacity: animatedValues.chartOpacity }]}>
        <View style={styles.chartHeader}>
          <View style={styles.chartTitleContainer}>
            <Feather name="trending-up" size={24} color="#3b82f6" />
            <Text style={styles.chartTitle}>Revenus vs Dépenses</Text>
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>Revenus</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.legendText}>Dépenses</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.chartArea}>
          {/* Grille de fond avec lignes horizontales */}
          <View style={styles.chartGrid}>
            {[0, 25, 50, 75, 100].map((percent, index) => (
              <Animated.View 
                key={index} 
                style={[
                  styles.gridLine, 
                  { 
                    bottom: `${percent}%`,
                    opacity: animatedValues.chartOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.4],
                    }),
                  }
                ]} 
              />
            ))}
          </View>
          
          {/* Graphique en barres avec animations */}
          <View style={styles.barChart}>
            {chartData.map((data, index) => {
              const revenueHeight = ((data.revenue || 0) / maxValue) * 100;
              const expenseHeight = ((data.expenses || 0) / maxValue) * 100;
              const isSelected = selectedMonth === index;
              
              return (
                <TouchableOpacity 
                  key={index} 
                  style={styles.barContainer}
                  onPress={() => setSelectedMonth(isSelected ? null : index)}
                  activeOpacity={0.8}
                >
                  <View style={styles.barLabels}>
                    <Text style={[styles.barLabel, isSelected && styles.selectedBarLabel]}>
                      {getMonthName(data.month)}
                    </Text>
                  </View>
                  
                  <View style={styles.bars}>
                    {/* Barre des revenus */}
                    <View style={styles.barGroup}>
                      <Animated.View 
                        style={[
                          styles.bar, 
                          styles.revenueBar, 
                          { 
                            height: animatedValues.revenueBar.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, revenueHeight],
                            }),
                            transform: [
                              { scaleY: animatedValues.revenueBar },
                              { scaleX: isSelected ? 1.1 : 1 }
                            ],
                            shadowOpacity: isSelected ? 0.3 : 0.15,
                          }
                        ]} 
                      />
                      <Animated.View
                        style={[
                          styles.barValueContainer,
                          {
                            opacity: animatedValues.revenueBar,
                          },
                        ]}
                      >
                        <Text style={styles.barValue}>{formatCurrency(data.revenue)}</Text>
                        <View style={[styles.barIndicator, { backgroundColor: '#10b981' }]} />
                      </Animated.View>
                    </View>
                    
                    {/* Barre des dépenses */}
                    <View style={styles.barGroup}>
                      <Animated.View 
                        style={[
                          styles.bar, 
                          styles.expenseBar, 
                          { 
                            height: animatedValues.expenseBar.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, expenseHeight],
                            }),
                            transform: [
                              { scaleY: animatedValues.expenseBar },
                              { scaleX: isSelected ? 1.1 : 1 }
                            ],
                            shadowOpacity: isSelected ? 0.3 : 0.15,
                          }
                        ]} 
                      />
                      <Animated.View
                        style={[
                          styles.barValueContainer,
                          {
                            opacity: animatedValues.expenseBar,
                          },
                        ]}
                      >
                        <Text style={styles.barValue}>{formatCurrency(data.expenses)}</Text>
                        <View style={[styles.barIndicator, { backgroundColor: '#ef4444' }]} />
                      </Animated.View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Statistiques améliorées en bas */}
        <View style={styles.chartStats}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Feather name="trending-up" size={16} color="#10b981" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Total Revenus</Text>
              <Text style={styles.statValue}>
                {formatCurrency(chartData.reduce((sum, d) => sum + (d.revenue || 0), 0))}
              </Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Feather name="trending-down" size={16} color="#ef4444" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Total Dépenses</Text>
              <Text style={styles.statValue}>
                {formatCurrency(chartData.reduce((sum, d) => sum + (d.expenses || 0), 0))}
              </Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Feather name="piggy-bank" size={16} color="#059669" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Épargne</Text>
              <Text style={[styles.statValue, styles.savingsValue]}>
                {formatCurrency(chartData.reduce((sum, d) => sum + (d.revenue || 0) - (d.expenses || 0), 0))}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderExpenseCategoriesChart = () => {
    if (!dashboardData.expenseCategories || dashboardData.expenseCategories.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Feather name="pie-chart" size={32} color="#9ca3af" />
          <Text style={styles.noDataText}>Aucune donnée disponible</Text>
        </View>
      );
    }

    const total = dashboardData.expenseCategories.reduce((sum, cat) => sum + (cat.value || 0), 0);

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Dépenses par catégorie — {getCurrentMonthLabel()}</Text>
        </View>
        
        <View style={styles.pieChartContainer}>
          <View style={styles.pieChart}>
            {dashboardData.expenseCategories.map((category, index) => {
              const percentage = total > 0 ? ((category.value || 0) / total) * 100 : 0;
              return (
                <View key={index} style={styles.pieSlice}>
                  <View 
                    style={[
                      styles.pieSegment, 
                      { backgroundColor: category.color || '#6b7280' }
                    ]} 
                  />
                  <Text style={styles.pieLabel}>{percentage.toFixed(0)}%</Text>
                </View>
              );
            })}
          </View>
          
          <View style={styles.categoryList}>
            {dashboardData.expenseCategories.map((category, index) => {
              const percentage = total > 0 ? ((category.value || 0) / total) * 100 : 0;
              return (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <View 
                      style={[
                        styles.categoryColor, 
                        { backgroundColor: category.color || '#6b7280' }
                      ]} 
                    />
                    <Text style={styles.categoryName}>{category.name || 'Autres'}</Text>
                  </View>
                  <View style={styles.categoryValues}>
                    <Text style={styles.categoryValue}>{formatCurrency(category.value)}</Text>
                    <Text style={styles.categoryPercentage}>{percentage.toFixed(0)}%</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des graphiques...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Graphique Revenus vs Dépenses */}
      <View style={styles.section}>
        <View style={styles.chartCard}>
          {renderRevenueVsExpensesChart()}
        </View>
      </View>

      {/* Graphique Dépenses par catégorie */}
      <View style={styles.section}>
        <View style={styles.chartCard}>
          {renderExpenseCategoriesChart()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  chartContainer: {
    flex: 1,
  },
  chartHeader: {
    marginBottom: 24,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  chartArea: {
    position: 'relative',
    height: 280,
    marginBottom: 20,
  },
  chartGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#e5e7eb',
    opacity: 0.5,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
    paddingHorizontal: 8,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  barLabels: {
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedBarLabel: {
    color: '#3b82f6',
    fontWeight: '700',
    fontSize: 13,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: '100%',
  },
  barGroup: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    width: 24,
    borderRadius: 4,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  revenueBar: {
    backgroundColor: '#10b981',
  },
  expenseBar: {
    backgroundColor: '#ef4444',
  },
  barValueContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  barIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  chartStats: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
  },
  savingsValue: {
    color: '#059669',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  pieChartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pieChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
    marginRight: 20,
  },
  pieSlice: {
    width: '50%',
    height: '50%',
    position: 'relative',
  },
  pieSegment: {
    width: '100%',
    height: '100%',
  },
  pieLabel: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  categoryList: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  categoryValues: {
    alignItems: 'flex-end',
  },
  categoryValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#6b7280',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 8,
    fontWeight: '500',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
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

export default DashboardCharts;
