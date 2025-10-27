const Revenues = require('../models/revenuesModel')
const RevenuesController = {
   
    // --- REVENUS ---
    getAll: (req, res) => {
        const id_user = req.user?.id_user;
        if (!id_user) return res.status(401).json({ message: "Non autorisé" });

    const { id_compte } = req.query;
    if (id_compte) {
        return Revenues.getByAccountForUser(id_user, id_compte, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    }

    Revenues.getAll(id_user, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
    },

    add: (req, res) => {
        const id_user = req.user?.id_user;
        if (!id_user) return res.status(401).json({ message: "Non autorisé" });

        const data = { ...req.body, id_user };
        Revenues.add(data, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Revenu ajouté", id: result.insertId });
        });
    },

    update: (req, res) => {
        const { id } = req.params;
        const id_user = req.user?.id_user;
        if (!id_user) return res.status(401).json({ message: "Non autorisé" });
        
        console.log('📝 UPDATE REVENU - ID:', id);
        console.log('📝 UPDATE REVENU - DATA:', req.body);
        console.log('📝 UPDATE REVENU - USER:', id_user);
        
        // Récupérer le revenu pour vérifier que l'utilisateur en est propriétaire
        Revenues.getById(id, (err, revenue) => {
            if (err) {
                console.error('❌ Erreur getById:', err);
                return res.status(500).json({ error: err.message });
            }
            if (!revenue || revenue.length === 0) {
                console.error('❌ Revenu introuvable:', id);
                return res.status(404).json({ message: "Revenu introuvable" });
            }
            
            console.log('✅ Revenu trouvé:', revenue[0]);
            
            // Vérifier que le revenu appartient à l'utilisateur
            if (revenue[0].id_user !== id_user) {
                console.error('❌ Utilisateur non autorisé:', id_user, 'vs', revenue[0].id_user);
                return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier ce revenu" });
            }
            
            Revenues.update(id, req.body, (err) => {
                if (err) {
                    console.error('❌ Erreur update model:', err);
                    return res.status(500).json({ error: err.message });
                }
                console.log('✅ Revenu mis à jour avec succès');
                res.json({ message: "Revenu mis à jour", data: req.body });
            });
        });
    },

    delete: (req, res) => {
        const { id } = req.params;
        Revenues.delete(id, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Revenu supprimé" });
        });
    },

    getById: (req, res) => {
        const { id } = req.params;
        Revenues.getById(id, (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(row);
        });
    }
};

module.exports = RevenuesController;
