const Abonnements = require('../models/abonnementModel');

const AbonnementController = {
  getAll: (req, res) => {
    const includeInactive = req.query.includeInactive === 'true'
    Abonnements.getAll(req.params.id_user, includeInactive, (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    });
  },

  add: (req, res) => {
    Abonnements.add(req.body, (err, result) => {
      if (err) {
        if (err.code === 'DUPLICATE_ABO') return res.status(409).json({ error: 'Abonnement déjà existant' });
        return res.status(500).json({ error: err.message || err });
      }
      res.json({ message: 'Abonnement ajouté', id: result.insertId });
    });
  },

  update: (req, res) => {
    Abonnements.update(req.params.id_abonnement, req.body, (err) => {
      if (err) return res.status(500).json({ error: err.message || err });
      res.json({ message: 'Abonnement mis à jour' });
    });
  },

  delete: (req, res) => {
    Abonnements.delete(req.params.id_abonnement, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Abonnement supprimé' });
    });
  },

  renew: (req, res) => {
    const id_user = req.user?.id_user;
    if (!id_user) return res.status(401).json({ message: 'Non autorisé' });
    const { id_abonnement, id_compte } = req.body;
    if (!id_abonnement || !id_compte) return res.status(400).json({ message: 'Champs requis manquants' });
    Abonnements.renew(id_user, { id_abonnement, id_compte }, (err, result) => {
      if (err) return res.status(500).json({ error: err.message || err });
      res.json(result);
    });
  }
  ,
  setActive: (req, res) => {
    const { id_abonnement } = req.params;
    const { actif } = req.body;
    Abonnements.setActive(id_abonnement, !!actif, (err) => {
      if (err) {
        if (err.code === 'NO_ACTIF_COLUMN') return res.status(400).json({ error: "Colonne 'actif' manquante. Exécutez la migration." });
        return res.status(500).json({ error: err.message || err });
      }
      res.json({ success: true });
    });
  }
};

module.exports = AbonnementController;
