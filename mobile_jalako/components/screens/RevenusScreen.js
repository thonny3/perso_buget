import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { revenuesService, accountService } from '../../services/apiService';

const RevenusScreen = ({ onBack }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRevenu, setNewRevenu] = useState({ montant: '', description: '', source: '', id_compte: '' });
  const [revenus, setRevenus] = useState([]);
  const [comptes, setComptes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);

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
    loadRevenus();
  };

  // Fonction pour créer un nouveau revenu
  const createRevenu = async () => {
    if (!newRevenu.description || !newRevenu.montant || !newRevenu.source || !newRevenu.id_compte) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setCreating(true);
    try {
      const result = await revenuesService.createRevenue({
        description: newRevenu.description,
        montant: parseFloat(newRevenu.montant),
        source: newRevenu.source,
        id_compte: newRevenu.id_compte
      });

      if (result.success) {
        Alert.alert('Succès', 'Revenu ajouté avec succès');
        // Réinitialiser le formulaire
        setNewRevenu({ montant: '', description: '', source: '', id_compte: '' });
        setShowAddModal(false);
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

  // Calculer le total des revenus
  const totalRevenus = revenus.reduce((sum, revenu) => {
    // Gérer les cas où montant est undefined, null, ou une chaîne vide
    if (revenu.montant === undefined || revenu.montant === null || revenu.montant === '') {
      return sum;
    }
    
    const montant = parseFloat(revenu.montant);
    return sum + (isNaN(montant) ? 0 : montant);
  }, 0);

  // Fonction pour fermer le modal et réinitialiser
  const closeModal = () => {
    setNewRevenu({ montant: '', description: '', source: '', id_compte: '' });
    setShowAddModal(false);
  };

  // Charger les revenus et comptes au montage du composant
  useEffect(() => {
    loadRevenus();
    loadComptes();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Mes Revenus</Text>
            <Text style={styles.subtitle}>Suivez vos sources de revenus</Text>
          </View>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Total ce mois</Text>
        <Text style={styles.summaryAmount}>{formatMontant(totalRevenus)} Ar</Text>
        <Text style={styles.summarySubtitle}>
          {revenus.length} revenu{revenus.length > 1 ? 's' : ''} enregistré{revenus.length > 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sources de revenus</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Feather name="plus" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.sourcesGrid}>
          {sources.map((source) => (
            <TouchableOpacity key={source.id} style={styles.sourceCard} activeOpacity={0.7}>
              <View style={[styles.sourceIcon, { backgroundColor: source.couleur }]}>
                <Feather name={source.icon} size={20} color="#fff" />
              </View>
              <Text style={styles.sourceLabel}>{source.nom}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
        <Text style={styles.sectionTitle}>Revenus récents</Text>
        
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
        ) : revenus.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="trending-up" size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>Aucun revenu</Text>
            <Text style={styles.emptyText}>Vous n'avez pas encore enregistré de revenus</Text>
          </View>
        ) : (
          revenus.map((revenu) => (
            <TouchableOpacity key={revenu.id_revenu || revenu.id} style={styles.revenuCard} activeOpacity={0.7}>
            <View style={styles.revenuLeft}>
                <View style={[styles.revenuIcon, { backgroundColor: getSourceColor(revenu.source) }]}>
                <Feather name="arrow-up-right" size={16} color="#fff" />
              </View>
              <View style={styles.revenuInfo}>
                  <Text style={styles.revenuDescription}>
                    {revenu.description || revenu.nom || 'Revenu'}
                  </Text>
                  <Text style={styles.revenuSource}>
                    {revenu.source || 'Non spécifié'}
                  </Text>
                  <Text style={styles.revenuDate}>
                    {formatDate(revenu.date_revenu || revenu.date || new Date())}
                  </Text>
                </View>
              </View>
              <Text style={styles.revenuMontant}>+{formatMontant(revenu.montant || 0)} Ar</Text>
          </TouchableOpacity>
          ))
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
                <Text style={styles.inputLabel}>Source</Text>
                <View style={styles.sourceSelector}>
                  {sources.map((source) => (
                    <TouchableOpacity
                      key={source.id}
                      style={[
                        styles.sourceOption,
                        newRevenu.source === source.nom && styles.sourceOptionSelected
                      ]}
                      onPress={() => setNewRevenu({...newRevenu, source: source.nom})}
                    >
                      <View style={[styles.sourceOptionIcon, { backgroundColor: source.couleur }]}>
                        <Feather name={source.icon} size={16} color="#fff" />
                      </View>
                      <Text style={[
                        styles.sourceOptionText,
                        newRevenu.source === source.nom && styles.sourceOptionTextSelected
                      ]}>
                        {source.nom}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Aperçu du revenu */}
              {newRevenu.description && newRevenu.montant && newRevenu.source && newRevenu.id_compte && (
                <View style={styles.previewCard}>
                  <Text style={styles.previewTitle}>Aperçu</Text>
                  <View style={styles.previewContent}>
                    <View style={styles.previewLeft}>
                      <View style={[styles.previewIcon, { backgroundColor: getSourceColor(newRevenu.source) }]}>
                        <Feather name="arrow-up-right" size={16} color="#fff" />
                      </View>
                      <View style={styles.previewInfo}>
                        <Text style={styles.previewDescription}>{newRevenu.description}</Text>
                        <Text style={styles.previewSource}>{newRevenu.source}</Text>
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
                disabled={creating || !newRevenu.description || !newRevenu.montant || !newRevenu.source || !newRevenu.id_compte}
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
  sourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sourceCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
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
});

export default RevenusScreen;
