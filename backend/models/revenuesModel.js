// models/Revenues.js
const db = require('../config/db');

const Revenues = {

  // --- REVENUS ---
  // Récupérer tous les revenus d'un utilisateur
  getAll: (id_user, callback) => {
    db.query(
      `SELECT r.*, 
            c.nom AS categorie_nom,  -- nom de la catégorie de revenu
            cp.nom AS compte_nom     -- nom du compte
     FROM Revenus r
     LEFT JOIN categories_revenus c ON r.id_categorie_revenu = c.id
     LEFT JOIN Comptes cp ON r.id_compte = cp.id_compte
     WHERE r.id_user = ?
     ORDER BY r.date_revenu DESC`,
      [id_user],
      callback
    );
  },

  // Ajouter un revenu
  add: (data, callback) => {
    const { montant, date_revenu, source, id_categorie_revenu, id_user, id_compte } = data;

    // 1️⃣ Insérer le revenu
    const sqlInsert = `
    INSERT INTO Revenus (id_user, montant, date_revenu, source, id_categorie_revenu, id_compte)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
    db.query(sqlInsert, [id_user, montant, date_revenu, source, id_categorie_revenu, id_compte], (err, result) => {
      if (err) return callback(err);

      // 2️⃣ Mettre à jour le solde du compte associé
      const sqlUpdateCompte = `
      UPDATE Comptes 
      SET solde = solde + ?
      WHERE id_compte = ?
    `;
      db.query(sqlUpdateCompte, [montant, id_compte], (err2) => {
        if (err2) return callback(err2);

        // Retourner le résultat de l'insertion du revenu
        callback(null, result);
      });
    });
  }
  ,

  // Mettre à jour un revenu
  update: (id_revenu, data, callback) => {
    const { montant, date_revenu, source, id_categorie_revenu, id_compte } = data;
    const sql = `UPDATE revenus 
                 SET montant=?, date_revenu=?, source=?, id_categorie_revenu=?, id_compte=? 
                 WHERE id_revenu=?`;
    db.query(sql, [montant, date_revenu, source, id_categorie_revenu, id_compte, id_revenu], callback);
  },

  // Supprimer un revenu
  delete: (id_revenu, callback) => {
    db.query('DELETE FROM revenus WHERE id_revenu = ?', [id_revenu], callback);
  },

  // Récupérer un revenu par id
  getById: (id_revenu, callback) => {
    db.query('SELECT * FROM revenus WHERE id_revenu = ?', [id_revenu], callback);
  }
};

module.exports = Revenues;
