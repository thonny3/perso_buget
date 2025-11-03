import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { contributionsService } from '../services/apiService';

const ContributionsScreen = ({ navigation, route }) => {
  const { objectif } = route?.params || {};
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const totalContrib = items.reduce((s, c) => s + (parseFloat(c.montant) || 0), 0);

  const load = async () => {
    setLoading(true);
    try {
      const res = await contributionsService.listByObjectif(objectif?.id_objectif);
      setItems(res.success && Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      Alert.alert('Erreur', 'Chargement impossible');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Modal visible={true} animationType="slide" transparent={true} onRequestClose={() => navigation?.goBack && navigation.goBack()}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.title}>Contributions</Text>
              <TouchableOpacity onPress={() => navigation?.goBack && navigation.goBack()} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <Text style={styles.subtitle}>Objectif : {objectif?.nom || '-'}</Text>

              {/* Bloc d'informations, aligné avec le web / modifier */}
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
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Total contributions:</Text>
                  <Text style={[styles.statValue, { color: '#16a34a' }]}>{Number(totalContrib).toLocaleString('fr-FR')} Ar</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Progression:</Text>
                  <Text style={styles.statValue}>{Number(objectif?.pourcentage || 0)}%</Text>
                </View>
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#059669" />
                </View>
              ) : items.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>Aucune contribution.</Text>
                </View>
              ) : (
                <View style={styles.listWrap}>
                  {items.map((c, idx) => (
                    <View key={`${c.id_contribution || idx}`} style={styles.item}>
                      <View>
                        <Text style={styles.itemDate}>{new Date(c.date_contribution).toLocaleDateString('fr-FR')}</Text>
                        <Text style={styles.itemAccount}>{c.compte_nom || '—'}</Text>
                      </View>
                      <Text style={styles.itemAmount}>{Number(c.montant).toLocaleString('fr-FR')} Ar</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '60%' },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  closeButtonText: { fontSize: 16, color: '#6b7280', fontWeight: 'bold' },
  content: { flex: 1, paddingHorizontal: 20 },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 12, marginBottom: 8 },
  statsCard: { borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  statLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  statValue: { fontSize: 14, color: '#1f2937', fontWeight: '700' },
  separator: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 6 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { paddingVertical: 24 },
  emptyText: { color: '#64748b', textAlign: 'center' },
  listWrap: { paddingVertical: 8 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  itemDate: { color: '#111827', fontWeight: '600' },
  itemAccount: { color: '#6b7280', fontSize: 12 },
  itemAmount: { color: '#10b981', fontWeight: '700' },
});

export default ContributionsScreen;


