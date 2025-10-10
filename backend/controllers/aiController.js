const { analyzeExpenses, predictNextMonth, recommend } = require('../services/aiService')

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
  }
}

module.exports = AiController


