const db = require('../config/db');

const Depenses = {
  getAll: (id_user, callback) => {
    db.query(
      `SELECT d.*, c.nom AS categorie_nom, co.nom AS compte_nom
       FROM Depenses d
       LEFT JOIN categories_depenses c ON d.id_categorie_depense = c.id
       LEFT JOIN Comptes co ON d.id_compte = co.id_compte
       WHERE d.id_user = ?
       ORDER BY d.date_depense DESC`,
      [id_user],
      callback
    );
  },

add: (data, callback) => {
  const { id_user, montant, date_depense, description, id_categorie_depense, id_compte } = data;

  // 1️⃣ Extraire année et mois de la dépense pour comparer avec VARCHAR 'YYYY-MM'
  const date = new Date(date_depense);
  const monthStr = date.toISOString().slice(0, 7); // 'YYYY-MM'

  // 2️⃣ Insérer la dépense
  const insertSql = `
    INSERT INTO Depenses (id_user, montant, date_depense, description, id_categorie_depense, id_compte)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(insertSql, [id_user, montant, date_depense, description, id_categorie_depense, id_compte], (err, result) => {
    if (err) return callback({ success: false, message: "Erreur lors de l'insertion de la dépense", error: err });

    const id_depense = result.insertId;

    // 3️⃣ Mettre à jour le solde du compte
    const updateCompteSql = `
      UPDATE Comptes
      SET solde = solde - ?
      WHERE id_compte = ?
    `;
    db.query(updateCompteSql, [montant, id_compte], (err2) => {
      if (err2) return callback({ success: false, message: "Erreur lors de la mise à jour du compte", error: err2 });

      // 4️⃣ Mettre à jour le budget pour la même catégorie et le même mois (VARCHAR)
      const updateBudgetSql = `
        UPDATE Budgets
        SET montant_restant = montant_restant - ?
        WHERE id_user = ? 
          AND id_categorie_depense = ? 
          AND LEFT(mois, 7) = ?
      `;
      db.query(updateBudgetSql, [montant, id_user, id_categorie_depense, monthStr], (err3, resultBudget) => {
        if (err3) return callback({ success: false, message: "Erreur lors de la mise à jour du budget", error: err3 });

        const message = resultBudget.affectedRows === 0
          ? "Dépense ajoutée, mais aucun budget existant pour ce mois et cette catégorie."
          : "Dépense ajoutée et budget mis à jour.";

        return callback(null, {
          success: true,
          message,
          depense: { id_depense, ...data }
        });
      });
    });
  });
}



,


  update: (id_depense, data, callback) => {
    const { montant, date_depense, description, id_categorie_depense, id_compte } = data;
    db.query(
      'UPDATE Depenses SET montant=?, date_depense=?, description=?, id_categorie_depense=?, id_compte=? WHERE id_depense=?',
      [montant, date_depense, description, id_categorie_depense, id_compte, id_depense],
      callback
    );
  },

  delete: (id_depense, callback) => {
    db.query('DELETE FROM Depenses WHERE id_depense=?', [id_depense], callback);
  }
};

module.exports = Depenses;
