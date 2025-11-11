import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { contributionsService, accountService, objectifsService } from '../../services/apiService';

const ObjectifActionScreen = ({ navigation, route }) => {
  const { objectif, onUpdated } = route?.params || {};
  const [accounts, setAccounts] = useState([]);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [isContribOpen, setIsContribOpen] = useState(false);
  const [loadingContrib, setLoadingContrib] = useState(false);
  const [contributions, setContributions] = useState([]);

  const loadAccounts = async () => {
    try {
      const res = await accountService.getMyAccounts();
      setAccounts(res.success && Array.isArray(res.data) ? res.data : []);
    } catch (_) {}
  };

  const openAddMoney = async () => {
    setAddMoneyAmount('');
    setSelectedAccountId('');
    await loadAccounts();
    setIsAddMoneyOpen(true);
  };

  const submitAddMoney = async () => {
    if (!addMoneyAmount) {
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
        id_objectif: objectif.id_objectif,
        montant,
        id_compte: selectedAccountId || undefined,
      });
      if (res.success) {
        setIsAddMoneyOpen(false);
        if (onUpdated) onUpdated();
        Alert.alert('Succès', 'Contribution ajoutée');
      } else {
        Alert.alert('Erreur', res.error || 'Ajout impossible');
      }
    } catch (e) {
      Alert.alert('Erreur', "Erreur lors de l'ajout");
    }
  };

  const openContributions = async () => {
    setIsContribOpen(true);
    setLoadingContrib(true);
    try {
      const res = await contributionsService.listByObjectif(objectif.id_objectif);
      setContributions(res.success && Array.isArray(res.data) ? res.data : []);
    } catch (_) {
      setContributions([]);
    } finally {
      setLoadingContrib(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Confirmer', 'Supprimer cet objectif ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        const res = await objectifsService.deleteObjectif(objectif.id_objectif);
        if (res.success) {
          if (onUpdated) onUpdated();
          navigation?.goBack && navigation.goBack();
        } else {
          Alert.alert('Erreur', res.error || 'Suppression impossible');
        }
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack && navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Actions Objectif</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ padding: 16 }}>
        {/* Résumé */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.left}>
              <View style={[styles.icon, { backgroundColor: '#3b82f6' }]}>
                <Feather name="target" size={18} color="#fff" />
              </View>
              <View style={styles.info}>
                <Text style={styles.nom}>{objectif.nom}</Text>
                <Text style={styles.date}>Limite: {objectif.date_limite?.slice(0,10) || '-'}</Text>
              </View>
            </View>
          </View>
          <View style={styles.rows}>
            <View style={styles.row}><Text style={styles.label}>Objectif</Text><Text style={styles.value}>{Number(objectif.montant_objectif||0).toLocaleString('fr-FR')} Ar</Text></View>
            <View style={styles.row}><Text style={styles.label}>Actuel</Text><Text style={[styles.value, { color: '#16a34a' }]}>{Number(objectif.montant_actuel||0).toLocaleString('fr-FR')} Ar</Text></View>
            <View style={styles.row}><Text style={styles.label}>Progression</Text><Text style={styles.value}>{Number(objectif.pourcentage||0)}%</Text></View>
            <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${Math.min(100, Number(objectif.pourcentage||0))}%` }]} /></View>
          </View>
        </View>

        {/* Actions */}
        <View style={{ gap: 12, marginTop: 12 }}>
          <TouchableOpacity style={[styles.actionPrimary]} onPress={openAddMoney}>
            <Feather name="plus-circle" size={18} color="#fff" />
            <Text style={styles.actionPrimaryText}>Ajouter de l'argent</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionSecondary} onPress={openContributions}>
            <Feather name="eye" size={18} color="#374151" />
            <Text style={styles.actionSecondaryText}>Voir les contributions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionSecondary}
            onPress={() => navigation?.navigate && navigation.navigate('EditFormScreen', {
              objectifData: objectif,
              onSuccess: onUpdated,
            })}
          >
            <Feather name="edit-2" size={18} color="#374151" />
            <Text style={styles.actionSecondaryText}>Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionDanger} onPress={handleDelete}>
            <Feather name="trash-2" size={18} color="#fff" />
            <Text style={styles.actionDangerText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Ajouter de l'argent */}
      <Modal animationType="slide" transparent={true} visible={isAddMoneyOpen} onRequestClose={() => setIsAddMoneyOpen(false)}>
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
              <Text style={{ marginBottom: 12, color: '#111827', fontWeight: '600' }}>{objectif?.nom || '-'}</Text>
              <Text style={styles.inputLabel}>Montant</Text>
              <TextInput style={styles.textInput} placeholder="0.00" keyboardType="numeric" value={addMoneyAmount} onChangeText={setAddMoneyAmount} />
              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Compte (optionnel)</Text>
              <View style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8 }}>
                <ScrollView style={{ maxHeight: 180 }}>
                  {accounts.map((acc) => (
                    <TouchableOpacity key={acc.id_compte || acc.id} style={styles.selectOption} onPress={() => setSelectedAccountId(acc.id_compte || acc.id)}>
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
      <Modal animationType="slide" transparent={true} visible={isContribOpen} onRequestClose={() => setIsContribOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contributions</Text>
              <TouchableOpacity onPress={() => setIsContribOpen(false)} style={styles.closeButton}>
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={[styles.modalBody, { paddingBottom: 8 }] }>
              <Text style={{ marginBottom: 8, color: '#111827', fontWeight: '600' }}>{objectif?.nom || '-'}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backButton: { padding: 8, borderRadius: 8, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
  title: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  icon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info: { flex: 1 },
  nom: { fontSize: 16, fontWeight: '800', color: '#111827' },
  date: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  rows: { gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  value: { fontSize: 14, color: '#1f2937', fontWeight: '700' },
  progressBar: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10b981' },

  actionPrimary: { backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionPrimaryText: { color: '#fff', fontWeight: '700' },
  actionSecondary: { backgroundColor: '#f8fafc', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionSecondaryText: { color: '#374151', fontWeight: '700' },
  actionDanger: { backgroundColor: '#ef4444', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionDangerText: { color: '#fff', fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, width: '90%', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  closeButton: { padding: 4 },
  modalBody: { padding: 16 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  textInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  selectOption: { paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff' },
  cancelButtonText: { fontSize: 16, color: '#374151' },
  saveButtonInline: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#10b981' },
  saveButtonText: { color: '#fff', fontWeight: '600' },
  contribItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
});

export default ObjectifActionScreen;


