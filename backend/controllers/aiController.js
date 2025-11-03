const { analyzeExpenses, predictNextMonth, recommend } = require('../services/aiService')
const { chatWithGemini } = require('../services/geminiService')
const Categories = require('../models/categoriesModel')
const Compte = require('../models/compteModel')
const Transactions = require('../models/transactionModel')
const Budgets = require('../models/budgetModel')
const Objectifs = require('../models/objectifModel')
const Dettes = require('../models/dettesModel')
const Remboursements = require('../models/remboursementsModel')
const Abonnements = require('../models/abonnementModel')
const AlertThresholds = require('../models/alertThresholdsModel')

const AiController = {
  insights: async (req, res) => {
    try {
      const id_user = req.user?.id_user
      if (!id_user) return res.status(401).json({ message: 'Non autorisé' })
      const data = await analyzeExpenses(id_user)
      res.json(data)
    } catch (e) {
      res.status(500).json({ message: 'Erreur analyse', error: String(e?.message || e) })
    }
  },

  predict: async (req, res) => {
    try {
      const id_user = req.user?.id_user
      if (!id_user) return res.status(401).json({ message: 'Non autorisé' })
      const data = await predictNextMonth(id_user)
      res.json(data)
    } catch (e) {
      res.status(500).json({ message: 'Erreur prédiction', error: String(e?.message || e) })
    }
  },

  recommendations: async (req, res) => {
    try {
      const id_user = req.user?.id_user
      if (!id_user) return res.status(401).json({ message: 'Non autorisé' })
      const data = await recommend(id_user)
      res.json(data)
    } catch (e) {
      res.status(500).json({ message: 'Erreur recommandations', error: String(e?.message || e) })
    }
  },

  chat: async (req, res) => {
    try {
      const id_user = req.user?.id_user
      if (!id_user) return res.status(401).json({ message: 'Non autorisé' })
      const { message, context } = req.body || {}

      let enriched = ''
      try {
        const analysis = await analyzeExpenses(id_user)
        const avg = Number(analysis?.avgMonthly || 0).toFixed(2)
        const top = analysis?.topCategories?.[0]?.categorie
        const topVal = analysis?.topCategories?.[0]?.total
        const topStr = top ? `${top} (${Number(topVal || 0).toFixed(2)})` : 'n/a'
        enriched = `Utilisateur ${id_user}: dépense mensuelle moyenne ~${avg}. Catégorie principale: ${topStr}.`
      } catch (_e) {}

      // Grounding: fetch categories from DB to avoid hallucinations
      const categoriesDepenses = await new Promise((resolve) => {
        try {
          Categories.allDepenses((err, rows) => {
            if (err || !Array.isArray(rows)) return resolve([])
            resolve(rows.map(r => r.nom).filter(Boolean))
          })
        } catch (_e) { resolve([]) }
      })

      // Pas de réponses pré-définies: laisser l'IA répondre librement avec ancrage BD

      // Additional facts from DB for flexible Q&A
      const categoriesRevenus = await new Promise((resolve) => {
        try {
          Categories.allRevenue((err, rows) => {
            if (err || !Array.isArray(rows)) return resolve([])
            resolve(rows.map(r => r.nom).filter(Boolean))
          })
        } catch (_e) { resolve([]) }
      })

      const comptes = await new Promise((resolve) => {
        try {
          Compte.findByUserId(id_user, (err, rows) => {
            if (err || !Array.isArray(rows)) return resolve([])
            resolve(rows.map(r => ({ id: r.id_compte, nom: r.nom, solde: Number(r.solde || 0) })))
          })
        } catch (_e) { resolve([]) }
      })

      const transactionsRecents = await new Promise((resolve) => {
        try {
          Transactions.getAllTransaction(id_user, id_user, (err, rows) => {
            if (err || !Array.isArray(rows)) return resolve([])
            const list = rows.slice(0, 5).map(t => ({
              type: t.type,
              montant: Number(t.montant || 0),
              date: t.date_transaction,
              description: (t.description || '').slice(0, 80),
              categorie: t.categorie_nom || ''
            }))
            resolve(list)
          })
        } catch (_e) { resolve([]) }
      })

      const budgets = await new Promise((resolve) => {
        try {
          Budgets.getAll(id_user, (err, rows) => {
            if (err || !Array.isArray(rows)) return resolve([])
            const now = new Date()
            const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
            const filtered = rows.filter(b => String(b.mois || '').slice(0,7) === ym)
            resolve(filtered.map(b => ({
              mois: b.mois,
              categorie: b.categorie,
              max: Number(b.montant_max || 0),
              restant: Number(b.montant_restant || 0),
              depense: Number(b.montant_depense || 0),
              utilisation_pct: Number(b.pourcentage_utilise || 0)
            })).slice(0, 8))
          })
        } catch (_e) { resolve([]) }
      })

      const objectifs = await new Promise((resolve) => {
        try {
          Objectifs.getAll(id_user, (err, rows) => {
            if (err || !Array.isArray(rows)) return resolve([])
            resolve(rows.slice(0, 10).map(o => ({ id: o.id_objectif, nom: o.nom, montant_objectif: Number(o.montant_objectif || 0), montant_actuel: Number(o.montant_actuel || 0), statut: o.statut })))
          })
        } catch (_e) { resolve([]) }
      })

      const dettes = await new Promise((resolve) => {
        try {
          Dettes.getAllByUser(id_user, (err, rows) => {
            if (err || !Array.isArray(rows)) return resolve([])
            resolve(rows.slice(0, 10).map(d => ({ id: d.id_dette, nom: d.nom, restant: Number(d.montant_restant || 0), mensualite: Number(d.paiement_mensuel || 0), statut: d.statut || 'en cours' })))
          })
        } catch (_e) { resolve([]) }
      })

      const remboursementsRecents = await new Promise((resolve) => {
        try {
          Remboursements.getByDette(id_user, null, (err, rows) => {
            if (err || !Array.isArray(rows)) return resolve([])
            resolve(rows.slice(0, 5).map(r => ({ id_dette: r.id_dette, montant: Number(r.montant || 0), date: r.date_paiement })))
          })
        } catch (_e) { resolve([]) }
      })

      const abonnements = await new Promise((resolve) => {
        try {
          Abonnements.getAll(id_user, true, (err, rows) => {
            if (err || !Array.isArray(rows)) return resolve([])
            const now = new Date()
            const in30d = new Date(now.getTime() + 30*24*60*60*1000)
            resolve(rows.filter(a => {
              const d = a.prochaine_echeance ? new Date(a.prochaine_echeance) : null
              return d && d >= now && d <= in30d
            }).map(a => ({ nom: a.nom, montant: Number(a.montant || 0), prochaine_echeance: a.prochaine_echeance })).slice(0, 10))
          })
        } catch (_e) { resolve([]) }
      })

      const alertThresholds = await new Promise((resolve) => {
        try {
          AlertThresholds.getAllByUser(id_user, (err, rows) => {
            if (err || !Array.isArray(rows)) return resolve([])
            resolve(rows.slice(0, 20).map(th => ({ domain: th.domain, value: Number(th.value || 0) })))
          })
        } catch (_e) { resolve([]) }
      })

      const facts = {
        regles: [
          "Ne pas inventer de données. Si une information n'existe pas ci-dessous, réponds 'non disponible'.",
          "Toujours répondre en français, brièvement et utilement.",
          "Utiliser uniquement les éléments de 'donnees' pour les informations personnelles."
        ],
        donnees: {
          categories_depenses: categoriesDepenses,
          categories_revenus: categoriesRevenus,
          comptes: comptes,
          transactions_recents: transactionsRecents,
          budgets: budgets,
          objectifs: objectifs,
          dettes: dettes,
          remboursements_recents: remboursementsRecents,
          abonnements: abonnements,
          alert_thresholds: alertThresholds
        }
      }

      const mergedContext = [
        enriched,
        context,
        `FAITS_JSON=${JSON.stringify(facts)}`
      ].filter(Boolean).join('\n')
      const resp = await chatWithGemini(message, mergedContext)
      const reply = (resp && resp.text) ? resp.text : `Désolé, je n'ai pas pu générer de réponse pour cette question. ${resp?.meta?.blockReason ? `(Raison: ${resp.meta.blockReason})` : ''}`.trim()
      res.json({ reply })
    } catch (e) {
      const msg = String(e?.message || e)
      const missingKey = msg.includes('GEMINI_API_KEY')
      const status = missingKey ? 400 : 500
      res.status(status).json({ message: 'Erreur chat IA', error: msg })
    }
  }
}

module.exports = AiController


