const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userController = {
    register: (req, res) => {
        const { nom, prenom, email, mot_de_passe, devise } = req.body;
        const image = req.file ? req.file.filename : null;
        console.log("req.file:", req.file);

        const hashedPassword = bcrypt.hashSync(mot_de_passe, 10);

        User.create({ nom, prenom, email, mot_de_passe: hashedPassword, devise, image }, (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).json({ message: 'Utilisateur créé', id_user: result.insertId });
        });
    },
    login: (req, res) => {
        const email = req.body.email;
        const mot_de_passe = req.body.password


        User.findByEmail(email, (err, users) => {
            if (err) return res.status(500).json({ error: err });
            if (users.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });

            const user = users[0];
            if (!bcrypt.compareSync(mot_de_passe, user.mot_de_passe)) {
                return res.status(401).json({ message: 'Mot de passe incorrect' });
            }

            const token = jwt.sign({ id_user: user.id_user }, 'SECRET_KEY', { expiresIn: '1d' });
            res.json({ message: 'Connexion réussie', token, user: { id_user: user.id_user, nom: user.nom, prenom: user.prenom, email: user.email, devise: user.devise, image: user.image , role:user.role} });
        });
    },

    getAllUsers: (req, res) => {
        User.getAll((err, users) => {
            if (err) return res.status(500).json({ error: err });
            res.json(users);
        });
    },

    getUser: (req, res) => {
        const id = req.params.id;
        User.findById(id, (err, users) => {
            if (err) return res.status(500).json({ error: err });
            if (users.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });
            res.json(users[0]);
        });
    },

    updateUser: (req, res) => {
        const id = req.params.id;
        const { nom, prenom, email, devise } = req.body;
        const image = req.file ? req.file.filename : null;
        User.update(id, { nom, prenom, email, devise, image }, (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Utilisateur mis à jour' });
        });
    },

    deleteUser: (req, res) => {
        const id = req.params.id;
        User.delete(id, (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Utilisateur supprimé' });
        });
    },

    verify: (req, res) => {
        // Le middleware auth a déjà vérifié le token et ajouté req.user
        const userId = req.user.id_user;
        
        User.findById(userId, (err, users) => {
            if (err) return res.status(500).json({ error: err });
            if (users.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });
            
            const user = users[0];
            res.json({ 
                message: 'Token valide', 
                user: { 
                    id_user: user.id_user, 
                    nom: user.nom, 
                    prenom: user.prenom, 
                    email: user.email, 
                    devise: user.devise, 
                    image: user.image, 
                    role: user.role 
                } 
            });
        });
    }
};

module.exports = userController;
