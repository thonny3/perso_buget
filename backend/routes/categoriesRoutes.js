const express = require('express');
const router = express.Router();
const CategoriesController = require('../controllers/categoriesController');

// Routes for categories depenses
router.get('/depenses', CategoriesController.allDepenses); 
router.post('/depenses', CategoriesController.add);
router.delete('/depenses/:id', CategoriesController.delete);
// Routes for categories revenues
router.get('/revenues', CategoriesController.allRevenues);
router.post('/revenues', CategoriesController.addRevenues);
router.delete('/revenues/:id', CategoriesController.deleteRevenues);
   

module.exports = router;