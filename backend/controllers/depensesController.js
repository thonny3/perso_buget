const Depenses = require('../models/depensesModel');

const DepensesController = {
  getAll: (req, res) => {
    const id_user = req.user?.id_user;
    if (!id_user) return res.status(401).json({ message: "Non autorisé" });
    Depenses.getAll(id_user, (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    });
  },

  add: (req, res) => {
    const id_user = req.user?.id_user;
    if (!id_user) return res.status(401).json({ message: "Non autorisé" });

    const data = { ...req.body, id_user };
    Depenses.add(data, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Dépense ajoutée', ...(result || {}) });
    });
  },

  update: (req, res) => {
    const { id_depense } = req.params;
    Depenses.update(id_depense, req.body, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Dépense mise à jour' });
    });
  },

  delete: (req, res) => {
    const { id_depense } = req.params;
    Depenses.delete(id_depense, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Dépense supprimée' });
    });
  }
};

module.exports = DepensesController;
