const db = require('../config/db');

const Transactions = {
    // Récupérer toutes les transactions d'un utilisateur
 getAllTransaction: (id_user, callback) => {
  const sql = `
    SELECT 
      t.*,
      CASE 
        WHEN t.type = 'revenu' THEN c.nom
        WHEN t.type = 'depense' THEN cd.nom
      END AS categorie_nom,
      cp.nom AS compte_nom,
      o.nom AS objectif_nom,
      (SELECT MAX(date_transaction) 
       FROM (
         SELECT date_revenu AS date_transaction FROM Revenus WHERE id_user = ?
         UNION ALL
         SELECT date_depense AS date_transaction FROM Depenses WHERE id_user = ?
         UNION ALL
         SELECT date_contribution AS date_transaction FROM Contributions WHERE id_user = ?
       ) AS all_dates
      ) AS derniere_date
    FROM (
      SELECT 
        id_revenu AS id_transaction, 
        id_user, 
        montant, 
        date_revenu AS date_transaction,
        source AS description, 
        id_categorie_revenu AS id_categorie, 
        id_compte,
        NULL AS id_objectif,
        'revenu' AS type
      FROM Revenus
      WHERE id_user = ?

      UNION ALL

      SELECT 
        id_depense AS id_transaction, 
        id_user, 
        montant, 
        date_depense AS date_transaction,
        description, 
        id_categorie_depense AS id_categorie, 
        id_compte,
        NULL AS id_objectif,
        CASE WHEN cd.nom = 'Abonnements' THEN 'abonnement' ELSE 'depense' END AS type
      FROM Depenses d
      LEFT JOIN categories_depenses cd ON d.id_categorie_depense = cd.id
      WHERE id_user = ?

      UNION ALL

      SELECT
        id_contribution AS id_transaction,
        id_user,
        montant,
        date_contribution AS date_transaction,
        'Contribution' AS description,
        NULL AS id_categorie,
        id_compte,
        id_objectif,
        'contribution' AS type
      FROM Contributions
      WHERE id_user = ?
    ) AS t
    LEFT JOIN categories_revenus c 
      ON t.type = 'revenu' AND t.id_categorie = c.id
    LEFT JOIN categories_depenses cd 
      ON (t.type = 'depense' OR t.type = 'abonnement') AND t.id_categorie = cd.id
    LEFT JOIN Comptes cp 
      ON t.id_compte = cp.id_compte
    LEFT JOIN Objectifs o
      ON t.type = 'contribution' AND t.id_objectif = o.id_objectif
    ORDER BY t.date_transaction DESC
  `;

  db.query(sql, [id_user, id_user, id_user, id_user, id_user, id_user], callback);
}


};

module.exports = Transactions;
