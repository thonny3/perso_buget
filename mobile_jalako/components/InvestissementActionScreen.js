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
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { accountService, investissementsService } from '../services/apiService';

const InvestissementActionScreen = ({ visible, onClose, investissement, onSuccess, onDelete }) => {
  const [activeAction, setActiveAction] = useState(null); // 'revenu', 'depense', 'edit'
  const [isLoading, setIsLoading] = useState(false);
  const [comptes, setComptes] = useState([]);
  
  // États pour les formulaires
  const [revenuForm, setRevenuForm] = useState({
    montant: '',
    date: new Date().toISOString().split('T')[0],
    type: '',
    note: '',
    id_compte: ''
  });
  
  const [depenseForm, setDepenseForm] = useState({
    montant: '',
    date: new Date().toISOString().split('T')[0],
    type: '',
    note: '',
    id_compte: ''
  });

  const [modifyForm, setModifyForm] = useState({
    nom: '',
    type: '',
    montant_investi: '',
    valeur_actuelle: '',
    description: '',
    date_achat: '',
    projet: '',
    duree_mois: '',
    taux_prevu: ''
  });

  React.useEffect(() => {
    if (visible && !activeAction) {
      loadComptes();
    }
    if (!visible) {
      setActiveAction(null);
    }
    // Initialiser le formulaire de modification avec les données de l'investissement
    if (visible && investissement && activeAction === 'edit') {
      setModifyForm({
        nom: investissement.nom || '',
        type: investissement.type || '',
        montant_investi: investissement.montant_investi ? investissement.montant_investi.toString() : '',
        valeur_actuelle: investissement.valeur_actuelle ? investissement.valeur_actuelle.toString() : '',
        description: investissement.description || '',
        date_achat: investissement.date_achat || '',
        projet: investissement.projet || '',
        duree_mois: investissement.duree_mois ? investissement.duree_mois.toString() : '',
        taux_prevu: investissement.taux_prevu ? investissement.taux_prevu.toString() : ''
      });
    }
  }, [visible, investissement, activeAction]);

  const loadComptes = async () => {
    try {
      const result = await accountService.getMyAccounts();
      if (result.success) {
        setComptes(result.data || []);
      }
    } catch (err) {
      console.error('Erreur loadComptes:', err);
    }
  };

  const handleBack = () => {
    if (activeAction) {
      setActiveAction(null);
    } else {
      onClose();
    }
  };

  // Fonction pour formater la date automatiquement
  const formatDateInput = (text) => {
    // Supprimer tous les caractères non numériques
    const numbers = text.replace(/\D/g, '');
    
    // Limiter à 8 chiffres maximum
    const limitedNumbers = numbers.slice(0, 8);
    
    // Formater selon le pattern YYYY-MM-DD
    if (limitedNumbers.length <= 4) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 6) {
      return `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(4)}`;
    } else {
      return `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(4, 6)}-${limitedNumbers.slice(6)}`;
    }
  };

  // Fonction pour valider une date
  const isValidDate = (dateString) => {
    if (!dateString) return true; // Date optionnelle
    
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date.toISOString().split('T')[0] === dateString;
  };

  const handleAddRevenu = async () => {
    if (!revenuForm.montant || parseFloat(revenuForm.montant) <= 0) {
      Alert.alert('Erreur', 'Le montant doit être positif');
      return;
    }

    setIsLoading(true);
    try {
      const result = await investissementsService.addRevenu(investissement.id_investissement || investissement.id, {
        montant: parseFloat(revenuForm.montant),
        date: revenuForm.date,
        type: revenuForm.type,
        note: revenuForm.note,
        id_compte: revenuForm.id_compte || null
      });

      if (result.success) {
        Alert.alert('Succès', 'Revenu ajouté avec succès!');
        setActiveAction(null);
        if (onSuccess) onSuccess();
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDepense = async () => {
    if (!depenseForm.montant || parseFloat(depenseForm.montant) <= 0) {
      Alert.alert('Erreur', 'Le montant doit être positif');
      return;
    }

    setIsLoading(true);
    try {
      const result = await investissementsService.addDepense(investissement.id_investissement || investissement.id, {
        montant: parseFloat(depenseForm.montant),
        date: depenseForm.date,
        type: depenseForm.type,
        note: depenseForm.note,
        id_compte: depenseForm.id_compte || null
      });

      if (result.success) {
        Alert.alert('Succès', 'Dépense ajoutée avec succès!');
        setActiveAction(null);
        if (onSuccess) onSuccess();
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModifyInvestment = async () => {
    if (!modifyForm.nom.trim()) {
      Alert.alert('Erreur', 'Le nom de l\'investissement est requis');
      return;
    }

    if (!modifyForm.montant_investi || parseFloat(modifyForm.montant_investi) <= 0) {
      Alert.alert('Erreur', 'Le montant investi doit être positif');
      return;
    }

    // Validation du format de date si une date est fournie
    if (modifyForm.date_achat && !isValidDate(modifyForm.date_achat)) {
      Alert.alert('Erreur', 'Le format de date doit être YYYY-MM-DD (ex: 2024-01-15)');
      return;
    }

    setIsLoading(true);
    try {
      const result = await investissementsService.updateInvestissement(investissement.id_investissement || investissement.id, {
        nom: modifyForm.nom.trim(),
        type: modifyForm.type.trim(),
        montant_investi: parseFloat(modifyForm.montant_investi),
        valeur_actuelle: modifyForm.valeur_actuelle ? parseFloat(modifyForm.valeur_actuelle) : null,
        description: modifyForm.description.trim(),
        date_achat: modifyForm.date_achat || null,
        projet: modifyForm.projet.trim() || null,
        duree_mois: modifyForm.duree_mois ? parseInt(modifyForm.duree_mois) : null,
        taux_prevu: modifyForm.taux_prevu ? parseFloat(modifyForm.taux_prevu) : null
      });

      if (result.success) {
        Alert.alert('Succès', 'Investissement modifié avec succès!');
        setActiveAction(null);
        if (onSuccess) onSuccess();
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer l\'investissement',
      `Êtes-vous sûr de vouloir supprimer "${investissement.nom}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await investissementsService.deleteInvestissement(
                investissement.id_investissement || investissement.id
              );
              if (result.success) {
                Alert.alert('Succès', 'Investissement supprimé avec succès!');
                if (onDelete) onDelete();
                onClose();
              } else {
                Alert.alert('Erreur', result.error);
              }
            } catch (error) {
              Alert.alert('Erreur', 'Erreur de connexion');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderActionMenu = () => (
    <View style={styles.actionMenuContainer}>
      <View style={styles.actionHeader}>
        <Text style={styles.actionTitle}>{investissement?.nom}</Text>
        <Text style={styles.actionSubtitle}>{investissement?.type}</Text>
      </View>

      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setActiveAction('revenu')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#dbeafe' }]}>
            <Feather name="trending-up" size={24} color="#3b82f6" />
          </View>
          <Text style={styles.actionLabel}>Ajouter revenu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setActiveAction('depense')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#fee2e2' }]}>
            <Feather name="trending-down" size={24} color="#ef4444" />
          </View>
          <Text style={styles.actionLabel}>Ajouter dépense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setActiveAction('edit')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
            <Feather name="edit-2" size={24} color="#f59e0b" />
          </View>
          <Text style={styles.actionLabel}>Modifier</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleDelete}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#fee2e2' }]}>
            <Feather name="trash-2" size={24} color="#ef4444" />
          </View>
          <Text style={styles.actionLabel}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRevenuForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Ajouter un revenu</Text>
      </View>
      
      <View style={styles.formContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Montant (Ar) *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={revenuForm.montant}
            onChangeText={(text) => setRevenuForm({...revenuForm, montant: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
            value={revenuForm.date}
            onChangeText={(text) => setRevenuForm({...revenuForm, date: text})}
          />
        </View>

         <View style={styles.inputGroup}>
           <Text style={styles.inputLabel}>Type (optionnel)</Text>
           <TextInput
             style={styles.textInput}
             placeholder="Ex: Dividendes, Loyer..."
             placeholderTextColor="#9ca3af"
             value={revenuForm.type}
             onChangeText={(text) => setRevenuForm({...revenuForm, type: text})}
           />
         </View>

         <View style={styles.inputGroup}>
           <Text style={styles.inputLabel}>Compte crédité</Text>
           <View style={styles.pickerContainer}>
             <Picker
               selectedValue={revenuForm.id_compte}
               onValueChange={(value) => setRevenuForm({...revenuForm, id_compte: value})}
               style={styles.picker}
             >
               <Picker.Item label="Sélectionner un compte..." value="" />
               {comptes.map((compte) => (
                 <Picker.Item 
                   key={compte.id_compte} 
                   label={`${compte.nom} (${compte.solde} Ar)`} 
                   value={compte.id_compte} 
                 />
               ))}
             </Picker>
           </View>
         </View>

         <View style={styles.inputGroup}>
           <Text style={styles.inputLabel}>Note (optionnel)</Text>
           <TextInput
             style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
             placeholder="Note..."
             placeholderTextColor="#9ca3af"
             multiline
             value={revenuForm.note}
             onChangeText={(text) => setRevenuForm({...revenuForm, note: text})}
           />
         </View>
      </View>

      <View style={styles.formButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => setActiveAction(null)}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} onPress={handleAddRevenu} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Ajouter</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDepenseForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Ajouter une dépense</Text>
      </View>
      
      <View style={styles.formContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Montant (Ar) *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={depenseForm.montant}
            onChangeText={(text) => setDepenseForm({...depenseForm, montant: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
            value={depenseForm.date}
            onChangeText={(text) => setDepenseForm({...depenseForm, date: text})}
          />
        </View>

         <View style={styles.inputGroup}>
           <Text style={styles.inputLabel}>Type (optionnel)</Text>
           <TextInput
             style={styles.textInput}
             placeholder="Ex: Entretien, Rénovation..."
             placeholderTextColor="#9ca3af"
             value={depenseForm.type}
             onChangeText={(text) => setDepenseForm({...depenseForm, type: text})}
           />
         </View>

         <View style={styles.inputGroup}>
           <Text style={styles.inputLabel}>Compte débité</Text>
           <View style={styles.pickerContainer}>
             <Picker
               selectedValue={depenseForm.id_compte}
               onValueChange={(value) => setDepenseForm({...depenseForm, id_compte: value})}
               style={styles.picker}
             >
               <Picker.Item label="Sélectionner un compte..." value="" />
               {comptes.map((compte) => (
                 <Picker.Item 
                   key={compte.id_compte} 
                   label={`${compte.nom} (${compte.solde} Ar)`} 
                   value={compte.id_compte} 
                 />
               ))}
             </Picker>
           </View>
         </View>

         <View style={styles.inputGroup}>
           <Text style={styles.inputLabel}>Note (optionnel)</Text>
           <TextInput
             style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
             placeholder="Note..."
             placeholderTextColor="#9ca3af"
             multiline
             value={depenseForm.note}
             onChangeText={(text) => setDepenseForm({...depenseForm, note: text})}
           />
         </View>
      </View>

      <View style={styles.formButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => setActiveAction(null)}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} onPress={handleAddDepense} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Ajouter</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderModifyForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Modifier l'investissement</Text>
      </View>
      
      <View style={styles.formContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nom de l'investissement *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: Appartement Tana..."
            placeholderTextColor="#9ca3af"
            value={modifyForm.nom}
            onChangeText={(text) => setModifyForm({...modifyForm, nom: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Type d'investissement</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: Immobilier, Actions, Crypto..."
            placeholderTextColor="#9ca3af"
            value={modifyForm.type}
            onChangeText={(text) => setModifyForm({...modifyForm, type: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Montant investi (Ar) *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={modifyForm.montant_investi}
            onChangeText={(text) => setModifyForm({...modifyForm, montant_investi: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Valeur actuelle (Ar)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={modifyForm.valeur_actuelle}
            onChangeText={(text) => setModifyForm({...modifyForm, valeur_actuelle: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date d'achat</Text>
          <TextInput
            style={[
              styles.textInput,
              modifyForm.date_achat && !isValidDate(modifyForm.date_achat) && styles.textInputError
            ]}
            placeholder="2024-01-15"
            placeholderTextColor="#9ca3af"
            value={modifyForm.date_achat}
            onChangeText={(text) => setModifyForm({...modifyForm, date_achat: formatDateInput(text)})}
            maxLength={10}
            keyboardType="numeric"
          />
          <Text style={styles.inputHint}>Format: YYYY-MM-DD (ex: 2024-01-15)</Text>
          {modifyForm.date_achat && !isValidDate(modifyForm.date_achat) && (
            <Text style={styles.errorText}>Format de date invalide</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Projet (optionnel)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Nom du projet..."
            placeholderTextColor="#9ca3af"
            value={modifyForm.projet}
            onChangeText={(text) => setModifyForm({...modifyForm, projet: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Durée en mois (optionnel)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={modifyForm.duree_mois}
            onChangeText={(text) => setModifyForm({...modifyForm, duree_mois: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Taux prévu % (optionnel)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={modifyForm.taux_prevu}
            onChangeText={(text) => setModifyForm({...modifyForm, taux_prevu: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description (optionnel)</Text>
          <TextInput
            style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Description de l'investissement..."
            placeholderTextColor="#9ca3af"
            multiline
            value={modifyForm.description}
            onChangeText={(text) => setModifyForm({...modifyForm, description: text})}
          />
        </View>
      </View>

      <View style={styles.formButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => setActiveAction(null)}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} onPress={handleModifyInvestment} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Modifier</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleBack}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {activeAction === 'revenu' ? 'Ajouter revenu' :
                 activeAction === 'depense' ? 'Ajouter dépense' :
                 activeAction === 'edit' ? 'Modifier investissement' :
                 'Actions'}
              </Text>
              <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {activeAction === 'revenu' ? renderRevenuForm() :
               activeAction === 'depense' ? renderDepenseForm() :
               activeAction === 'edit' ? renderModifyForm() :
               renderActionMenu()}
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
    height: '70%',
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
  actionMenuContainer: {
    paddingVertical: 20,
  },
  actionHeader: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  formContainer: {
    paddingVertical: 0,
  },
  formHeader: {
    paddingVertical: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
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
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 20,
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
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  inputHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    fontStyle: 'italic',
  },
  textInputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
   errorText: {
     fontSize: 12,
     color: '#ef4444',
     marginTop: 4,
     fontWeight: '500',
   },
   pickerContainer: {
     borderWidth: 1,
     borderColor: '#d1d5db',
     borderRadius: 8,
     backgroundColor: '#f9fafb',
   },
   picker: {
     height: 50,
   },
 });

export default InvestissementActionScreen;

