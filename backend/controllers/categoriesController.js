const categorie = require('../models/categoriesModel');

const Categories = {
  /*******************************CATEGORIES DEPENSES************************************* */
  allDepenses: (req, res) => {
    categorie.allDepenses((err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    });
  },

  add: (req, res) => {
    const { nom } = req.body;
    categorie.addDepenses(nom, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Catégorie ajoutée', id: result.insertId });
    });
  },

  delete: (req, res) => {
    const { id } = req.params;
    categorie.deleteDepenses(id, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Catégorie supprimée' });
    });
  },

  /*******************************CATEGORIES REVENUES************************************* */
  allRevenues: (req, res) => {
    categorie.allRevenue((err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    });
  },

  addRevenues: (req, res) => {
    const { nom } = req.body;
    categorie.addrevenue(nom, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Catégorie ajoutée', id: result.insertId });
    });
  },

  deleteRevenues: (req, res) => {
    const { id } = req.params;
    categorie.deleteRevenue(id, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Catégorie supprimée' });
    });
  },

};

module.exports = Categories;