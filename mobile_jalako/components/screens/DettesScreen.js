import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { dettesService, accountService } from '../../services/apiService';

const DettesScreen = ({ onBack, onRefreshCallback }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    montant_initial: '',
    montant_restant: '',
    taux_interet: '0',
    date_debut: new Date().toISOString().slice(0,10),
    date_fin_prevue: '',
    paiement_mensuel: '0',
    creancier: '',
    statut: 'en cours',
    type: 'personne',
  });
  const [formErrors, setFormErrors] = useState({});
  const [actionVisible, setActionVisible] = useState(false);
  const [activeAction, setActiveAction] = useState(null); // 'edit' | 'paiement' | null
  const [selectedDette, setSelectedDette] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [editData, setEditData] = useState({
    nom: '', montant_initial: '', montant_restant: '', taux_interet: '0',
    date_debut: '', date_fin_prevue: '', paiement_mensuel: '0', creancier: '', type: 'personne'
  });
  const [editErrors, setEditErrors] = useState({});
  const [payData, setPayData] = useState({ montant: '', date_paiement: new Date().toISOString().slice(0,10), id_compte: '' });
  const [paySelectOpen, setPaySelectOpen] = useState(false);
  const [comptes, setComptes] = useState([]);
  const [editTypeOpen, setEditTypeOpen] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [addTypeOpen, setAddTypeOpen] = useState(false);
  const [payErrors, setPayErrors] = useState({});

  useEffect(() => {
    const loadComptes = async () => {
      try {
        const res = await accountService.getMyAccounts();
        if (res.success) setComptes(Array.isArray(res.data) ? res.data : []);
      } catch (_e) {}
    };
    if (actionVisible && activeAction === 'paiement') {
      loadComptes();
    }
  }, [actionVisible, activeAction]);

  const load = async () => {
    try {
      setError('');
      const res = await dettesService.getDettes();
      if (res.success) {
        setItems(Array.isArray(res.data) ? res.data : []);
      } else {
        setError(res.error || 'Erreur chargement dettes');
        setItems([]);
      }
    } catch (e) {
      setError(e.message || 'Erreur chargement dettes');
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (onRefreshCallback) onRefreshCallback(load);
  }, [onRefreshCallback]);

  // Harmoniser les champs selon backend: montant_initial, montant_restant, total_rembourse
  const totalMontant = items.reduce((s, d) => s + Number(d.montant_initial ?? d.montant ?? 0), 0);
  const totalRestant = items.reduce((s, d) => {
    const restantBase = d.montant_restant ?? ((Number(d.montant_initial ?? 0)) - (Number(d.total_rembourse ?? d.rembourse ?? 0)));
    const restantNum = Number(restantBase ?? 0);
    return s + restantNum;
  }, 0);
  const totalRembourse = Math.max(0, totalMontant - totalRestant);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const validate = () => {
    const e = {};
    if (!formData.nom.trim()) e.nom = 'Nom requis';
    if (!formData.montant_initial || Number(formData.montant_initial) <= 0) e.montant_initial = 'Montant > 0';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        nom: formData.nom,
        montant_initial: Number(formData.montant_initial),
        montant_restant: formData.montant_restant === '' ? undefined : Number(formData.montant_restant),
        taux_interet: Number(formData.taux_interet || 0),
        date_debut: formData.date_debut,
        date_fin_prevue: formData.date_fin_prevue || null,
        paiement_mensuel: Number(formData.paiement_mensuel || 0),
        creancier: formData.creancier,
        statut: formData.statut,
        type: formData.type,
      };
      const res = await dettesService.createDette(payload);
      if (!res.success) {
        setError(res.error || "Erreur lors de l'ajout");
      } else {
        setFormData({
          nom: '', montant_initial: '', montant_restant: '', taux_interet: '0',
          date_debut: new Date().toISOString().slice(0,10), date_fin_prevue: '', paiement_mensuel: '0', creancier: '', statut: 'en cours', type: 'personne'
        });
        await load();
      }
    } catch (e) {
      setError(e.message || "Erreur lors de l'ajout");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Mes Dettes</Text>
            <Text style={styles.subtitle}>Suivi des dettes et remboursements</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Mes Dettes</Text>
          <Text style={styles.subtitle}>Suivi des dettes et remboursements</Text>
        </View>
        <TouchableOpacity
          style={{ backgroundColor: '#059669', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#059669', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 6 }}
          onPress={() => setAddVisible(true)}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}


      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total dettes</Text>
          <Text style={styles.statValue}>{Math.round(totalMontant).toLocaleString('fr-FR')} Ar</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total remboursé</Text>
          <Text style={[styles.statValue, { color: '#059669' }]}>{Math.round(totalRembourse).toLocaleString('fr-FR')} Ar</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Reste à payer</Text>
          <Text style={[styles.statValue, { color: totalRestant > 0 ? '#ef4444' : '#059669' }]}>{Math.round(totalRestant).toLocaleString('fr-FR')} Ar</Text>
        </View>
      </View>

      <View style={styles.list}>
        {items.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Aucune dette</Text>
            <Text style={styles.emptyText}>Ajoutez votre première dette depuis le web ou prochainement ici.</Text>
          </View>
        ) : (
          items.map((d) => {
            const montant = Number(d.montant_initial ?? d.montant ?? 0);
            const calcRestantBase = d.montant_restant ?? (montant - Number(d.total_rembourse ?? d.rembourse ?? 0));
            const restant = Number(calcRestantBase ?? 0);
            const rembourse = Math.max(0, montant - restant);
            return (
              <TouchableOpacity
                key={(d.id_dette || d.id)}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedDette(d);
                  setEditData({
                    nom: d.nom || '',
                    montant_initial: String(d.montant_initial ?? d.montant ?? ''),
                    montant_restant: d.montant_restant === null || d.montant_restant === undefined ? '' : String(d.montant_restant),
                    taux_interet: String(d.taux_interet ?? 0),
                    date_debut: d.date_debut || '',
                    date_fin_prevue: d.date_fin_prevue || '',
                    paiement_mensuel: String(d.paiement_mensuel ?? 0),
                    creancier: d.creancier || '',
                    type: d.type || 'personne',
                  });
                  setPayData({ montant: '', date_paiement: new Date().toISOString().slice(0,10) });
                  setActiveAction(null);
                  setActionVisible(true);
                }}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{d.titre || d.nom || 'Dette'}</Text>
                  <Text style={[styles.badge, restant > 0 ? styles.badgeDanger : styles.badgeSuccess]}>{restant > 0 ? 'En cours' : 'Terminé'}</Text>
                </View>
                <Text style={styles.cardSubtitle}>{d.creancier || d.debiteur || ''}</Text>
                <View style={styles.cardRow}>
                  <Text style={styles.rowLabel}>Montant</Text>
                  <Text style={styles.rowValue}>{Math.round(montant).toLocaleString('fr-FR')} Ar</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.rowLabel}>Remboursé</Text>
                  <Text style={[styles.rowValue, { color: '#059669' }]}>{Math.round(rembourse).toLocaleString('fr-FR')} Ar</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.rowLabel}>Restant</Text>
                  <Text style={[styles.rowValue, { color: restant > 0 ? '#ef4444' : '#059669' }]}>{Math.round(restant).toLocaleString('fr-FR')} Ar</Text>
                </View>
                {d.echeance ? (
                  <View style={styles.cardRow}>
                    <Text style={styles.rowLabel}>Échéance</Text>
                    <Text style={styles.rowValue}>{new Date(d.echeance).toLocaleDateString('fr-FR')}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })
        )}
      </View>
      {/* Action Modal */}
      <Modal visible={actionVisible} animationType="slide" transparent onRequestClose={() => setActionVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.actionContainer}>
            <View style={styles.actionHeader}>
              <View>
                <Text style={styles.actionTitle}>{selectedDette?.nom || 'Dette'}</Text>
                {!!selectedDette?.creancier && (
                  <Text style={styles.actionSubtitle}>{selectedDette?.creancier}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setActionVisible(false)} style={styles.closeButton}><Text style={styles.closeButtonText}>✕</Text></TouchableOpacity>
            </View>

            {!activeAction && (
              <View style={styles.actionsGrid}>
                <TouchableOpacity style={styles.actionCard} onPress={() => setActiveAction('paiement')}>
                  <View style={[styles.actionIcon, { backgroundColor: '#dbeafe' }]}>
                    <Feather name="dollar-sign" size={24} color="#3b82f6" />
                  </View>
                  <Text style={styles.actionLabel}>Ajouter un paiement</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard} onPress={() => setActiveAction('edit')}>
                  <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
                    <Feather name="edit-2" size={24} color="#f59e0b" />
                  </View>
                  <Text style={styles.actionLabel}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionCard, { backgroundColor: '#fee2e2', borderColor: '#fecaca' }]}
                  onPress={() => {
                    Alert.alert(
                      'Supprimer',
                      `Supprimer la dette "${selectedDette?.nom}" ?`,
                      [
                        { text: 'Annuler', style: 'cancel' },
                        { text: 'Supprimer', style: 'destructive', onPress: async () => {
                            try {
                              setActionLoading(true);
                              await dettesService.deleteDette(selectedDette.id_dette || selectedDette.id);
                              setActionVisible(false);
                              await load();
                            } catch (e) {
                              Alert.alert('Erreur', e.message || 'Suppression impossible');
                            } finally {
                              setActionLoading(false);
                            }
                          } }
                      ]
                    );
                  }}
                >
                  <View style={[styles.actionIcon, { backgroundColor: '#fee2e2' }]}>
                    <Feather name="trash-2" size={24} color="#ef4444" />
                  </View>
                  <Text style={[styles.actionLabel, { color: '#b91c1c' }]}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeAction === 'paiement' && (
              <View style={styles.formContent}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Ajouter un paiement</Text>
                </View>
                <View style={styles.inputGroup}><Text style={styles.inputLabel}>Montant</Text>
                  <TextInput style={[styles.textInput, payErrors.montant && styles.inputError]} placeholder="0.00" placeholderTextColor="#9ca3af" keyboardType="numeric" value={payData.montant} onChangeText={(t)=>{ setPayData({...payData, montant: t}); setPayErrors({...payErrors, montant: undefined}); }} />
                  {payErrors.montant ? <Text style={styles.errorTextSmall}>{payErrors.montant}</Text> : null}
                </View>
                <View style={styles.inputGroup}><Text style={styles.inputLabel}>Date de paiement</Text>
                  <TextInput style={styles.textInput} placeholder="YYYY-MM-DD" placeholderTextColor="#9ca3af" value={payData.date_paiement} onChangeText={(t)=>setPayData({...payData, date_paiement: t})} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Compte</Text>
                  <TouchableOpacity
                    style={[styles.selectContainer, payErrors.id_compte && { borderColor: '#ef4444', backgroundColor: '#fef2f2' }]}
                    onPress={() => setPaySelectOpen(!paySelectOpen)}
                  >
                    <Text style={styles.selectText}>
                      {comptes.find(c => (c.id_compte || c.id) === payData.id_compte)?.nom || 'Sélectionner un compte'}
                    </Text>
                    <Text style={[styles.selectArrow, paySelectOpen && styles.selectArrowOpen]}>▼</Text>
                  </TouchableOpacity>
                  {payErrors.id_compte ? <Text style={styles.errorTextSmall}>{payErrors.id_compte}</Text> : null}
                  {paySelectOpen && (
                    <View style={styles.selectDropdown}>
                      <ScrollView style={styles.selectOptions} showsVerticalScrollIndicator={false}>
                        {comptes.map((compte) => (
                          <TouchableOpacity
                            key={compte.id_compte || compte.id}
                            style={[styles.selectOption, payData.id_compte === (compte.id_compte || compte.id) && styles.selectOptionSelected]}
                            onPress={() => { setPayData({...payData, id_compte: (compte.id_compte || compte.id)}); setPaySelectOpen(false); }}
                          >
                            <Text style={[styles.selectOptionText, payData.id_compte === (compte.id_compte || compte.id) && styles.selectOptionTextSelected]}>
                              {compte.nom}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
                <View style={styles.formButtons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={()=>setActiveAction(null)}><Text style={styles.cancelButtonText}>Annuler</Text></TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.submitButton, actionLoading && styles.submitButtonDisabled]}
                    disabled={actionLoading}
                    onPress={async ()=>{
                      const errs = {};
                      if (!payData.montant || Number(payData.montant) <= 0) errs.montant = 'Montant > 0';
                      if (!payData.id_compte) errs.id_compte = 'Compte requis';
                      setPayErrors(errs);
                      if (Object.keys(errs).length > 0) return;
                      try {
                        setActionLoading(true);
                        await dettesService.addRemboursement(selectedDette.id_dette || selectedDette.id, {
                          montant: Number(payData.montant),
                          date_paiement: payData.date_paiement,
                          id_compte: payData.id_compte,
                        });
                        setActiveAction(null);
                        setActionVisible(false);
                        await load();
                      } catch (e) {
                        Alert.alert('Erreur', e.message || "Ajout du paiement impossible");
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                  >
                    {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Enregistrer</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {activeAction === 'edit' && (
              <View style={styles.formContent}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Modifier la dette</Text>
                </View>
                <View style={styles.inputGroup}><Text style={styles.inputLabel}>Nom</Text>
                  <TextInput style={[styles.textInput, editErrors.nom && styles.inputError]} placeholder="Ex: Prêt bancaire" placeholderTextColor="#9ca3af" value={editData.nom} onChangeText={(t)=>{ setEditData({...editData, nom: t}); setEditErrors({...editErrors, nom: undefined}); }} />
                  {editErrors.nom ? <Text style={styles.errorTextSmall}>{editErrors.nom}</Text> : null}
                </View>
                <View style={styles.inputGroup}><Text style={styles.inputLabel}>Créancier</Text>
                  <TextInput style={styles.textInput} placeholder="Banque, personne..." placeholderTextColor="#9ca3af" value={editData.creancier} onChangeText={(t)=>setEditData({...editData, creancier: t})} />
                </View>
                <View style={styles.inputGroup}><Text style={styles.inputLabel}>Montant initial</Text>
                  <TextInput style={[styles.textInput, editErrors.montant_initial && styles.inputError]} placeholder="0.00" placeholderTextColor="#9ca3af" keyboardType="numeric" value={editData.montant_initial} onChangeText={(t)=>{ setEditData({...editData, montant_initial: t}); setEditErrors({...editErrors, montant_initial: undefined}); }} />
                  {editErrors.montant_initial ? <Text style={styles.errorTextSmall}>{editErrors.montant_initial}</Text> : null}
                </View>
                <View style={styles.inputGroup}><Text style={styles.inputLabel}>Montant restant</Text>
                  <TextInput style={styles.textInput} placeholder="0.00" placeholderTextColor="#9ca3af" keyboardType="numeric" value={editData.montant_restant} onChangeText={(t)=>setEditData({...editData, montant_restant: t})} />
                </View>
                <View style={styles.inputGroup}><Text style={styles.inputLabel}>Taux d'intérêt (%)</Text>
                  <TextInput style={styles.textInput} keyboardType="numeric" value={editData.taux_interet} onChangeText={(t)=>setEditData({...editData, taux_interet: t})} />
                </View>
                <View style={styles.inputGroup}><Text style={styles.inputLabel}>Paiement mensuel</Text>
                  <TextInput style={styles.textInput} keyboardType="numeric" value={editData.paiement_mensuel} onChangeText={(t)=>setEditData({...editData, paiement_mensuel: t})} />
                </View>
                <View style={styles.inputGroup}><Text style={styles.inputLabel}>Date de début</Text>
                  <TextInput style={styles.textInput} placeholder="YYYY-MM-DD" placeholderTextColor="#9ca3af" value={editData.date_debut} onChangeText={(t)=>setEditData({...editData, date_debut: t})} />
                </View>
                <View style={styles.inputGroup}><Text style={styles.inputLabel}>Date fin prévue</Text>
                  <TextInput style={styles.textInput} placeholder="YYYY-MM-DD" placeholderTextColor="#9ca3af" value={editData.date_fin_prevue} onChangeText={(t)=>setEditData({...editData, date_fin_prevue: t})} />
                </View>
                <View style={styles.inputGroup}><Text style={styles.inputLabel}>Type</Text>
                  <TouchableOpacity
                    style={styles.selectContainer}
                    onPress={() => setEditTypeOpen(!editTypeOpen)}
                  >
                    <Text style={styles.selectText}>
                      {editData.type === 'personne' ? 'Personne' : editData.type === 'banque' ? 'Banque' : 'Autre'}
                    </Text>
                    <Text style={[styles.selectArrow, editTypeOpen && styles.selectArrowOpen]}>▼</Text>
                  </TouchableOpacity>
                  {editTypeOpen && (
                    <View style={styles.selectDropdown}>
                      <ScrollView style={styles.selectOptions} showsVerticalScrollIndicator={false}>
                        {[
                          { value: 'personne', label: 'Personne' },
                          { value: 'banque', label: 'Banque' },
                          { value: 'autre', label: 'Autre' }
                        ].map((opt) => (
                          <TouchableOpacity
                            key={opt.value}
                            style={[styles.selectOption, editData.type === opt.value && styles.selectOptionSelected]}
                            onPress={() => { setEditData({...editData, type: opt.value}); setEditTypeOpen(false); }}
                          >
                            <Text style={[styles.selectOptionText, editData.type === opt.value && styles.selectOptionTextSelected]}>
                              {opt.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
                <View style={styles.formButtons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={()=>setActiveAction(null)}><Text style={styles.cancelButtonText}>Annuler</Text></TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.submitButton, actionLoading && styles.submitButtonDisabled]}
                    disabled={actionLoading}
                    onPress={async ()=>{
                      const errs = {};
                      if (!editData.nom.trim()) errs.nom = 'Nom requis';
                      if (!editData.montant_initial || Number(editData.montant_initial) <= 0) errs.montant_initial = 'Montant > 0';
                      setEditErrors(errs);
                      if (Object.keys(errs).length > 0) return;
                      try {
                        setActionLoading(true);
                        await dettesService.updateDette(selectedDette.id_dette || selectedDette.id, {
                          nom: editData.nom,
                          montant_initial: Number(editData.montant_initial),
                          montant_restant: editData.montant_restant === '' ? undefined : Number(editData.montant_restant),
                          taux_interet: Number(editData.taux_interet || 0),
                          date_debut: editData.date_debut || null,
                          date_fin_prevue: editData.date_fin_prevue || null,
                          paiement_mensuel: Number(editData.paiement_mensuel || 0),
                          creancier: editData.creancier || '',
                          type: editData.type || 'personne',
                        });
                        setActiveAction(null);
                        setActionVisible(false);
                        await load();
                      } catch (e) {
                        Alert.alert('Erreur', e.message || 'Modification impossible');
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                  >
                    {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Enregistrer</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Dette Modal */}
      <Modal visible={addVisible} animationType="slide" transparent onRequestClose={() => setAddVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.actionContainer}>
            <View style={styles.actionHeader}>
              <View>
                <Text style={styles.actionTitle}>Ajouter une dette</Text>
                <Text style={styles.actionSubtitle}>Créer une nouvelle dette</Text>
              </View>
              <TouchableOpacity onPress={() => setAddVisible(false)} style={styles.closeButton}><Text style={styles.closeButtonText}>✕</Text></TouchableOpacity>
            </View>

            <View style={styles.formContent}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Informations</Text>
              </View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Nom</Text>
                <TextInput style={[styles.textInput, formErrors.nom && styles.inputError]} placeholder="Ex: Prêt bancaire" placeholderTextColor="#9ca3af" value={formData.nom} onChangeText={(t)=>setFormData({...formData, nom: t})} />
                {formErrors.nom ? <Text style={styles.errorTextSmall}>{formErrors.nom}</Text> : null}
              </View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Créancier</Text>
                <TextInput style={styles.textInput} placeholder="Banque, personne..." placeholderTextColor="#9ca3af" value={formData.creancier} onChangeText={(t)=>setFormData({...formData, creancier: t})} />
              </View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Montant initial</Text>
                <TextInput style={[styles.textInput, formErrors.montant_initial && styles.inputError]} placeholder="0.00" placeholderTextColor="#9ca3af" keyboardType="numeric" value={formData.montant_initial} onChangeText={(t)=>setFormData({...formData, montant_initial: t})} />
                {formErrors.montant_initial ? <Text style={styles.errorTextSmall}>{formErrors.montant_initial}</Text> : null}
              </View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Montant restant</Text>
                <TextInput style={styles.textInput} placeholder="0.00" placeholderTextColor="#9ca3af" keyboardType="numeric" value={formData.montant_restant} onChangeText={(t)=>setFormData({...formData, montant_restant: t})} />
              </View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Taux d'intérêt (%)</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={formData.taux_interet} onChangeText={(t)=>setFormData({...formData, taux_interet: t})} />
              </View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Paiement mensuel</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={formData.paiement_mensuel} onChangeText={(t)=>setFormData({...formData, paiement_mensuel: t})} />
              </View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Date de début</Text>
                <TextInput style={styles.textInput} placeholder="YYYY-MM-DD" placeholderTextColor="#9ca3af" value={formData.date_debut} onChangeText={(t)=>setFormData({...formData, date_debut: t})} />
              </View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Date fin prévue</Text>
                <TextInput style={styles.textInput} placeholder="YYYY-MM-DD" placeholderTextColor="#9ca3af" value={formData.date_fin_prevue} onChangeText={(t)=>setFormData({...formData, date_fin_prevue: t})} />
              </View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Type</Text>
                <TouchableOpacity
                  style={styles.selectContainer}
                  onPress={() => setAddTypeOpen(!addTypeOpen)}
                >
                  <Text style={styles.selectText}>
                    {formData.type === 'personne' ? 'Personne' : formData.type === 'banque' ? 'Banque' : 'Autre'}
                  </Text>
                  <Text style={[styles.selectArrow, addTypeOpen && styles.selectArrowOpen]}>▼</Text>
                </TouchableOpacity>
                {addTypeOpen && (
                  <View style={styles.selectDropdown}>
                    <ScrollView style={styles.selectOptions} showsVerticalScrollIndicator={false}>
                      {[
                        { value: 'personne', label: 'Personne' },
                        { value: 'banque', label: 'Banque' },
                        { value: 'autre', label: 'Autre' }
                      ].map((opt) => (
                        <TouchableOpacity
                          key={opt.value}
                          style={[styles.selectOption, formData.type === opt.value && styles.selectOptionSelected]}
                          onPress={() => { setFormData({...formData, type: opt.value}); setAddTypeOpen(false); }}
                        >
                          <Text style={[styles.selectOptionText, formData.type === opt.value && styles.selectOptionTextSelected]}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.formButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={()=>setAddVisible(false)}><Text style={styles.cancelButtonText}>Annuler</Text></TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                  disabled={submitting}
                  onPress={async ()=>{
                    const ok = validate();
                    if (!ok) return;
                    setSubmitting(true);
                    try {
                      const payload = {
                        nom: formData.nom,
                        montant_initial: Number(formData.montant_initial),
                        montant_restant: formData.montant_restant === '' ? undefined : Number(formData.montant_restant),
                        taux_interet: Number(formData.taux_interet || 0),
                        date_debut: formData.date_debut,
                        date_fin_prevue: formData.date_fin_prevue || null,
                        paiement_mensuel: Number(formData.paiement_mensuel || 0),
                        creancier: formData.creancier,
                        statut: formData.statut,
                        type: formData.type,
                      };
                      const res = await dettesService.createDette(payload);
                      if (!res.success) {
                        Alert.alert('Erreur', res.error || "Erreur lors de l'ajout");
                      } else {
                        setAddVisible(false);
                        setFormData({
                          nom: '', montant_initial: '', montant_restant: '', taux_interet: '0',
                          date_debut: new Date().toISOString().slice(0,10), date_fin_prevue: '', paiement_mensuel: '0', creancier: '', statut: 'en cours', type: 'personne'
                        });
                        await load();
                      }
                    } catch (e) {
                      Alert.alert('Erreur', e.message || "Erreur lors de l'ajout");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Enregistrer</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  backButton: { padding: 8, marginRight: 12, borderRadius: 8, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
  title: { fontSize: 28, fontWeight: '800', color: '#1e293b' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6b7280' },
  errorBox: { marginHorizontal: 20, padding: 12, backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1, borderRadius: 12 },
  errorText: { color: '#b91c1c' },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  statLabel: { fontSize: 12, color: '#64748b', marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  list: { padding: 20, gap: 12 },
  formCard: { marginHorizontal: 20, marginBottom: 12, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  formGrid: { flexDirection: 'row', gap: 12 },
  formGroup: { flex: 1 },
  inputLabel: { fontSize: 12, color: '#374151', marginBottom: 6, fontWeight: '600' },
  textInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#f9fafb', color: '#1f2937' },
  inputError: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  errorTextSmall: { color: '#b91c1c', fontSize: 12, marginTop: 4 },
  segment: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 8, padding: 2 },
  segmentBtn: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6 },
  segmentBtnActive: { backgroundColor: '#fff' },
  segmentText: { fontSize: 12, color: '#374151' },
  segmentTextActive: { color: '#059669', fontWeight: '700' },
  submitBtn: { backgroundColor: '#059669', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  submitBtnText: { color: '#fff', fontWeight: '700' },
  emptyBox: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, color: '#fff', overflow: 'hidden', fontSize: 12 },
  badgeDanger: { backgroundColor: '#ef4444' },
  badgeSuccess: { backgroundColor: '#10b981' },
  cardSubtitle: { fontSize: 12, color: '#6b7280', marginBottom: 6 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  rowLabel: { fontSize: 12, color: '#64748b' },
  rowValue: { fontSize: 14, color: '#1f2937', fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  actionContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '60%' },
  actionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  actionTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  actionSubtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  closeButtonText: { fontSize: 16, color: '#6b7280', fontWeight: 'bold' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, padding: 20 },
  actionCard: { width: '48%', backgroundColor: '#f9fafb', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  actionIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionLabel: { fontSize: 14, fontWeight: '600', color: '#374151', textAlign: 'center' },
  formContent: { flex: 1, paddingHorizontal: 20, paddingBottom: 12 },
  cancelButton: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, color: '#6b7280', fontWeight: '500' },
  submitButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#10b981', alignItems: 'center' },
  submitButtonText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  submitButtonDisabled: { backgroundColor: '#9ca3af', opacity: 0.7 },
  formHeader: { paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  formTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  formButtons: { marginTop: 'auto', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#fff' },
});

export default DettesScreen;


