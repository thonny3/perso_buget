const db = require('../config/db');

const Objectifs = {
  getAll: (id_user, callback) => {
    db.query('SELECT * FROM Objectifs WHERE id_user=? ORDER BY id_objectif DESC', [id_user], callback);
  },

  add: (data, callback) => {
    const { id_user, nom, montant_objectif, date_limite, montant_actuel,statut,	pourcentage } = data;
    db.query(
      'INSERT INTO Objectifs (id_user, nom, montant_objectif, date_limite, montant_actuel,statut,pourcentage) VALUES (?, ?, ?, ?, ?,?,?)',
      [id_user, nom, montant_objectif, date_limite, montant_actuel,statut,pourcentage],
      callback
    );
  },

  update: (id_objectif, data, callback) => {
    const { nom, montant_objectif, date_limite, montant_actuel } = data;
    db.query(
      'UPDATE Objectifs SET nom=?, montant_objectif=?, date_limite=?, montant_actuel=? WHERE id_objectif=?',
      [nom, montant_objectif, date_limite, montant_actuel, id_objectif],
      callback
    );
  },

  delete: (id_objectif, callback) => {
    db.query('DELETE FROM Objectifs WHERE id_objectif=?', [id_objectif], callback);
  }
};

module.exports = Objectifs;
