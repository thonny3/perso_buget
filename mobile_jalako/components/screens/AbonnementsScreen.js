import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { abonnementsService, accountService, authService } from '../../services/apiService';

const AbonnementsScreen = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: '', montant: '', frequence: 'Mensuel', prochaine_echeance: '', rappel: true, icone: 'RefreshCw', couleur: '#3B82F6', id_compte: '', auto_renouvellement: false });
  const [comptes, setComptes] = useState([]);
  const [selectOpen, setSelectOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFrequence, setFilterFrequence] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [renewCompteId, setRenewCompteId] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await abonnementsService.listMy();
      const raw = res.success && Array.isArray(res.data) ? res.data : [];
      const normalized = raw.map(row => ({
        id_abonnement: row.id_abonnement,
        id_user: row.id_user,
        nom: row.nom,
        montant: Number(row.montant) || 0,
        frequence: row['fréquence'] || row.frequence || 'Mensuel',
        prochaine_echeance: row.prochaine_echeance,
        rappel: !!row.rappel,
        icone: row.icon || row.icone || 'RefreshCw',
        couleur: row.couleur || '#3B82F6',
        id_compte: row.id_compte || null,
        auto_renouvellement: !!row.auto_renouvellement,
        actif: (row.actif == null ? 1 : Number(row.actif)) === 1,
      }));
      setItems(normalized);
    } catch (e) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadComptes = async () => {
    try {
      const res = await accountService.getMyAccounts();
      setComptes(res.success && Array.isArray(res.data) ? res.data : []);
    } catch (_e) {}
  };

  useEffect(() => { load(); }, []);

  const computeMonthlyCost = (ab) => {
    const amount = Number(ab.montant) || 0;
    const f = (ab.frequence || 'Mensuel').toLowerCase();
    if (f.includes('mens')) return amount;
    if (f.includes('ann')) return amount / 12;
    if (f.includes('hebdo')) return amount * (52 / 12);
    if (f.includes('quot')) return amount * 30; // approx
    if (f.includes('trimes')) return amount / 3;
    if (f.includes('semest')) return amount / 6;
    return amount; // fallback
  };

  const computeAnnualCost = (ab) => {
    const amount = Number(ab.montant) || 0;
    const f = (ab.frequence || 'Mensuel').toLowerCase();
    if (f.includes('mens')) return amount * 12;
    if (f.includes('ann')) return amount;
    if (f.includes('hebdo')) return amount * 52;
    if (f.includes('quot')) return amount * 365; // approx
    if (f.includes('trimes')) return amount * 4;
    if (f.includes('semest')) return amount * 2;
    return amount * 12; // fallback
  };

  const now = new Date();
  const soonThresholdMs = 14 * 24 * 60 * 60 * 1000; // 14 jours
  const totalCount = items.length;
  const activeCount = items.filter(ab => ab.actif).length;
  const expiringSoonCount = items.filter(ab => {
    if (!ab.prochaine_echeance) return false;
    const d = new Date(ab.prochaine_echeance);
    return ab.actif && d - now >= 0 && (d - now) <= soonThresholdMs;
  }).length;
  const monthlyCost = items.reduce((s, ab) => s + computeMonthlyCost(ab), 0);
  const annualCost = items.reduce((s, ab) => s + computeAnnualCost(ab), 0);

  const openCreate = async () => {
    setEditing(null);
    setForm({ nom: '', montant: '', frequence: 'Mensuel', prochaine_echeance: '', rappel: true, icone: 'RefreshCw', couleur: '#3B82F6', id_compte: '', auto_renouvellement: false });
    await loadComptes();
    setIsFormOpen(true);
  };

  const openEdit = async (item) => {
    setEditing(item);
    setForm({ nom: item.nom, montant: String(item.montant || ''), frequence: item.frequence || 'Mensuel', prochaine_echeance: item.prochaine_echeance || '', rappel: !!item.rappel, icone: item.icone || 'RefreshCw', couleur: item.couleur || '#3B82F6', id_compte: item.id_compte || '', auto_renouvellement: !!item.auto_renouvellement });
    await loadComptes();
    setIsFormOpen(true);
  };

  const submit = async () => {
    if (!form.nom || !form.montant || !form.prochaine_echeance) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setSaving(true);
    try {
      const current = await authService.getCurrentUser();
      const id_user = current?.data?.id_user || current?.id_user || current?.data?.user?.id_user;
      const payload = { id_user, nom: form.nom, montant: parseFloat(form.montant), frequence: form.frequence, prochaine_echeance: form.prochaine_echeance, rappel: form.rappel ? 1 : 0, icon: form.icone, couleur: form.couleur, id_compte: form.id_compte || null, auto_renouvellement: !!form.auto_renouvellement };
      let res;
      if (editing?.id_abonnement) res = await abonnementsService.update(editing.id_abonnement, payload);
      else res = await abonnementsService.create(payload);
      if (!res.success) Alert.alert('Erreur', res.error || "Impossible d'enregistrer");
      else { setIsFormOpen(false); await load(); }
    } catch (e) {
      Alert.alert('Erreur', 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  };

  const openRenew = async (item) => {
    setEditing(item);
    setRenewCompteId(item.id_compte || '');
    await loadComptes();
    setIsRenewOpen(true);
  };

  const doRenew = async () => {
    if (!editing?.id_abonnement) return;
    setSaving(true);
    try {
      const res = await abonnementsService.renew({ id_abonnement: editing.id_abonnement, id_compte: renewCompteId || null });
      if (!res.success) Alert.alert('Erreur', res.error || 'Renouvellement impossible');
      else { setIsRenewOpen(false); await load(); }
    } catch (e) {
      Alert.alert('Erreur', 'Renouvellement impossible');
    } finally {
      setSaving(false);
    }
  };

  const removeOne = async (id) => {
    Alert.alert('Confirmer', 'Supprimer cet abonnement ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { const res = await abonnementsService.remove(id); if (!res.success) Alert.alert('Erreur', res.error || 'Suppression impossible'); else load(); } }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.title}>Abonnements</Text>
        <TouchableOpacity onPress={openCreate} style={styles.addButton}><Text style={styles.addText}>＋</Text></TouchableOpacity>
      </View>

      {/* Cartes Statistiques */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}><Text style={styles.statLabel}>Total</Text><Text style={styles.statValue}>{totalCount}</Text></View>
          <View style={styles.statCard}><Text style={styles.statLabel}>Actifs</Text><Text style={styles.statValue}>{activeCount}</Text></View>
          <View style={styles.statCard}><Text style={styles.statLabel}>Expire bientôt</Text><Text style={styles.statValue}>{expiringSoonCount}</Text></View>
          <View style={styles.statCard}><Text style={styles.statLabel}>Coût Mensuel</Text><Text style={styles.statValue}>{Math.round(monthlyCost).toLocaleString('fr-FR')} Ar</Text></View>
          <View style={styles.statCard}><Text style={styles.statLabel}>Coût Annuel</Text><Text style={styles.statValue}>{Math.round(annualCost).toLocaleString('fr-FR')} Ar</Text></View>
        </View>
      </View>

      {/* Filtres / Recherche */}
      <View style={styles.filtersRow}>
        <View style={styles.searchBox}><TextInput style={styles.searchInputTop} placeholder="Rechercher..." value={searchTerm} onChangeText={setSearchTerm} /></View>
        <TouchableOpacity style={styles.filterPill} onPress={()=> setFilterFrequence(filterFrequence ? '' : 'Mensuel')}><Text style={[styles.filterText, filterFrequence && styles.filterTextActive]}>{filterFrequence || 'Fréquence'}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.filterPill} onPress={()=> setFilterStatut(filterStatut ? '' : 'Actif')}><Text style={[styles.filterText, filterStatut && styles.filterTextActive]}>{filterStatut || 'Statut'}</Text></TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#3b82f6" /></View>
      ) : error ? (
        <View style={styles.loadingContainer}><Text style={{ color: '#ef4444' }}>{error}</Text></View>
      ) : (
        <ScrollView style={styles.list}>
          {items
            .filter(ab => ab.nom.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(ab => !filterFrequence || ab.frequence === filterFrequence)
            .filter(ab => !filterStatut || (filterStatut === 'Actif' ? ab.actif : !ab.actif))
            .map((it) => (
            <View key={it.id_abonnement} style={[styles.card, { borderLeftColor: it.couleur || '#3B82F6' }]}> 
              <View style={styles.cardTopRow}>
                <View style={styles.iconWrap}> 
                  <View style={[styles.iconCircle, { backgroundColor: (it.couleur || '#3B82F6') + '22', borderColor: it.couleur || '#3B82F6' }]}> 
                    <Text style={[styles.iconEmoji]}>{'🔄'}</Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.nom}>{it.nom}</Text>
                    <View style={[styles.statutPill, { backgroundColor: it.actif ? '#ecfdf5' : '#f3f4f6', borderColor: it.actif ? '#10b981' : '#9ca3af' }]}> 
                      <Text style={[styles.statutText, { color: it.actif ? '#065f46' : '#4b5563' }]}>{it.actif ? 'Actif' : 'Inactif'}</Text>
                    </View>
                  </View>
                  <View style={styles.badgesRow}>
                    <View style={styles.badge}><Text style={styles.badgeText}>{it.frequence}</Text></View>
                    {it.auto_renouvellement ? (<View style={[styles.badge, { backgroundColor: '#eef2ff' }]}><Text style={[styles.badgeText, { color: '#4f46e5' }]}>Auto</Text></View>) : null}
                    {it.rappel ? (<View style={[styles.badge, { backgroundColor: '#ecfeff' }]}><Text style={[styles.badgeText, { color: '#0891b2' }]}>Rappel</Text></View>) : null}
                  </View>
                </View>
                <View style={styles.rowActions}>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => openRenew(it)}><Text style={styles.smallBtnText}>🔁</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => openEdit(it)}><Text style={styles.smallBtnText}>✏️</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: '#fee2e2' }]} onPress={() => removeOne(it.id_abonnement)}><Text style={[styles.smallBtnText, { color: '#b91c1c' }]}>🗑️</Text></TouchableOpacity>
                </View>
              </View>
              <View style={styles.cardBottomRow}>
                <Text style={styles.amountText}>{(Number(it.montant)||0).toLocaleString('fr-FR')} Ar</Text>
                <Text style={styles.nextText}>Prochaine: {it.prochaine_echeance?.slice(0,10) || '-'}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={isFormOpen} animationType="slide" transparent={true} onRequestClose={() => setIsFormOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{editing ? 'Modifier abonnement' : 'Nouvel abonnement'}</Text>
                <TouchableOpacity onPress={() => setIsFormOpen(false)} style={styles.closeButton}><Text style={styles.closeButtonText}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView style={styles.content}>
                <View style={styles.inputGroup}><Text style={styles.inputLabel}>Nom</Text><TextInput style={styles.textInput} value={form.nom} onChangeText={(t)=>setForm({...form, nom:t})} placeholder="Ex: Netflix" /></View>
                <View style={styles.inputGroup}><Text style={styles.inputLabel}>Montant</Text><TextInput style={styles.textInput} value={form.montant} onChangeText={(t)=>setForm({...form, montant:t})} keyboardType="numeric" placeholder="0.00" /></View>
                <View style={styles.inputGroup}><Text style={styles.inputLabel}>Fréquence</Text><TextInput style={styles.textInput} value={form.frequence} onChangeText={(t)=>setForm({...form, frequence:t})} placeholder="Mensuel" /></View>
                <View style={styles.inputGroup}><Text style={styles.inputLabel}>Prochaine échéance</Text><TextInput style={styles.textInput} value={form.prochaine_echeance} onChangeText={(t)=>setForm({...form, prochaine_echeance:t})} placeholder="YYYY-MM-DD" /></View>
                <View style={styles.inputGroup}><Text style={styles.inputLabel}>Icône</Text><TextInput style={styles.textInput} value={form.icone} onChangeText={(t)=>setForm({...form, icone:t})} placeholder="RefreshCw" /></View>
                <View style={styles.inputGroup}><Text style={styles.inputLabel}>Couleur</Text><TextInput style={styles.textInput} value={form.couleur} onChangeText={(t)=>setForm({...form, couleur:t})} placeholder="#3B82F6" /></View>
                <View style={styles.inputGroup}><Text style={styles.inputLabel}>Compte</Text>
                  <TouchableOpacity style={styles.selectContainer} onPress={()=>setSelectOpen(!selectOpen)}>
                    <Text style={styles.selectText}>{comptes.find(c=>(c.id_compte||c.id)===form.id_compte)?.nom || 'Sélectionner un compte'}</Text>
                    <Text style={styles.selectArrow}>{selectOpen ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                  {selectOpen && (
                    <View style={styles.selectDropdown}>
                      <View style={styles.searchContainer}><Text style={styles.searchIcon}>🔍</Text><TextInput style={styles.searchInput} placeholder="Rechercher un compte..." value={search} onChangeText={setSearch} /></View>
                      <ScrollView style={styles.selectOptions}>
                        {comptes.filter(c=>(c.nom||'').toLowerCase().includes(search.toLowerCase())).map((c)=>(
                          <TouchableOpacity key={c.id_compte||c.id} style={styles.selectOption} onPress={()=>{ setForm({...form, id_compte: c.id_compte||c.id}); setSelectOpen(false); }}>
                            <Text style={styles.selectOptionText}>{c.nom} — {(parseFloat(c.solde)||0).toLocaleString('fr-FR')} Ar</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </ScrollView>
              <View style={styles.formButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={()=>setIsFormOpen(false)}><Text style={styles.cancelButtonText}>Annuler</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.submitButton, saving && styles.submitButtonDisabled]} onPress={submit} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitButtonText}>{editing ? 'Enregistrer' : 'Créer'}</Text>}
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>

      {/* Renew Modal */}
      <Modal visible={isRenewOpen} animationType="slide" transparent={true} onRequestClose={() => setIsRenewOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Renouveler</Text>
                <TouchableOpacity onPress={() => setIsRenewOpen(false)} style={styles.closeButton}><Text style={styles.closeButtonText}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView style={styles.content}>
                <Text style={styles.subtitleTop}>{editing?.nom || '-'}</Text>
                <View style={styles.inputGroup}><Text style={styles.inputLabel}>Compte de débit</Text>
                  <TouchableOpacity style={styles.selectContainer} onPress={()=>setSelectOpen(!selectOpen)}>
                    <Text style={styles.selectText}>{comptes.find(c=>(c.id_compte||c.id)===renewCompteId)?.nom || 'Sélectionner un compte'}</Text>
                    <Text style={styles.selectArrow}>{selectOpen ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                  {selectOpen && (
                    <View style={styles.selectDropdown}>
                      <View style={styles.searchContainer}><Text style={styles.searchIcon}>🔍</Text><TextInput style={styles.searchInput} placeholder="Rechercher un compte..." value={search} onChangeText={setSearch} /></View>
                      <ScrollView style={styles.selectOptions}>
                        {comptes.filter(c=>(c.nom||'').toLowerCase().includes(search.toLowerCase())).map((c)=>(
                          <TouchableOpacity key={c.id_compte||c.id} style={styles.selectOption} onPress={()=>{ setRenewCompteId(c.id_compte||c.id); setSelectOpen(false); }}>
                            <Text style={styles.selectOptionText}>{c.nom} — {(parseFloat(c.solde)||0).toLocaleString('fr-FR')} Ar</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </ScrollView>
              <View style={styles.formButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={()=>setIsRenewOpen(false)}><Text style={styles.cancelButtonText}>Annuler</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.submitButton, saving && styles.submitButtonDisabled]} onPress={doRenew} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitButtonText}>Renouveler</Text>}
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: '#374151' },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  addButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
  addText: { color: '#fff', fontSize: 18 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16 },
  statsSection: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  statCard: { width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#eef2f7' },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  statValue: { fontSize: 18, color: '#111827', fontWeight: '800', marginTop: 6 },
  filtersRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  searchBox: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8 },
  searchInputTop: { fontSize: 14, color: '#1f2937' },
  filterPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9999, backgroundColor: '#eef2ff' },
  filterText: { color: '#4f46e5' },
  filterTextActive: { fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#eef2f7', marginBottom: 12 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center' },
  cardBottomRow: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nom: { fontSize: 16, fontWeight: '800', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  rowActions: { flexDirection: 'row', gap: 8 },
  smallBtn: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  smallBtnText: { color: '#374151', fontSize: 14 },
  iconWrap: { marginRight: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 18 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badgesRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  badge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  badgeText: { fontSize: 11, color: '#374151' },
  statutPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999, borderWidth: 1 },
  statutText: { fontSize: 11, fontWeight: '700' },
  amountText: { fontSize: 14, fontWeight: '800', color: '#111827' },
  nextText: { fontSize: 12, color: '#6b7280' },

  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '60%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  closeButtonText: { fontSize: 16, color: '#6b7280', fontWeight: 'bold' },
  content: { flex: 1, paddingHorizontal: 20 },
  inputGroup: { marginTop: 12 },
  inputLabel: { fontSize: 14, color: '#374151', fontWeight: '600', marginBottom: 6 },
  textInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, backgroundColor: '#f9fafb', color: '#1f2937' },
  formButtons: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  cancelButton: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, color: '#6b7280', fontWeight: '500' },
  submitButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#10b981', alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: '#9ca3af', opacity: 0.7 },

  selectContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#f9fafb' },
  selectText: { fontSize: 16, color: '#1f2937', flex: 1 },
  selectArrow: { fontSize: 12, color: '#6b7280' },
  selectDropdown: { marginTop: 4, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, backgroundColor: '#fff', overflow: 'hidden', maxHeight: 220 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#f9fafb' },
  searchIcon: { fontSize: 16, marginRight: 8, color: '#6b7280' },
  searchInput: { flex: 1, fontSize: 14, color: '#1f2937', paddingVertical: 4 },
  selectOptions: { maxHeight: 160 },
  selectOption: { paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  selectOptionText: { fontSize: 16, color: '#374151' },
});

export default AbonnementsScreen;


