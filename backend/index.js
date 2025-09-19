const express = require('express');
const cors = require('cors');
const app = express();
const userRoutes = require('./routes/userRoutes');
const compteRoutes = require('./routes/compteRoutes');
const comptesPartagesRoutes = require('./routes/comptesPartagesRoutes');
const revenuesRoutes = require('./routes/revenuesRoutes');
const abonnementRoutes = require('./routes/abonnementRoutes');
const categorieRoutes = require('./routes/categoriesRoutes');
const depenseroutes = require('./routes/depensesRoutes');
const budgetroutes = require('./routes/budgetRoutes');
const objectifroutes = require('./routes/objectifRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const contributionRoutes = require('./routes/contributionRoutes');
const transfertsRoutes = require('./routes/transfertsRoutes');



const fs = require('fs');
const path = require('path');
const auth = require('./middlewares/auth');
// Créer le dossier uploads si pas existant
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // ton front (Next.js/React)
  credentials: true
}));
app.use('/uploads', express.static(uploadDir));
app.set('db', require('./config/db'));

// Routes
app.use('/api/users', userRoutes);
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
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
