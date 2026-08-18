const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const approvalMiddleware = require('../middleware/approvalMiddleware');

router.get('/me', authMiddleware, approvalMiddleware, userController.getProfile);
router.put('/me', authMiddleware, approvalMiddleware, userController.updateProfile);
router.get('/me/requests', authMiddleware, approvalMiddleware, userController.getUserRequests);

module.exports = router;
