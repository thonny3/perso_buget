const { analyzeExpenses, predictNextMonth, recommend, enrichBudgetData } = require('../services/aiService')
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
const User = require('../models/userModel')
const db = require('../config/db')

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

      // Récupérer la devise de l'utilisateur
      const userDevise = await new Promise((resolve) => {
        try {
          User.findById(id_user, (err, rows) => {
            if (err || !Array.isArray(rows) || rows.length === 0) return resolve('EUR') // Devise par défaut
            resolve(rows[0].devise || 'EUR')
          })
        } catch (_e) { resolve('EUR') }
      })

      // Récupérer tous les budgets en premier pour l'analyse
      const allBudgets = await new Promise((resolve) => {
        try {
          Budgets.getAll(id_user, (err, rows) => {
            if (err || !Array.isArray(rows)) return resolve([])
            resolve(rows)
          })
        } catch (_e) { resolve([]) }
      })

      // Enrichir les données budgétaires avec analyses
      const budgetAnalysis = enrichBudgetData(allBudgets)

      // Contexte minimal - seulement la devise, pas de résumé automatique
      // Les données détaillées sont disponibles dans 'donnees' mais ne doivent pas être partagées sauf si demandé
      let enriched = `Devise utilisateur: ${userDevise}`

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

      // Budgets du mois actuel pour contexte immédiat (allBudgets et budgetAnalysis déjà récupérés plus haut)
      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
      const budgetsCurrentMonth = allBudgets
        .filter(b => String(b.mois || '').slice(0,7) === currentMonth)
        .map(b => ({
          mois: b.mois,
          categorie: b.categorie,
          max: Number(b.montant_max || 0),
          restant: Number(b.montant_restant || 0),
          depense: Number(b.montant_depense || 0),
          utilisation_pct: Number(b.pourcentage_utilise || 0),
          statut: Number(b.pourcentage_utilise || 0) >= 100 ? 'depasse' : 
                  Number(b.pourcentage_utilise || 0) >= 80 ? 'alerte' : 'normal'
        }))

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
          "Toujours répondre en français, clairement et de manière utile.",
          "Utiliser uniquement les éléments de 'donnees' pour les informations personnelles.",
          "COMPORTEMENT CONVERSATIONNEL CRITIQUE:",
          "  - NE JAMAIS donner de résumé automatique ou d'aperçu complet au début d'une conversation",
          "  - Répondre UNIQUEMENT à la question ou demande spécifique de l'utilisateur",
          "  - Pour une simple salutation ('bonjour', 'salut'), répondre simplement et demander comment aider",
          "  - Ne partager les données détaillées (budgets, dépenses, alertes) QUE si l'utilisateur les demande explicitement",
          "  - Être concis et direct, ne pas surcharger l'utilisateur d'informations non demandées",
          "IMPORTANT: TOUJOURS inclure la devise ('devise_utilisateur') avec CHAQUE montant mentionné dans ta réponse.",
          "Format des montants: toujours afficher comme 'XXX.XX [DEVISE]' (exemple: '150.50 EUR', '250.75 USD').",
          "Pour les questions sur les budgets, utiliser les données enrichies dans 'budgets_analysis' qui contient des analyses détaillées.",
          "Mentionner les budgets dépassés ou en alerte UNIQUEMENT si l'utilisateur demande explicitement cette information.",
          "Utiliser les tendances pour expliquer l'évolution des dépenses par catégorie SEULEMENT si demandé.",
          "Formater les réponses de manière claire: utiliser des listes à puces, des paragraphes séparés, et mettre en évidence les montants importants."
        ],
        donnees: {
          devise_utilisateur: userDevise,
          categories_depenses: categoriesDepenses,
          categories_revenus: categoriesRevenus,
          comptes: comptes,
          transactions_recents: transactionsRecents,
          budgets_mois_actuel: budgetsCurrentMonth,
          budgets_analysis: {
            resume: budgetAnalysis.summary,
            budgets: budgetAnalysis.budgets,
            alertes: budgetAnalysis.alerts,
            tendances: budgetAnalysis.trends,
            top_utilises: budgetAnalysis.top_utilises
          },
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


