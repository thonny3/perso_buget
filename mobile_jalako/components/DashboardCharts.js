import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
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

    // Préparer les données pour les 6 derniers mois comme dans l'application web
    const data = Array.isArray(dashboardData.revenueData) ? dashboardData.revenueData : [];
    const now = new Date();
    const getMonthKey = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    };

    // Créer les 6 derniers mois
    const lastSixMonths = Array.from({ length: 6 }, (_, idx) => {
      const dt = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      return { date: dt, key: getMonthKey(dt) };
    });

    // Mapper les données existantes
    const monthMap = data.reduce((acc, item) => {
      if (item && typeof item.month === 'string') {
        acc[item.month] = item;
      }
      return acc;
    }, {});

    // Créer les données du graphique
    const chartData = lastSixMonths.map(({ date, key }) => {
      const found = monthMap[key] || {};
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      return {
        month: key,
        revenue: Number(found.revenue || 0),
        expenses: Number(found.expenses || 0),
        label: monthName
      };
    });

    const maxValue = Math.max(
      ...chartData.map(d => Math.max(d.revenue || 0, d.expenses || 0)),
      1 // Éviter la division par zéro
    );

    const getMonthName = (monthStr) => {
      if (!monthStr) return '';
      const parts = monthStr.split('-');
      if (parts.length !== 2) return monthStr;
      const months = {
        '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
        '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Aoû',
        '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc'
      };
      return months[parts[1]] || parts[1];
    };

    return (
      <Animated.View style={[styles.chartContainer, { opacity: animatedValues.chartOpacity }]}>
        <View style={styles.chartHeader}>
          <View style={styles.chartTitleContainer}>
            <View style={styles.chartTitleTextContainer}>
              <Text style={styles.chartTitle}>Revenus vs Dépenses</Text>
              <Text style={styles.chartSubtitle}>Évolution sur les 6 derniers mois</Text>
            </View>
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
          
          {/* Graphique en lignes (courbes) */}
          <View style={styles.lineChart}>
            {(() => {
              const innerPadding = 16;
              const chartHeight = 280;
              const usableWidth = screenWidth - (20 * 2) - (24 * 2) - (innerPadding * 2);
              const stepX = chartData.length > 1 ? usableWidth / (chartData.length - 1) : 0;
              const baseLeft = innerPadding;
              const baseBottom = 0;
              
              const revenuePoints = chartData.map((d, i) => {
                const x = baseLeft + i * stepX;
                const yPct = ((d.revenue || 0) / (maxValue || 1)) * 100;
                const y = (chartHeight * (yPct / 100));
                return { x, y };
              });
              
              const expensePoints = chartData.map((d, i) => {
                const x = baseLeft + i * stepX;
                const yPct = ((d.expenses || 0) / (maxValue || 1)) * 100;
                const y = (chartHeight * (yPct / 100));
                return { x, y };
              });
              
              // Créer des courbes lisses avec interpolation de Bézier
              const createSmoothPath = (points) => {
                if (points.length < 2) return [];
                
                const smoothSegments = [];
                for (let i = 0; i < points.length - 1; i++) {
                  const p0 = i > 0 ? points[i - 1] : points[i];
                  const p1 = points[i];
                  const p2 = points[i + 1];
                  const p3 = i < points.length - 2 ? points[i + 2] : points[i + 1];
                  
                  // Créer plusieurs petits segments pour une courbe lisse (interpolation catmull-rom)
                  const segmentsPerCurve = 20;
                  for (let j = 0; j < segmentsPerCurve; j++) {
                    const t = j / segmentsPerCurve;
                    const t2 = t * t;
                    const t3 = t2 * t;
                    
                    // Interpolation de Catmull-Rom pour courbes lisses
                    const x = 0.5 * (
                      (2 * p1.x) +
                      (-p0.x + p2.x) * t +
                      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
                      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
                    );
                    
                    const y = 0.5 * (
                      (2 * p1.y) +
                      (-p0.y + p2.y) * t +
                      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
                      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
                    );
                    
                    if (j === 0 || smoothSegments.length === 0) {
                      smoothSegments.push({ x, y });
                    } else {
                      const prev = smoothSegments[smoothSegments.length - 1];
                      const dx = x - prev.x;
                      const dy = y - prev.y;
                      const length = Math.sqrt(dx * dx + dy * dy);
                      if (length > 0.5) { // Éviter les segments trop petits
                        smoothSegments.push({ x, y });
                      }
                    }
                  }
                }
                return smoothSegments.length > 0 ? smoothSegments : points;
              };

              const renderSegments = (points, color) => {
                // Créer une version lissée des points
                const smoothPoints = points.length > 2 ? createSmoothPath(points) : points;
                const segments = [];
                
                for (let i = 0; i < smoothPoints.length - 1; i++) {
                  const p1 = smoothPoints[i];
                  const p2 = smoothPoints[i + 1];
                  const dx = p2.x - p1.x;
                  const dy = p2.y - p1.y;
                  const length = Math.sqrt(dx * dx + dy * dy);
                  
                  if (length < 0.1) continue; // Ignorer les segments trop courts
                  
                  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                  segments.push(
                    <Animated.View
                      key={`seg-${color}-${i}`}
                      style={[
                        styles.lineSegment,
                        {
                          width: length,
                          left: p1.x,
                          bottom: baseBottom + p1.y,
                          backgroundColor: color,
                          transform: [
                            { rotateZ: `${angle}deg` },
                            { scaleX: animatedValues.chartOpacity }
                          ],
                          opacity: animatedValues.chartOpacity
                        }
                      ]}
                    />
                  );
                }
                return segments;
              };
              
              const renderDots = (points, color, seriesKey) => {
                return points.map((p, i) => (
                  <Animated.View
                    key={`dot-${seriesKey}-${i}`}
                    style={[
                      styles.lineDot,
                      {
                        left: p.x - 4,
                        bottom: baseBottom + p.y - 4,
                        borderColor: color,
                        opacity: animatedValues.chartOpacity
                      }
                    ]}
                  />
                ));
              };
              
              const renderAreaFill = (points, color, seriesKey) => {
                const strips = [];
                const samplesPerSegment = 8;
                for (let i = 0; i < points.length - 1; i++) {
                  const p1 = points[i];
                  const p2 = points[i + 1];
                  for (let s = 0; s <= samplesPerSegment; s++) {
                    const t = s / samplesPerSegment;
                    const x = p1.x + (p2.x - p1.x) * t;
                    const y = p1.y + (p2.y - p1.y) * t;
                    strips.push(
                      <Animated.View
                        key={`fill-${seriesKey}-${i}-${s}`}
                        style={[
                          styles.lineFillStrip,
                          {
                            left: x,
                            bottom: baseBottom,
                            height: y,
                            backgroundColor: color,
                            opacity: animatedValues.chartOpacity.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 0.15],
                            })
                          }
                        ]}
                      />
                    );
                  }
                }
                return strips;
              };
              
              return (
                <>
                  {/* Zones remplies */}
                  {renderAreaFill(revenuePoints, '#10b981', 'rev')}
                  {renderAreaFill(expensePoints, '#ef4444', 'exp')}
                  {/* Lignes */}
                  {renderSegments(revenuePoints, '#10b981')}
                  {renderSegments(expensePoints, '#ef4444')}
                  {/* Points */}
                  {renderDots(revenuePoints, '#10b981', 'rev')}
                  {renderDots(expensePoints, '#ef4444', 'exp')}
                  {/* Labels mois */}
                  <View style={styles.lineLabels}>
                    {chartData.map((d, i) => (
                      <Text key={`lbl-${i}`} style={styles.barLabel}>
                        {d.label || getMonthName(d.month)}
                      </Text>
                    ))}
                  </View>
                </>
              );
            })()}
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
  chartTitleTextContainer: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '400',
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
  lineChart: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  lineSegment: {
    position: 'absolute',
    height: 3,
    borderRadius: 1.5,
  },
  lineDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    borderWidth: 2,
  },
  lineLabels: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: -20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lineFillStrip: {
    position: 'absolute',
    width: 2,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
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
