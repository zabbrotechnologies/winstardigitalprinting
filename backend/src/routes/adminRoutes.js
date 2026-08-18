const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Protect all admin routes with authentication & admin role checks
router.use(authMiddleware, adminMiddleware);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/approve', adminController.approveUser);
router.patch('/users/:id/reject', adminController.rejectUser);

router.get('/service-requests', adminController.getServiceRequests);
router.patch('/service-requests/:id/status', adminController.updateServiceRequestStatus);

module.exports = router;
