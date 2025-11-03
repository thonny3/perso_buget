import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Switch, TextInput } from 'react-native';
import { investissementsService } from '../services/apiService';

const InvestissementReportModal = ({ visible, onClose, items }) => {
  const [periode, setPeriode] = useState('mensuel');
  const [annee, setAnnee] = useState(String(new Date().getFullYear()));
  const [mois, setMois] = useState(String(new Date().getMonth() + 1));
  const [investFilter, setInvestFilter] = useState('all');
  const [includeVariation, setIncludeVariation] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [detailsById, setDetailsById] = useState({});

  useEffect(() => {
    if (!visible) return;
    const load = async () => {
      try {
        setErr('');
        setLoading(true);
        const ids = investFilter === 'all' ? (items || []).map((it) => (it.id_investissement || it.id)) : [investFilter];
        const next = { ...detailsById };
        for (const rawId of ids) {
          const id = Number(rawId);
          if (!id || next[id]) continue;
          const [rev, dep] = await Promise.all([
            investissementsService.getRevenus(id),
            investissementsService.getDepenses(id),
          ]);
          const revenus = rev?.success && Array.isArray(rev.data)
            ? rev.data.map((r) => ({ montant: Number(r.montant || 0), date: r.date_revenu || r.date, type: r.type, note: r.note }))
            : [];
          const depenses = dep?.success && Array.isArray(dep.data)
            ? dep.data.map((d) => ({ montant: Number(d.montant || 0), date: d.date_depense || d.date, type: d.type, note: d.note }))
            : [];
          next[id] = { revenus, depenses };
        }
        setDetailsById(next);
      } catch (e) {
        setErr(e.message || 'Erreur chargement détails');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, investFilter, items]);

  const filteredRows = useMemo(() => {
    if (!Array.isArray(items)) return [];
    const year = Number(annee);
    const month = Number(mois);
    const list = items
      .filter((it) => (investFilter === 'all' ? true : String(it.id_investissement || it.id) === String(investFilter)))
      .map((it) => {
        const id = it.id_investissement || it.id;
        const det = detailsById[id] || { revenus: [], depenses: [] };
        const revenus = det.revenus.filter((r) => {
          const d = new Date(r.date);
          if (Number.isNaN(d.getTime())) return false;
          return periode === 'mensuel' ? d.getFullYear() === year && d.getMonth() + 1 === month : d.getFullYear() === year;
        });
        const depenses = det.depenses.filter((d0) => {
          const d = new Date(d0.date);
          if (Number.isNaN(d.getTime())) return false;
          return periode === 'mensuel' ? d.getFullYear() === year && d.getMonth() + 1 === month : d.getFullYear() === year;
        });
        const revenusTotal = revenus.reduce((s, r) => s + Number(r.montant || 0), 0);
        const depensesTotal = depenses.reduce((s, d) => s + Number(d.montant || 0), 0);
        const variation = Number((it.valeur_actuelle ?? it.montant_investi) || 0) - Number(it.montant_investi || 0);
        const net = revenusTotal - depensesTotal;
        const netInclValue = net + variation;
        return { id, nom: it.nom, revenus: revenusTotal, depenses: depensesTotal, variation, net, netInclValue };
      });
    return list;
  }, [items, detailsById, periode, annee, mois, investFilter]);

  const totals = useMemo(() => {
    const totalRevenus = filteredRows.reduce((s, r) => s + r.revenus, 0);
    const totalDepenses = filteredRows.reduce((s, r) => s + r.depenses, 0);
    const totalVariation = filteredRows.reduce((s, r) => s + r.variation, 0);
    const totalNet = filteredRows.reduce((s, r) => s + (includeVariation ? r.netInclValue : r.net), 0);
    return { totalRevenus, totalDepenses, totalVariation, totalNet };
  }, [filteredRows, includeVariation]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{periode === 'mensuel' ? 'Rapport mensuel' : 'Rapport annuel'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.filtersRow}>
              <View style={styles.filterGroup}>
                <Text style={styles.label}>Période</Text>
                <View style={styles.segment}>
                  <TouchableOpacity onPress={() => setPeriode('mensuel')} style={[styles.segmentBtn, periode==='mensuel' && styles.segmentBtnActive]}>
                    <Text style={[styles.segmentText, periode==='mensuel' && styles.segmentTextActive]}>Mensuel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setPeriode('annuel')} style={[styles.segmentBtn, periode==='annuel' && styles.segmentBtnActive]}>
                    <Text style={[styles.segmentText, periode==='annuel' && styles.segmentTextActive]}>Annuel</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={styles.label}>Année</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={annee}
                  onChangeText={setAnnee}
                />
              </View>

              {periode === 'mensuel' && (
                <View style={styles.filterGroup}>
                  <Text style={styles.label}>Mois</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={mois}
                    onChangeText={setMois}
                  />
                </View>
              )}

              <View style={[styles.filterGroup, { flex: 1 }]}>
                <Text style={styles.label}>Investissement</Text>
                <ScrollView style={styles.investList}>
                  <TouchableOpacity onPress={() => setInvestFilter('all')} style={[styles.investItem, investFilter==='all' && styles.investItemActive]}>
                    <Text style={[styles.investItemText, investFilter==='all' && styles.investItemTextActive]}>Tous</Text>
                  </TouchableOpacity>
                  {(items || []).map((it) => (
                    <TouchableOpacity key={(it.id_investissement || it.id)} onPress={() => setInvestFilter(String(it.id_investissement || it.id))} style={[styles.investItem, String(investFilter)===String(it.id_investissement || it.id) && styles.investItemActive]}>
                      <Text style={[styles.investItemText, String(investFilter)===String(it.id_investissement || it.id) && styles.investItemTextActive]}>{it.nom}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.filterGroupSwitch}>
                <Text style={styles.label}>Inclure variation valeur</Text>
                <Switch value={includeVariation} onValueChange={setIncludeVariation} />
              </View>
            </View>

            {err ? (
              <Text style={styles.error}>{err}</Text>
            ) : null}

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 2 }]}>Investissement</Text>
                <Text style={[styles.th, styles.textRight]}>Revenus</Text>
                <Text style={[styles.th, styles.textRight]}>Dépenses</Text>
                {includeVariation ? <Text style={[styles.th, styles.textRight]}>Variation</Text> : null}
                <Text style={[styles.th, styles.textRight]}>{includeVariation ? 'Net incl. valeur' : 'Net'}</Text>
              </View>
              {loading ? (
                <View style={styles.loadingRow}><ActivityIndicator /></View>
              ) : filteredRows.length === 0 ? (
                <View style={styles.emptyRow}><Text style={styles.emptyText}>Aucune donnée</Text></View>
              ) : (
                filteredRows.map((l) => (
                  <View key={l.id} style={styles.tr}>
                    <Text style={[styles.td, { flex: 2 }]}>{l.nom}</Text>
                    <Text style={[styles.td, styles.textRight, { color: '#059669', fontWeight: '700' }]}>{Math.round(l.revenus).toLocaleString('fr-FR')}</Text>
                    <Text style={[styles.td, styles.textRight, { color: '#ef4444', fontWeight: '700' }]}>{Math.round(l.depenses).toLocaleString('fr-FR')}</Text>
                    {includeVariation ? <Text style={[styles.td, styles.textRight]}>{Math.round(l.variation).toLocaleString('fr-FR')}</Text> : null}
                    <Text style={[styles.td, styles.textRight]}>{Math.round(includeVariation ? l.netInclValue : l.net).toLocaleString('fr-FR')}</Text>
                  </View>
                ))
              )}
              <View style={[styles.tr, styles.totalRow]}>
                <Text style={[styles.td, { flex: 2, textAlign: 'right', fontWeight: '700' }]}>Totaux</Text>
                <Text style={[styles.td, styles.textRight, { color: '#065f46', fontWeight: '800' }]}>{Math.round(totals.totalRevenus).toLocaleString('fr-FR')}</Text>
                <Text style={[styles.td, styles.textRight, { color: '#7f1d1d', fontWeight: '800' }]}>{Math.round(totals.totalDepenses).toLocaleString('fr-FR')}</Text>
                {includeVariation ? <Text style={[styles.td, styles.textRight]}>{Math.round(totals.totalVariation).toLocaleString('fr-FR')}</Text> : null}
                <Text style={[styles.td, styles.textRight]}>{Math.round(totals.totalNet).toLocaleString('fr-FR')}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
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
    fontSize: 18,
    fontWeight: '700',
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    marginBottom: 12,
  },
  filterGroup: {
    width: 150,
  },
  filterGroupSwitch: {
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 6,
    fontWeight: '600',
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 2,
  },
  segmentBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#fff',
  },
  segmentText: {
    fontSize: 12,
    color: '#374151',
  },
  segmentTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
  },
  investList: {
    maxHeight: 110,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  investItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f7',
  },
  investItemActive: {
    backgroundColor: '#ecfeff',
  },
  investItemText: {
    fontSize: 12,
    color: '#374151',
  },
  investItemTextActive: {
    color: '#0e7490',
    fontWeight: '700',
  },
  table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  th: {
    flex: 1,
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '700',
  },
  tr: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  td: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  totalRow: {
    backgroundColor: '#f8fafc',
  },
  textRight: {
    textAlign: 'right',
  },
  loadingRow: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRow: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
  },
  error: {
    color: '#b91c1c',
    marginBottom: 12,
  },
});

export default InvestissementReportModal;


