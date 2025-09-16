const express = require('express');
const router = express.Router();
const DepensesController = require('../controllers/depensesController');

router.get('/', DepensesController.getAll);
router.post('/', DepensesController.add);
router.put('/:id_depense', DepensesController.update);
router.delete('/:id_depense', DepensesController.delete);

module.exports = router;
