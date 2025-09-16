const ComptesPartages = require('../models/comptesPartagesModel');
const User = require('../models/userModel');

const comptesPartagesController = {

    // Ajouter un partage (seul le propriétaire)
    create: (req, res) => {
        const { id_compte, email, role } = req.body;
        if (!id_compte || !email || !role) {
            return res.status(400).json({ message: "Champs requis: id_compte, email, role" });
        }

        User.findByEmail(email, (err, users) => {
            if (err) return res.status(500).json({ error: err });
            if (users.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });

            const user = users[0];

            // Vérifier si l'utilisateur a déjà un partage sur ce compte
            ComptesPartages.findByCompteId(id_compte, (err, rows) => {
                if (err) return res.status(500).json({ error: err });

                const exists = rows.find(r => r.id_user === user.id_user);
                if (exists) {
                    return res.status(400).json({ message: "Cet utilisateur a déjà un partage sur ce compte" });
                }

                // Créer le partage
                ComptesPartages.create({ id_compte, id_user: user.id_user, role }, (err, result) => {
                    if (err) return res.status(500).json({ error: err });
                    res.status(201).json({ message: "Partage créé avec succès", id: result.insertId });
                });
            });
        });
    }
    ,

    // Récupérer utilisateurs ayant accès à un compte
    getByCompte: (req, res) => {
        ComptesPartages.findByCompteId(req.params.id_compte, (err, rows) => {
            if (err) return res.status(500).json({ error: err });
            res.json(rows);
        });
    },

    // Récupérer comptes auxquels un utilisateur a accès
    getByUser: (req, res) => {
        ComptesPartages.findByUserId(req.params.id_user, (err, rows) => {
            if (err) return res.status(500).json({ error: err });
            res.json(rows);
        });
    },

    // Supprimer un partage (seul le propriétaire)
    delete: (req, res) => {
        ComptesPartages.delete(req.params.id, (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Partage supprimé avec succès" });
        });
    },

    // Modifier le rôle d'un utilisateur sur un compte partagé (seul le propriétaire)
    updateRole: (req, res) => {
        const role = req.body.role;
        const id = req.params.id;
        if (!role) {
            return res.status(400).json({ message: "Champs requis:  role" });
        }

        ComptesPartages.updateRole(id, role, (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Rôle modifié avec succès" });
        });
    }

};

module.exports = comptesPartagesController;
