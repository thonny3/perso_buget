const Contributions = require('../models/Contributions');

const ContributionsController = {
    getAll: (req, res) => {
        const id_user = req.user?.id_user;
        if (!id_user) return res.status(401).json({ message: "Non autorisé" });
        Contributions.getAll(id_user, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
    },

    add: (req, res) => {
        const id_user = req.user?.id_user;
        if (!id_user) return res.status(401).json({ message: "Non autorisé" });

        const data = { ...req.body, id_user };
        Contributions.add(data, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(result);
        });
    }
};

module.exports = ContributionsController;
