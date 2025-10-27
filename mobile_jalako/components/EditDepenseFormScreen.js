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
import { accountService, categoryService, depensesService } from '../services/apiService';

const EditDepenseFormScreen = ({ visible, onClose, depenseData, onSuccess }) => {
  // Formater la date au format YYYY-MM-DD
  const formatDate = (dateStr) => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    // Si la date contient 'T', c'est au format ISO, extraire seulement la date
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    return dateStr;
  };
  
  const [formData, setFormData] = useState({
    description: '',
    montant: '',
    id_categorie_depense: '',
    id_compte: '',
    date_depense: new Date().toISOString().split('T')[0]
  });
  
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isSourceSelectOpen, setIsSourceSelectOpen] = useState(false);
  const [sourceSearchText, setSourceSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [comptes, setComptes] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Catégories par défaut en cas de problème de chargement
  const defaultCategories = [
    { id: 1, nom: 'Alimentation' },
    { id: 2, nom: 'Transport' },
    { id: 3, nom: 'Logement' },
    { id: 4, nom: 'Santé' },
    { id: 5, nom: 'Loisirs' },
    { id: 6, nom: 'Éducation' },
    { id: 7, nom: 'Shopping' },
    { id: 8, nom: 'Autres dépenses' }
  ];

  // Charger les données initiales au montage
  useEffect(() => {
    if (visible && depenseData) {
      setFormData({
        description: depenseData.description || '',
        montant: depenseData.montant?.toString() || '',
        id_categorie_depense: depenseData.id_categorie_depense || '',
        id_compte: depenseData.id_compte?.toString() || '',
        date_depense: formatDate(depenseData.date_depense)
      });
      loadComptes();
      loadCategories();
    }
  }, [visible, depenseData]);

  // Charger les comptes
  const loadComptes = async () => {
    try {
      console.log('🔄 Chargement des comptes pour édition...');
      const result = await accountService.getMyAccounts();
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

  // Charger les catégories pour le formulaire de dépenses
  const loadCategories = async () => {
    try {
      console.log('🔄 Chargement des catégories de dépenses pour édition...');
      const result = await categoryService.getCategoriesDepenses();
      if (result.success) {
        setCategories(result.data || []);
        console.log('✅ Catégories de dépenses chargées:', result.data);
      } else {
        console.error('❌ Erreur lors du chargement des catégories de dépenses:', result.error);
        setCategories(defaultCategories);
      }
    } catch (err) {
      console.error('❌ Erreur loadCategories:', err);
      setCategories(defaultCategories);
    }
  };

  const handleFormSubmit = async () => {
    // Validation
    if (!formData.description || !formData.description.trim()) {
      Alert.alert('Erreur', 'La description est requise');
      return;
    }
    
    if (!formData.montant || parseFloat(formData.montant) <= 0) {
      Alert.alert('Erreur', 'Le montant doit être positif');
      return;
    }

    if (!formData.id_categorie_depense) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return;
    }

    if (!formData.id_compte) {
      Alert.alert('Erreur', 'Veuillez sélectionner un compte');
      return;
    }

    setIsLoading(true);

    try {
      const depenseUpdateData = {
        description: formData.description.trim(),
        montant: parseFloat(formData.montant),
        id_categorie_depense: parseInt(formData.id_categorie_depense),
        id_compte: parseInt(formData.id_compte),
        date_depense: formData.date_depense || new Date().toISOString().split('T')[0]
      };

      // Récupérer l'ID de la dépense
      const depenseId = depenseData?.id_depense || depenseData?.id;
      
      console.log('📤 ========== MISE À JOUR DEPENSE ==========');
      console.log('🆔 ID de la dépense à mettre à jour:', depenseId);
      console.log('📝 Données originales:', depenseData);
      console.log('📋 Nouvelles données à envoyer:', depenseUpdateData);
      console.log('========================================');

      const result = await depensesService.updateDepense(depenseId, depenseUpdateData);

      if (result.success) {
        console.log('✅ Dépense mise à jour avec succès:', result.data);
        Alert.alert('Succès', 'Dépense modifiée avec succès!');
        
        onClose();
        if (onSuccess) onSuccess(result.data);
      } else {
        console.error('❌ Erreur lors de la mise à jour de la dépense:', result.error);
        Alert.alert('Erreur', result.error || 'Erreur lors de la modification de la dépense');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la dépense:', error);
      Alert.alert('Erreur', 'Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Modifier la dépense</Text>
              <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.formContainer}>
                {/* Formulaire */}
                <View style={styles.formContent}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ex: Courses Carrefour, Essence..."
                      placeholderTextColor="#9ca3af"
                      value={formData.description}
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
                      value={formData.montant}
                      onChangeText={(text) => setFormData({...formData, montant: text})}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Date</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9ca3af"
                      value={formData.date_depense}
                      onChangeText={(text) => setFormData({...formData, date_depense: text})}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Compte</Text>
                    <TouchableOpacity 
                      style={styles.selectContainer}
                      onPress={() => setIsSelectOpen(!isSelectOpen)}
                    >
                      <Text style={styles.selectText}>
                        {comptes.find(c => (c.id_compte || c.id) == formData.id_compte)?.nom || 'Sélectionner un compte'}
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
                                formData.id_compte == (compte.id_compte || compte.id) && styles.selectOptionSelected
                              ]}
                              onPress={() => {
                                setFormData({...formData, id_compte: (compte.id_compte || compte.id).toString()});
                                setIsSelectOpen(false);
                              }}
                            >
                              <Text style={[
                                styles.selectOptionText,
                                formData.id_compte == (compte.id_compte || compte.id) && styles.selectOptionTextSelected
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
                        {categories.find(cat => cat.id == formData.id_categorie_depense)?.nom || 'Sélectionner une catégorie'}
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
                          {categories.filter(categorie => 
                            categorie.nom.toLowerCase().includes(sourceSearchText.toLowerCase())
                          ).map((categorie) => (
                            <TouchableOpacity
                              key={categorie.id}
                              style={[
                                styles.selectOption,
                                formData.id_categorie_depense == categorie.id && styles.selectOptionSelected
                              ]}
                              onPress={() => {
                                setFormData({...formData, id_categorie_depense: categorie.id.toString()});
                                setIsSourceSelectOpen(false);
                                setSourceSearchText('');
                              }}
                            >
                              <Text style={[
                                styles.selectOptionText,
                                formData.id_categorie_depense == categorie.id && styles.selectOptionTextSelected
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

export default EditDepenseFormScreen;

