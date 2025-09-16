const express = require('express');
const router = express.Router();
const ContributionController  = require('../controllers/ContributionsController');

router.get('/', ContributionController.getAll);
router.post('/', ContributionController.add);

module.exports = router;
