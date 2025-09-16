const Transactions = require('../models/transactionModel')

const TransactionController = {
    // Récupérer toutes les transactions d'un utilisateur
    getAll: (req, res) => {
        const id_user = req.user?.id_user;
        if (!id_user) return res.status(401).json({ message: "Non autorisé" });
        Transactions.getAllTransaction(id_user, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    }       
};
module.exports = TransactionController;