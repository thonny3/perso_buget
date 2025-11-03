import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { accountService, contributionsService } from '../services/apiService';

const AddContributionScreen = ({ navigation, route }) => {
  const { objectif, onSuccess } = route?.params || {};
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await accountService.getMyAccounts();
        setAccounts(res.success && Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async () => {
    const value = parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) {
      Alert.alert('Erreur', 'Montant invalide');
      return;
    }
    setSubmitting(true);
    try {
      const res = await contributionsService.create({
        id_objectif: objectif?.id_objectif,
        montant: value,
        id_compte: selectedAccountId || undefined,
      });
      if (res.success) {
        Alert.alert('Succès', 'Contribution ajoutée', [
          { text: 'OK', onPress: () => navigation?.goBack && navigation.goBack() }
        ]);
        if (typeof onSuccess === 'function') onSuccess();
      } else {
        Alert.alert('Erreur', res.error || "Impossible d'ajouter la contribution");
      }
    } catch (e) {
      Alert.alert('Erreur', "Erreur lors de l'ajout");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={true} animationType="slide" transparent={true} onRequestClose={() => navigation?.goBack && navigation.goBack()}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <SafeAreaView style={styles.safeArea}>
            {loading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#059669" />
              </View>
            ) : (
              <>
                <View style={styles.header}>
                  <Text style={styles.title}>Ajouter de l'argent</Text>
                  <TouchableOpacity onPress={() => navigation?.goBack && navigation.goBack()} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                  <Text style={styles.subtitle}>Objectif : {objectif?.nom || '-'}</Text>

                  {/* Bloc d'informations */}
                  <View style={styles.statsCard}>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Nom de l'objectif:</Text>
                      <Text style={styles.statValue}>{objectif?.nom || '-'}</Text>
                    </View>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Montant objectif:</Text>
                      <Text style={styles.statValue}>{Number(objectif?.montant_objectif || 0).toLocaleString('fr-FR')} Ar</Text>
                    </View>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Date limite:</Text>
                      <Text style={styles.statValue}>{objectif?.date_limite?.slice(0,10) || '-'}</Text>
                    </View>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Icône:</Text>
                      <Text style={styles.statValue}>{objectif?.icone || '—'}</Text>
                    </View>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Couleur:</Text>
                      <Text style={styles.statValue}>{objectif?.couleur || '—'}</Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Montant actuel:</Text>
                      <Text style={styles.statValue}>{Number(objectif?.montant_actuel || 0).toLocaleString('fr-FR')} Ar</Text>
                    </View>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Montant objectif:</Text>
                      <Text style={styles.statValue}>{Number(objectif?.montant_objectif || 0).toLocaleString('fr-FR')} Ar</Text>
                    </View>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Restant (avant):</Text>
                      <Text style={styles.statValue}>{Math.max(0, Number(objectif?.montant_objectif || 0) - Number(objectif?.montant_actuel || 0)).toLocaleString('fr-FR')} Ar</Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Après ajout:</Text>
                      <Text style={[styles.statValue, { color: '#16a34a' }]}>{(Number(objectif?.montant_actuel || 0) + (parseFloat(amount) || 0)).toLocaleString('fr-FR')} Ar</Text>
                    </View>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Restant (après ajout):</Text>
                      <Text style={styles.statValue}>{Math.max(0, Number(objectif?.montant_objectif || 0) - (Number(objectif?.montant_actuel || 0) + (parseFloat(amount) || 0))).toLocaleString('fr-FR')} Ar</Text>
                    </View>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Progression:</Text>
                      <Text style={styles.statValue}>{Number(objectif?.pourcentage || 0)}%</Text>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Montant à ajouter</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="0.00"
                      keyboardType="numeric"
                      value={amount}
                      onChangeText={setAmount}
                    />
                  </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Compte de débit</Text>
              <TouchableOpacity 
                style={styles.selectContainer}
                onPress={() => setIsSelectOpen(!isSelectOpen)}
              >
                <Text style={styles.selectText}>
                  {accounts.find(a => (a.id_compte || a.id) === selectedAccountId)?.nom || 'Sélectionner un compte'}
                </Text>
                <Text style={[styles.selectArrow, isSelectOpen && styles.selectArrowOpen]}>▼</Text>
              </TouchableOpacity>

              {isSelectOpen && (
                <View style={styles.selectDropdown}>
                  <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Rechercher un compte..."
                      placeholderTextColor="#9ca3af"
                      value={searchText}
                      onChangeText={setSearchText}
                    />
                  </View>
                  <ScrollView style={styles.selectOptions} showsVerticalScrollIndicator={false}>
                    {accounts
                      .filter(acc => (acc.nom || '').toLowerCase().includes(searchText.toLowerCase()))
                      .map((acc) => (
                        <TouchableOpacity
                          key={acc.id_compte || acc.id}
                          style={[styles.selectOption, selectedAccountId === (acc.id_compte || acc.id) && styles.selectOptionSelected]}
                          onPress={() => {
                            setSelectedAccountId(acc.id_compte || acc.id);
                            setIsSelectOpen(false);
                          }}
                        >
                          <Text style={[styles.selectOptionText, selectedAccountId === (acc.id_compte || acc.id) && styles.selectOptionTextSelected]}>
                            {acc.nom} — {(parseFloat(acc.solde)||0).toLocaleString('fr-FR')} Ar
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                </View>
              )}
            </View>
                </ScrollView>

                <View style={styles.formButtons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => navigation?.goBack && navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.submitButton, submitting && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={submitting}>
                    {submitting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.submitButtonText}>Ajouter</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  title: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: { fontSize: 16, color: '#6b7280', fontWeight: 'bold' },
  content: { flex: 1, paddingHorizontal: 20 },
  subtitle: { fontSize: 16, color: '#6b7280', marginTop: 20, marginBottom: 16, textAlign: 'center' },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  statsCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  statValue: { fontSize: 14, color: '#1f2937', fontWeight: '700' },
  separator: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 6 },
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
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    maxHeight: 200,
  },
  selectOptions: { maxHeight: 150 },
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
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectOptionSelected: { backgroundColor: '#3b82f6' },
  selectOptionText: { fontSize: 16, color: '#374151' },
  selectOptionTextSelected: { color: '#fff', fontWeight: '500' },
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
  cancelButtonText: { fontSize: 16, color: '#6b7280', fontWeight: '500' },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  submitButtonText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  submitButtonDisabled: { backgroundColor: '#9ca3af', opacity: 0.7 },
});

export default AddContributionScreen;


