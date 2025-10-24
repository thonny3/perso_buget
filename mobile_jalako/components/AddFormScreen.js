import React, { useState } from 'react';
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
import { accountService } from '../services/apiService';

const AddFormScreen = ({ visible, onClose, currentScreen, onSuccess }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Si on est dans portefeuille, afficher directement le formulaire de compte
  React.useEffect(() => {
    if (visible && currentScreen === 'portefeuille') {
      setSelectedType('compte');
      setShowForm(true);
    } else if (visible) {
      setSelectedType(null);
      setShowForm(false);
    }
  }, [visible, currentScreen]);

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setShowForm(true);
  };

  const handleFormSubmit = async () => {
    // Validation basique comme dans l'application web
    if (!formData.nom || !formData.nom.trim()) {
      Alert.alert('Erreur', 'Le nom du compte est requis');
      return;
    }
    
    if (!formData.solde || parseFloat(formData.solde) < 0) {
      Alert.alert('Erreur', 'Le solde doit être positif ou nul');
      return;
    }

    if (!formData.type) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type de compte');
      return;
    }

    setIsLoading(true);

    try {
      // Structure de données identique à l'application web
      const accountData = {
        nom: formData.nom.trim(),
        type: formData.type,
        solde: parseFloat(formData.solde) || 0,
      };

      console.log('Envoi des données du compte au backend:', accountData);

      // Appel API pour créer le compte
      const result = await accountService.createAccount(accountData);

      if (result.success) {
        console.log('Compte créé avec succès:', result.data);
        Alert.alert('Succès', 'Compte créé avec succès!');
        
        // Réinitialiser le formulaire
        setFormData({});
        setShowForm(false);
        setSelectedType(null);
        setIsSelectOpen(false);
        setSearchText('');
        onClose();
        
        // Appeler le callback de succès avec les données du compte créé
        if (onSuccess) onSuccess(result.data);
      } else {
        console.error('Erreur lors de la création du compte:', result.error);
        Alert.alert('Erreur', result.error || 'Erreur lors de la création du compte');
      }
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
      Alert.alert('Erreur', 'Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToOptions = () => {
    setShowForm(false);
    setSelectedType(null);
    setFormData({});
    setIsSelectOpen(false);
    setSearchText('');
  };

  const getFormOptions = () => {
    switch (currentScreen) {
      case 'portefeuille':
        return [
          { id: 'compte', label: 'Nouveau Compte', icon: '🏦' },
          { id: 'carte', label: 'Nouvelle Carte', icon: '💳' },
        ];
      case 'depenses':
        return [
          { id: 'depense', label: 'Nouvelle Dépense', icon: '💸' },
          { id: 'categorie', label: 'Nouvelle Catégorie', icon: '📂' },
        ];
      case 'revenus':
        return [
          { id: 'revenu', label: 'Nouveau Revenu', icon: '💰' },
          { id: 'salaire', label: 'Salaire', icon: '💼' },
        ];
      case 'budget':
        return [
          { id: 'budget', label: 'Nouveau Budget', icon: '📊' },
          { id: 'objectif', label: 'Nouvel Objectif', icon: '🎯' },
        ];
      case 'transactions':
        return [
          { id: 'transaction', label: 'Nouvelle Transaction', icon: '💳' },
          { id: 'transfert', label: 'Nouveau Transfert', icon: '🔄' },
        ];
      default:
        return [
          { id: 'depense', label: 'Nouvelle Dépense', icon: '💸' },
          { id: 'revenu', label: 'Nouveau Revenu', icon: '💰' },
          { id: 'budget', label: 'Nouveau Budget', icon: '📊' },
          { id: 'transaction', label: 'Nouvelle Transaction', icon: '💳' },
        ];
    }
  };

  const renderAccountForm = () => (
    <View style={styles.formContainer}>
      {/* Header simplifié */}
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Créer un nouveau compte</Text>
      </View>
      
      {/* Formulaire simplifié */}
      <View style={styles.formContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nom du compte</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: Compte Épargne"
            placeholderTextColor="#9ca3af"
            value={formData.nom || ''}
            onChangeText={(text) => setFormData({...formData, nom: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Type de compte</Text>
          <TouchableOpacity 
            style={styles.selectContainer}
            onPress={() => setIsSelectOpen(!isSelectOpen)}
          >
            <Text style={styles.selectText}>
              {formData.type === 'courant' ? 'Compte Courant' :
               formData.type === 'epargne' ? 'Épargne' :
               formData.type === 'investissement' ? 'Investissement' :
               formData.type === 'trading' ? 'Trading' :
               formData.type === 'crypto' ? 'Crypto' :
               'Sélectionner un type'}
            </Text>
            <Text style={[styles.selectArrow, isSelectOpen && styles.selectArrowOpen]}>
              ▼
            </Text>
          </TouchableOpacity>
          
          {isSelectOpen && (
            <View style={styles.selectDropdown}>
              <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher un type..."
                  placeholderTextColor="#9ca3af"
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>
              
              <ScrollView style={styles.selectOptions} showsVerticalScrollIndicator={false}>
                {[
                  { value: 'courant', label: 'Compte Courant' },
                  { value: 'epargne', label: 'Épargne' },
                  { value: 'investissement', label: 'Investissement' },
                  { value: 'trading', label: 'Trading' },
                  { value: 'crypto', label: 'Crypto' }
                ]
                .filter(type => 
                  type.label.toLowerCase().includes(searchText.toLowerCase())
                )
                .map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.selectOption,
                      formData.type === type.value && styles.selectOptionSelected
                    ]}
                    onPress={() => {
                      setFormData({...formData, type: type.value});
                      setIsSelectOpen(false);
                      setSearchText('');
                    }}
                  >
                    <Text style={[
                      styles.selectOptionText,
                      formData.type === type.value && styles.selectOptionTextSelected
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Solde initial (AR)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={formData.solde || ''}
            onChangeText={(text) => setFormData({...formData, solde: text})}
          />
        </View>
      </View>

      {/* Boutons d'action simplifiés */}
      <View style={styles.formButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleBackToOptions}
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
            <Text style={styles.submitButtonText}>Créer</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const formOptions = getFormOptions();

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
              <Text style={styles.title}>Ajouter</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {showForm && selectedType === 'compte' ? (
                renderAccountForm()
              ) : currentScreen === 'portefeuille' ? (
                // Si on est dans portefeuille mais pas encore de formulaire, afficher les options
                <>
                  <Text style={styles.subtitle}>
                    Que souhaitez-vous ajouter ?
                  </Text>
                  
                  <View style={styles.optionsContainer}>
                    {formOptions.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        style={styles.optionButton}
                        onPress={() => handleTypeSelect(option.id)}
                      >
                        <Text style={styles.optionIcon}>{option.icon}</Text>
                        <Text style={styles.optionLabel}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.subtitle}>
                    Que souhaitez-vous ajouter ?
                  </Text>
                  
                  <View style={styles.optionsContainer}>
                    {formOptions.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        style={styles.optionButton}
                        onPress={() => handleTypeSelect(option.id)}
                      >
                        <Text style={styles.optionIcon}>{option.icon}</Text>
                        <Text style={styles.optionLabel}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
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
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  // Styles pour le formulaire simplifié
  formContainer: {
    paddingVertical: 0,
  },
  formHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  formContent: {
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
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
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
  },
});

export default AddFormScreen;
