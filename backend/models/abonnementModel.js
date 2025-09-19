const db = require('../config/db');

const Abonnements = {

    getAll: (id_user, includeInactive, callback) => {
        const sqlActive = 'SELECT * FROM Abonnements WHERE id_user=? AND (actif IS NULL OR actif=1) ORDER BY id_abonnement DESC';
        const sqlAll = 'SELECT * FROM Abonnements WHERE id_user=? ORDER BY id_abonnement DESC';
        // If explicitly asked to include inactive, try without filter first
        if (includeInactive) {
            return db.query(sqlAll, [id_user], (err, rows) => {
                if (err && err.code === 'ER_BAD_FIELD_ERROR') {
                    // No 'actif' column - return rows anyway
                    return db.query('SELECT * FROM Abonnements WHERE id_user=? ORDER BY id_abonnement DESC', [id_user], callback);
                }
                return callback(err, rows);
            });
        }
        db.query(sqlActive, [id_user], (err, rows) => {
            if (err && err.code === 'ER_BAD_FIELD_ERROR') {
                // Colonne 'actif' absente: fallback sans filtre
                return db.query(sqlAll, [id_user], callback);
            }
            return callback(err, rows);
        });
    },
    
    add: (data, callback) => {
        const { id_user, nom, montant, prochaine_echeance, rappel } = data;
        const frequence = data['fréquence'] || data.frequence;
        // Empêcher les doublons par (id_user, nom)
        db.query('SELECT 1 FROM Abonnements WHERE id_user=? AND nom=? LIMIT 1', [id_user, nom], (e0, rows) => {
            if (e0) return callback(e0);
            if (rows && rows.length > 0) return callback(Object.assign(new Error('Abonnement déjà existant'), { code: 'DUPLICATE_ABO' }));
            db.query(
                'INSERT INTO Abonnements (id_user, nom, montant, fréquence, prochaine_echeance, rappel) VALUES (?, ?, ?, ?, ?, ?)',
                [id_user, nom, montant, frequence, prochaine_echeance, rappel],
                callback
            );
        });
    },

    setActive: (id_abonnement, actif, callback) => {
        // Toggle actif; if column missing, return error code so controller can fallback
        db.query('UPDATE Abonnements SET actif=? WHERE id_abonnement=?', [actif ? 1 : 0, id_abonnement], (err, result) => {
            if (err && err.code === 'ER_BAD_FIELD_ERROR') {
                return callback(Object.assign(new Error("Colonne 'actif' manquante"), { code: 'NO_ACTIF_COLUMN' }));
            }
            callback(err, result);
        });
    },

    update: (id_abonnement, data, callback) => {
        const { nom, montant, prochaine_echeance, rappel } = data;
        const frequence = data['fréquence'] || data.frequence;
        db.query(
            'UPDATE Abonnements SET nom=?, montant=?, fréquence=?, prochaine_echeance=?, rappel=? WHERE id_abonnement=?',
            [nom, montant, frequence, prochaine_echeance, rappel, id_abonnement],
            callback
        );
    },

    delete: (id_abonnement, callback) => {
        db.query('UPDATE Abonnements SET actif=0 WHERE id_abonnement=?', [id_abonnement], (err, result) => {
            if (err) {
                if (err.code === 'ER_BAD_FIELD_ERROR') {
                    return db.query('DELETE FROM Abonnements WHERE id_abonnement=?', [id_abonnement], callback);
                }
                return callback(err);
            }
            callback(null, result);
        });
    },

    renew: (id_user, { id_abonnement, id_compte }, callback) => {
        // Débiter le compte choisi, avancer l'échéance selon la fréquence, et enregistrer en historique Transactions optionnellement
        db.beginTransaction((err) => {
            if (err) return callback(err);

            db.query('SELECT * FROM Abonnements WHERE id_abonnement=? AND id_user=? FOR UPDATE', [id_abonnement, id_user], (e1, rowsA) => {
                if (e1 || rowsA.length === 0) return db.rollback(() => callback(e1 || new Error('Abonnement introuvable')));
                const abo = rowsA[0];

                db.query('SELECT solde FROM Comptes WHERE id_compte=? AND id_user=? FOR UPDATE', [id_compte, id_user], (e2, rowsC) => {
                    if (e2 || rowsC.length === 0) return db.rollback(() => callback(e2 || new Error('Compte introuvable')));
                    const solde = Number(rowsC[0].solde);
                    const montant = Number(abo.montant);
                    if (solde < montant) return db.rollback(() => callback(new Error('Solde insuffisant')));

                    db.query('UPDATE Comptes SET solde = solde - ? WHERE id_compte = ?', [montant, id_compte], (e3) => {
                        if (e3) return db.rollback(() => callback(e3));

                        // Calcul prochaine échéance
                        let next = new Date(abo.prochaine_echeance);
                        const freq = (abo.fréquence || abo.frequence || '').toLowerCase();
                        if (freq.includes('mensuel')) next.setMonth(next.getMonth() + 1);
                        else if (freq.includes('trimestr')) next.setMonth(next.getMonth() + 3);
                        else if (freq.includes('semestr')) next.setMonth(next.getMonth() + 6);
                        else if (freq.includes('annuel')) next.setFullYear(next.getFullYear() + 1);
                        else next.setMonth(next.getMonth() + 1);

                        const y = next.getFullYear();
                        const m = String(next.getMonth() + 1).padStart(2, '0');
                        const d = String(next.getDate()).padStart(2, '0');
                        const nextStr = `${y}-${m}-${d}`;

                        db.query('UPDATE Abonnements SET prochaine_echeance=? WHERE id_abonnement=?', [nextStr, id_abonnement], (e4) => {
                            if (e4) return db.rollback(() => callback(e4));

                            // Enregistrer une dépense pour l'abonnement afin d'apparaître dans Transactions
                            const desc = `${abo.nom || 'Abonnement'}`;
                            const insertDepenseSql = `
                              INSERT INTO Depenses (id_user, montant, date_depense, description, id_categorie_depense, id_compte)
                              VALUES (?, ?, NOW(), ?, (SELECT id FROM categories_depenses WHERE nom='Abonnements' LIMIT 1), ?)
                            `;
                            db.query(insertDepenseSql, [id_user, montant, desc, id_compte], (eDep) => {
                                if (eDep) return db.rollback(() => callback(eDep));

                                db.commit((e5) => {
                                    if (e5) return db.rollback(() => callback(e5));
                                    callback(null, { success: true, prochaine_echeance: nextStr });
                                });
                            });
                        });
                    });
                });
            });
        });
    }
};

module.exports = Abonnements;
