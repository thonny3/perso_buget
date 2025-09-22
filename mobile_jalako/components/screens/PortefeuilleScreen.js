import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, TextInput } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { accountService, authService } from '../../services/apiService';

const PortefeuilleScreen = () => {
  const [comptes, setComptes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [userDevise, setUserDevise] = useState('MGA');
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [newCompte, setNewCompte] = useState({
    nom: '',
    solde: '',
    type: 'courant'
  });
  const [editingCompte, setEditingCompte] = useState(null);
  const [deletingCompte, setDeletingCompte] = useState(null);
  const [sharingCompte, setSharingCompte] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState('lecture');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [historiqueModalVisible, setHistoriqueModalVisible] = useState(false);

  const actionsRapides = [
    { id: 'ajouter', label: 'Ajouter un compte', icon: 'plus-circle', color: '#059669' },
    { id: 'transfert', label: 'Faire un transfert', icon: 'arrow-left-right', color: '#10b981' },
    { id: 'historique', label: 'Voir l\'historique', icon: 'clock', color: '#16a34a' },
  ];

  // Fonction pour charger les comptes
  const loadComptes = async () => {
    try {
      setError(null);
      
      // Récupérer d'abord les informations de l'utilisateur pour obtenir sa devise
      const userResult = await authService.getCurrentUser();
      if (userResult.success && userResult.data.devise) {
        setUserDevise(userResult.data.devise);
      }
      
      const result = await accountService.getMyAccounts();
      
      if (result.success) {
        // Transformer les données du backend pour correspondre au format attendu
        const comptesFormatted = result.data.map(compte => {
          const devise = compte.devise || userDevise;
          const deviseAffichage = devise === 'MGA' ? 'Ar' : devise;
          
          return {
            id: compte.id_compte,
            nom: compte.nom,
            solde: `${parseFloat(compte.solde).toLocaleString('fr-FR')} ${deviseAffichage}`,
            devise: deviseAffichage,
            type: compte.type || 'principal',
            couleur: getCouleurParType(compte.type)
          };
        });
        setComptes(comptesFormatted);
      } else {
        setError(result.error);
        Alert.alert('Erreur', result.error);
      }
    } catch (err) {
      const errorMessage = 'Erreur lors du chargement des comptes';
      setError(errorMessage);
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fonction pour obtenir la couleur selon le type de compte (thème vert)
  const getCouleurParType = (type) => {
    switch (type) {
      case 'principal':
        return '#059669';
      case 'epargne':
        return '#10b981';
      case 'investissement':
        return '#047857';
      case 'courant':
        return '#16a34a';
      case 'trading':
        return '#15803d';
      default:
        return '#6b7280';
    }
  };

  // Fonction pour rafraîchir les données
  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1); // Remettre à la première page lors du rafraîchissement
    loadComptes();
  };

  // Fonction pour calculer la pagination
  const getPaginatedComptes = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return comptes.slice(startIndex, endIndex);
  };

  // Fonction pour calculer le nombre total de pages
  const getTotalPages = () => {
    return Math.ceil(comptes.length / itemsPerPage);
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

  // Fonction pour voir l'historique des comptes
  const viewHistorique = () => {
    setHistoriqueModalVisible(true);
  };

  // Fonction pour fermer le modal d'historique
  const closeHistoriqueModal = () => {
    setHistoriqueModalVisible(false);
  };

  // Charger les comptes au montage du composant
  useEffect(() => {
    loadComptes();
  }, []);

  // Fonction pour créer un nouveau compte
  const createCompte = async () => {
    if (!newCompte.nom.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom pour le compte');
      return;
    }

    setCreating(true);
    try {
      const result = await accountService.createAccount({
        nom: newCompte.nom.trim(),
        solde: parseFloat(newCompte.solde) || 0,
        type: newCompte.type
      });

      if (result.success) {
        Alert.alert('Succès', 'Compte créé avec succès');
        setModalVisible(false);
        setNewCompte({ nom: '', solde: '', type: 'courant' });
        loadComptes(); // Recharger la liste des comptes
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur lors de la création du compte');
    } finally {
      setCreating(false);
    }
  };

  // Fonction pour ouvrir le modal d'ajout
  const openAddModal = () => {
    setModalVisible(true);
  };

  // Fonction pour fermer le modal
  const closeModal = () => {
    setModalVisible(false);
    setNewCompte({ nom: '', solde: '', type: 'courant' });
  };

  // Fonction pour ouvrir le modal d'édition
  const openEditModal = (compte) => {
    setEditingCompte({
      id: compte.id,
      nom: compte.nom,
      solde: compte.solde.replace(/[^\d.,]/g, '').replace(',', '.'), // Extraire le nombre du solde formaté
      type: compte.type
    });
    setEditModalVisible(true);
  };

  // Fonction pour fermer le modal d'édition
  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingCompte(null);
  };

  // Fonction pour ouvrir le modal de suppression
  const openDeleteModal = (compte) => {
    setDeletingCompte(compte);
    setDeleteModalVisible(true);
  };

  // Fonction pour fermer le modal de suppression
  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setDeletingCompte(null);
  };

  // Fonction pour ouvrir le modal de partage
  const openShareModal = (compte) => {
    setSharingCompte(compte);
    setShareEmail('');
    setShareRole('lecture');
    setShareModalVisible(true);
  };

  // Fonction pour fermer le modal de partage
  const closeShareModal = () => {
    setShareModalVisible(false);
    setSharingCompte(null);
    setShareEmail('');
    setShareRole('lecture');
  };

  // Fonction pour modifier un compte
  const updateCompte = async () => {
    if (!editingCompte.nom.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom pour le compte');
      return;
    }

    setUpdating(true);
    try {
      const result = await accountService.updateAccount(editingCompte.id, {
        nom: editingCompte.nom.trim(),
        solde: parseFloat(editingCompte.solde) || 0,
        type: editingCompte.type
      });

      if (result.success) {
        Alert.alert('Succès', 'Compte modifié avec succès');
        closeEditModal();
        loadComptes(); // Recharger la liste des comptes
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur lors de la modification du compte');
    } finally {
      setUpdating(false);
    }
  };

  // Fonction pour supprimer un compte
  const deleteCompte = async () => {
    setDeleting(true);
    try {
      const result = await accountService.deleteAccount(deletingCompte.id);

      if (result.success) {
        Alert.alert('Succès', 'Compte supprimé avec succès');
        closeDeleteModal();
        loadComptes(); // Recharger la liste des comptes
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur lors de la suppression du compte');
    } finally {
      setDeleting(false);
    }
  };

  // Fonction pour partager un compte
  const shareCompte = async () => {
    if (!shareEmail.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shareEmail)) {
      Alert.alert('Erreur', 'Veuillez saisir un email valide');
      return;
    }

    setSharing(true);
    try {
      const result = await accountService.shareAccount(sharingCompte.id, {
        email: shareEmail.trim(),
        role: shareRole
      });

      if (result.success) {
        Alert.alert('Succès', 'Compte partagé avec succès');
        closeShareModal();
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur lors du partage du compte');
    } finally {
      setSharing(false);
    }
  };

  // Affichage de chargement
  if (loading) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Portefeuille</Text>
        <Text style={styles.subtitle}>Gérez vos comptes et vos finances</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement de vos comptes...</Text>
        </View>
      </View>
    );
  }

  // Affichage d'erreur
  if (error && comptes.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mon Portefeuille</Text>
          <Text style={styles.subtitle}>Gérez vos comptes et vos finances</Text>
        </View>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Erreur de chargement</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadComptes}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
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
            <View>
              <Text style={styles.title}>Mes Comptes</Text>
              <Text style={styles.subtitle}>Gérez vos comptes bancaires et financiers</Text>
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

      {/* Statistiques des comptes */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="layers" size={24} color="#059669" />
            </View>
            <Text style={styles.statValue}>{comptes.length}</Text>
            <Text style={styles.statLabel}>Total des comptes</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="dollar-sign" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.statValue}>
              {comptes.reduce((total, compte) => {
                const solde = parseFloat(compte.solde.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
                return total + solde;
              }, 0).toLocaleString('fr-FR')} Ar
            </Text>
            <Text style={styles.statLabel}>Solde total</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="user-plus" size={24} color="#8b5cf6" />
            </View>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Comptes partagés</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="pie-chart" size={24} color="#6366f1" />
            </View>
            <Text style={styles.statValue}>
              {comptes.length > 0
                ? (comptes.reduce((total, compte) => {
                    const solde = parseFloat(compte.solde.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
                    return total + solde;
                  }, 0) / comptes.length).toLocaleString('fr-FR') + ' Ar'
                : '0 Ar'
              }
            </Text>
            <Text style={styles.statLabel}>Solde moyen</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vos comptes</Text>
          <View style={styles.realtimeIndicator}>
            <View style={styles.realtimeDot} />
            <Text style={styles.realtimeText}>En temps réel</Text>
          </View>
        </View>
        
        {comptes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Feather name="wallet" size={64} color="#d1d5db" />
            </View>
            <Text style={styles.emptyTitle}>Aucun compte trouvé</Text>
            <Text style={styles.emptyText}>Commencez par créer votre premier compte pour suivre vos finances</Text>
            <TouchableOpacity style={styles.createAccountButton} onPress={openAddModal}>
              <Text style={styles.createAccountButtonText}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.accountsGrid}>
            {getPaginatedComptes().map((compte) => (
              <View key={compte.id} style={styles.compteCard}>
                {/* Élément décoratif de fond */}
                <View style={styles.cardBackground} />
                
                {/* En-tête de la carte */}
                <View style={styles.compteHeader}>
                  <View style={styles.compteLeft}>
                    <View style={[styles.compteIcon, { backgroundColor: compte.couleur }]}>
                      <Feather name="wallet" size={20} color="#fff" />
                    </View>
                    <View style={styles.compteInfo}>
                      <Text style={styles.compteNom}>{compte.nom}</Text>
                      <View style={styles.compteTypeContainer}>
                        <View style={[styles.typeBadge, { backgroundColor: compte.couleur + '20' }]}>
                          <Text style={[styles.compteType, { color: compte.couleur }]}>
                            {compte.type === 'principal' ? 'Principal' : 
                             compte.type === 'epargne' ? 'Épargne' : 
                             compte.type === 'investissement' ? 'Investissement' :
                             compte.type === 'courant' ? 'Courant' :
                             compte.type === 'trading' ? 'Trading' : 'Autre'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  {/* Menu d'actions */}
                  <View style={styles.actionsMenu}>
                    <TouchableOpacity 
                      style={styles.actionButton} 
                      onPress={() => openShareModal(compte)}
                    >
                      <Feather name="share-2" size={16} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton} 
                      onPress={() => openEditModal(compte)}
                    >
                      <Feather name="edit-2" size={16} color="#059669" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton} 
                      onPress={() => openDeleteModal(compte)}
                    >
                      <Feather name="trash-2" size={16} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Solde principal */}
                <View style={styles.soldeSection}>
                  <Text style={styles.soldeMontant}>{compte.solde}</Text>
                  <Text style={styles.soldeLabel}>Solde actuel</Text>
                  <View style={styles.trendIndicator} />
                </View>

                {/* Section accès partagé */}
                <View style={styles.sharedAccessSection}>
                  <View style={styles.sharedAccessContent}>
                    <View style={styles.sharedAccessInfo}>
                      <Feather name="users" size={16} color="#6b7280" />
                      <Text style={styles.sharedAccessText}>Accès partagé</Text>
                    </View>
                    <View style={styles.sharedUsers}>
                      <View style={styles.userAvatar}>
                        <Text style={styles.userInitial}>M</Text>
                      </View>
                      <View style={styles.userAvatar}>
                        <Text style={styles.userInitial}>P</Text>
                      </View>
                      <TouchableOpacity style={styles.addUserButton}>
                        <Feather name="plus" size={16} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '60%' }]} />
                  </View>
                </View>

                {/* Indicateur d'activité */}
                <View style={styles.activityIndicator}>
                  <View style={styles.activityDot} />
                  <Text style={styles.activityText}>Actif</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {/* Contrôles de pagination */}
        {comptes.length > 0 && (
          <View style={styles.paginationContainer}>
            <View style={styles.paginationInfo}>
              <Text style={styles.paginationText}>
                Page {currentPage} sur {getTotalPages()} • {comptes.length} compte{comptes.length > 1 ? 's' : ''}
                {comptes.length <= itemsPerPage && ' (Tous affichés)'}
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
      </View>


      {/* Modal pour ajouter un compte */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter un compte</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
    </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom du compte</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: Compte principal"
                  value={newCompte.nom}
                  onChangeText={(text) => setNewCompte({...newCompte, nom: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Solde initial</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0"
                  value={newCompte.solde}
                  onChangeText={(text) => setNewCompte({...newCompte, solde: text})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type de compte</Text>
                <View style={styles.typeSelector}>
                  {[
                    { value: 'courant', label: 'Compte courant' },
                    { value: 'epargne', label: 'Épargne' },
                    { value: 'trading', label: 'Trading' },
                    { value: 'investissement', label: 'Investissement' }
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeOption,
                        newCompte.type === type.value && styles.typeOptionSelected
                      ]}
                      onPress={() => setNewCompte({...newCompte, type: type.value})}
                    >
                      <Text style={[
                        styles.typeOptionText,
                        newCompte.type === type.value && styles.typeOptionTextSelected
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={closeModal}
                disabled={creating}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.createButton, creating && styles.createButtonDisabled]} 
                onPress={createCompte}
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

      {/* Modal pour modifier un compte */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier le compte</Text>
              <TouchableOpacity onPress={closeEditModal} style={styles.closeButton}>
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom du compte</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: Compte principal"
                  value={editingCompte?.nom || ''}
                  onChangeText={(text) => setEditingCompte({...editingCompte, nom: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Solde</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0"
                  value={editingCompte?.solde || ''}
                  onChangeText={(text) => setEditingCompte({...editingCompte, solde: text})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type de compte</Text>
                <View style={styles.typeSelector}>
                  {[
                    { value: 'courant', label: 'Compte courant' },
                    { value: 'epargne', label: 'Épargne' },
                    { value: 'trading', label: 'Trading' },
                    { value: 'investissement', label: 'Investissement' }
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeOption,
                        editingCompte?.type === type.value && styles.typeOptionSelected
                      ]}
                      onPress={() => setEditingCompte({...editingCompte, type: type.value})}
                    >
                      <Text style={[
                        styles.typeOptionText,
                        editingCompte?.type === type.value && styles.typeOptionTextSelected
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={closeEditModal}
                disabled={updating}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.createButton, updating && styles.createButtonDisabled]} 
                onPress={updateCompte}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Modifier</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal pour supprimer un compte */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={closeDeleteModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Supprimer le compte</Text>
              <TouchableOpacity onPress={closeDeleteModal} style={styles.closeButton}>
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.deleteWarning}>
                <Feather name="alert-triangle" size={48} color="#ef4444" />
                <Text style={styles.deleteWarningTitle}>Attention !</Text>
                <Text style={styles.deleteWarningText}>
                  Êtes-vous sûr de vouloir supprimer le compte "{deletingCompte?.nom}" ?
                </Text>
                <Text style={styles.deleteWarningSubtext}>
                  Cette action est irréversible et supprimera définitivement le compte et toutes ses données associées.
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={closeDeleteModal}
                disabled={deleting}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.deleteConfirmButton, deleting && styles.createButtonDisabled]} 
                onPress={deleteCompte}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteConfirmButtonText}>Supprimer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal pour partager un compte */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={shareModalVisible}
        onRequestClose={closeShareModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Partager le compte</Text>
              <TouchableOpacity onPress={closeShareModal} style={styles.closeButton}>
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.shareInfo}>
                <View style={styles.shareAccountInfo}>
                  <View style={[styles.shareAccountIcon, { backgroundColor: sharingCompte?.couleur || '#059669' }]}>
                    <Feather name="wallet" size={20} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.shareAccountName}>{sharingCompte?.nom}</Text>
                    <Text style={styles.shareAccountType}>
                      {sharingCompte?.type === 'principal' ? 'Compte principal' : 
                       sharingCompte?.type === 'epargne' ? 'Compte épargne' : 
                       sharingCompte?.type === 'investissement' ? 'Investissements' :
                       sharingCompte?.type === 'courant' ? 'Compte courant' :
                       sharingCompte?.type === 'trading' ? 'Trading' : 'Autre'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email de l'utilisateur</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="exemple@email.com"
                  value={shareEmail}
                  onChangeText={setShareEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Rôle</Text>
                <View style={styles.roleSelector}>
                  {[
                    { value: 'lecture', label: 'Lecture seule', description: 'Peut voir le compte' },
                    { value: 'ecriture', label: 'Lecture/Écriture', description: 'Peut modifier le compte' }
                  ].map((role) => (
                    <TouchableOpacity
                      key={role.value}
                      style={[
                        styles.roleOption,
                        shareRole === role.value && styles.roleOptionSelected
                      ]}
                      onPress={() => setShareRole(role.value)}
                    >
                      <View style={styles.roleOptionContent}>
                        <Text style={[
                          styles.roleOptionText,
                          shareRole === role.value && styles.roleOptionTextSelected
                        ]}>
                          {role.label}
                        </Text>
                        <Text style={[
                          styles.roleOptionDescription,
                          shareRole === role.value && styles.roleOptionDescriptionSelected
                        ]}>
                          {role.description}
                        </Text>
                      </View>
                      <View style={[
                        styles.roleRadio,
                        shareRole === role.value && styles.roleRadioSelected
                      ]}>
                        {shareRole === role.value && (
                          <View style={styles.roleRadioInner} />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={closeShareModal}
                disabled={sharing}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.createButton, sharing && styles.createButtonDisabled]} 
                onPress={shareCompte}
                disabled={sharing}
              >
                {sharing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Partager</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal pour l'historique des comptes */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={historiqueModalVisible}
        onRequestClose={closeHistoriqueModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Historique des comptes</Text>
              <TouchableOpacity onPress={closeHistoriqueModal} style={styles.closeButton}>
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.historiqueStats}>
                <View style={styles.historiqueStatCard}>
                  <Feather name="wallet" size={24} color="#059669" />
                  <Text style={styles.historiqueStatValue}>{comptes.length}</Text>
                  <Text style={styles.historiqueStatLabel}>Comptes total</Text>
                </View>
                <View style={styles.historiqueStatCard}>
                  <Feather name="layers" size={24} color="#10b981" />
                  <Text style={styles.historiqueStatValue}>{getTotalPages()}</Text>
                  <Text style={styles.historiqueStatLabel}>Pages</Text>
                </View>
                <View style={styles.historiqueStatCard}>
                  <Feather name="trending-up" size={24} color="#16a34a" />
                  <Text style={styles.historiqueStatValue}>
                    {comptes.reduce((total, compte) => {
                      const solde = parseFloat(compte.solde.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
                      return total + solde;
                    }, 0).toLocaleString('fr-FR')} Ar
                  </Text>
                  <Text style={styles.historiqueStatLabel}>Total</Text>
                </View>
              </View>

              <View style={styles.historiqueDetails}>
                <Text style={styles.historiqueSectionTitle}>Répartition par type</Text>
                {['courant', 'epargne', 'trading', 'investissement'].map(type => {
                  const count = comptes.filter(c => c.type === type).length;
                  if (count === 0) return null;
                  return (
                    <View key={type} style={styles.historiqueTypeRow}>
                      <View style={styles.historiqueTypeInfo}>
                        <View style={[styles.historiqueTypeIcon, { backgroundColor: getCouleurParType(type) }]}>
                          <Feather name="wallet" size={16} color="#fff" />
                        </View>
                        <Text style={styles.historiqueTypeName}>
                          {type === 'courant' ? 'Courant' : 
                           type === 'epargne' ? 'Épargne' : 
                           type === 'trading' ? 'Trading' : 'Investissement'}
                        </Text>
                      </View>
                      <Text style={styles.historiqueTypeCount}>{count}</Text>
    </View>
                  );
                })}
              </View>

              <View style={styles.historiquePagination}>
                <Text style={styles.historiqueSectionTitle}>Pagination actuelle</Text>
                <View style={styles.historiquePaginationInfo}>
                  <Text style={styles.historiquePaginationText}>
                    Page {currentPage} sur {getTotalPages()}
                  </Text>
                  <Text style={styles.historiquePaginationText}>
                    {itemsPerPage} comptes par page
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={closeHistoriqueModal}
              >
                <Text style={styles.cancelButtonText}>Fermer</Text>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 16,
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
    fontSize: 20,
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
  accountsGrid: {
    gap: 16,
  },
  compteCard: {
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
  compteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  compteLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  compteIcon: {
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
  compteInfo: {
    flex: 1,
  },
  compteNom: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  compteTypeContainer: {
    flexDirection: 'row',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  compteType: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
  soldeSection: {
    marginBottom: 20,
    position: 'relative',
  },
  soldeMontant: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  soldeLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  trendIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
  },
  sharedAccessSection: {
    marginBottom: 16,
  },
  sharedAccessContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sharedAccessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sharedAccessText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  sharedUsers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: -8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    marginLeft: -8,
  },
  userInitial: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  addUserButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    marginLeft: -8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  activityIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  activityText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  // Styles pour les états de chargement et d'erreur
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
    marginBottom: 24,
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
  createAccountButton: {
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
  createAccountButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  typeOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  typeOptionTextSelected: {
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
    backgroundColor: '#059669',
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
  // Styles pour le modal de suppression
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
  deleteConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  deleteConfirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  // Styles pour le modal de partage
  shareInfo: {
    marginBottom: 20,
  },
  shareAccountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  shareAccountIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shareAccountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  shareAccountType: {
    fontSize: 12,
    color: '#6b7280',
  },
  roleSelector: {
    gap: 8,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  roleOptionSelected: {
    borderColor: '#059669',
    backgroundColor: '#f0fdf4',
  },
  roleOptionContent: {
    flex: 1,
  },
  roleOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  roleOptionTextSelected: {
    color: '#059669',
  },
  roleOptionDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  roleOptionDescriptionSelected: {
    color: '#047857',
  },
  roleRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleRadioSelected: {
    borderColor: '#059669',
  },
  roleRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059669',
  },
  // Styles pour la pagination
  paginationContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  paginationInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  paginationText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paginationButtonDisabled: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  pageNumbers: {
    flexDirection: 'row',
    gap: 4,
  },
  pageNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pageNumberActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  pageNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  pageNumberTextActive: {
    color: '#fff',
  },
  // Styles pour le modal d'historique
  historiqueStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  historiqueStatCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  historiqueStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  historiqueStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  historiqueDetails: {
    marginBottom: 24,
  },
  historiqueSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  historiqueTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  historiqueTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historiqueTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historiqueTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  historiqueTypeCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  historiquePagination: {
    marginBottom: 16,
  },
  historiquePaginationInfo: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  historiquePaginationText: {
    fontSize: 14,
    color: '#047857',
    fontWeight: '500',
    marginBottom: 4,
  },
});

export default PortefeuilleScreen;
