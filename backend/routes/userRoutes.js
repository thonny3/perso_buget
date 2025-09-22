const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const multer = require('multer');

// Config multer pour upload images
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });


// Public routes
router.post('/register', upload.single('image'), userController.register);
router.post('/login', userController.login);

// Routes protégées
router.get('/verify', auth, userController.verify);
router.get('/', auth, userController.getAllUsers);
router.get('/:id', auth, userController.getUser);
router.put('/:id', auth, upload.single('image'), userController.updateUser);
router.delete('/:id', auth, userController.deleteUser);

module.exports = router;
