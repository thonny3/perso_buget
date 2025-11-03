import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { accountService, revenuesService, budgetService, objectifsService } from '../services/apiService';

const EditFormScreen = ({ navigation, route }) => {
  const { revenuData, budgetData, objectifData, onSuccess } = route.params || {};
  
  // Formater la date au format YYYY-MM-DD
  const formatDate = (dateStr) => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    // Si la date contient 'T', c'est au format ISO, extraire seulement la date
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    return dateStr;
  };
  
  const [formData, setFormData] = useState(
    budgetData
      ? {
          mois: budgetData?.mois || new Date().toISOString().slice(0, 7),
          montant_max: budgetData?.montant_max?.toString() || '',
        }
      : objectifData
      ? {
          nom: objectifData?.nom || '',
          montant_objectif: objectifData?.montant_objectif?.toString() || '',
          date_limite: objectifData?.date_limite?.slice(0, 10) || '',
          montant_actuel: objectifData?.montant_actuel?.toString() || '0',
          icone: objectifData?.icone || 'Target',
          couleur: objectifData?.couleur || '#3B82F6',
        }
      : {
          description: revenuData?.source || '',
          montant: revenuData?.montant?.toString() || '',
          id_categorie_revenu: revenuData?.id_categorie_revenu || '',
          id_compte: revenuData?.id_compte || '',
          date_revenu: formatDate(revenuData?.date_revenu),
        }
  );
  
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isSourceSelectOpen, setIsSourceSelectOpen] = useState(false);
  const [sourceSearchText, setSourceSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [comptes, setComptes] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Catégories par défaut en cas de problème de chargement
  const defaultCategories = [
    { id: 1, nom: 'Salaire' },
    { id: 2, nom: 'Prime' },
    { id: 3, nom: 'Freelance / Mission' },
    { id: 4, nom: 'Investissements' },
    { id: 5, nom: 'Dividendes' },
    { id: 6, nom: 'Ventes / Revente' },
    { id: 7, nom: 'Cadeaux / Héritage' },
    { id: 8, nom: 'Autres revenus' }
  ];

  // Charger les données nécessaires au montage du composant
  useEffect(() => {
    if (!budgetData && !objectifData) {
      loadComptes();
      loadCategories();
    } else {
      // Pour afficher le nom de la catégorie dans le formulaire Budget
      loadDepenseCategories();
    }
  }, [budgetData, objectifData]);

  // Charger les catégories de dépenses (pour Budget)
  const loadDepenseCategories = async () => {
    try {
      const result = await revenuesService.getRevenueCategories?.(); // fallback si service non importé
    } catch (_e) {}
    try {
      const { categoryService } = await import('../services/apiService');
      const resp = await categoryService.getCategoriesDepenses();
      if (resp.success) {
        setCategories(resp.data || []);
      }
    } catch (_err) {}
  };

  // Charger les comptes
  const loadComptes = async () => {
    try {
      console.log('🔄 Chargement des comptes...');
      const result = await accountService.getMyAccounts();
      console.log('📊 Résultat du chargement des comptes:', result);
      if (result.success) {
        setComptes(result.data || []);
        console.log('✅ Comptes chargés:', result.data);
      } else {
        console.error('❌ Erreur lors du chargement des comptes:', result.error);
      }
    } catch (err) {
      console.error('Erreur loadComptes:', err);
    }
  };

  // Charger les catégories pour le formulaire de revenus
  const loadCategories = async () => {
    try {
      console.log('🔄 Chargement des catégories de revenus...');
      const result = await revenuesService.getRevenueCategories();
      console.log('📊 Résultat du chargement des catégories:', result);
      if (result.success) {
        setCategories(result.data || []);
        console.log('✅ Catégories chargées:', result.data);
      } else {
        console.error('❌ Erreur lors du chargement des catégories:', result.error);
        
        // Utiliser les catégories par défaut en cas d'échec
        setCategories(defaultCategories);
        console.log('🔄 Utilisation des catégories par défaut');
        
        // Si c'est un problème d'authentification, afficher un message spécifique
        if (result.requiresAuth) {
          Alert.alert(
            'Session expirée', 
            'Votre session a expiré. Veuillez vous reconnecter pour continuer.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (err) {
      console.error('❌ Erreur loadCategories:', err);
      // Utiliser les catégories par défaut en cas d'erreur
      setCategories(defaultCategories);
      console.log('🔄 Utilisation des catégories par défaut (erreur)');
      Alert.alert('Erreur', 'Impossible de charger les catégories. Vérifiez votre connexion.');
    }
  };

  const handleFormSubmit = async () => {
    if (budgetData) {
      // Edition d'un budget
      const maxNum = parseFloat(formData.montant_max);
      if (!Number.isFinite(maxNum) || maxNum < 0) {
        Alert.alert('Erreur', 'Le montant maximum est invalide');
        return;
      }
      try {
        const id_budget = budgetData.id_budget || budgetData.id;
        const result = await budgetService.updateBudget(id_budget, {
          montant_max: maxNum,
          // Conserver la valeur actuelle du restant côté serveur
          montant_restant: budgetData.montant_restant,
        });
        if (result.success) {
          Alert.alert('Succès', 'Budget modifié avec succès!');
          navigation.goBack();
          if (onSuccess) onSuccess(result.data);
        } else {
          Alert.alert('Erreur', result.error || 'Erreur lors de la modification du budget');
        }
      } catch (e) {
        Alert.alert('Erreur', 'Erreur de connexion. Veuillez réessayer.');
      }
      return;
    }
    if (objectifData) {
      // Edition d'un objectif
      if (!formData.nom || !formData.nom.trim()) {
        Alert.alert('Erreur', 'Le nom est requis');
        return;
      }
      const montantObj = parseFloat(formData.montant_objectif);
      if (!Number.isFinite(montantObj) || montantObj <= 0) {
        Alert.alert('Erreur', 'Le montant objectif est invalide');
        return;
      }
      try {
        const id_objectif = objectifData.id_objectif || objectifData.id;
        const result = await objectifsService.updateObjectif(id_objectif, {
          nom: formData.nom.trim(),
          montant_objectif: montantObj,
          date_limite: formData.date_limite,
          montant_actuel: formData.montant_actuel ? parseFloat(formData.montant_actuel) : 0,
          icone: formData.icone || 'Target',
          couleur: formData.couleur || '#3B82F6',
        });
        if (result.success) {
          Alert.alert('Succès', 'Objectif modifié avec succès!');
          navigation.goBack();
          if (onSuccess) onSuccess(result.data);
        } else {
          Alert.alert('Erreur', result.error || 'Erreur lors de la modification de l\'objectif');
        }
      } catch (e) {
        Alert.alert('Erreur', 'Erreur de connexion. Veuillez réessayer.');
      }
      return;
    }
    // Validation pour le revenu
    if (!formData.description || !formData.description.trim()) {
      Alert.alert('Erreur', 'La description est requise');
      return;
    }
    
    if (!formData.montant || parseFloat(formData.montant) <= 0) {
      Alert.alert('Erreur', 'Le montant doit être positif');
      return;
    }

    if (!formData.id_categorie_revenu) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return;
    }

    if (!formData.id_compte) {
      Alert.alert('Erreur', 'Veuillez sélectionner un compte');
      return;
    }

    setIsLoading(true);

    try {
      // Formater la date correctement (YYYY-MM-DD)
      let dateFormatee = '';
      if (formData.date_revenu) {
        // Si c'est déjà au format YYYY-MM-DD, utiliser tel quel
        if (formData.date_revenu.includes('T')) {
          dateFormatee = formData.date_revenu.split('T')[0];
        } else {
          dateFormatee = formData.date_revenu;
        }
      } else {
        dateFormatee = new Date().toISOString().split('T')[0];
      }
      
      const revenuUpdateData = {
        source: formData.description.trim(), // Mapper description vers source pour la base de données
        montant: parseFloat(formData.montant),
        id_categorie_revenu: formData.id_categorie_revenu,
        id_compte: formData.id_compte,
        date_revenu: dateFormatee
      };

      // Récupérer l'ID du revenu original depuis route.params
      const revenuId = revenuData?.id_revenu || revenuData?.id;
      
      console.log('📤 ========== MISE À JOUR REVENU ==========');
      console.log('🆔 ID du revenu à mettre à jour:', revenuId);
      console.log('📝 Données originales (route.params):', revenuData);
      console.log('📋 Nouvelles données à envoyer:', revenuUpdateData);
      console.log('========================================');

      const result = await revenuesService.updateRevenue(revenuId, revenuUpdateData);

      if (result.success) {
        console.log('✅ Revenu mis à jour avec succès:', result.data);
        Alert.alert('Succès', 'Revenu modifié avec succès!');
        
        // Retourner à l'écran précédent
        navigation.goBack();
        if (onSuccess) onSuccess(result.data);
      } else {
        console.error('❌ Erreur lors de la mise à jour du revenu:', result.error);
        Alert.alert('Erreur', result.error || 'Erreur lors de la modification du revenu');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du revenu:', error);
      Alert.alert('Erreur', 'Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const resetForm = () => {
    setFormData({
      description: revenuData?.source || '',
      montant: revenuData?.montant?.toString() || '',
      id_categorie_revenu: revenuData?.id_categorie_revenu || '',
      id_compte: revenuData?.id_compte || '',
      date_revenu: formatDate(revenuData?.date_revenu)
    });
  };

  const renderRevenueForm = () => (
    <View style={styles.formContainer}>
      {/* Formulaire */}
      <View style={styles.formContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: Salaire mensuel, Projet freelance..."
            placeholderTextColor="#9ca3af"
            value={formData.description || ''}
            onChangeText={(text) => setFormData({...formData, description: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Montant (Ar)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={formData.montant || ''}
            onChangeText={(text) => setFormData({...formData, montant: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date</Text>
          <TextInput
            style={styles.textInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
            value={formData.date_revenu || new Date().toISOString().split('T')[0]}
            onChangeText={(text) => setFormData({...formData, date_revenu: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Compte</Text>
          <TouchableOpacity 
            style={styles.selectContainer}
            onPress={() => setIsSelectOpen(!isSelectOpen)}
          >
            <Text style={styles.selectText}>
              {comptes.find(c => (c.id_compte || c.id) === formData.id_compte)?.nom || 'Sélectionner un compte'}
            </Text>
            <Text style={[styles.selectArrow, isSelectOpen && styles.selectArrowOpen]}>
              ▼
            </Text>
          </TouchableOpacity>
          
          {isSelectOpen && (
            <View style={styles.selectDropdown}>
              <ScrollView style={styles.selectOptions} showsVerticalScrollIndicator={false}>
                {comptes.map((compte) => (
                  <TouchableOpacity
                    key={compte.id_compte || compte.id}
                    style={[
                      styles.selectOption,
                      formData.id_compte === (compte.id_compte || compte.id) && styles.selectOptionSelected
                    ]}
                    onPress={() => {
                      setFormData({...formData, id_compte: compte.id_compte || compte.id});
                      setIsSelectOpen(false);
                    }}
                  >
                    <Text style={[
                      styles.selectOptionText,
                      formData.id_compte === (compte.id_compte || compte.id) && styles.selectOptionTextSelected
                    ]}>
                      {compte.nom || 'Compte'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Catégorie</Text>
          <TouchableOpacity 
            style={styles.selectContainer}
            onPress={() => setIsSourceSelectOpen(!isSourceSelectOpen)}
          >
            <Text style={styles.selectText}>
              {categories.find(cat => cat.id === formData.id_categorie_revenu)?.nom || 'Sélectionner une catégorie'}
            </Text>
            <Text style={[styles.selectArrow, isSourceSelectOpen && styles.selectArrowOpen]}>
              ▼
            </Text>
          </TouchableOpacity>
          
          {isSourceSelectOpen && (
            <View style={styles.selectDropdown}>
              <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher une catégorie..."
                  placeholderTextColor="#9ca3af"
                  value={sourceSearchText}
                  onChangeText={setSourceSearchText}
                />
              </View>
              
              <ScrollView style={styles.selectOptions} showsVerticalScrollIndicator={false}>
                {(() => {
                  const filteredCategories = categories.filter(categorie => 
                    categorie.nom.toLowerCase().includes(sourceSearchText.toLowerCase())
                  );
                  console.log('📋 Catégories filtrées:', filteredCategories.length, 'sur', categories.length);
                  return filteredCategories;
                })().map((categorie) => (
                  <TouchableOpacity
                    key={categorie.id}
                    style={[
                      styles.selectOption,
                      formData.id_categorie_revenu === categorie.id && styles.selectOptionSelected
                    ]}
                    onPress={() => {
                      setFormData({...formData, id_categorie_revenu: categorie.id});
                      setIsSourceSelectOpen(false);
                      setSourceSearchText('');
                    }}
                  >
                    <Text style={[
                      styles.selectOptionText,
                      formData.id_categorie_revenu === categorie.id && styles.selectOptionTextSelected
                    ]}>
                      {categorie.nom}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Boutons d'action */}
      <View style={styles.formButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleBack}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleFormSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Modifier</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBudgetEditForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mois (lecture seule)</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: '#f3f4f6' }]}
            editable={false}
            value={formData.mois || ''}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Catégorie de dépense (lecture seule)</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: '#f3f4f6' }]}
            editable={false}
            value={
              categories.find((c) => c.id === (budgetData?.id_categorie_depense || budgetData?.id_categories_depenses))?.nom
              || 'Catégorie'
            }
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Montant maximum (Ar)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={formData.montant_max || ''}
            onChangeText={(text) => setFormData({ ...formData, montant_max: text })}
          />
        </View>

        {/* Pas de champ "montant restant" en modification */}
      </View>

      <View style={styles.formButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleBack}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleFormSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Modifier</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={handleBack}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Modifier</Text>
              <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {budgetData ? renderBudgetEditForm() : renderRevenueForm()}
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '60%',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formContainer: {
    paddingVertical: 0,
  },
  formContent: {
    paddingVertical: 16,
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
  },
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
  },
  selectText: {
    fontSize: 16,
    color: '#1f2937',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#6b7280',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    paddingVertical: 4,
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
    backgroundColor: '#3b82f6',
  },
  selectOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectOptionTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
    paddingBottom: 20,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default EditFormScreen;
