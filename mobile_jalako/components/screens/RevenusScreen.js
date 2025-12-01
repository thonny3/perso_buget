import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, RefreshControl, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { revenuesService, accountService } from '../../services/apiService';

const RevenusScreen = ({ onBack, onRefreshCallback, navigation }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [newRevenu, setNewRevenu] = useState({ montant: '', description: '', id_categorie_revenu: '', id_compte: '', date_revenu: '' });
  const [editingRevenu, setEditingRevenu] = useState(null);
  const [deletingRevenu, setDeletingRevenu] = useState(null);
  const [revenus, setRevenus] = useState([]);
  const [comptes, setComptes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [displayLimit, setDisplayLimit] = useState(4);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [isSourceSelectOpen, setIsSourceSelectOpen] = useState(false);

  const sources = [
    { id: 1, nom: 'Salaire', couleur: '#22c55e', icon: 'briefcase' },
    { id: 2, nom: 'Freelance', couleur: '#3b82f6', icon: 'laptop' },
    { id: 3, nom: 'Investissements', couleur: '#a855f7', icon: 'trending-up' },
    { id: 4, nom: 'Ventes', couleur: '#f97316', icon: 'shopping-bag' },
    { id: 5, nom: 'Autres', couleur: '#6b7280', icon: 'more-horizontal' },
  ];

  // Fonction pour charger les revenus
  const loadRevenus = async () => {
    try {
      setError(null);
      const result = await revenuesService.getRevenues();
      
      if (result.success) {
        console.log('Revenus chargés:', result.data);
        setRevenus(result.data || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erreur lors du chargement des revenus');
      console.error('Erreur loadRevenus:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fonction pour charger les catégories
  const loadCategories = async () => {
    try {
      const result = await revenuesService.getRevenueCategories();
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (err) {
      console.error('Erreur loadCategories:', err);
    }
  };

  // Fonction pour charger les comptes
  const loadComptes = async () => {
    try {
      const result = await accountService.getMyAccounts();
      
      if (result.success) {
        console.log('Comptes chargés:', result.data);
        setComptes(result.data || []);
      } else {
        console.error('Erreur chargement comptes:', result.error);
      }
    } catch (err) {
      console.error('Erreur loadComptes:', err);
    }
  };

  // Fonction pour rafraîchir les données
  const onRefresh = () => {
    setRefreshing(true);
    resetPagination();
    loadRevenus();
    loadCategories();
  };

  // Fonction pour filtrer les revenus
  const getFilteredRevenus = () => {
    return revenus.filter(revenu => {
      const matchesSearch = (revenu.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (revenu.source || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategorie || 
        (revenu.categorie_nom && revenu.categorie_nom === selectedCategorie);
      const matchesMonth = !selectedMonth || new Date(revenu.date_revenu).getMonth().toString() === selectedMonth;
      
      return matchesSearch && matchesCategory && matchesMonth;
    });
  };

  // Fonction pour obtenir les revenus à afficher (avec pagination)
  const getDisplayedRevenus = () => {
    const filtered = getFilteredRevenus();
    return filtered.slice(0, displayLimit);
  };

  // Fonction pour charger plus de revenus
  const loadMoreRevenus = () => {
    setDisplayLimit(prev => prev + 4);
  };

  // Fonction pour réinitialiser la pagination
  const resetPagination = () => {
    setDisplayLimit(4);
    setShowLoadMore(false);
  };

  // Fonction pour créer un nouveau revenu
  const createRevenu = async () => {
    if (!newRevenu.description || !newRevenu.montant || !newRevenu.id_categorie_revenu || !newRevenu.id_compte) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setCreating(true);
    try {
      const result = await revenuesService.createRevenue({
        description: newRevenu.description,
        montant: parseFloat(newRevenu.montant),
        id_categorie_revenu: newRevenu.id_categorie_revenu,
        id_compte: newRevenu.id_compte,
        date_revenu: newRevenu.date_revenu || new Date().toISOString().split('T')[0]
      });

      if (result.success) {
        Alert.alert('Succès', 'Revenu ajouté avec succès');
        resetForm();
        loadRevenus(); // Recharger la liste
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur lors de la création du revenu');
      console.error('Erreur createRevenu:', err);
    } finally {
      setCreating(false);
    }
  };

  // Fonction pour modifier un revenu
  const updateRevenu = async () => {
    if (!editingRevenu || !editingRevenu.description || !editingRevenu.montant || !editingRevenu.source || !editingRevenu.id_compte) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setUpdating(true);
    try {
      const result = await revenuesService.updateRevenue(editingRevenu.id_revenu, {
        description: editingRevenu.description,
        montant: parseFloat(editingRevenu.montant),
        source: editingRevenu.source,
        id_compte: editingRevenu.id_compte,
        date_revenu: editingRevenu.date_revenu
      });

      if (result.success) {
        Alert.alert('Succès', 'Revenu modifié avec succès');
        setShowEditModal(false);
        setEditingRevenu(null);
        loadRevenus();
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur lors de la modification du revenu');
      console.error('Erreur updateRevenu:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Fonction pour supprimer un revenu
  const deleteRevenu = async () => {
    if (!deletingRevenu) return;

    setDeleting(true);
    try {
      const result = await revenuesService.deleteRevenue(deletingRevenu.id_revenu);

      if (result.success) {
        Alert.alert('Succès', 'Revenu supprimé avec succès');
        setShowDeleteModal(false);
        setDeletingRevenu(null);
        loadRevenus();
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur lors de la suppression du revenu');
      console.error('Erreur deleteRevenu:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setNewRevenu({ montant: '', description: '', source: '', id_compte: '', date_revenu: '' });
    setShowAddModal(false);
  };

  // Fonction pour ouvrir l'écran d'édition
  const openEditScreen = (revenu) => {
    if (navigation) {
      navigation.navigate('EditFormScreen', {
        revenuData: {
          id_revenu: revenu.id_revenu,
          id: revenu.id_revenu, // Pour compatibilité
          source: revenu.source || revenu.description, // Mapper description vers source
          montant: revenu.montant,
          id_categorie_revenu: revenu.id_categorie_revenu,
          id_compte: revenu.id_compte,
          date_revenu: revenu.date_revenu
        },
        onSuccess: (updatedData) => {
          console.log('✅ Revenu mis à jour:', updatedData);
          loadRevenus(); // Recharger la liste des revenus
        }
      });
    } else {
      console.error('❌ Navigation non disponible');
      Alert.alert('Erreur', 'Navigation non disponible');
    }
  };

  // Fonction pour ouvrir le modal de suppression
  const openDeleteModal = (revenu) => {
    setDeletingRevenu(revenu);
    setShowDeleteModal(true);
  };

  // Fonction pour formater le montant
  const formatMontant = (montant) => {
    // Gérer les cas où montant est undefined, null, ou une chaîne vide
    if (montant === undefined || montant === null || montant === '') {
      return '0,00';
    }
    
    const amount = parseFloat(montant);
    if (isNaN(amount)) {
      return '0,00';
    }
    
    return amount.toLocaleString('fr-FR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Fonction pour obtenir la couleur selon la source
  const getSourceColor = (source) => {
    const sourceObj = sources.find(s => s.nom === source);
    return sourceObj ? sourceObj.couleur : '#6b7280';
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Aujourd\'hui';
    if (diffDays === 2) return 'Hier';
    if (diffDays <= 7) return `Il y a ${diffDays - 1} jours`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Calculer les statistiques des revenus (exactement comme dans le web)
  const calculateStats = () => {
    const totalRevenus = revenus.reduce((sum, revenu) => {
      if (revenu.montant === undefined || revenu.montant === null || revenu.montant === '') {
        return sum;
      }
      const montant = parseFloat(revenu.montant);
      return sum + (isNaN(montant) ? 0 : montant);
    }, 0);

    const thisMonthRevenus = revenus.filter(rev => 
      new Date(rev.date_revenu).getMonth() === new Date().getMonth()
    ).reduce((sum, rev) => sum + parseFloat(rev.montant || 0), 0);

    const averageRevenu = revenus.length > 0 ? totalRevenus / revenus.length : 0;

    // Nombre de sources uniques
    const uniqueSources = [...new Set(revenus.map(rev => rev.source))].length;

    return {
      total: totalRevenus,
      thisMonth: thisMonthRevenus,
      average: averageRevenu,
      sourcesCount: uniqueSources,
      totalCount: revenus.length
    };
  };

  const stats = calculateStats();
  const filteredRevenus = getFilteredRevenus();
  const displayedRevenus = getDisplayedRevenus();
  const hasMoreRevenus = filteredRevenus.length > displayLimit;

  // Fonction pour fermer le modal et réinitialiser
  const closeModal = () => {
    setNewRevenu({ montant: '', description: '', id_categorie_revenu: '', id_compte: '' });
    setShowAddModal(false);
    setIsSourceSelectOpen(false);
  };

  // Exposer la fonction de rechargement au parent (une seule fois)
  useEffect(() => {
    if (onRefreshCallback) {
      onRefreshCallback(loadRevenus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dépendances vides pour éviter la boucle infinie

  // Charger les revenus, comptes et catégories au montage du composant
  useEffect(() => {
    loadRevenus();
    loadComptes();
    loadCategories();
  }, []);

  // Réinitialiser la pagination quand les filtres changent
  useEffect(() => {
    resetPagination();
  }, [searchTerm, selectedCategory, selectedCategorie, selectedMonth]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <View style={styles.titleContent}>
            <Text style={styles.title}>Mes Revenus</Text>
            <Text style={styles.subtitle}>Suivez vos sources de revenus</Text>
          </View>
          
        </View>
      </View>

      {/* Statistiques exactes du web */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statCardContent}>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Total des Revenus</Text>
                <Text style={styles.statValue}>{formatMontant(stats.total)} Ar</Text>
              </View>
              <View style={[styles.statIconContainer, { backgroundColor: '#dcfce7' }]}>
                <Feather name="dollar-sign" size={24} color="#16a34a" />
              </View>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statCardContent}>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Revenu Moyen</Text>
                <Text style={styles.statValue}>{formatMontant(stats.average)} Ar</Text>
              </View>
              <View style={[styles.statIconContainer, { backgroundColor: '#dbeafe' }]}>
                <Feather name="trending-up" size={24} color="#2563eb" />
              </View>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statCardContent}>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Ce Mois</Text>
                <Text style={styles.statValue}>{formatMontant(stats.thisMonth)} Ar</Text>
              </View>
              <View style={[styles.statIconContainer, { backgroundColor: '#dcfce7' }]}>
                <Feather name="trending-up" size={24} color="#059669" />
              </View>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statCardContent}>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Nombre de Sources</Text>
                <Text style={styles.statValue}>{stats.sourcesCount}</Text>
              </View>
              <View style={[styles.statIconContainer, { backgroundColor: '#f3e8ff' }]}>
                <Feather name="layers" size={24} color="#7c3aed" />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Dernier revenu ajouté */}
      {revenus.length > 0 && (
        <View style={styles.lastRevenueSection}>
          <Text style={styles.sectionTitle}>Dernier revenu</Text>
          <View style={styles.lastRevenueCard}>
            <View style={styles.lastRevenueHeader}>
              <View style={[styles.lastRevenueIcon, { backgroundColor: getSourceColor(revenus[0]?.source) }]}>
                <Feather name="arrow-up-right" size={18} color="#fff" />
              </View>
              <View style={styles.lastRevenueInfo}>
                <Text style={styles.lastRevenueDescription}>
                  {revenus[0]?.description || 'Revenu sans description'}
                </Text>
                <Text style={styles.lastRevenueSource}>
                  {revenus[0]?.source || 'Non spécifié'}
                </Text>
              </View>
            </View>
            <View style={styles.lastRevenueAmount}>
              <Text style={styles.lastRevenueAmountText}>
                +{formatMontant(revenus[0]?.montant || 0)} Ar
              </Text>
              <Text style={styles.lastRevenueDate}>
                {formatDate(revenus[0]?.date_revenu || new Date())}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Barre de recherche et filtres */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un revenu..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#9ca3af"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Feather name="x" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Feather name="filter" size={16} color="#3b82f6" />
        </TouchableOpacity>
      </View>


      <ScrollView 
        style={styles.section}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#059669']}
            tintColor="#059669"
          />
        }
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Revenus récents</Text>
          <View style={styles.sectionSubtitleContainer}>
            <Text style={styles.sectionSubtitle}>
              {displayedRevenus.length} sur {filteredRevenus.length} revenu{filteredRevenus.length > 1 ? 's' : ''}
            </Text>
            {hasMoreRevenus && (
              <Text style={styles.moreAvailableText}>
                +{filteredRevenus.length - displayLimit} autres disponibles
              </Text>
            )}
          </View>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>Chargement des revenus...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={48} color="#ef4444" />
            <Text style={styles.errorTitle}>Erreur de chargement</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadRevenus}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : displayedRevenus.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="trending-up" size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>
              {searchTerm || selectedCategory || selectedSource || selectedMonth ? 'Aucun résultat' : 'Aucun revenu'}
            </Text>
            <Text style={styles.emptyText}>
              {searchTerm || selectedCategory || selectedSource || selectedMonth 
                ? 'Aucun revenu ne correspond à vos critères de recherche'
                : filteredRevenus.length > 0 
                  ? 'Tous les revenus ont été chargés'
                  : 'Vous n\'avez pas encore enregistré de revenus'
              }
            </Text>
            {(searchTerm || selectedCategory || selectedSource || selectedMonth) && (
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedSource('');
                  setSelectedMonth('');
                }}
              >
                <Text style={styles.clearFiltersText}>Effacer les filtres</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.revenusList}>
            {displayedRevenus.map((revenu, index) => (
              <TouchableOpacity 
                key={revenu.id_revenu || revenu.id} 
                style={styles.revenuCard} 
                activeOpacity={0.7}
                onPress={() => openEditScreen(revenu)}
              >
                {/* En-tête de la carte */}
                <View style={styles.revenuCardHeader}>
                  <View style={styles.revenuCardLeft}>
                   
                    <View style={styles.revenuCardInfo}>
                      <Text style={styles.revenuCardTitle}>
                        {revenu.source || 'Revenu sans description'}
                      </Text>
                     
                    </View>
                  </View>
                  
                  <View style={styles.revenuCardActions}>
                    <TouchableOpacity 
                      style={styles.revenuActionButton}
                      onPress={() => openEditScreen(revenu)}
                    >
                      <Feather name="edit-3" size={16} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.revenuActionButton}
                      onPress={() => openDeleteModal(revenu)}
                    >
                      <Feather name="trash-2" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Contenu principal */}
                <View style={styles.revenuCardContent}>
                  <View style={styles.revenuCardAmount}>
                    <Text style={styles.revenuAmountText}>
                      +{formatMontant(revenu.montant || 0)} Ar
                    </Text>
                    <View style={styles.revenuAmountBadge}>
                      <Feather name="trending-up" size={12} color="#16a34a" />
                    </View>
                  </View>
                  
                  <View style={styles.revenuCardDetails}>
                    <View style={styles.revenuDetailItem}>
                      <Feather name="calendar" size={14} color="#6b7280" />
                      <Text style={styles.revenuDetailText}>
                        {formatDate(revenu.date_revenu || new Date())}
                      </Text>
                    </View>
                    
                    <View style={styles.revenuDetailItem}>
                      <Feather name="tag" size={14} color="#6b7280" />
                      <View style={styles.revenuCategoryBadge}>
                        <Text style={styles.revenuCategoryText}>
                          {revenu.categorie || 
                           (categories.find(cat => cat.id === revenu.id_categorie_revenu)?.nom) || 
                           'Général'}
                        </Text>
                      </View>
                    </View>
                    
                    {revenu.compte && (
                      <View style={styles.revenuDetailItem}>
                        <Feather name="wallet" size={14} color="#6b7280" />
                        <Text style={styles.revenuDetailText}>
                          {revenu.compte}
                        </Text>
                      </View>
                    )}
                    
                    {revenu.user_prenom && (
                      <View style={styles.revenuDetailItem}>
                        <View style={styles.revenuUserInfo}>
                          {revenu.user_image ? (
                            <Image 
                              source={{ uri: revenu.user_image }} 
                              style={styles.revenuUserAvatar}
                              onError={(e) => {
                                // Fallback to icon if image fails to load
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <View style={styles.revenuUserAvatarPlaceholder}>
                              <Text style={styles.revenuUserInitial}>
                                {(revenu.user_prenom || 'U').charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          )}
                          <Text style={styles.revenuDetailText}>
                            {revenu.user_prenom} {revenu.user_nom || ''}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>

              
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Bouton Charger plus */}
        {hasMoreRevenus && (
          <View style={styles.loadMoreContainer}>
            <TouchableOpacity 
              style={styles.loadMoreButton}
              onPress={loadMoreRevenus}
            >
              <Feather name="plus-circle" size={20} color="#059669" />
              <Text style={styles.loadMoreText}>
                Charger plus ({filteredRevenus.length - displayLimit} restants)
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Indicateur de fin de liste */}
        {!hasMoreRevenus && filteredRevenus.length > 0 && (
          <View style={styles.endOfListContainer}>
            <View style={styles.endOfListLine} />
            <Text style={styles.endOfListText}>
              Tous les revenus ont été chargés
            </Text>
            <View style={styles.endOfListLine} />
          </View>
        )}
      </ScrollView>

      {/* Modal d'ajout amélioré */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nouveau revenu</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Feather name="x" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.input}
                  placeholder="Ex: Salaire mensuel, Projet freelance..."
              value={newRevenu.description}
              onChangeText={(text) => setNewRevenu({...newRevenu, description: text})}
            />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Montant (Ar)</Text>
            <TextInput
              style={styles.input}
                  placeholder="0,00"
              keyboardType="numeric"
              value={newRevenu.montant}
              onChangeText={(text) => setNewRevenu({...newRevenu, montant: text})}
            />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Compte</Text>
                <View style={styles.compteSelector}>
                  {comptes.map((compte) => (
                    <TouchableOpacity
                      key={compte.id_compte || compte.id}
                      style={[
                        styles.compteOption,
                        newRevenu.id_compte === (compte.id_compte || compte.id) && styles.compteOptionSelected
                      ]}
                      onPress={() => setNewRevenu({...newRevenu, id_compte: compte.id_compte || compte.id})}
                    >
                      <View style={[styles.compteOptionIcon, { backgroundColor: '#059669' }]}>
                        <Feather name="wallet" size={16} color="#fff" />
                      </View>
                      <View style={styles.compteOptionInfo}>
                        <Text style={[
                          styles.compteOptionName,
                          newRevenu.id_compte === (compte.id_compte || compte.id) && styles.compteOptionNameSelected
                        ]}>
                          {compte.nom || 'Compte'}
                        </Text>
                        <Text style={styles.compteOptionType}>
                          {compte.type || 'Type'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Catégorie</Text>
                <TouchableOpacity 
                  style={styles.selectContainer}
                  onPress={() => setIsSourceSelectOpen(!isSourceSelectOpen)}
                >
                  <Text style={styles.selectText}>
                    {categories.find(cat => cat.id === newRevenu.id_categorie_revenu)?.nom || 'Sélectionner une catégorie'}
                  </Text>
                  <Text style={[styles.selectArrow, isSourceSelectOpen && styles.selectArrowOpen]}>
                    ▼
                  </Text>
                </TouchableOpacity>
                
                {isSourceSelectOpen && (
                  <View style={styles.selectDropdown}>
                    <ScrollView style={styles.selectOptions} showsVerticalScrollIndicator={false}>
                      {categories.map((categorie) => (
                        <TouchableOpacity
                          key={categorie.id}
                          style={[
                            styles.selectOption,
                            newRevenu.id_categorie_revenu === categorie.id && styles.selectOptionSelected
                          ]}
                          onPress={() => {
                            setNewRevenu({...newRevenu, id_categorie_revenu: categorie.id});
                            setIsSourceSelectOpen(false);
                          }}
                        >
                          <Text style={[
                            styles.selectOptionText,
                            newRevenu.id_categorie_revenu === categorie.id && styles.selectOptionTextSelected
                          ]}>
                            {categorie.nom}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Aperçu du revenu */}
              {newRevenu.description && newRevenu.montant && newRevenu.id_categorie_revenu && newRevenu.id_compte && (
                <View style={styles.previewCard}>
                  <Text style={styles.previewTitle}>Aperçu</Text>
                  <View style={styles.previewContent}>
                    <View style={styles.previewLeft}>
                      <View style={[styles.previewIcon, { backgroundColor: '#16a34a' }]}>
                        <Feather name="arrow-up-right" size={16} color="#fff" />
                      </View>
                      <View style={styles.previewInfo}>
                        <Text style={styles.previewDescription}>{newRevenu.description}</Text>
                        <Text style={styles.previewSource}>
                          {categories.find(cat => cat.id === newRevenu.id_categorie_revenu)?.nom || 'Catégorie'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.previewMontant}>+{formatMontant(newRevenu.montant)} Ar</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, creating && styles.saveButtonDisabled]} 
                onPress={createRevenu}
                disabled={creating || !newRevenu.description || !newRevenu.montant || !newRevenu.id_categorie_revenu || !newRevenu.id_compte}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
              <Text style={styles.saveButtonText}>Enregistrer</Text>
                )}
            </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de filtres */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrer les revenus</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)} style={styles.closeButton}>
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Source</Text>
                <View style={styles.sourceSelector}>
                  <TouchableOpacity
                    style={[styles.sourceOption, !selectedSource && styles.sourceOptionSelected]}
                    onPress={() => setSelectedSource('')}
                  >
                    <Text style={[styles.sourceOptionText, !selectedSource && styles.sourceOptionTextSelected]}>
                      Toutes les sources
                    </Text>
                  </TouchableOpacity>
                  {sources.map((source) => (
                    <TouchableOpacity
                      key={source.id}
                      style={[
                        styles.sourceOption,
                        selectedSource === source.nom && styles.sourceOptionSelected
                      ]}
                      onPress={() => setSelectedSource(source.nom)}
                    >
                      <View style={[styles.sourceOptionIcon, { backgroundColor: source.couleur }]}>
                        <Feather name={source.icon} size={16} color="#fff" />
                      </View>
                      <Text style={[
                        styles.sourceOptionText,
                        selectedSource === source.nom && styles.sourceOptionTextSelected
                      ]}>
                        {source.nom}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mois</Text>
                <View style={styles.monthSelector}>
                  <TouchableOpacity
                    style={[styles.monthOption, !selectedMonth && styles.monthOptionSelected]}
                    onPress={() => setSelectedMonth('')}
                  >
                    <Text style={[styles.monthOptionText, !selectedMonth && styles.monthOptionTextSelected]}>
                      Tous les mois
                    </Text>
                  </TouchableOpacity>
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = new Date(2024, i);
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.monthOption,
                          selectedMonth === i.toString() && styles.monthOptionSelected
                        ]}
                        onPress={() => setSelectedMonth(i.toString())}
                      >
                        <Text style={[
                          styles.monthOptionText,
                          selectedMonth === i.toString() && styles.monthOptionTextSelected
                        ]}>
                          {date.toLocaleDateString('fr-FR', { month: 'long' })}
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
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.cancelButtonText}>Fermer</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => {
                  setSelectedSource('');
                  setSelectedMonth('');
                  setSelectedCategory('');
                }}
              >
                <Text style={styles.clearButtonText}>Effacer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal d'édition */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier le revenu</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.closeButton}>
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Salaire mensuel, Projet freelance..."
                  value={editingRevenu?.description || ''}
                  onChangeText={(text) => setEditingRevenu({...editingRevenu, description: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Montant (Ar)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0,00"
                  keyboardType="numeric"
                  value={editingRevenu?.montant || ''}
                  onChangeText={(text) => setEditingRevenu({...editingRevenu, montant: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={editingRevenu?.date_revenu || ''}
                  onChangeText={(text) => setEditingRevenu({...editingRevenu, date_revenu: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Source</Text>
                <View style={styles.sourceSelector}>
                  {sources.map((source) => (
                    <TouchableOpacity
                      key={source.id}
                      style={[
                        styles.sourceOption,
                        editingRevenu?.source === source.nom && styles.sourceOptionSelected
                      ]}
                      onPress={() => setEditingRevenu({...editingRevenu, source: source.nom})}
                    >
                      <View style={[styles.sourceOptionIcon, { backgroundColor: source.couleur }]}>
                        <Feather name={source.icon} size={16} color="#fff" />
                      </View>
                      <Text style={[
                        styles.sourceOptionText,
                        editingRevenu?.source === source.nom && styles.sourceOptionTextSelected
                      ]}>
                        {source.nom}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowEditModal(false)}
                disabled={updating}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, updating && styles.saveButtonDisabled]} 
                onPress={updateRevenu}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Modifier</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de suppression */}
      <Modal
        visible={showDeleteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Supprimer le revenu</Text>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)} style={styles.closeButton}>
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.deleteWarning}>
                <Feather name="alert-triangle" size={48} color="#ef4444" />
                <Text style={styles.deleteWarningTitle}>Attention !</Text>
                <Text style={styles.deleteWarningText}>
                  Êtes-vous sûr de vouloir supprimer ce revenu ?
                </Text>
                <Text style={styles.deleteWarningSubtext}>
                  Cette action est irréversible et supprimera définitivement le revenu.
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]} 
                onPress={deleteRevenu}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteButtonText}>Supprimer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  titleContent: {
    flex: 1,
    marginLeft: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  addRevenueButton: {
    backgroundColor: '#059669',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryCard: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#22c55e',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '500',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  addButton: {
    backgroundColor: '#059669',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  revenuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  revenuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  revenuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  revenuInfo: {
    flex: 1,
  },
  revenuDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  revenuSource: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  revenuDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  revenuMontant: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22c55e',
  },
  // Styles pour le modal amélioré
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
    maxWidth: 400,
    maxHeight: '80%',
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
    color: '#1e293b',
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
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    color: '#1e293b',
  },
  sourceSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sourceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: '45%',
  },
  sourceOptionSelected: {
    backgroundColor: '#f0fdf4',
    borderColor: '#059669',
  },
  sourceOptionIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sourceOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  sourceOptionTextSelected: {
    color: '#059669',
  },
  // Styles pour le sélecteur de compte
  compteSelector: {
    gap: 8,
  },
  compteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  compteOptionSelected: {
    backgroundColor: '#f0fdf4',
    borderColor: '#059669',
  },
  compteOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compteOptionInfo: {
    flex: 1,
  },
  compteOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  compteOptionNameSelected: {
    color: '#059669',
  },
  compteOptionType: {
    fontSize: 12,
    color: '#6b7280',
  },
  previewCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginTop: 8,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 12,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  previewIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  previewInfo: {
    flex: 1,
  },
  previewDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  previewSource: {
    fontSize: 12,
    color: '#6b7280',
  },
  previewMontant: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22c55e',
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
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  // Nouveaux styles pour les états
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Nouveaux styles pour les statistiques
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
  },
  statsGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  statCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statInfo: {
    flex: 1,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Styles pour la section "Dernier revenu"
  lastRevenueSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  lastRevenueCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  lastRevenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  lastRevenueIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lastRevenueInfo: {
    flex: 1,
  },
  lastRevenueDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  lastRevenueSource: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  lastRevenueAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastRevenueAmountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16a34a',
  },
  lastRevenueDate: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  // Styles pour la recherche et filtres
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionSubtitleContainer: {
    alignItems: 'flex-end',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  moreAvailableText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  // Styles pour les revenus avec actions
  revenuRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  revenuActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Styles pour les filtres
  clearFiltersButton: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginTop: 16,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
  },
  // Styles pour les sélecteurs de mois
  monthSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  monthOptionSelected: {
    backgroundColor: '#f0fdf4',
    borderColor: '#059669',
  },
  monthOptionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  monthOptionTextSelected: {
    color: '#059669',
    fontWeight: '600',
  },
  // Styles pour les boutons de modal
  clearButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  // Styles pour les avertissements de suppression
  deleteWarning: {
    alignItems: 'center',
    padding: 20,
  },
  deleteWarningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8,
  },
  deleteWarningText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteWarningSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Styles pour la liste mobile des revenus
  revenusList: {
    gap: 12,
    flexDirection: 'column',
  },
  revenuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  revenuCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  revenuCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  revenuIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  revenuCardInfo: {
    flex: 1,
  },
  revenuCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  revenuCardSource: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  revenuCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  revenuActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  revenuCardContent: {
    marginBottom: 10,
  },
  revenuCardAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  revenuAmountText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#16a34a',
  },
  revenuAmountBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  revenuCardDetails: {
    gap: 6,
  },
  revenuDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  revenuDetailText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  revenuCategoryBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  revenuCategoryText: {
    fontSize: 12,
    color: '#1d4ed8',
    fontWeight: '600',
  },
  revenuCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  revenuStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  revenuStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  revenuStatusText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  revenuCardMeta: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  revenuMetaText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  // Styles pour l'affichage de l'utilisateur
  revenuUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  revenuUserAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  revenuUserAvatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  revenuUserInitial: {
    fontSize: 9,
    color: '#16a34a',
    fontWeight: '700',
  },
  // Styles pour la pagination et chargement
  loadMoreContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  endOfListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  endOfListLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  endOfListText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  // Styles pour le dropdown de sélection des sources
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  selectText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  selectArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  selectArrowOpen: {
    transform: [{ rotate: '180deg' }],
  },
  selectDropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    maxHeight: 200,
  },
  selectOptions: {
    maxHeight: 150,
  },
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectOptionSelected: {
    backgroundColor: '#f0fdf4',
  },
  selectOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectOptionTextSelected: {
    color: '#059669',
    fontWeight: '500',
  },
});

export default RevenusScreen;
