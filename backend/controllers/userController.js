const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userController = {
    register: (req, res) => {
        const { nom, prenom, email, password, currency } = req.body;
        
        // Validation des champs requis
        if (!nom || !prenom || !email || !password || !currency) {
            return res.status(400).json({ 
                error: 'Tous les champs sont requis',
                message: 'nom, prenom, email, password et currency sont obligatoires'
            });
        }

        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Format d\'email invalide',
                message: 'Veuillez fournir un email valide'
            });
        }

        // Validation de la longueur du mot de passe
        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'Mot de passe trop court',
                message: 'Le mot de passe doit contenir au moins 6 caractères'
            });
        }

        // Vérifier si l'email existe déjà
        User.findByEmail(email, (err, users) => {
            if (err) return res.status(500).json({ error: 'Erreur serveur', details: err });
            
            if (users.length > 0) {
                return res.status(409).json({ 
                    error: 'Email déjà utilisé',
                    message: 'Un compte avec cet email existe déjà'
                });
            }

            // Hacher le mot de passe
            const hashedPassword = bcrypt.hashSync(password, 10);

            // Créer l'utilisateur
            User.create({ 
                nom: nom.trim(), 
                prenom: prenom.trim(), 
                email, 
                mot_de_passe: hashedPassword, 
                devise: currency 
            }, (err, result) => {
                if (err) {
                    console.error('Erreur création utilisateur:', err);
                    return res.status(500).json({ 
                        error: 'Erreur lors de la création du compte',
                        details: err.message 
                    });
                }
                
                res.status(201).json({ 
                    message: 'Compte créé avec succès',
                    user: {
                        id_user: result.insertId,
                        nom,
                        prenom,
                        email,
                        devise: currency
                    }
                });
            });
        });
    },
    login: (req, res) => {
        const { email, password } = req.body;

        // Validation des champs requis
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email et mot de passe requis',
                message: 'Veuillez fournir un email et un mot de passe'
            });
        }

        User.findByEmail(email, (err, users) => {
            if (err) {
                console.error('Erreur recherche utilisateur:', err);
                return res.status(500).json({ error: 'Erreur serveur', details: err });
            }
            
            if (users.length === 0) {
                return res.status(404).json({ 
                    error: 'Utilisateur non trouvé',
                    message: 'Aucun compte trouvé avec cet email'
                });
            }

            const user = users[0];
            
            // Vérifier le mot de passe
            if (!bcrypt.compareSync(password, user.mot_de_passe)) {
                return res.status(401).json({ 
                    error: 'Mot de passe incorrect',
                    message: 'Le mot de passe fourni est incorrect'
                });
            }

            // Générer le token JWT
            const token = jwt.sign({ id_user: user.id_user }, 'SECRET_KEY', { expiresIn: '1d' });
            
            res.json({ 
                message: 'Connexion réussie', 
                token, 
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
    },

    // Changer le mot de passe de l'utilisateur authentifié
    changePassword: (req, res) => {
        const userId = req.user.id_user;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Champs manquants',
                message: 'currentPassword et newPassword sont requis'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'Mot de passe trop court',
                message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
            });
        }

        // Récupérer l'utilisateur pour vérifier l'ancien mot de passe
        User.findById(userId, (err, users) => {
            if (err) return res.status(500).json({ error: 'Erreur serveur', details: err });
            if (users.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });

            const user = users[0];
            const isValid = bcrypt.compareSync(currentPassword, user.mot_de_passe);
            if (!isValid) {
                return res.status(401).json({
                    error: 'Mot de passe actuel incorrect',
                    message: 'Le mot de passe actuel ne correspond pas'
                });
            }

            const hashed = bcrypt.hashSync(newPassword, 10);
            User.updatePassword(userId, hashed, (updateErr) => {
                if (updateErr) return res.status(500).json({ error: 'Erreur mise à jour', details: updateErr });
                res.json({ message: 'Mot de passe mis à jour avec succès' });
            });
        });
    }
};

module.exports = userController;
