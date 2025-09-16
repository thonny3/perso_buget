const db = require('../config/db');

const ComptesPartages = {
    // Ajouter un partage de compte
    create: (data, callback) => {
        const sql = 'INSERT INTO Comptes_partages (id_compte, id_user, role) VALUES (?, ?, ?)';
        db.query(sql, [data.id_compte, data.id_user, data.role], callback);
    },

    // Trouver les utilisateurs qui partagent un compte
    findByCompteId: (id_compte, callback) => {
        const sql = `
            SELECT cp.id, cp.role, u.id_user, u.nom, u.prenom, u.email
            FROM Comptes_partages cp
            JOIN Users u ON cp.id_user = u.id_user
            WHERE cp.id_compte = ?`;
        db.query(sql, [id_compte], callback);
    },

    // Trouver les comptes partagés d’un utilisateur
    findByUserId: (id_user, callback) => {
        const sql = `
            SELECT cp.id, cp.role, c.id_compte, c.nom, c.type, c.solde
            FROM Comptes_partages cp
            JOIN Comptes c ON cp.id_compte = c.id_compte
            WHERE cp.id_user = ?`;
        db.query(sql, [id_user], callback);
    },

    // Supprimer un partage
    delete: (id, callback) => {
        db.query('DELETE FROM Comptes_partages WHERE id = ?', [id], callback);
    },
    // Modifier le rôle d'un utilisateur sur un compte partagé
    updateRole: (id, role, callback) => {
        const sql = 'UPDATE Comptes_partages SET role = ? WHERE id = ?';
        db.query(sql, [role, id], callback);
    },

};

module.exports = ComptesPartages;
