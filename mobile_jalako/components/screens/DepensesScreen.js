import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  ActivityIndicator, 
  Alert, 
  RefreshControl,
  Dimensions 
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { depensesService, categoryService, compteService } from '../../services/apiService';

const { width } = Dimensions.get('window');

const DepensesScreen = ({ onBack }) => {
  // États principaux
  const [depenses, setDepenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [comptes, setComptes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // États pour les modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDepense, setSelectedDepense] = useState(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');

  // États pour le formulaire
  const [formData, setFormData] = useState({
    description: '',
    montant: '',
    date_depense: new Date().toISOString().split('T')[0],
    id_categorie_depense: '',
    id_compte: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [creating, setCreating] = useState(false);

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

  // Charger les données
  const loadData = async () => {
    try {
      setError(null);
      const [depensesResult, categoriesResult, comptesResult] = await Promise.all([
        depensesService.getAllDepenses(),
        categoryService.getCategories(),
        compteService.getAllComptes()
      ]);

      if (depensesResult.success) {
        setDepenses(depensesResult.data);
      } else {
        setError(depensesResult.error);
      }

      if (categoriesResult.success) {
        setCategories(categoriesResult.data);
      }

      if (comptesResult.success) {
        setComptes(comptesResult.data);
      }
    } catch (err) {
      const errorMessage = 'Erreur lors du chargement des données';
      setError(errorMessage);
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filtrage des dépenses
  const filteredDepenses = depenses.filter(depense => {
    const matchesSearch = depense.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesCategory = filterCategory === 'all' || depense.id_categorie_depense?.toString() === filterCategory;
    
    let matchesDate = true;
    if (filterDateRange !== 'all') {
      const depenseDate = new Date(depense.date_depense);
      const today = new Date();
      
      switch (filterDateRange) {
        case 'today':
          matchesDate = depenseDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = depenseDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = depenseDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  // Calculs statistiques
  const totalDepenses = depenses.reduce((sum, depense) => sum + safeNumber(depense.montant), 0);
  const monthlyDepenses = depenses.filter(depense => {
    const depenseDate = new Date(depense.date_depense);
    const today = new Date();
    return depenseDate.getMonth() === today.getMonth() && depenseDate.getFullYear() === today.getFullYear();
  }).reduce((sum, depense) => sum + safeNumber(depense.montant), 0);

  const categoryStats = categories.map(category => {
    const categoryDepenses = depenses.filter(depense => depense.id_categorie_depense === category.id);
    const total = categoryDepenses.reduce((sum, depense) => sum + safeNumber(depense.montant), 0);
    return {
      ...category,
      total,
      count: categoryDepenses.length
    };
  }).filter(stat => stat.total > 0).sort((a, b) => b.total - a.total);

  // Fonction pour rafraîchir les données
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Fonctions pour gérer les dépenses
  const handleSave = async () => {
    if (!formData.description.trim()) {
      setFormErrors({ description: 'La description est requise' });
      return;
    }
    if (!formData.montant || formData.montant <= 0) {
      setFormErrors({ montant: 'Le montant doit être positif' });
      return;
    }
    if (!formData.id_categorie_depense) {
      setFormErrors({ id_categorie_depense: 'Veuillez sélectionner une catégorie' });
      return;
    }
    if (!formData.id_compte) {
      setFormErrors({ id_compte: 'Veuillez sélectionner un compte' });
      return;
    }

    setCreating(true);
    try {
      const depenseData = {
        ...formData,
        montant: parseFloat(formData.montant),
        id_categorie_depense: parseInt(formData.id_categorie_depense),
        id_compte: parseInt(formData.id_compte)
      };

      const result = selectedDepense 
        ? await depensesService.updateDepense(selectedDepense.id_depense || selectedDepense.id, depenseData)
        : await depensesService.createDepense(depenseData);
      
      if (result.success) {
        Alert.alert('Succès', selectedDepense ? 'Dépense modifiée avec succès' : 'Dépense créée avec succès');
        resetForm();
        loadData();
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur lors de l\'enregistrement de la dépense');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      montant: '',
      date_depense: new Date().toISOString().split('T')[0],
      id_categorie_depense: '',
      id_compte: ''
    });
    setFormErrors({});
    setSelectedDepense(null);
    setIsFormOpen(false);
  };

  const handleEdit = (depense) => {
    setSelectedDepense(depense);
    setFormData({
      description: depense.description || '',
      montant: depense.montant?.toString() || '',
      date_depense: depense.date_depense ? new Date(depense.date_depense).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      id_categorie_depense: depense.id_categorie_depense?.toString() || '',
      id_compte: depense.id_compte?.toString() || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = (depense) => {
    setSelectedDepense(depense);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const result = await depensesService.deleteDepense(selectedDepense.id_depense || selectedDepense.id);
      if (result.success) {
        Alert.alert('Succès', 'Dépense supprimée avec succès');
        loadData();
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur lors de la suppression de la dépense');
    }
    setIsDeleteOpen(false);
    setSelectedDepense(null);
  };

  const handleDetails = (depense) => {
    setSelectedDepense(depense);
    setIsDetailsOpen(true);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.nom : 'Sans catégorie';
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.couleur : '#6b7280';
  };

  const getAccountName = (accountId) => {
    const account = comptes.find(c => c.id === accountId);
    return account ? account.nom : 'Compte inconnu';
  };

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  // Affichage de chargement
  if (loading) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
          <Text style={styles.title}>Mes Dépenses</Text>
          <Text style={styles.subtitle}>Gérez et analysez vos dépenses quotidiennes</Text>
      </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement de vos dépenses...</Text>
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
                <Text style={styles.title}>Mes Dépenses</Text>
                <Text style={styles.subtitle}>Gérez et analysez vos dépenses quotidiennes</Text>
              </View>
            </View>
          <TouchableOpacity 
            style={styles.addButton}
              onPress={() => {
                setSelectedDepense(null);
                setIsFormOpen(true);
              }}
          >
              <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
          </View>
        </View>
        </View>
        
      {/* Statistiques */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="credit-card" size={24} color="#3b82f6" />
              </View>
            <Text style={styles.statValue}>
              {formatAmount(totalDepenses)} Ar
            </Text>
            <Text style={styles.statLabel}>Total des dépenses</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="calendar" size={24} color="#ef4444" />
            </View>
            <Text style={styles.statValue}>
              {formatAmount(monthlyDepenses)} Ar
            </Text>
            <Text style={styles.statLabel}>Ce mois</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="shopping-cart" size={24} color="#16a34a" />
            </View>
            <Text style={styles.statValue}>{depenses.length}</Text>
            <Text style={styles.statLabel}>Nombre de dépenses</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="bar-chart-3" size={24} color="#ea580c" />
            </View>
            <Text style={styles.statValue}>
              {formatAmount(depenses.length > 0 ? (totalDepenses / 30) : 0)} Ar
            </Text>
            <Text style={styles.statLabel}>Moyenne journalière</Text>
          </View>
        </View>
      </View>

      {/* Statistiques par catégorie */}
      {categoryStats.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top catégories</Text>
          <View style={styles.categoryStatsGrid}>
            {categoryStats.slice(0, 4).map((stat) => (
              <View key={stat.id} style={styles.categoryStatCard}>
                <View style={styles.categoryStatHeader}>
                  <View style={[styles.categoryStatIcon, { backgroundColor: stat.couleur || '#6b7280' }]}>
                    <Feather name="pie-chart" size={16} color="#fff" />
                  </View>
                  <Text style={styles.categoryStatName}>{stat.nom}</Text>
                </View>
                <Text style={styles.categoryStatAmount}>{formatAmount(stat.total)} Ar</Text>
                <Text style={styles.categoryStatCount}>{stat.count} dépense{stat.count > 1 ? 's' : ''}</Text>
              </View>
          ))}
        </View>
      </View>
      )}

      {/* Analyse */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analyse</Text>
        <View style={styles.analysisCard}>
          <View style={styles.analysisItem}>
            <View style={styles.analysisItemLeft}>
              <Feather name="trending-up" size={20} color="#ef4444" />
              <Text style={styles.analysisLabel}>Dépense la plus élevée</Text>
            </View>
            <Text style={styles.analysisValue}>
              {depenses.length > 0 ? formatAmount(Math.max(...depenses.map(e => safeNumber(e.montant)))) : formatAmount(0)} Ar
            </Text>
          </View>
          
          <View style={styles.analysisItem}>
            <View style={styles.analysisItemLeft}>
              <Feather name="trending-down" size={20} color="#16a34a" />
              <Text style={styles.analysisLabel}>Dépense la plus faible</Text>
            </View>
            <Text style={styles.analysisValue}>
              {depenses.length > 0 ? formatAmount(Math.min(...depenses.map(e => safeNumber(e.montant)))) : formatAmount(0)} Ar
            </Text>
          </View>
          
          <View style={styles.analysisItem}>
            <View style={styles.analysisItemLeft}>
              <Feather name="bar-chart-3" size={20} color="#6b7280" />
              <Text style={styles.analysisLabel}>Moyenne par dépense</Text>
            </View>
            <Text style={styles.analysisValue}>
              {formatAmount(depenses.length > 0 ? (totalDepenses / depenses.length) : 0)} Ar
            </Text>
          </View>
        </View>
      </View>

      {/* Filtres */}
      <View style={styles.filtersSection}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une dépense..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        
        <View style={styles.filterRow}>
          <View style={styles.filterContainer}>
            <Feather name="filter" size={20} color="#6b7280" />
            <View style={styles.filterSelector}>
              <Text style={styles.filterLabel}>Catégorie:</Text>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterText}>
                  {filterCategory === 'all' ? 'Toutes les catégories' : getCategoryName(filterCategory)}
                </Text>
                <Feather name="chevron-down" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.filterContainer}>
            <Feather name="calendar" size={20} color="#6b7280" />
            <View style={styles.filterSelector}>
              <Text style={styles.filterLabel}>Période:</Text>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterText}>
                  {filterDateRange === 'all' ? 'Toutes les dates' : 
                   filterDateRange === 'today' ? "Aujourd'hui" :
                   filterDateRange === 'week' ? 'Cette semaine' : 'Ce mois'}
                </Text>
                <Feather name="chevron-down" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Liste des dépenses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Dépenses récentes</Text>
          <View style={styles.realtimeIndicator}>
            <View style={styles.realtimeDot} />
            <Text style={styles.realtimeText}>En temps réel</Text>
          </View>
        </View>
        
        {filteredDepenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Feather name="credit-card" size={64} color="#d1d5db" />
            </View>
            <Text style={styles.emptyTitle}>Aucune dépense trouvée</Text>
            <Text style={styles.emptyText}>
              {filteredDepenses.length === 0 && depenses.length > 0 
                ? "Essayez de modifier vos filtres de recherche" 
                : "Commencez par ajouter votre première dépense"
              }
            </Text>
            <TouchableOpacity style={styles.createDepenseButton} onPress={() => setIsFormOpen(true)}>
              <Text style={styles.createDepenseButtonText}>Ajouter une dépense</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.depensesList}>
            {filteredDepenses.map((depense) => (
              <TouchableOpacity 
                key={depense.id_depense || depense.id} 
                style={styles.depenseCard} 
                activeOpacity={0.7}
                onPress={() => handleDetails(depense)}
              >
            <View style={styles.depenseLeft}>
                  <View style={[styles.depenseIcon, { backgroundColor: getCategoryColor(depense.id_categorie_depense) }]}>
                <Feather name="arrow-down-right" size={16} color="#fff" />
              </View>
              <View style={styles.depenseInfo}>
                <Text style={styles.depenseDescription}>{depense.description}</Text>
                    <Text style={styles.depenseCategorie}>{getCategoryName(depense.id_categorie_depense)}</Text>
                    <Text style={styles.depenseAccount}>{getAccountName(depense.id_compte)}</Text>
                    <Text style={styles.depenseDate}>
                      {new Date(depense.date_depense).toLocaleDateString('fr-FR')}
                    </Text>
              </View>
            </View>
                <View style={styles.depenseRight}>
                  <Text style={styles.depenseMontant}>-{formatAmount(depense.montant)} Ar</Text>
                  <View style={styles.depenseActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleEdit(depense)}
                    >
                      <Feather name="edit-2" size={16} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDelete(depense)}
                    >
                      <Feather name="trash-2" size={16} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                </View>
          </TouchableOpacity>
        ))}
          </View>
        )}
      </View>

      {/* Modal pour ajouter/modifier une dépense */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFormOpen}
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDepense ? 'Modifier la dépense' : 'Nouvelle dépense'}
              </Text>
              <TouchableOpacity onPress={resetForm} style={styles.closeButton}>
                <Feather name="x" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
            <TextInput
                  style={[styles.textInput, formErrors.description && styles.inputError]}
                  placeholder="Ex: Courses Carrefour"
                  value={formData.description}
                  onChangeText={(text) => setFormData({...formData, description: text})}
                />
                {formErrors.description && <Text style={styles.errorText}>{formErrors.description}</Text>}
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Montant (Ar)</Text>
            <TextInput
                    style={[styles.textInput, formErrors.montant && styles.inputError]}
                    placeholder="0"
                    value={formData.montant}
                    onChangeText={(text) => setFormData({...formData, montant: text})}
              keyboardType="numeric"
            />
                  {formErrors.montant && <Text style={styles.errorText}>{formErrors.montant}</Text>}
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Date</Text>
            <TextInput
                    style={styles.textInput}
                    value={formData.date_depense}
                    onChangeText={(text) => setFormData({...formData, date_depense: text})}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Catégorie</Text>
                <View style={styles.categorySelector}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        formData.id_categorie_depense === category.id.toString() && styles.categoryOptionSelected
                      ]}
                      onPress={() => setFormData({...formData, id_categorie_depense: category.id.toString()})}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        formData.id_categorie_depense === category.id.toString() && styles.categoryOptionTextSelected
                      ]}>
                        {category.nom}
                      </Text>
            </TouchableOpacity>
                  ))}
                </View>
                {formErrors.id_categorie_depense && <Text style={styles.errorText}>{formErrors.id_categorie_depense}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Compte</Text>
                <View style={styles.categorySelector}>
                  {comptes.map((compte) => (
                    <TouchableOpacity
                      key={compte.id}
                      style={[
                        styles.categoryOption,
                        formData.id_compte === compte.id.toString() && styles.categoryOptionSelected
                      ]}
                      onPress={() => setFormData({...formData, id_compte: compte.id.toString()})}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        formData.id_compte === compte.id.toString() && styles.categoryOptionTextSelected
                      ]}>
                        {compte.nom} ({compte.type})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {formErrors.id_compte && <Text style={styles.errorText}>{formErrors.id_compte}</Text>}
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
                onPress={handleSave}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>
                    {selectedDepense ? 'Mettre à jour' : 'Créer'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de détails */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDetailsOpen}
        onRequestClose={() => setIsDetailsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails de la dépense</Text>
              <TouchableOpacity onPress={() => setIsDetailsOpen(false)} style={styles.closeButton}>
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
    </View>

            {selectedDepense && (
              <View style={styles.modalBody}>
                <View style={styles.detailsCard}>
                  <Text style={styles.detailsTitle}>{selectedDepense.description}</Text>
                  <View style={styles.detailsRow}>
                    <View style={[styles.detailsIcon, { backgroundColor: getCategoryColor(selectedDepense.id_categorie_depense) }]}>
                      <Feather name="pie-chart" size={20} color="#fff" />
                    </View>
                    <Text style={styles.detailsText}>{getCategoryName(selectedDepense.id_categorie_depense)}</Text>
                  </View>
                </View>

                <View style={styles.detailsGrid}>
                  <View style={styles.detailsItem}>
                    <Text style={styles.detailsLabel}>Montant</Text>
                    <Text style={styles.detailsValue}>{formatAmount(selectedDepense.montant)} Ar</Text>
                  </View>
                  <View style={styles.detailsItem}>
                    <Text style={styles.detailsLabel}>Date</Text>
                    <Text style={styles.detailsValue}>
                      {new Date(selectedDepense.date_depense).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsItem}>
                  <Text style={styles.detailsLabel}>Compte utilisé</Text>
                  <Text style={styles.detailsValue}>
                    {getAccountName(selectedDepense.id_compte)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDeleteOpen}
        onRequestClose={() => setIsDeleteOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmer la suppression</Text>
              <TouchableOpacity onPress={() => setIsDeleteOpen(false)} style={styles.closeButton}>
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.confirmIconContainer}>
                <Feather name="alert-triangle" size={48} color="#dc2626" />
              </View>
              <Text style={styles.confirmTitle}>Supprimer cette dépense ?</Text>
              <Text style={styles.confirmText}>
                Êtes-vous sûr de vouloir supprimer "{selectedDepense?.description}" ?{'\n'}
                Cette action est irréversible.
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setIsDeleteOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={confirmDelete}
              >
                <Feather name="trash-2" size={16} color="#fff" />
                <Text style={styles.deleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
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
  categoryStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryStatCard: {
    width: '48%',
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
  categoryStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryStatName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  categoryStatAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  categoryStatCount: {
    fontSize: 12,
    color: '#64748b',
  },
  analysisCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  analysisItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  analysisItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  analysisLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginLeft: 8,
  },
  analysisValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
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
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterContainer: {
    flex: 1,
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
  filterSelector: {
    flex: 1,
    marginLeft: 12,
  },
  filterLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  depensesList: {
    gap: 12,
  },
  depenseCard: {
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
  depenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginBottom: 8,
  },
  depenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  depenseInfo: {
    flex: 1,
  },
  depenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  depenseCategorie: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  depenseAccount: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  depenseDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  depenseRight: {
    alignItems: 'flex-end',
  },
  depenseMontant: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 8,
  },
  depenseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  createDepenseButton: {
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
  createDepenseButtonText: {
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
  // Styles pour les modals
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
  inputRow: {
    flexDirection: 'row',
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
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
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
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  // Styles pour les détails
  detailsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  detailsItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  detailsLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  detailsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  confirmIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DepensesScreen;
