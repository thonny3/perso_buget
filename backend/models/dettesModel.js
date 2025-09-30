const db = require('../config/db');

const Dettes = {
  getAllByUser: (id_user, callback) => {
    const sql = 'SELECT * FROM Dettes WHERE id_user = ? ORDER BY date_debut DESC';
    db.query(sql, [id_user], callback);
  },

  create: (data, callback) => {
    const sql = `INSERT INTO Dettes (id_user, nom, montant_initial, montant_restant, taux_interet, date_debut, date_fin_prevue, paiement_mensuel, creancier, statut, type)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      data.id_user,
      data.nom,
      data.montant_initial,
      data.montant_restant ?? data.montant_initial,
      data.taux_interet ?? 0,
      data.date_debut,
      data.date_fin_prevue,
      data.paiement_mensuel ?? 0,
      data.creancier || '',
      data.statut || 'en cours',
      data.type || 'personne'
    ];
    db.query(sql, params, callback);
  },

  update: (id_dette, data, callback) => {
    const sql = `UPDATE Dettes SET nom=?, montant_initial=?, montant_restant=?, taux_interet=?, date_debut=?, date_fin_prevue=?, paiement_mensuel=?, creancier=?, statut=?, type=?
                 WHERE id_dette=? AND id_user=?`;
    const params = [
      data.nom,
      data.montant_initial,
      data.montant_restant ?? data.montant_initial,
      data.taux_interet ?? 0,
      data.date_debut,
      data.date_fin_prevue,
      data.paiement_mensuel ?? 0,
      data.creancier || '',
      data.statut || 'en cours',
      data.type || 'personne',
      id_dette,
      data.id_user
    ];
    db.query(sql, params, callback);
  },

  delete: (id_dette, id_user, callback) => {
    const sql = `DELETE FROM Dettes WHERE id_dette=? AND id_user=?`;
    db.query(sql, [id_dette, id_user], callback);
  }
};

module.exports = Dettes;


