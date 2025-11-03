import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { objectifsService, contributionsService, accountService, dettesService } from '../../services/apiService';

const ObjectifsScreen = ({ onBack, onRefreshCallback, navigation }) => {
  const [objectifs, setObjectifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isContribOpen, setIsContribOpen] = useState(false);
  const [selectedObjectif, setSelectedObjectif] = useState(null);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [loadingContrib, setLoadingContrib] = useState(false);
  const [contributions, setContributions] = useState([]);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [isLoanOpen, setIsLoanOpen] = useState(false);
  const [loanName, setLoanName] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanLender, setLoanLender] = useState('');
  const [loanAccountId, setLoanAccountId] = useState('');
  const [submittingLoan, setSubmittingLoan] = useState(false);
  
  // Statistiques
  const totalObjectifs = objectifs.length;
  const objectifsAtteints = objectifs.filter(o => o.statut === 'Atteint').length;
  const objectifsRetard = objectifs.filter(o => o.statut === 'Retard').length;
  const montantTotalObjectifs = objectifs.reduce((sum, o) => sum + (parseFloat(o.montant_objectif) || 0), 0);

  const loadObjectifs = async () => {
    try {
      const res = await objectifsService.getObjectifs();
      if (res.success) setObjectifs(res.data || []);
      else Alert.alert('Erreur', res.error || 'Chargement impossible');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadObjectifs();
  }, []);

  useEffect(() => {
    if (typeof onRefreshCallback === 'function') {
      onRefreshCallback(() => {
        setRefreshing(true);
        loadObjectifs();
      });
    }
  }, [onRefreshCallback]);

  const onRefresh = () => {
    setRefreshing(true);
    loadObjectifs();
  };

  const openAddMoney = async (obj) => {
    setSelectedObjectif(obj);
    // Ouvrir l'écran dédié au lieu du modal
    if (navigation?.navigate) {
      navigation.navigate('AddContributionScreen', {
        objectif: obj,
        onSuccess: async () => {
          await loadObjectifs();
        }
      });
    }
  };

  const submitAddMoney = async () => {
    if (!addMoneyAmount || !selectedObjectif) {
      Alert.alert('Erreur', 'Montant requis');
      return;
    }
    const montant = parseFloat(addMoneyAmount);
    if (!Number.isFinite(montant) || montant <= 0) {
      Alert.alert('Erreur', 'Montant invalide');
      return;
    }
    try {
      const res = await contributionsService.create({
        id_objectif: selectedObjectif.id_objectif,
        montant,
        id_compte: selectedAccountId || undefined,
      });
      if (res.success) {
        setIsAddMoneyOpen(false);
        setSelectedObjectif(null);
        await loadObjectifs();
        Alert.alert('Succès', 'Contribution ajoutée');
      } else {
        Alert.alert('Erreur', res.error || 'Ajout impossible');
      }
    } catch (e) {
      Alert.alert('Erreur', "Erreur lors de l'ajout");
    }
  };

  const openContributions = async (obj) => {
    setSelectedObjectif(obj);
    if (navigation?.navigate) {
      navigation.navigate('ContributionsScreen', { objectif: obj });
    }
  };

  const openLoan = async (obj) => {
    setSelectedObjectif(obj);
    setLoanName(obj?.nom ? `Prêt pour ${obj.nom}` : 'Prêt bancaire');
    setLoanAmount('');
    setLoanLender('');
    setLoanAccountId('');
    try {
      const res = await accountService.getMyAccounts();
      setAccounts(res.success && Array.isArray(res.data) ? res.data : []);
    } catch (_) {}
    setIsLoanOpen(true);
  };

  const submitLoan = async () => {
    if (!selectedObjectif) {
      Alert.alert('Erreur', 'Aucun objectif sélectionné');
      return;
    }
    if (!loanName.trim()) {
      Alert.alert('Erreur', 'Nom du prêt requis');
      return;
    }
    const amount = parseFloat(loanAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Erreur', 'Montant du prêt invalide');
      return;
    }
    if (!loanAccountId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un compte de réception');
      return;
    }
    setSubmittingLoan(true);
    try {
      const today = new Date().toISOString().slice(0,10);
      const dettePayload = {
        nom: loanName.trim(),
        montant_initial: amount,
        montant_restant: amount,
        taux_interet: 0,
        date_debut: today,
        date_fin_prevue: null,
        paiement_mensuel: 0,
        creancier: loanLender || 'Banque',
        statut: 'en cours',
        type: 'banque',
      };
      const detteRes = await dettesService.createDette(dettePayload);
      if (!detteRes.success) {
        Alert.alert('Erreur', detteRes.error || 'Création du prêt impossible');
        return;
      }
      const contribRes = await contributionsService.create({
        id_objectif: selectedObjectif.id_objectif,
        montant: amount,
        id_compte: loanAccountId,
      });
      if (!contribRes.success) {
        Alert.alert('Attention', "Prêt créé, mais l'ajout à l'objectif a échoué");
      } else {
        Alert.alert('Succès', "Prêt créé et fonds ajoutés à l'objectif");
      }
      setIsLoanOpen(false);
      setSelectedObjectif(null);
      await loadObjectifs();
    } catch (e) {
      Alert.alert('Erreur', 'Opération échouée');
    } finally {
      setSubmittingLoan(false);
    }
  };

  const handleDelete = (id_objectif) => {
    Alert.alert('Confirmer', 'Supprimer cet objectif ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        const res = await objectifsService.deleteObjectif(id_objectif);
        if (res.success) loadObjectifs(); else Alert.alert('Erreur', res.error || 'Suppression impossible');
      }}
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <>
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Mes Objectifs</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            if (navigation?.navigate) {
              navigation.navigate('AddFormScreen');
            }
          }}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Cartes Statistiques */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="target" size={22} color="#3b82f6" />
            </View>
            <Text style={styles.statValue}>{totalObjectifs}</Text>
            <Text style={styles.statLabel}>Total objectifs</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="check-circle" size={22} color="#10b981" />
            </View>
            <Text style={styles.statValue}>{objectifsAtteints}</Text>
            <Text style={styles.statLabel}>Atteints</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="dollar-sign" size={22} color="#f59e0b" />
            </View>
            <Text style={styles.statValue}>{Number(montantTotalObjectifs).toLocaleString('fr-FR')} Ar</Text>
            <Text style={styles.statLabel}>Montant total</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="alert-triangle" size={22} color="#ef4444" />
            </View>
            <Text style={styles.statValue}>{objectifsRetard}</Text>
            <Text style={styles.statLabel}>En retard</Text>
          </View>
        </View>
      </View>

      <View style={styles.list}>
        {objectifs.map((obj) => (
          <TouchableOpacity key={obj.id_objectif} style={styles.card} activeOpacity={0.8}
            onPress={() => { setSelectedObjectif(obj); setIsActionOpen(true); }}>
            <View style={styles.cardHeader}>
              <View style={styles.left}>
                <View style={[styles.icon, { backgroundColor: '#3b82f6' }]}>
                  <Feather name="target" size={18} color="#fff" />
                </View>
                <View style={styles.info}>
                  <Text style={styles.nom}>{obj.nom}</Text>
                  <Text style={styles.date}>Limite: {obj.date_limite?.slice(0,10) || '-'}</Text>
                </View>
              </View>
              <Feather name="more-horizontal" size={18} color="#9ca3af" />
            </View>

            <View style={styles.rows}>
              <View style={styles.row}><Text style={styles.label}>Objectif</Text><Text style={styles.value}>{Number(obj.montant_objectif||0).toLocaleString('fr-FR')} Ar</Text></View>
              <View style={styles.row}><Text style={styles.label}>Actuel</Text><Text style={[styles.value, { color: '#16a34a' }]}>{Number(obj.montant_actuel||0).toLocaleString('fr-FR')} Ar</Text></View>
              <View style={styles.row}><Text style={styles.label}>Progression</Text><Text style={styles.value}>{Number(obj.pourcentage||0)}%</Text></View>
              <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${Math.min(100, Number(obj.pourcentage||0))}%` }]} /></View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>

    {/* Modal Ajouter de l'argent */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={isAddMoneyOpen}
      onRequestClose={() => setIsAddMoneyOpen(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter de l'argent</Text>
            <TouchableOpacity onPress={() => setIsAddMoneyOpen(false)} style={styles.closeButton}>
              <Feather name="x" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>Objectif</Text>
            <Text style={{ marginBottom: 12, color: '#111827', fontWeight: '600' }}>{selectedObjectif?.nom || '-'}</Text>
            <Text style={styles.inputLabel}>Montant</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0.00"
              keyboardType="numeric"
              value={addMoneyAmount}
              onChangeText={setAddMoneyAmount}
            />
            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Compte (optionnel)</Text>
            <View style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8 }}>
              <ScrollView style={{ maxHeight: 180 }}>
                {accounts.map((acc) => (
                  <TouchableOpacity key={acc.id_compte || acc.id} style={styles.selectOption}
                    onPress={() => setSelectedAccountId(acc.id_compte || acc.id)}>
                    <Text style={{ color: (selectedAccountId === (acc.id_compte || acc.id)) ? '#10b981' : '#374151', fontWeight: '600' }}>
                      {acc.nom} — {(parseFloat(acc.solde)||0).toLocaleString('fr-FR')} Ar
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsAddMoneyOpen(false)}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButtonInline} onPress={submitAddMoney}>
              <Text style={styles.saveButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* Modal Contributions */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={isContribOpen}
      onRequestClose={() => setIsContribOpen(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Contributions</Text>
            <TouchableOpacity onPress={() => setIsContribOpen(false)} style={styles.closeButton}>
              <Feather name="x" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View style={[styles.modalBody, { paddingBottom: 8 }] }>
            <Text style={{ marginBottom: 8, color: '#111827', fontWeight: '600' }}>{selectedObjectif?.nom || '-'}</Text>
            {loadingContrib ? (
              <ActivityIndicator size="small" color="#059669" />
            ) : contributions.length === 0 ? (
              <Text style={{ color: '#64748b' }}>Aucune contribution.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 320 }}>
                {contributions.map((c) => (
                  <View key={`${c.id_contribution || c.date_contribution}-${c.montant}`} style={styles.contribItem}>
                    <View>
                      <Text style={{ color: '#111827', fontWeight: '600' }}>{new Date(c.date_contribution).toLocaleDateString('fr-FR')}</Text>
                      <Text style={{ color: '#6b7280', fontSize: 12 }}>{c.compte_nom || '—'}</Text>
                    </View>
                    <Text style={{ color: '#10b981', fontWeight: '700' }}>{Number(c.montant).toLocaleString('fr-FR')} Ar</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </Modal>

    {/* Modal Actions (comme AddFormScreen) */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={isActionOpen}
      onRequestClose={() => setIsActionOpen(false)}
    >
      <View style={styles.sheetOverlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Actions</Text>
            <TouchableOpacity onPress={() => setIsActionOpen(false)} style={styles.sheetCloseButton}>
              <Text style={styles.sheetCloseButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
            <Text style={{ marginBottom: 12, color: '#111827', fontWeight: '600', textAlign: 'center' }}>{selectedObjectif?.nom || '-'}</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity style={styles.optionButton} onPress={() => { setIsActionOpen(false); openAddMoney(selectedObjectif); }}>
                <Text style={styles.optionIcon}>➕</Text>
                <Text style={styles.optionLabel}>Ajouter de l'argent</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={() => { setIsActionOpen(false); openLoan(selectedObjectif); }}>
                <Text style={styles.optionIcon}>💳</Text>
                <Text style={styles.optionLabel}>Financer via prêt bancaire</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={() => { setIsActionOpen(false); openContributions(selectedObjectif); }}>
                <Text style={styles.optionIcon}>👁️</Text>
                <Text style={styles.optionLabel}>Voir les contributions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={() => { setIsActionOpen(false); navigation?.navigate && navigation.navigate('EditFormScreen', { objectifData: selectedObjectif, onSuccess: () => loadObjectifs() }); }}>
                <Text style={styles.optionIcon}>✏️</Text>
                <Text style={styles.optionLabel}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.optionButton, { backgroundColor: '#fee2e2', borderColor: '#fecaca' }]} onPress={() => { setIsActionOpen(false); handleDelete(selectedObjectif.id_objectif); }}>
                <Text style={styles.optionIcon}>🗑️</Text>
                <Text style={[styles.optionLabel, { color: '#b91c1c' }]}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>

    {/* Modal Prêt bancaire */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={isLoanOpen}
      onRequestClose={() => setIsLoanOpen(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Prêt bancaire</Text>
            <TouchableOpacity onPress={() => setIsLoanOpen(false)} style={styles.closeButton}>
              <Feather name="x" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>Objectif</Text>
            <Text style={{ marginBottom: 12, color: '#111827', fontWeight: '600' }}>{selectedObjectif?.nom || '-'}</Text>

            <Text style={styles.inputLabel}>Nom du prêt</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Prêt immobilier"
              value={loanName}
              onChangeText={setLoanName}
            />

            <Text style={styles.inputLabel}>Montant du prêt</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0.00"
              keyboardType="numeric"
              value={loanAmount}
              onChangeText={setLoanAmount}
            />

            <Text style={styles.inputLabel}>Créancier (banque)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Nom de la banque (optionnel)"
              value={loanLender}
              onChangeText={setLoanLender}
            />

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Compte de réception</Text>
            <View style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8 }}>
              <ScrollView style={{ maxHeight: 180 }}>
                {accounts.map((acc) => (
                  <TouchableOpacity key={acc.id_compte || acc.id} style={styles.selectOption}
                    onPress={() => setLoanAccountId(acc.id_compte || acc.id)}>
                    <Text style={{ color: (loanAccountId === (acc.id_compte || acc.id)) ? '#10b981' : '#374151', fontWeight: '600' }}>
                      {acc.nom} — {(parseFloat(acc.solde)||0).toLocaleString('fr-FR')} Ar
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsLoanOpen(false)} disabled={submittingLoan}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButtonInline} onPress={submitLoan} disabled={submittingLoan}>
              <Text style={styles.saveButtonText}>{submittingLoan ? 'Veuillez patienter...' : 'Valider'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backButton: { padding: 8, borderRadius: 8, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
  title: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
  addButton: { backgroundColor: '#3b82f6', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statsSection: { paddingHorizontal: 16, marginBottom: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  statCard: { width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9', elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  statIconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 2, textAlign: 'center' },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: '600', textAlign: 'center' },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  icon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info: { flex: 1 },
  nom: { fontSize: 16, fontWeight: '800', color: '#111827' },
  date: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  actionButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  rows: { gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  value: { fontSize: 14, color: '#1f2937', fontWeight: '700' },
  progressBar: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10b981' },
  actionSecondary: { backgroundColor: '#f8fafc', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionSecondaryText: { color: '#374151', fontWeight: '700' },
  actionDanger: { backgroundColor: '#ef4444', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionDangerText: { color: '#fff', fontWeight: '700' },
  // Bottom-sheet styles aligned with AddFormScreen
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sheetCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetCloseButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
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
    fontSize: 20,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
});

export default ObjectifsScreen;


