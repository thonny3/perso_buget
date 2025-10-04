const db = require('../config/db');

const User = {
    create: (data, callback) => {
        const sql = 'INSERT INTO Users (nom, prenom, email, mot_de_passe, devise, date_creation) VALUES (?, ?, ?, ?, ?, NOW())';
        db.query(sql, [data.nom, data.prenom, data.email, data.mot_de_passe, data.devise], callback);
    },

    findByEmail: (email, callback) => {
        db.query('SELECT * FROM Users WHERE email = ?', [email], callback);
    },

    findById: (id_user, callback) => {
        db.query('SELECT * FROM Users WHERE id_user = ?', [id_user], callback);
    },

    getAll: (callback) => {
        db.query('SELECT * FROM Users', callback);
    },

    update: (id_user, data, callback) => {
        const sql = 'UPDATE Users SET nom=?, prenom=?, email=?, devise=?, image=? WHERE id_user=?';
        db.query(sql, [data.nom, data.prenom, data.email, data.devise, data.image, id_user], callback);
    },

    delete: (id_user, callback) => {
        db.query('DELETE FROM Users WHERE id_user = ?', [id_user], callback);
    }
};

module.exports = User;
