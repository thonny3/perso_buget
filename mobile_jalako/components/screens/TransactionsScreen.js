import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, TextInput } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { transactionService } from '../../services/apiService';

const TransactionsScreen = ({ onBack }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('Toutes');
  const [dateFilterVisible, setDateFilterVisible] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const categories = [
    { nom: 'Toutes', active: true },
    { nom: 'Dépenses', active: false },
    { nom: 'Revenus', active: false },
    { nom: 'Transferts', active: false },
    { nom: 'Date', active: false, isDateFilter: true },
  ];

  // Fonction pour charger les transactions
  const loadTransactions = async () => {
    try {
      setError(null);
      const result = await transactionService.getTransactions();
      
      if (result.success) {
        setTransactions(result.data || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erreur lors du chargement des transactions');
      console.error('Erreur loadTransactions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fonction pour rafraîchir les données
  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  // Fonction pour gérer les filtres
  const handleFilterPress = (filterName, isDateFilter = false) => {
    if (isDateFilter) {
      setDateFilterVisible(true);
    } else {
      setSelectedFilter(filterName);
      setCurrentPage(1); // Reset à la première page
    }
  };

  // Fonction pour filtrer les transactions
  const getFilteredTransactions = () => {
    let filtered = transactions;
    
    // Filtre par type
    if (selectedFilter !== 'Toutes') {
      const filterMap = {
        'Dépenses': 'depense',
        'Revenus': 'revenu',
        'Transferts': 'transfert'
      };
      
      filtered = filtered.filter(transaction => 
        transaction.type === filterMap[selectedFilter]
      );
    }
    
    // Filtre par date
    if (startDate && endDate) {
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date_transaction || transaction.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return transactionDate >= start && transactionDate <= end;
      });
    }
    
    return filtered;
  };

  // Fonction pour obtenir les transactions paginées
  const getPaginatedTransactions = () => {
    const filtered = getFilteredTransactions();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  // Fonction pour obtenir le nombre total de pages
  const getTotalPages = () => {
    const filtered = getFilteredTransactions();
    return Math.ceil(filtered.length / itemsPerPage);
  };

  // Fonction pour aller à la page suivante
  const goToNextPage = () => {
    const totalPages = getTotalPages();
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Fonction pour aller à la page précédente
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Fonction pour aller à une page spécifique
  const goToPage = (page) => {
    const totalPages = getTotalPages();
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Fonction pour formater le montant
  const formatMontant = (montant, type) => {
    const amount = parseFloat(montant) || 0;
    const formatted = amount.toLocaleString('fr-FR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    
    if (type === 'revenu') {
      return `+${formatted} Ar`;
    } else {
      return `-${formatted} Ar`;
    }
  };

  // Fonction pour obtenir la couleur selon le type
  const getTransactionColor = (type) => {
    switch (type) {
      case 'depense': return '#ef4444';
      case 'revenu': return '#22c55e';
      case 'transfert': return '#3b82f6';
      default: return '#6b7280';
    }
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

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'depense': return 'arrow-down-right';
      case 'revenu': return 'arrow-up-right';
      case 'transfert': return 'arrow-left-right';
      default: return 'circle';
    }
  };

  // Récupérer libellés compte et utilisateur
  const getAccountName = (t) => (
    t?.compte?.nom || t?.compte_nom || t?.nom_compte || t?.account_name || t?.compte || 'Compte'
  );
  const getUserName = (t) => {
    const name = (
      t?.utilisateur?.nom || t?.utilisateur?.username || t?.utilisateur?.prenom || t?.utilisateur?.name ||
      t?.user?.nom || t?.user?.username || t?.user?.prenom || t?.user?.name ||
      t?.user_name || t?.nom_utilisateur || t?.username || t?.name || t?.email || t?.utilisateur
    );
    return name || '';
  };

  // Fonction pour créer une nouvelle transaction
  const createNewTransaction = () => {
    Alert.alert(
      'Nouvelle transaction',
      'Fonctionnalité de création de transaction à implémenter',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  // Fonction pour appliquer le filtre de date
  const applyDateFilter = () => {
    if (startDate && endDate) {
      setSelectedFilter('Date');
      setCurrentPage(1);
      setDateFilterVisible(false);
    } else {
      Alert.alert('Erreur', 'Veuillez sélectionner une date de début et une date de fin');
    }
  };

  // Fonction pour effacer le filtre de date
  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setSelectedFilter('Toutes');
    setCurrentPage(1);
    setDateFilterVisible(false);
  };

  // Fonction pour obtenir la date d'aujourd'hui au format YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Fonction pour obtenir la date d'il y a 30 jours au format YYYY-MM-DD
  const get30DaysAgoDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  };

  // Charger les transactions au montage du composant
  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions = getFilteredTransactions();
  const paginatedTransactions = getPaginatedTransactions();

  // Totaux pour cartes
  const sumByType = (list, predicate) => list.reduce((s, t) => s + Number(t.montant || 0) * (predicate(t) ? 1 : 0), 0);
  const totalRevenus = sumByType(transactions, (t) => t.type === 'revenu');
  const totalDepenses = sumByType(transactions, (t) => t.type === 'depense');
  const isContribution = (t) => (t.type === 'contribution') || (String(t.categorie || '').toLowerCase().includes('contrib'));
  const totalContributions = sumByType(transactions, isContribution);
  const formatAmount = (n) => Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Mes Transactions</Text>
            <Text style={styles.subtitle}>Historique de vos mouvements</Text>
          </View>
        </View>
      </View>

      {/* Cartes de synthèse */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statHeaderRow}>
            <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
              <Feather name="arrow-up-right" size={18} color="#3b82f6" />
            </View>
            <Text style={styles.statLabel}>Revenus</Text>
          </View>
          <Text style={[styles.statValue, { color: '#10b981' }]}>{formatAmount(totalRevenus)} Ar</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statHeaderRow}>
            <View style={[styles.statIcon, { backgroundColor: '#fee2e2' }]}>
              <Feather name="arrow-down-right" size={18} color="#ef4444" />
            </View>
            <Text style={styles.statLabel}>Dépenses</Text>
          </View>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>{formatAmount(totalDepenses)} Ar</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statHeaderRow}>
            <View style={[styles.statIcon, { backgroundColor: '#d1fae5' }]}>
              <Feather name="gift" size={18} color="#10b981" />
            </View>
            <Text style={styles.statLabel}>Contributions</Text>
          </View>
          <Text style={[styles.statValue, { color: '#059669' }]}>{formatAmount(totalContributions)} Ar</Text>
        </View>
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((categorie, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterChip, 
                selectedFilter === categorie.nom && styles.activeFilterChip
              ]}
              activeOpacity={0.7}
              onPress={() => handleFilterPress(categorie.nom, categorie.isDateFilter)}
            >
              <Text style={[
                styles.filterText, 
                selectedFilter === categorie.nom && styles.activeFilterText
              ]}>
                {categorie.nom}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
          <Text style={styles.sectionTitle}>
            {selectedFilter === 'Toutes' ? 'Toutes les transactions' : selectedFilter}
          </Text>
          <View style={styles.headerRight}>
            <Text style={styles.transactionCount}>
              {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''}
            </Text>
            {selectedFilter === 'Date' && (startDate || endDate) && (
              <TouchableOpacity onPress={clearDateFilter} style={styles.clearDateButton}>
                <Feather name="x-circle" size={16} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>Chargement des transactions...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={48} color="#ef4444" />
            <Text style={styles.errorTitle}>Erreur de chargement</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadTransactions}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>Aucune transaction</Text>
            <Text style={styles.emptyText}>
              {selectedFilter === 'Toutes' 
                ? 'Vous n\'avez pas encore de transactions' 
                : `Aucune transaction de type "${selectedFilter.toLowerCase()}"`}
            </Text>
          </View>
        ) : (
          paginatedTransactions.map((transaction) => (
            <TouchableOpacity key={transaction.id_transaction || transaction.id} style={styles.transactionCard} activeOpacity={0.7}>
            <View style={styles.transactionLeft}>
                <View style={[styles.transactionIcon, { backgroundColor: getTransactionColor(transaction.type) }]}>
                <Feather 
                  name={getTransactionIcon(transaction.type)} 
                  size={20} 
                  color="#fff" 
                />
              </View>
              <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description || transaction.nom || 'Transaction'}
                  </Text>
                  <Text style={styles.transactionCategory}>
                    {transaction.categorie || transaction.type || 'Non catégorisé'}
                  </Text>
                  <View style={styles.infoChips}>
                    <View style={[styles.chip, { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }]}>
                      <Feather name="credit-card" size={12} color="#475569" style={styles.chipIcon} />
                      <Text style={styles.chipText}>{getAccountName(transaction)}</Text>
                    </View>
                    {!!getUserName(transaction) && (
                      <View style={[styles.chip, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
                        <Feather name="user" size={12} color="#047857" style={styles.chipIcon} />
                        <Text style={[styles.chipText, { color: '#065f46' }]}>{getUserName(transaction)}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.date_transaction || transaction.date || new Date())}
                  </Text>
                </View>
            </View>
            <View style={styles.transactionRight}>
              <Text style={[
                styles.transactionMontant,
                { color: transaction.type === 'revenu' ? '#22c55e' : '#ef4444' }
              ]}>
                  {formatMontant(transaction.montant, transaction.type)}
              </Text>
            </View>
          </TouchableOpacity>
          ))
        )}

        {/* Contrôles de pagination */}
        {filteredTransactions.length > 0 && (
          <View style={styles.paginationContainer}>
            <View style={styles.paginationInfo}>
              <Text style={styles.paginationText}>
                Page {currentPage} sur {getTotalPages()} • {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''}
                {filteredTransactions.length <= itemsPerPage && ' (Tous affichés)'}
              </Text>
            </View>

            {getTotalPages() > 1 && (
              <View style={styles.paginationControls}>
                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                  onPress={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  <Feather name="chevron-left" size={20} color={currentPage === 1 ? "#9ca3af" : "#059669"} />
                </TouchableOpacity>

                {/* Numéros de page */}
                <View style={styles.pageNumbers}>
                  {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => (
                    <TouchableOpacity
                      key={page}
                      style={[
                        styles.pageNumber,
                        currentPage === page && styles.pageNumberActive
                      ]}
                      onPress={() => goToPage(page)}
                    >
                      <Text style={[
                        styles.pageNumberText,
                        currentPage === page && styles.pageNumberTextActive
                      ]}>
                        {page}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === getTotalPages() && styles.paginationButtonDisabled]}
                  onPress={goToNextPage}
                  disabled={currentPage === getTotalPages()}
                >
                  <Feather name="chevron-right" size={20} color={currentPage === getTotalPages() ? "#9ca3af" : "#059669"} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton} 
          activeOpacity={0.7}
          onPress={createNewTransaction}
        >
          <Feather name="plus" size={20} color="#059669" />
          <Text style={styles.quickActionText}>Nouvelle transaction</Text>
        </TouchableOpacity>
      </View>

      {/* Modal pour le filtre de date */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={dateFilterVisible}
        onRequestClose={() => setDateFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrer par date</Text>
              <TouchableOpacity onPress={() => setDateFilterVisible(false)} style={styles.closeButton}>
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>Date de début</Text>
                <TextInput
                  style={styles.dateInput}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity 
                  style={styles.quickDateButton}
                  onPress={() => setStartDate(get30DaysAgoDate())}
                >
                  <Text style={styles.quickDateText}>Il y a 30 jours</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>Date de fin</Text>
                <TextInput
                  style={styles.dateInput}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity 
                  style={styles.quickDateButton}
                  onPress={() => setEndDate(getTodayDate())}
                >
                  <Text style={styles.quickDateText}>Aujourd'hui</Text>
                </TouchableOpacity>
              </View>

              {(startDate || endDate) && (
                <View style={styles.datePreview}>
                  <Text style={styles.datePreviewText}>
                    Période sélectionnée : {startDate || 'Début'} → {endDate || 'Fin'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setDateFilterVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton} 
                onPress={applyDateFilter}
              >
                <Text style={styles.applyButtonText}>Appliquer</Text>
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
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  filters: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#059669',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeFilterText: {
    color: '#fff',
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
  seeAllText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  transactionCard: {
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
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  infoChips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipIcon: {
    marginRight: 4,
  },
  chipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionMontant: {
    fontSize: 16,
    fontWeight: '700',
  },
  quickActions: {
    padding: 20,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#059669',
    borderStyle: 'dashed',
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 8,
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
  transactionCount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  // Styles pour l'en-tête avec bouton de suppression
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearDateButton: {
    padding: 4,
  },
  // Styles pour la pagination
  paginationContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  paginationInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  paginationText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationButtonDisabled: {
    backgroundColor: '#f9fafb',
  },
  pageNumbers: {
    flexDirection: 'row',
    gap: 4,
  },
  pageNumber: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageNumberActive: {
    backgroundColor: '#059669',
  },
  pageNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  pageNumberTextActive: {
    color: '#fff',
  },
  // Styles pour le modal de filtre de date
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
  dateInputContainer: {
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#f9fafb',
  },
  quickDateButton: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  quickDateText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '500',
  },
  datePreview: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  datePreviewText: {
    fontSize: 14,
    color: '#0369a1',
    fontWeight: '500',
    textAlign: 'center',
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
  applyButton: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default TransactionsScreen;
