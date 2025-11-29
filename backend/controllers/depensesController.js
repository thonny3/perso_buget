const Depenses = require('../models/depensesModel');
const AlertThresholds = require('../models/alertThresholdsModel');
const Alertes = require('../models/alertesModel');
const { checkAccountPermission } = require('../utils/accountPermissions');

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

  add: async (req, res) => {
    const id_user = req.user?.id_user;
    if (!id_user) return res.status(401).json({ message: "Non autorisé" });

    const id_compte = req.body?.id_compte;

    // Si un compte est spécifié, vérifier les permissions
    if (id_compte) {
      try {
        const { hasAccess, role } = await checkAccountPermission(id_user, id_compte, 'write');
        if (!hasAccess) {
          return res.status(403).json({
            message: 'Vous n\'avez pas la permission d\'ajouter des transactions sur ce compte. Seuls les contributeurs et propriétaires peuvent effectuer des transactions.',
            role: role || 'aucun'
          });
        }
      } catch (error) {
        console.error('Erreur vérification permissions:', error);
        return res.status(500).json({ error: 'Erreur lors de la vérification des permissions' });
      }
    }

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
              type_alerte: 'Limite de dépenses atteinte',
              message: `Vous avez atteint votre limite de dépenses aujourd'hui (${totalToday}/${thresholdValue}).`,
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
              } catch (_e) { }
              return res.json({ message: 'Dépense ajoutée', ...(result || {}), thresholdChecked: true, notified: true, totalToday, thresholdValue });
            });
          } else {
            return res.json({ message: 'Dépense ajoutée', ...(result || {}), thresholdChecked: true, notified: false, totalToday, thresholdValue });
          }
        });
      });
    });
  },

  update: async (req, res) => {
    const { id_depense } = req.params;
    const id_user = req.user?.id_user;
    if (!id_user) return res.status(401).json({ message: "Non autorisé" });

    console.log('📝 UPDATE DEPENSE - ID:', id_depense);
    console.log('📝 UPDATE DEPENSE - DATA:', req.body);
    console.log('📝 UPDATE DEPENSE - USER:', id_user);

    // Récupérer la dépense pour vérifier les permissions
    const db = require('../config/db');
    db.query('SELECT id_user, id_compte FROM Depenses WHERE id_depense = ?', [id_depense], async (err, rows) => {
      if (err) {
        console.error('❌ Erreur getById:', err);
        return res.status(500).json({ error: err.message });
      }
      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: "Dépense introuvable" });
      }

      const depenseData = rows[0];
      const id_compte = depenseData.id_compte;

      // Si la dépense appartient à l'utilisateur, il peut la modifier
      if (depenseData.id_user === id_user) {
        Depenses.update(id_depense, req.body, (err, result) => {
          if (err) {
            console.error('❌ Erreur update model:', err);
            return res.status(500).json({ error: err.message });
          }
          console.log('✅ Dépense mise à jour avec succès');
          res.json({ message: 'Dépense mise à jour', data: req.body });
        });
        return;
      }

      // Si la dépense est sur un compte partagé, vérifier les permissions
      if (id_compte) {
        try {
          const { hasAccess, role } = await checkAccountPermission(id_user, id_compte, 'write');
          if (!hasAccess) {
            return res.status(403).json({
              message: 'Vous n\'avez pas la permission de modifier cette transaction. Seuls les contributeurs et propriétaires peuvent modifier les transactions.',
              role: role || 'aucun'
            });
          }

          Depenses.update(id_depense, req.body, (err, result) => {
            if (err) {
              console.error('❌ Erreur update model:', err);
              return res.status(500).json({ error: err.message });
            }
            console.log('✅ Dépense mise à jour avec succès');
            res.json({ message: 'Dépense mise à jour', data: req.body });
          });
        } catch (error) {
          console.error('Erreur vérification permissions:', error);
          return res.status(500).json({ error: 'Erreur lors de la vérification des permissions' });
        }
      } else {
        return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette dépense" });
      }
    });
  },

  delete: async (req, res) => {
    const { id_depense } = req.params;
    const id_user = req.user?.id_user;
    if (!id_user) return res.status(401).json({ message: "Non autorisé" });

    // Récupérer la dépense pour vérifier les permissions
    const db = require('../config/db');
    db.query('SELECT id_user, id_compte FROM Depenses WHERE id_depense = ?', [id_depense], async (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: "Dépense introuvable" });
      }

      const depenseData = rows[0];
      const id_compte = depenseData.id_compte;

      // Si la dépense appartient à l'utilisateur, il peut la supprimer
      if (depenseData.id_user === id_user) {
        Depenses.delete(id_depense, (err) => {
          if (err) return res.status(500).json({ error: err });
          res.json({ message: 'Dépense supprimée' });
        });
        return;
      }

      // Si la dépense est sur un compte partagé, vérifier les permissions
      if (id_compte) {
        try {
          const { hasAccess, role } = await checkAccountPermission(id_user, id_compte, 'write');
          if (!hasAccess) {
            return res.status(403).json({
              message: 'Vous n\'avez pas la permission de supprimer cette transaction. Seuls les contributeurs et propriétaires peuvent supprimer les transactions.',
              role: role || 'aucun'
            });
          }

          Depenses.delete(id_depense, (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Dépense supprimée' });
          });
        } catch (error) {
          console.error('Erreur vérification permissions:', error);
          return res.status(500).json({ error: 'Erreur lors de la vérification des permissions' });
        }
      } else {
        return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cette dépense" });
      }
    });
  }
};

module.exports = DepensesController;
