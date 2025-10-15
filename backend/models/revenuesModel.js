// models/Revenues.js
const db = require('../config/db');

const Revenues = {

  // --- REVENUS ---
  // Récupérer tous les revenus d'un utilisateur
  getAll: (id_user, callback) => {
    db.query(
      `SELECT r.*,
              c.nom AS categorie_nom,
              cp.nom AS compte_nom,
              u.prenom AS user_prenom,
              u.nom AS user_nom,
              u.email AS user_email,
              u.image AS user_image
       FROM Revenus r
       LEFT JOIN categories_revenus c ON r.id_categorie_revenu = c.id
       LEFT JOIN Comptes cp ON r.id_compte = cp.id_compte
       LEFT JOIN Users u ON r.id_user = u.id_user
       WHERE r.id_user = ?
          OR r.id_compte IN (
            SELECT ct.id_compte FROM Comptes_partages ct WHERE ct.id_user = ?
          )
       ORDER BY r.date_revenu DESC`,
      [id_user, id_user],
      callback
    );
  },

  getByAccountForUser: (id_user, id_compte, callback) => {
    db.query(
      `SELECT r.*,
              c.nom AS categorie_nom,
              cp.nom AS compte_nom,
              u.prenom AS user_prenom,
              u.nom AS user_nom,
              u.email AS user_email,
              u.image AS user_image
       FROM Revenus r
       LEFT JOIN categories_revenus c ON r.id_categorie_revenu = c.id
       LEFT JOIN Comptes cp ON r.id_compte = cp.id_compte
       LEFT JOIN Users u ON r.id_user = u.id_user
       WHERE r.id_compte = ?
         AND (
           cp.id_user = ? OR EXISTS (
             SELECT 1 FROM Comptes_partages ct WHERE ct.id_compte = r.id_compte AND ct.id_user = ?
           )
         )
       ORDER BY r.date_revenu DESC`,
      [id_compte, id_user, id_user],
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
    // Récupérer le revenu pour connaître le montant et le compte associé
    const sqlSelect = 'SELECT montant, id_compte FROM revenus WHERE id_revenu = ?';
    db.query(sqlSelect, [id_revenu], (err, rows) => {
      if (err) return callback(err);
      if (!rows || rows.length === 0) return callback(new Error('Revenu introuvable'));

      const { montant, id_compte } = rows[0];

      // Supprimer le revenu
      db.query('DELETE FROM revenus WHERE id_revenu = ?', [id_revenu], (errDel) => {
        if (errDel) return callback(errDel);

        // Décrémenter le solde du compte associé
        const sqlUpdateCompte = `UPDATE Comptes SET solde = solde - ? WHERE id_compte = ?`;
        db.query(sqlUpdateCompte, [montant, id_compte], (errUpd) => {
          if (errUpd) return callback(errUpd);
          callback(null, { message: 'Revenu supprimé et solde mis à jour' });
        });
      });
    });
  },

  // Récupérer un revenu par id
  getById: (id_revenu, callback) => {
    db.query('SELECT * FROM revenus WHERE id_revenu = ?', [id_revenu], callback);
  }
};

module.exports = Revenues;
