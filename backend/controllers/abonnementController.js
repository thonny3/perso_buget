const Abonnements = require('../models/abonnementModel');

const AbonnementController = {
  getAll: (req, res) => {
    Abonnements.getAll(req.params.id_user, (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    });
  },

  add: (req, res) => {
    Abonnements.add(req.body, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Abonnement ajouté', id: result.insertId });
    });
  },

  update: (req, res) => {
    Abonnements.update(req.params.id_abonnement, req.body, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Abonnement mis à jour' });
    });
  },

  delete: (req, res) => {
    Abonnements.delete(req.params.id_abonnement, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Abonnement supprimé' });
    });
  }
};

module.exports = AbonnementController;
