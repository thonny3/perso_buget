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
import { accountService, revenuesService, depensesService, categoryService, investissementsService, dettesService, budgetService, objectifsService } from '../services/apiService';

const AddFormScreen = ({ visible, onClose, currentScreen, onSuccess }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isSourceSelectOpen, setIsSourceSelectOpen] = useState(false);
  const [isDetteTypeOpen, setIsDetteTypeOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
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

  const sources = [
    { id: 1, nom: 'Salaire', couleur: '#22c55e', icon: 'briefcase' },
    { id: 2, nom: 'Freelance', couleur: '#3b82f6', icon: 'laptop' },
    { id: 3, nom: 'Investissements', couleur: '#a855f7', icon: 'trending-up' },
    { id: 4, nom: 'Ventes', couleur: '#f97316', icon: 'shopping-bag' },
    { id: 5, nom: 'Autres', couleur: '#6b7280', icon: 'more-horizontal' },
  ];

  // Si on est dans portefeuille, revenus ou dépenses, afficher directement le formulaire approprié
  React.useEffect(() => {
    if (visible && currentScreen === 'portefeuille') {
      setSelectedType('compte');
      setShowForm(true);
    } else if (visible && currentScreen === 'revenus') {
      setSelectedType('revenu');
      setShowForm(true);
      loadComptes(); // Charger les comptes pour le formulaire de revenus
      loadCategories(); // Charger les catégories pour le formulaire de revenus
    } else if (visible && currentScreen === 'depenses') {
      setSelectedType('depense');
      setShowForm(true);
      // Initialiser les données du formulaire
      setFormData({
        description: '',
        montant: '',
        date_depense: new Date().toISOString().split('T')[0],
        id_categorie_depense: '',
        id_compte: ''
      });
      loadComptes(); // Charger les comptes pour le formulaire de dépenses
      loadDepenseCategories(); // Charger les catégories pour le formulaire de dépenses
    } else if (visible && currentScreen === 'budget') {
      setSelectedType('budget');
      setShowForm(true);
      // Initialiser les données du formulaire budget
      setFormData({
        mois: new Date().toISOString().slice(0,7),
        montant_max: '',
        id_categorie_depense: ''
      });
      loadDepenseCategories();
    } else if (visible && currentScreen === 'investissements') {
      setSelectedType('investissement');
      setShowForm(true);
      // Initialiser les données du formulaire d'investissement
      setFormData({
        nom: '',
        type: 'immobilier',
        projet: '',
        date_achat: new Date().toISOString().split('T')[0],
        montant_investi: '',
        valeur_actuelle: '',
        duree_mois: '',
        taux_prevu: ''
      });
    } else if (visible && currentScreen === 'dettes') {
      setSelectedType('dette');
      setShowForm(true);
      // Initialiser les données du formulaire de dette
      setFormData({
        nom: '',
        montant_initial: '',
        montant_restant: '',
        taux_interet: '0',
        date_debut: new Date().toISOString().split('T')[0],
        date_fin_prevue: '',
        paiement_mensuel: '0',
        creancier: '',
        type: 'personne'
      });
    } else if (visible && currentScreen === 'objectifs') {
      setSelectedType('objectif');
      setShowForm(true);
      setFormData({
        nom: '',
        montant_objectif: '',
        date_limite: '',
        montant_actuel: '0',
        icone: 'Target',
        couleur: '#3B82F6',
      });
    
    } else if (visible) {
      setSelectedType(null);
      setShowForm(false);
    }
  }, [visible, currentScreen]);

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setShowForm(true);
  };

  // Charger les comptes pour le formulaire de revenus
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

  // Charger les catégories pour le formulaire de dépenses
  const loadDepenseCategories = async () => {
    try {
      console.log('🔄 Chargement des catégories de dépenses...');
      const result = await categoryService.getCategoriesDepenses();
      console.log('📊 Résultat du chargement des catégories de dépenses:', result);
      if (result.success) {
        setCategories(result.data || []);
        console.log('✅ Catégories de dépenses chargées:', result.data);
      } else {
        console.error('❌ Erreur lors du chargement des catégories de dépenses:', result.error);
        
        // Utiliser les catégories par défaut en cas d'échec
        setCategories([
          { id: 1, nom: 'Alimentation' },
          { id: 2, nom: 'Transport' },
          { id: 3, nom: 'Logement' },
          { id: 4, nom: 'Santé' },
          { id: 5, nom: 'Loisirs' },
          { id: 6, nom: 'Éducation' },
          { id: 7, nom: 'Shopping' },
          { id: 8, nom: 'Autres dépenses' }
        ]);
        console.log('🔄 Utilisation des catégories par défaut pour les dépenses');
        
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
      console.error('❌ Erreur loadDepenseCategories:', err);
      // Utiliser les catégories par défaut en cas d'erreur
      setCategories([
        { id: 1, nom: 'Alimentation' },
        { id: 2, nom: 'Transport' },
        { id: 3, nom: 'Logement' },
        { id: 4, nom: 'Santé' },
        { id: 5, nom: 'Loisirs' },
        { id: 6, nom: 'Éducation' },
        { id: 7, nom: 'Shopping' },
        { id: 8, nom: 'Autres dépenses' }
      ]);
      console.log('🔄 Utilisation des catégories par défaut pour les dépenses (erreur)');
      Alert.alert('Erreur', 'Impossible de charger les catégories. Vérifiez votre connexion.');
    }
  };

  const handleFormSubmit = async () => {
    if (selectedType === 'objectif') {
      if (!formData.nom || !formData.nom.trim()) {
        Alert.alert('Erreur', 'Le nom est requis');
        return;
      }
      if (!formData.montant_objectif || parseFloat(formData.montant_objectif) <= 0) {
        Alert.alert('Erreur', 'Le montant objectif doit être positif');
        return;
      }
      if (!formData.date_limite) {
        Alert.alert('Erreur', 'La date limite est requise');
        return;
      }
      setIsLoading(true);
      try {
        const payload = {
          nom: formData.nom.trim(),
          montant_objectif: parseFloat(formData.montant_objectif),
          date_limite: formData.date_limite,
          montant_actuel: formData.montant_actuel ? parseFloat(formData.montant_actuel) : 0,
          statut: 'En cours',
          pourcentage: 0,
          icone: formData.icone || 'Target',
          couleur: formData.couleur || '#3B82F6',
        };
        const res = await objectifsService.createObjectif(payload);
        if (res.success) {
          Alert.alert('Succès', 'Objectif créé');
          resetForm();
          if (onSuccess) onSuccess(res.data);
        } else {
          Alert.alert('Erreur', res.error || 'Création impossible');
        }
      } catch (e) {
        Alert.alert('Erreur', 'Erreur de connexion. Réessayez.');
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (selectedType === 'budget') {
      if (!formData.mois || !formData.montant_max || !formData.id_categorie_depense) {
        Alert.alert('Erreur', 'Veuillez renseigner le mois, le montant et la catégorie');
        return;
      }
      setIsLoading(true);
      try {
        const payload = {
          mois: formData.mois,
          id_categorie_depense: parseInt(formData.id_categorie_depense),
          montant_max: parseFloat(formData.montant_max),
          // Le backend initialise montant_restant
        };
        const result = await budgetService.createBudget(payload);
        if (result.success) {
          Alert.alert('Succès', 'Budget créé avec succès');
          resetForm();
          if (onSuccess) onSuccess(result.data);
          return;
        } else {
          Alert.alert('Erreur', result.error || 'Création du budget impossible');
        }
      } catch (e) {
        Alert.alert('Erreur', 'Erreur de connexion. Réessayez.');
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (selectedType === 'compte') {
      // Validation pour le compte
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
        const accountData = {
          nom: formData.nom.trim(),
          type: formData.type,
          solde: parseFloat(formData.solde) || 0,
        };

        console.log('Envoi des données du compte au backend:', accountData);

        const result = await accountService.createAccount(accountData);

        if (result.success) {
          console.log('Compte créé avec succès:', result.data);
          Alert.alert('Succès', 'Compte créé avec succès!');
          
          resetForm();
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
    } else if (selectedType === 'revenu') {
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
        const revenuData = {
          source: formData.description.trim(), // Mapper description vers source pour la base de données
          montant: parseFloat(formData.montant),
          id_categorie_revenu: formData.id_categorie_revenu,
          id_compte: formData.id_compte,
          date_revenu: formData.date_revenu || new Date().toISOString().split('T')[0]
        };

        console.log('📤 Envoi des données du revenu au backend:', revenuData);
        console.log('📝 Description mappée vers source:', formData.description, '->', revenuData.source);

        const result = await revenuesService.createRevenue(revenuData);

        if (result.success) {
          console.log('Revenu créé avec succès:', result.data);
          Alert.alert('Succès', 'Revenu ajouté avec succès!');
          
          resetForm();
          if (onSuccess) onSuccess(result.data);
        } else {
          console.error('Erreur lors de la création du revenu:', result.error);
          Alert.alert('Erreur', result.error || 'Erreur lors de la création du revenu');
        }
      } catch (error) {
        console.error('Erreur lors de la création du revenu:', error);
        Alert.alert('Erreur', 'Erreur de connexion. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    } else if (selectedType === 'depense') {
      // Validation pour la dépense
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
        const depenseData = {
          description: formData.description.trim(),
          montant: parseFloat(formData.montant),
          id_categorie_depense: parseInt(formData.id_categorie_depense),
          id_compte: parseInt(formData.id_compte),
          date_depense: formData.date_depense || new Date().toISOString().split('T')[0]
        };

        console.log('📤 ========== AJOUT DEPENSE ==========');
        console.log('📋 formData:', formData);
        console.log('📋 depenseData:', depenseData);
        console.log('================================');

        const result = await depensesService.createDepense(depenseData);
        
        console.log('✅ Résultat création dépense:', result);

        if (result.success) {
          console.log('Dépense créée avec succès:', result.data);
          Alert.alert('Succès', 'Dépense ajoutée avec succès!');
          
          resetForm();
          if (onSuccess) onSuccess(result.data);
        } else {
          console.error('Erreur lors de la création de la dépense:', result.error);
          Alert.alert('Erreur', result.error || 'Erreur lors de la création de la dépense');
        }
      } catch (error) {
        console.error('Erreur lors de la création de la dépense:', error);
        Alert.alert('Erreur', 'Erreur de connexion. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    } else if (selectedType === 'investissement') {
      // Validation pour l'investissement
      if (!formData.nom || !formData.nom.trim()) {
        Alert.alert('Erreur', 'Le nom de l\'investissement est requis');
        return;
      }
      
      if (!formData.montant_investi || parseFloat(formData.montant_investi) <= 0) {
        Alert.alert('Erreur', 'Le montant investi doit être positif');
        return;
      }

      setIsLoading(true);

      try {
        const investissementData = {
          nom: formData.nom.trim(),
          type: formData.type || 'immobilier',
          projet: formData.projet || null,
          date_achat: formData.date_achat || new Date().toISOString().split('T')[0],
          montant_investi: parseFloat(formData.montant_investi),
          valeur_actuelle: formData.valeur_actuelle ? parseFloat(formData.valeur_actuelle) : null,
          duree_mois: formData.duree_mois ? parseFloat(formData.duree_mois) : null,
          taux_prevu: formData.taux_prevu ? parseFloat(formData.taux_prevu) : null
        };

        console.log('📤 ========== AJOUT INVESTISSEMENT ==========');
        console.log('📋 formData:', formData);
        console.log('📋 investissementData:', investissementData);
        console.log('================================');

        const result = await investissementsService.createInvestissement(investissementData);
        
        console.log('✅ Résultat création investissement:', result);

        if (result.success) {
          console.log('Investissement créé avec succès:', result.data);
          Alert.alert('Succès', 'Investissement ajouté avec succès!');
          
          resetForm();
          if (onSuccess) onSuccess(result.data);
        } else {
          console.error('Erreur lors de la création de l\'investissement:', result.error);
          Alert.alert('Erreur', result.error || 'Erreur lors de la création de l\'investissement');
        }
      } catch (error) {
        console.error('Erreur lors de la création de l\'investissement:', error);
        Alert.alert('Erreur', 'Erreur de connexion. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    } else if (selectedType === 'dette') {
      // Validation pour la dette
      if (!formData.nom || !formData.nom.trim()) {
        Alert.alert('Erreur', 'Le nom de la dette est requis');
        return;
      }
      if (!formData.montant_initial || parseFloat(formData.montant_initial) <= 0) {
        Alert.alert('Erreur', 'Le montant initial doit être positif');
        return;
      }

      setIsLoading(true);

      try {
        const detteData = {
          nom: formData.nom.trim(),
          montant_initial: parseFloat(formData.montant_initial),
          montant_restant: formData.montant_restant === '' ? undefined : parseFloat(formData.montant_restant),
          taux_interet: parseFloat(formData.taux_interet || 0),
          date_debut: formData.date_debut || new Date().toISOString().split('T')[0],
          date_fin_prevue: formData.date_fin_prevue || null,
          paiement_mensuel: parseFloat(formData.paiement_mensuel || 0),
          creancier: formData.creancier || '',
          type: formData.type || 'personne'
        };

        const result = await dettesService.createDette(detteData);

        if (result.success) {
          Alert.alert('Succès', 'Dette ajoutée avec succès!');
          resetForm();
          if (onSuccess) onSuccess(result.data);
        } else {
          Alert.alert('Erreur', result.error || 'Erreur lors de la création de la dette');
        }
      } catch (error) {
        Alert.alert('Erreur', 'Erreur de connexion. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({});
    setShowForm(false);
    setSelectedType(null);
    setIsSelectOpen(false);
    setIsSourceSelectOpen(false);
    setSearchText('');
    setSourceSearchText('');
    onClose();
  };

  const handleBackToOptions = () => {
    setShowForm(false);
    setSelectedType(null);
    setFormData({});
    setIsSelectOpen(false);
    setIsSourceSelectOpen(false);
    setSearchText('');
    setSourceSearchText('');
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
      case 'investissements':
        return [
          { id: 'investissement', label: 'Nouvel Investissement', icon: '📈' },
        ];
      case 'dettes':
        return [
          { id: 'dette', label: 'Nouvelle Dette', icon: '🧾' },
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

  const renderRevenueForm = () => (
    <View style={styles.formContainer}>
      {/* Header simplifié */}
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Ajouter un revenu</Text>
      </View>
      
      {/* Formulaire simplifié */}
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
            placeholder="0,00"
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
            <Text style={styles.submitButtonText}>Ajouter</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDepenseForm = () => (
    <View style={styles.formContainer}>
      {/* Header simplifié */}
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Ajouter une dépense</Text>
      </View>
      
      {/* Formulaire simplifié */}
      <View style={styles.formContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: Courses Carrefour, Essence..."
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
            value={formData.date_depense || new Date().toISOString().split('T')[0]}
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
              {categories.find(cat => cat.id === formData.id_categorie_depense)?.nom || 'Sélectionner une catégorie'}
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
                  return filteredCategories;
                })().map((categorie) => (
                  <TouchableOpacity
                    key={categorie.id}
                    style={[
                      styles.selectOption,
                      formData.id_categorie_depense === categorie.id && styles.selectOptionSelected
                    ]}
                    onPress={() => {
                      setFormData({...formData, id_categorie_depense: categorie.id});
                      setIsSourceSelectOpen(false);
                      setSourceSearchText('');
                    }}
                  >
                    <Text style={[
                      styles.selectOptionText,
                      formData.id_categorie_depense === categorie.id && styles.selectOptionTextSelected
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
            <Text style={styles.submitButtonText}>Ajouter</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBudgetForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Créer un budget</Text>
      </View>
      <View style={styles.formContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mois (YYYY-MM)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="YYYY-MM"
            placeholderTextColor="#9ca3af"
            value={formData.mois || ''}
            onChangeText={(text) => setFormData({ ...formData, mois: text })}
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
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Catégorie de dépense</Text>
          <TouchableOpacity 
            style={styles.selectContainer}
            onPress={() => setIsSourceSelectOpen(!isSourceSelectOpen)}
          >
            <Text style={styles.selectText}>
              {categories.find(cat => cat.id === formData.id_categorie_depense)?.nom || 'Sélectionner une catégorie'}
            </Text>
            <Text style={[styles.selectArrow, isSourceSelectOpen && styles.selectArrowOpen]}>▼</Text>
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
                {categories
                  .filter(c => c.nom.toLowerCase().includes(sourceSearchText.toLowerCase()))
                  .map((categorie) => (
                    <TouchableOpacity
                      key={categorie.id}
                      style={[
                        styles.selectOption,
                        formData.id_categorie_depense === categorie.id && styles.selectOptionSelected
                      ]}
                      onPress={() => {
                        setFormData({ ...formData, id_categorie_depense: categorie.id });
                        setIsSourceSelectOpen(false);
                        setSourceSearchText('');
                      }}
                    >
                      <Text style={[
                        styles.selectOptionText,
                        formData.id_categorie_depense === categorie.id && styles.selectOptionTextSelected
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
      <View style={styles.formButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleBackToOptions}>
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

  const renderInvestissementForm = () => (
    <View style={styles.formContainer}>
      {/* Header simplifié */}
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Ajouter un investissement</Text>
      </View>
      
      {/* Formulaire simplifié */}
      <View style={styles.formContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nom de l'investissement</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: Appartement Paris, Actions..."
            placeholderTextColor="#9ca3af"
            value={formData.nom || ''}
            onChangeText={(text) => setFormData({...formData, nom: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Type</Text>
          <TouchableOpacity 
            style={styles.selectContainer}
            onPress={() => setIsSelectOpen(!isSelectOpen)}
          >
            <Text style={styles.selectText}>
              {formData.type === 'immobilier' ? 'Immobilier' :
               formData.type === 'actions' ? 'Actions' :
               formData.type === 'crypto' ? 'Crypto-monnaie' :
               formData.type === 'or' ? 'Or' :
               formData.type === 'autre' ? 'Autre' :
               'Sélectionner un type'}
            </Text>
            <Text style={[styles.selectArrow, isSelectOpen && styles.selectArrowOpen]}>
              ▼
            </Text>
          </TouchableOpacity>
          
          {isSelectOpen && (
            <View style={styles.selectDropdown}>
              <ScrollView style={styles.selectOptions} showsVerticalScrollIndicator={false}>
                {[
                  { value: 'immobilier', label: 'Immobilier' },
                  { value: 'actions', label: 'Actions' },
                  { value: 'crypto', label: 'Crypto-monnaie' },
                  { value: 'or', label: 'Or' },
                  { value: 'autre', label: 'Autre' }
                ].map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.selectOption,
                      formData.type === type.value && styles.selectOptionSelected
                    ]}
                    onPress={() => {
                      setFormData({...formData, type: type.value});
                      setIsSelectOpen(false);
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
          <Text style={styles.inputLabel}>Projet (optionnel)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: Résidence principale, Portfolio..."
            placeholderTextColor="#9ca3af"
            value={formData.projet || ''}
            onChangeText={(text) => setFormData({...formData, projet: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date d'achat</Text>
          <TextInput
            style={styles.textInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
            value={formData.date_achat || new Date().toISOString().split('T')[0]}
            onChangeText={(text) => setFormData({...formData, date_achat: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Montant investi (Ar) *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={formData.montant_investi || ''}
            onChangeText={(text) => setFormData({...formData, montant_investi: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Valeur actuelle (Ar) - optionnel</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={formData.valeur_actuelle || ''}
            onChangeText={(text) => setFormData({...formData, valeur_actuelle: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Durée en mois - optionnel</Text>
          <TextInput
            style={styles.textInput}
            placeholder="12"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={formData.duree_mois || ''}
            onChangeText={(text) => setFormData({...formData, duree_mois: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Taux prévu (%) - optionnel</Text>
          <TextInput
            style={styles.textInput}
            placeholder="5"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={formData.taux_prevu || ''}
            onChangeText={(text) => setFormData({...formData, taux_prevu: text})}
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

  const renderDetteForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Ajouter une dette</Text>
      </View>
      <View style={styles.formContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nom</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: Prêt bancaire"
            placeholderTextColor="#9ca3af"
            value={formData.nom || ''}
            onChangeText={(text) => setFormData({ ...formData, nom: text })}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Créancier</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Banque, personne..."
            placeholderTextColor="#9ca3af"
            value={formData.creancier || ''}
            onChangeText={(text) => setFormData({ ...formData, creancier: text })}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Montant initial (Ar)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={formData.montant_initial || ''}
            onChangeText={(text) => setFormData({ ...formData, montant_initial: text })}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Montant restant (Ar) - optionnel</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={formData.montant_restant || ''}
            onChangeText={(text) => setFormData({ ...formData, montant_restant: text })}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Taux d'intérêt (%)</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            value={formData.taux_interet || '0'}
            onChangeText={(text) => setFormData({ ...formData, taux_interet: text })}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Paiement mensuel (Ar)</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            value={formData.paiement_mensuel || '0'}
            onChangeText={(text) => setFormData({ ...formData, paiement_mensuel: text })}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date de début</Text>
          <TextInput
            style={styles.textInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
            value={formData.date_debut || new Date().toISOString().split('T')[0]}
            onChangeText={(text) => setFormData({ ...formData, date_debut: text })}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date fin prévue (optionnel)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
            value={formData.date_fin_prevue || ''}
            onChangeText={(text) => setFormData({ ...formData, date_fin_prevue: text })}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Type</Text>
          <TouchableOpacity 
            style={styles.selectContainer}
            onPress={() => setIsDetteTypeOpen(!isDetteTypeOpen)}
          >
            <Text style={styles.selectText}>
              {formData.type === 'personne' ? 'Personne' : formData.type === 'banque' ? 'Banque' : 'Autre'}
            </Text>
            <Text style={[styles.selectArrow, isDetteTypeOpen && styles.selectArrowOpen]}>▼</Text>
          </TouchableOpacity>
          {isDetteTypeOpen && (
            <View style={styles.selectDropdown}>
              {[
                { value: 'personne', label: 'Personne' },
                { value: 'banque', label: 'Banque' },
                { value: 'autre', label: 'Autre' }
              ].map((t) => (
                <TouchableOpacity key={t.value} style={styles.selectOption} onPress={() => {
                  setFormData({ ...formData, type: t.value });
                  setIsDetteTypeOpen(false);
                }}>
                  <Text style={styles.selectOptionText}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
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
            <Text style={styles.submitButtonText}>Ajouter</Text>
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
              ) : showForm && selectedType === 'revenu' ? (
                renderRevenueForm()
              ) : showForm && selectedType === 'depense' ? (
                renderDepenseForm()
              ) : showForm && selectedType === 'budget' ? (
                renderBudgetForm()
              ) : showForm && selectedType === 'investissement' ? (
                renderInvestissementForm()
              ) : showForm && selectedType === 'dette' ? (
                renderDetteForm()
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
