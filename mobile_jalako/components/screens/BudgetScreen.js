import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert, RefreshControl, Modal, TextInput } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { budgetService, categoryService } from '../../services/apiService';

const { width } = Dimensions.get('window');

const BudgetScreen = ({ onBack }) => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [monthModalVisible, setMonthModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    mois: '',
    montant_max: '',
    id_categorie_depense: ''
  });

  // Fonction pour obtenir le mois actuel au format YYYY-MM
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const handleDelete = async (id_budget) => {
    try {
      Alert.alert(
        'Confirmer',
        'Supprimer ce budget ? Cette action est irréversible.',
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Supprimer', 
            style: 'destructive', 
            onPress: async () => {
              const result = await budgetService.deleteBudget(id_budget);
              if (result.success) {
                loadBudgets();
              } else {
                Alert.alert('Erreur', result.error || 'Suppression impossible');
              }
            }
          }
        ]
      );
    } catch (e) {
      Alert.alert('Erreur', 'Suppression impossible');
    }
  };

  // Fonction pour formater le mois d'affichage
  const formatMonthDisplay = (monthValue) => {
    if (!monthValue) return 'Tous les mois';
    const [year, month] = monthValue.split('-');
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Fonction pour formater les montants
  const formatAmount = (amount) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || amount === null || amount === undefined) {
      return '0.00';
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

  // Charger les budgets
  const loadBudgets = async () => {
    try {
      setError(null);
      const result = await budgetService.getAllBudgets();
      
      if (result.success) {
        setBudgets(result.data);
      } else {
        setError(result.error);
        Alert.alert('Erreur', result.error);
      }
    } catch (err) {
      const errorMessage = 'Erreur lors du chargement des budgets';
      setError(errorMessage);
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger les catégories
  const loadCategories = async () => {
    try {
      const result = await categoryService.getCategories();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
    }
  };

  // Filtrage des budgets
  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.categorie?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesMonth = !selectedMonth || budget.mois === selectedMonth;
    return matchesSearch && matchesMonth;
  });

  // Calculs statistiques
  const totalBudgetMax = filteredBudgets.reduce((sum, budget) => {
    return sum + safeNumber(budget.montant_max);
  }, 0);
  
  const totalDepense = filteredBudgets.reduce((sum, budget) => {
    return sum + safeNumber(budget.montant_depense);
  }, 0);
  
  const totalRestant = filteredBudgets.reduce((sum, budget) => {
    return sum + safeNumber(budget.montant_restant);
  }, 0);
  
  const budgetsAlertes = filteredBudgets.filter(b => safeNumber(b.pourcentage_utilise) >= 80).length;
  
  const pourcentageGlobal = totalBudgetMax > 0 ? Math.round((totalDepense / totalBudgetMax) * 100) : 0;

  // Obtenir la liste des mois disponibles
  const availableMonths = [...new Set(budgets.map(budget => budget.mois).filter(Boolean))].sort();

  // Fonction pour rafraîchir les données
  const onRefresh = () => {
    setRefreshing(true);
    loadBudgets();
  };

  // Fonctions pour gérer les budgets
  const handleSubmit = async () => {
    if (!formData.montant_max || !formData.id_categorie_depense || !formData.mois) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setCreating(true);
    try {
      const budgetData = {
        ...formData,
        montant_max: parseFloat(formData.montant_max),
        montant_restant: parseFloat(formData.montant_max),
        montant_depense: 0,
        pourcentage_utilise: 0
      };

      const result = await budgetService.createBudget(budgetData);
      
      if (result.success) {
        Alert.alert('Succès', 'Budget créé avec succès');
        resetForm();
        loadBudgets();
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur lors de la création du budget');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      mois: '',
      montant_max: '',
      id_categorie_depense: ''
    });
    setEditingBudget(null);
    setModalVisible(false);
  };

  const openAddModal = () => {
    setModalVisible(true);
  };

  const openMonthModal = () => {
    setMonthModalVisible(true);
  };

  const closeMonthModal = () => {
    setMonthModalVisible(false);
  };

  const selectMonth = (month) => {
    setSelectedMonth(month);
    closeMonthModal();
  };

  const getBudgetStatus = (pourcentage) => {
    const pct = safeNumber(pourcentage);
    if (pct >= 100) return { color: '#dc2626', bg: '#fef2f2', label: 'Dépassé' };
    if (pct >= 80) return { color: '#ea580c', bg: '#fff7ed', label: 'Attention' };
    if (pct >= 60) return { color: '#d97706', bg: '#fffbeb', label: 'Modéré' };
    return { color: '#16a34a', bg: '#f0fdf4', label: 'Sain' };
  };

  const getProgressBarColor = (pourcentage) => {
    const pct = safeNumber(pourcentage);
    if (pct >= 100) return '#dc2626';
    if (pct >= 80) return '#ea580c';
    if (pct >= 60) return '#d97706';
    return '#16a34a';
  };

  // Charger les données au montage
  useEffect(() => {
    loadBudgets();
    loadCategories();
    setSelectedMonth(getCurrentMonth());
  }, []);

  // Affichage de chargement
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Gestion du Budget</Text>
          <Text style={styles.subtitle}>Suivez et contrôlez vos dépenses par catégorie</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement de vos budgets...</Text>
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
      {/* Header simplifié */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.titleContainer}>
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Feather name="arrow-left" size={24} color="#374151" />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text style={styles.title}>Mon Budget</Text>
                <Text style={styles.subtitle}>Suivez vos dépenses - {formatMonthDisplay(selectedMonth)}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={openAddModal}
            >
              <Feather name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Statistiques des budgets */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="target" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.statValue}>
              {formatAmount(totalBudgetMax)} Ar
            </Text>
            <Text style={styles.statLabel}>Budget Total</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="trending-down" size={24} color="#ef4444" />
            </View>
            <Text style={styles.statValue}>
              {formatAmount(totalDepense)} Ar
            </Text>
            <Text style={styles.statLabel}>Dépensé</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="dollar-sign" size={24} color="#16a34a" />
            </View>
            <Text style={styles.statValue}>
              {formatAmount(totalRestant)} Ar
            </Text>
            <Text style={styles.statLabel}>Restant</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="alert-triangle" size={24} color="#ea580c" />
            </View>
            <Text style={styles.statValue}>{budgetsAlertes}</Text>
            <Text style={styles.statLabel}>Budgets en Alerte</Text>
          </View>
        </View>
      </View>

      {/* Filtres */}
      <View style={styles.filtersSection}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par catégorie..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        
        <View style={styles.monthFilter}>
          <Feather name="calendar" size={20} color="#6b7280" />
          <View style={styles.monthSelector}>
            <Text style={styles.monthLabel}>Mois:</Text>
            <TouchableOpacity style={styles.monthButton} onPress={openMonthModal}>
              <Text style={styles.monthText}>{formatMonthDisplay(selectedMonth)}</Text>
              <Feather name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Liste des budgets */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vos budgets</Text>
          <View style={styles.realtimeIndicator}>
            <View style={styles.realtimeDot} />
            <Text style={styles.realtimeText}>En temps réel</Text>
                </View>
              </View>
        
        {filteredBudgets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Feather name="pie-chart" size={64} color="#d1d5db" />
            </View>
            <Text style={styles.emptyTitle}>Aucun budget trouvé</Text>
            <Text style={styles.emptyText}>
              {selectedMonth 
                ? `Aucun budget trouvé pour ${formatMonthDisplay(selectedMonth)}` 
                : 'Commencez par créer votre premier budget pour suivre vos dépenses'
              }
            </Text>
            <TouchableOpacity style={styles.createBudgetButton} onPress={openAddModal}>
              <Text style={styles.createBudgetButtonText}>Créer un budget</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.budgetsGrid}>
            {filteredBudgets.map((budget) => {
              const status = getBudgetStatus(budget.pourcentage_utilise);
              return (
                <View key={budget.id_budget} style={styles.budgetCard}>
                  {/* Élément décoratif de fond */}
                  <View style={styles.cardBackground} />
                  
                  {/* En-tête de la carte */}
                  <View style={styles.budgetHeader}>
                    <View style={styles.budgetLeft}>
                      <View style={[styles.budgetIcon, { backgroundColor: getProgressBarColor(budget.pourcentage_utilise) }]}>
                        <Feather name="pie-chart" size={20} color="#fff" />
                      </View>
                      <View style={styles.budgetInfo}>
                        <Text style={styles.budgetNom}>{budget.categorie || 'Sans nom'}</Text>
                        <Text style={styles.budgetPeriod}>{formatMonthDisplay(budget.mois)}</Text>
                      </View>
                    </View>
                    
                    {/* Menu d'actions */}
                    <View style={styles.actionsMenu}>
                      <TouchableOpacity style={styles.actionButton}>
                        <Feather name="edit-2" size={16} color="#3b82f6" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(budget.id_budget)}>
                        <Feather name="trash-2" size={16} color="#dc2626" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Détails du budget */}
                  <View style={styles.budgetDetails}>
                    <View style={styles.budgetRow}>
                      <Text style={styles.budgetLabel}>Budget</Text>
                      <Text style={styles.budgetValue}>
                        {formatAmount(budget.montant_max)} Ar
                      </Text>
                    </View>
                    
                    <View style={styles.budgetRow}>
                      <Text style={styles.budgetLabel}>Dépensé</Text>
                      <Text style={[styles.budgetValue, { color: '#ef4444' }]}>
                        {formatAmount(budget.montant_depense)} Ar
                      </Text>
                    </View>
                    
                    <View style={styles.budgetRow}>
                      <Text style={styles.budgetLabel}>Restant</Text>
                      <Text style={[styles.budgetValue, { color: '#16a34a' }]}>
                        {formatAmount(budget.montant_restant)} Ar
                      </Text>
                    </View>
            </View>
            
                  {/* Barre de progression */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Utilisation</Text>
                      <Text style={styles.progressPercentage}>
                        {safeNumber(budget.pourcentage_utilise).toFixed(0)}%
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                <View 
                  style={[
                          styles.progressFill, 
                    { 
                            width: `${Math.min(safeNumber(budget.pourcentage_utilise), 100)}%`,
                            backgroundColor: getProgressBarColor(budget.pourcentage_utilise)
                    }
                  ]} 
                />
              </View>
                  </View>

                  {/* Statut */}
                  <View style={[styles.statusContainer, { backgroundColor: status.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Modal pour ajouter un budget */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouveau Budget</Text>
              <TouchableOpacity onPress={resetForm} style={styles.closeButton}>
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Période/Mois</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM"
                  value={formData.mois}
                  onChangeText={(text) => setFormData({...formData, mois: text})}
                />
      </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Montant Maximum (Ar)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0"
                  value={formData.montant_max}
                  onChangeText={(text) => setFormData({...formData, montant_max: text})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Catégorie de Dépense</Text>
                <View style={styles.categorySelector}>
                  {categories.map((category) => {
                    const isSelected = Number(formData.id_categorie_depense) === Number(category.id);
                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryOption,
                          isSelected && styles.categoryOptionSelected
                        ]}
                        onPress={() => setFormData({ ...formData, id_categorie_depense: category.id })}
                      >
                        <Text style={[
                          styles.categoryOptionText,
                          isSelected && styles.categoryOptionTextSelected
                        ]}>
                          {category.nom}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
      </View>
    </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={resetForm}
                disabled={creating}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.createButton, creating && styles.createButtonDisabled]} 
                onPress={handleSubmit}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Créer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal pour sélectionner le mois */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={monthModalVisible}
        onRequestClose={closeMonthModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.monthModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner le mois</Text>
              <TouchableOpacity onPress={closeMonthModal} style={styles.closeButton}>
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.monthList}>
              <TouchableOpacity 
                style={[styles.monthOption, !selectedMonth && styles.monthOptionSelected]}
                onPress={() => selectMonth('')}
              >
                <Text style={[styles.monthOptionText, !selectedMonth && styles.monthOptionTextSelected]}>
                  Tous les mois
                </Text>
              </TouchableOpacity>
              
              {availableMonths.map((month) => (
                <TouchableOpacity
                  key={month}
                  style={[styles.monthOption, selectedMonth === month && styles.monthOptionSelected]}
                  onPress={() => selectMonth(month)}
                >
                  <Text style={[styles.monthOptionText, selectedMonth === month && styles.monthOptionTextSelected]}>
                    {formatMonthDisplay(month)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
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
    flexWrap: 'wrap',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    flexShrink: 0,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  filtersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  monthFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  monthSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  monthLabel: {
    fontSize: 16,
    color: '#64748b',
    marginRight: 8,
  },
  monthButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  realtimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  realtimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  realtimeText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  budgetsGrid: {
    gap: 16,
  },
  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    position: 'relative',
    overflow: 'hidden',
  },
  cardBackground: {
    position: 'absolute',
    top: -32,
    right: -32,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  budgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  budgetIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetNom: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  budgetPeriod: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  actionsMenu: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  budgetDetails: {
    marginBottom: 20,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
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
    marginBottom: 24,
    lineHeight: 24,
  },
  createBudgetButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createBudgetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
  // Styles pour le modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  categoryOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  categoryOptionTextSelected: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  createButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  // Styles pour le modal de sélection de mois
  monthModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  monthList: {
    padding: 20,
    maxHeight: 300,
  },
  monthOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  monthOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  monthOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
  monthOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default BudgetScreen;
