const Revenues = require('../models/revenuesModel')
const RevenuesController = {
   
    // --- REVENUS ---
    getAll: (req, res) => {
        const id_user = req.user?.id_user;
        if (!id_user) return res.status(401).json({ message: "Non autorisé" });

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
        Revenues.update(id, req.body, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Revenu mis à jour" });
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
