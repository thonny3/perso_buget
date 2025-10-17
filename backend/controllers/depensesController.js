const Depenses = require('../models/depensesModel');
const AlertThresholds = require('../models/alertThresholdsModel');
const Alertes = require('../models/alertesModel');

const DepensesController = {
  getAll: (req, res) => {
    const id_user = req.user?.id_user;
    if (!id_user) return res.status(401).json({ message: "Non autorisé" });

    const { id_compte } = req.query;
    if (id_compte) {
      return Depenses.getByAccountForUser(id_user, id_compte, (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows);
      });
    }

    Depenses.getAll(id_user, (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    });
  },

  add: (req, res) => {
    const id_user = req.user?.id_user;
    if (!id_user) return res.status(401).json({ message: "Non autorisé" });

    const data = { ...req.body, id_user };
    Depenses.add(data, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      // Après ajout, vérifier le seuil du domaine 'depenses' pour aujourd'hui (selon date serveur)
      const sumSql = `SELECT SUM(montant) AS total FROM Depenses WHERE id_user = ? AND DATE(date_depense) = CURDATE()`;
      const db = require('../config/db');
      db.query(sumSql, [id_user], (sumErr, rows) => {
        if (sumErr) {
          return res.json({ message: 'Dépense ajoutée', ...(result || {}), thresholdChecked: false, error: sumErr.message || String(sumErr) });
        }
        const totalToday = Number(rows?.[0]?.total || 0);
        AlertThresholds.getByUserAndDomain(id_user, 'depenses', (thrErr, thr) => {
          if (thrErr || !thr) {
            return res.json({ message: 'Dépense ajoutée', ...(result || {}), thresholdChecked: false, totalToday });
          }
          const thresholdValue = Number(thr.value || 0);
          if (!Number.isFinite(thresholdValue)) {
            return res.json({ message: 'Dépense ajoutée', ...(result || {}), thresholdChecked: false, totalToday });
          }
          const shouldNotify = totalToday >= thresholdValue;
          console.log('[Depenses] Check seuil jour', { id_user, totalToday, thresholdValue, shouldNotify });
          if (shouldNotify) {
            const alertPayload = {
              id_user,
              type_alerte: 'Alerte seuil dépenses',
              message: `Dépenses du jour (${totalToday}) supérieures ou égales au seuil (${thresholdValue}).`,
              date_declenchement: new Date()
            };
            Alertes.create(alertPayload, (_eIns, insRes) => {
              console.log('[Depenses] Alerte dépenses créée', { id_user, totalToday, thresholdValue })
              try {
                const io = req.app.get('io');
                if (io) {
                  io.to(`user:${id_user}`).emit('alert:new', { id_alerte: insRes?.insertId, ...alertPayload, lue: 0 });
                  console.log('[Depenses] Événement socket envoyé', { room: `user:${id_user}` })
                }
              } catch (_e) {}
              return res.json({ message: 'Dépense ajoutée', ...(result || {}), thresholdChecked: true, notified: true, totalToday, thresholdValue });
            });
          } else {
            return res.json({ message: 'Dépense ajoutée', ...(result || {}), thresholdChecked: true, notified: false, totalToday, thresholdValue });
          }
        });
      });
    });
  },

  update: (req, res) => {
    const { id_depense } = req.params;
    Depenses.update(id_depense, req.body, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Dépense mise à jour' });
    });
  },

  delete: (req, res) => {
    const { id_depense } = req.params;
    Depenses.delete(id_depense, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Dépense supprimée' });
    });
  }
};

module.exports = DepensesController;
