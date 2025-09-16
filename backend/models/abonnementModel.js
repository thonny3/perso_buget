const db = require('../config/db');

const Abonnements = {

    getAll: (id_user, callback) => {
        db.query('SELECT * FROM Abonnements WHERE id_user=? ORDER BY id_abonnement DESC', [id_user], callback);
    },
    
    add: (data, callback) => {
        const { id_user, nom, montant, fréquence, prochaine_echeance, rappel } = data;
        db.query(
            'INSERT INTO Abonnements (id_user, nom, montant, fréquence, prochaine_echeance, rappel) VALUES (?, ?, ?, ?, ?, ?)',
            [id_user, nom, montant, fréquence, prochaine_echeance, rappel],
            callback
        );
    },

    update: (id_abonnement, data, callback) => {
        const { nom, montant, fréquence, prochaine_echeance, rappel } = data;
        db.query(
            'UPDATE Abonnements SET nom=?, montant=?, fréquence=?, prochaine_echeance=?, rappel=? WHERE id_abonnement=?',
            [nom, montant, fréquence, prochaine_echeance, rappel, id_abonnement],
            callback
        );
    },

    delete: (id_abonnement, callback) => {
        db.query('DELETE FROM Abonnements WHERE id_abonnement=?', [id_abonnement], callback);
    }
};

module.exports = Abonnements;
