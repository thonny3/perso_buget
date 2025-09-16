const Budgets = require('../models/budgetModel');

const BudgetController = {
  getAll: (req, res) => {
    const id_user = req.user?.id_user;
    if (!id_user) return res.status(401).json({ message: "Non autorisé" });

    Budgets.getAll(id_user, (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    });
  },

  add: (req, res) => {
     const id_user = req.user?.id_user;
    if (!id_user) return res.status(401).json({ message: "Non autorisé" });

    const data = { ...req.body, id_user };

    Budgets.add(data, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Budget ajouté', id: result.insertId });
    });
  },

  update: (req, res) => {
    const { id_budget } = req.params;
    Budgets.update(id_budget, req.body, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Budget mis à jour' });
    });
  },

  delete: (req, res) => {
    const { id_budget } = req.params;
    Budgets.delete(id_budget, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Budget supprimé' });
    });
  }
};

module.exports = BudgetController;
