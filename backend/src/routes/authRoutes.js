const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../utils/validators');
const validate = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
