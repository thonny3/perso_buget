import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import InvestissementReportModal from '../InvestissementReportModal';
import { investissementsService } from '../../services/apiService';
import InvestissementActionScreen from '../InvestissementActionScreen';

const { width } = Dimensions.get('window');

const InvestissementsScreen = ({ onBack, onRefreshCallback, onAddPress }) => {
  // États principaux
  const [investissements, setInvestissements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isActionScreenOpen, setIsActionScreenOpen] = useState(false);
  const [selectedInvestissement, setSelectedInvestissement] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Fonction pour formater les montants
  const formatAmount = (amount) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || amount === null || amount === undefined) {
      return '0';
    }
    
    if (numAmount % 1 === 0) {
      return numAmount.toLocaleString('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    }
    
    return numAmount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Fonction pour convertir sécurisément en nombre
  const safeNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Charger les données
  const loadData = async () => {
    try {
      setError(null);
      console.log('🔄 Début du chargement des investissements...');
      
      const result = await investissementsService.getInvestissements();

      console.log('📊 Résultat:', result);

      if (result.success && result.data) {
        console.log('✅ Investissements chargés:', result.data.length || 0);
        setInvestissements(result.data || []);
        setError(null);
      } else {
        console.error('❌ Erreur chargement investissements:', result.error);
        setError(result.error || 'Erreur inconnue');
      }
    } catch (err) {
      console.error('❌ Erreur dans loadData:', err);
      const errorMessage = 'Erreur lors du chargement des données';
      setError(errorMessage);
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Calcul des statistiques globales
  const totalInvesti = investissements.reduce((sum, inv) => sum + safeNumber(inv.montant_investi), 0);
  const totalRevenus = investissements.reduce((sum, inv) => sum + safeNumber(inv.total_revenus || 0), 0);
  const totalDepenses = investissements.reduce((sum, inv) => sum + safeNumber(inv.total_depenses || 0), 0);
  const totalValeur = investissements.reduce((sum, inv) => sum + safeNumber(inv.valeur_actuelle || inv.montant_investi || 0), 0);
  const beneficeNet = (totalRevenus - totalDepenses) + (totalValeur - totalInvesti);

  // Fonction pour rafraîchir les données
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Handler pour ouvrir l'action screen
  const handleInvestissementPress = (investissement) => {
    setSelectedInvestissement(investissement);
    setIsActionScreenOpen(true);
  };

  // Handler pour supprimer un investissement
  const handleDelete = () => {
    if (selectedInvestissement) {
      Alert.alert(
        'Supprimer l\'investissement',
        `Êtes-vous sûr de vouloir supprimer "${selectedInvestissement.nom}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await investissementsService.deleteInvestissement(
                  selectedInvestissement.id_investissement || selectedInvestissement.id
                );
                if (result.success) {
                  Alert.alert('Succès', 'Investissement supprimé avec succès!');
                  loadData();
                } else {
                  Alert.alert('Erreur', result.error);
                }
              } catch (error) {
                Alert.alert('Erreur', 'Erreur de connexion');
              }
            }
          }
        ]
      );
    }
    setIsActionScreenOpen(false);
    setSelectedInvestissement(null);
  };

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  // Enregistrer la callback de rafraîchissement
  useEffect(() => {
    if (onRefreshCallback) {
      onRefreshCallback(() => {
        console.log('🔄 Rafraîchissement des investissements depuis Dashboard...');
        loadData();
      });
    }
  }, [onRefreshCallback]);

  // Affichage de chargement
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mes Investissements</Text>
          <Text style={styles.subtitle}>Suivez la performance de vos investissements</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement de vos investissements...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.titleContainer}>
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Feather name="arrow-left" size={24} color="#374151" />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text style={styles.title}>Mes Investissements</Text>
                <Text style={styles.subtitle}>Suivez la performance de vos investissements</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={onAddPress}
            >
              <Feather name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity onPress={() => setIsReportOpen(true)} style={{ backgroundColor: '#1f2937', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 }}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Rapport</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Cartes de statistiques */}
      <View style={styles.statsSection}>
        {/* Total Investi */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
              <Feather name="trending-up" size={20} color="#f59e0b" />
            </View>
            <Text style={styles.statLabel}>Total investi</Text>
          </View>
          <Text style={styles.statValue}>{formatAmount(totalInvesti)} Ar</Text>
          <Text style={styles.statDescription}>Capital initial investi</Text>
        </View>

        {/* Revenus - Dépenses */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
              <Feather name="dollar-sign" size={20} color="#3b82f6" />
            </View>
            <Text style={styles.statLabel}>Revenus - Dépenses</Text>
          </View>
          <Text style={[styles.statValue, { color: totalRevenus - totalDepenses >= 0 ? '#10b981' : '#ef4444' }]}>
            {totalRevenus - totalDepenses >= 0 ? '+' : ''}{formatAmount(totalRevenus - totalDepenses)} Ar
          </Text>
          <Text style={styles.statDescription}>
            Revenus: {formatAmount(totalRevenus)} Ar{'\n'}
            Dépenses: {formatAmount(totalDepenses)} Ar
          </Text>
        </View>

        {/* Bénéfice net (incl. valeur) */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={[styles.statIcon, { backgroundColor: '#d1fae5' }]}>
              <Feather name="bar-chart-2" size={20} color="#10b981" />
            </View>
            <Text style={styles.statLabel}>Bénéfice net (incl. valeur)</Text>
          </View>
          <Text style={[styles.statValue, { color: beneficeNet >= 0 ? '#10b981' : '#ef4444' }]}>
            {beneficeNet >= 0 ? '+' : ''}{formatAmount(beneficeNet)} Ar
          </Text>
          <Text style={styles.statDescription}>
            Valeur actuelle: {formatAmount(totalValeur)} Ar{'\n'}
            Bénéfice total
          </Text>
        </View>
      </View>

      {/* Liste des investissements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes investissements ({investissements.length})</Text>

        {investissements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Feather name="trending-up" size={64} color="#d1d5db" />
            </View>
            <Text style={styles.emptyTitle}>Aucun investissement</Text>
            <Text style={styles.emptyText}>
              Commencez par ajouter votre premier investissement
            </Text>
          </View>
        ) : (
          <View style={styles.investissementsList}>
            {investissements.map((inv) => {
              const revenus = safeNumber(inv.total_revenus || 0);
              const depenses = safeNumber(inv.total_depenses || 0);
              const valeurActuelle = safeNumber(inv.valeur_actuelle || inv.montant_investi || 0);
              const montantInvesti = safeNumber(inv.montant_investi);
              const profit = (revenus - depenses) + (valeurActuelle - montantInvesti);
              const roi = montantInvesti > 0 ? ((profit / montantInvesti) * 100) : 0;

              return (
                <TouchableOpacity
                  key={inv.id_investissement || inv.id}
                  style={styles.investissementCard}
                  activeOpacity={0.7}
                  onPress={() => handleInvestissementPress(inv)}
                >
                  <View style={styles.investissementHeader}>
                    <View style={styles.investissementTitleRow}>
                      <Text style={styles.investissementName}>{inv.nom || 'Sans nom'}</Text>
                      <Text style={[styles.investissementProfit, { color: profit >= 0 ? '#10b981' : '#ef4444' }]}>
                        {profit >= 0 ? '+' : ''}{formatAmount(profit)} Ar
                      </Text>
                    </View>
                    <Text style={styles.investissementType}>{inv.type || 'Autre'}</Text>
                  </View>

                  <View style={styles.investissementStats}>
                    <View style={styles.miniStat}>
                      <Text style={styles.miniStatLabel}>Investi</Text>
                      <Text style={styles.miniStatValue}>{formatAmount(montantInvesti)} Ar</Text>
                    </View>
                    <View style={styles.miniStat}>
                      <Text style={styles.miniStatLabel}>Valeur actuelle</Text>
                      <Text style={styles.miniStatValue}>{formatAmount(valeurActuelle)} Ar</Text>
                    </View>
                    <View style={styles.miniStat}>
                      <Text style={styles.miniStatLabel}>ROI</Text>
                      <Text style={[styles.miniStatValue, { color: roi >= 0 ? '#10b981' : '#ef4444' }]}>
                        {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.investissementFooter}>
                    <View style={styles.footerItem}>
                      <Feather name="trending-up" size={14} color="#10b981" />
                      <Text style={styles.footerText}>Revenus: {formatAmount(revenus)} Ar</Text>
                    </View>
                    <View style={styles.footerItem}>
                      <Feather name="trending-down" size={14} color="#ef4444" />
                      <Text style={styles.footerText}>Dépenses: {formatAmount(depenses)} Ar</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Écran d'actions pour un investissement */}
      <InvestissementActionScreen
        visible={isActionScreenOpen}
        onClose={() => {
          setIsActionScreenOpen(false);
          setSelectedInvestissement(null);
        }}
        investissement={selectedInvestissement}
        onSuccess={() => {
          loadData();
        }}
        onDelete={handleDelete}
      />

      {/* Rapport d'investissement */}
      <InvestissementReportModal
        visible={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        items={investissements}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  header: {
    backgroundColor: 'transparent',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#059669',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    flexShrink: 0,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  statDescription: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  investissementsList: {
    gap: 12,
  },
  investissementCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  investissementHeader: {
    marginBottom: 12,
  },
  investissementTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  investissementName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  investissementProfit: {
    fontSize: 18,
    fontWeight: '700',
  },
  investissementType: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  investissementStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
  },
  miniStatLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
  },
  miniStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  investissementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default InvestissementsScreen;

