const Compte = require('../models/compteModel');
const ComptePartage  = require('../models/comptesPartagesModel');
const db = require('../config/db');

// --- Controller Comptes ---
const compteController = {
    // Créer un compte
    create: (req, res) => {
        const { nom, solde, type } = req.body;
        const id_user = req.user.id_user; // récupéré depuis le middleware
        if (!nom || !type) {
            return res.status(400).json({ message: "Champs requis: id_user, nom, type" });
        }

        Compte.create({ id_user, nom, solde: solde || 0.00, type }, (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).json({ message: "Compte créé avec succès", id: result.insertId });
            ComptePartage.create({id_compte:result.insertId,id_user,role:"proprietaire"});
        });
    },

    // Récupérer tous les comptes
    getAll: (req, res) => {
        Compte.getAll((err, rows) => {
            if (err) return res.status(500).json({ error: err });
            res.json(rows);
        });
    },

    // Récupérer un compte par ID
    getById: (req, res) => {
        Compte.findById(req.params.id_compte, (err, row) => {
            if (err) return res.status(500).json({ error: err });
            if (!row || row.length === 0) return res.status(404).json({ message: "Compte non trouvé" });
            res.json(row[0]);
        });
    },

    // Récupérer tous les comptes d’un utilisateur
    getByUser: (req, res) => {
        Compte.findByUserId(req.params.id_user, (err, rows) => {
            if (err) return res.status(500).json({ error: err });
            res.json(rows);
        });
    },

    // Mettre à jour un compte
    update: (req, res) => {
        const { nom, solde, type } = req.body;
        Compte.update(req.params.id_compte, { nom, solde, type }, (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Compte mis à jour avec succès" });
        });
    },

    // Supprimer un compte
    delete: (req, res) => {
        Compte.delete(req.params.id_compte, (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Compte supprimé avec succès" });
        });
    },
    // Récupérer tous les comptes de l'utilisateur authentifié
    getMyAccounts: (req, res) => {
        const id_user = req.user.id_user;
        console.log(`Récupération des comptes pour l'utilisateur ID: ${id_user}`);
        
        // Récupérer les comptes avec la devise de l'utilisateur
        const sql = `
            SELECT c.*, u.devise 
            FROM Comptes c 
            INNER JOIN Users u ON u.id_user = c.id_user 
            WHERE c.id_user = ?
        `;
        
        db.query(sql, [id_user], (err, rows) => {
            if (err) return res.status(500).json({ error: err });
            res.json(rows);
        });
    },

};

module.exports = compteController;
