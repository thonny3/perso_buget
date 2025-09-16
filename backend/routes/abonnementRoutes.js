const express = require('express');
const router = express.Router();
const AbonnementController = require('../controllers/abonnementController');

router.get('/:id_user', AbonnementController.getAll);
router.post('/', AbonnementController.add);
router.put('/:id_abonnement', AbonnementController.update);
router.delete('/:id_abonnement', AbonnementController.delete);

module.exports = router;
