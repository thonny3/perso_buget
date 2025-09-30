const express = require('express');
const cors = require('cors');
const app = express();
const userRoutes = require('./routes/userRoutes');
const compteRoutes = require('./routes/compteRoutes');
const comptesPartagesRoutes = require('./routes/comptesPartagesRoutes');
const revenuesRoutes = require('./routes/revenuesRoutes');
const abonnementRoutes = require('./routes/abonnementRoutes');
const alertesRoutes = require('./routes/alertesRoutes');
const categorieRoutes = require('./routes/categoriesRoutes');
const depenseroutes = require('./routes/depensesRoutes');
const budgetroutes = require('./routes/budgetRoutes');
const objectifroutes = require('./routes/objectifRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const contributionRoutes = require('./routes/contributionRoutes');
const transfertsRoutes = require('./routes/transfertsRoutes');
const dettesRoutes = require('./routes/dettesRoutes');



const fs = require('fs');
const path = require('path');
const auth = require('./middlewares/auth');
// Créer le dossier uploads si pas existant
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Middleware
app.use(express.json());
app.use(cors({
  //origin: 'http://192.168.1.248:8081', // ton front (Next.js/React)
  origin: '*',
  credentials: true
}));
app.use('/uploads', express.static(uploadDir));
app.set('db', require('./config/db'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', userRoutes); // Routes d'authentification
app.use('/api/comptes', auth, compteRoutes);
app.use('/api/comptes-partages', auth, comptesPartagesRoutes);
app.use('/api/revenus', auth, revenuesRoutes);
app.use('/api/categories', auth, categorieRoutes);
app.use('/api/depenses', auth, depenseroutes);
app.use('/api/budgets', auth, budgetroutes);
app.use('/api/objectifs', auth, objectifroutes);
app.use('/api/transactions', auth, transactionRoutes);
app.use('/api/contributions', auth, contributionRoutes);
app.use('/api/transferts', auth, transfertsRoutes);
app.use('/api/abonnements', auth, abonnementRoutes);
app.use('/api/alertes', auth, alertesRoutes);
app.use('/api/dettes', auth, dettesRoutes);

// Endpoint de santé pour les tests de connectivité
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Endpoint de test pour l'authentification (sans token)
app.get('/api/auth/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Auth endpoint is accessible',
    timestamp: new Date().toISOString()
  });
});

// Endpoint de ping simple
app.get('/api/ping', (req, res) => {
  res.json({ 
    status: 'pong', 
    message: 'Server is responding',
    timestamp: new Date().toISOString()
  });
});

const PORT = 3001;
//app.listen(PORT, '192.168.1.248', () => console.log(`Server running on http://192.168.1.248:${PORT}`));
app.listen(PORT, 'localhost', () => console.log(`Server running on http://localhost:${PORT}`));
