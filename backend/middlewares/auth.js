const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if(!token) return res.status(401).json({ message: 'Token manquant' });

    try {
        const decoded = jwt.verify(token, 'SECRET_KEY');
        req.user = decoded; // id_user disponible
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token invalide' });
    }
};

module.exports = auth;
