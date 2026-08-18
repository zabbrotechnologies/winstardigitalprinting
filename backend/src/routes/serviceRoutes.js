const express = require('express');
const router = express.Router();
const multer = require('multer');
const serviceController = require('../controllers/serviceController');
const { printRequestValidator } = require('../utils/validators');
const validate = require('../middleware/validationMiddleware');

const authMiddleware = require('../middleware/authMiddleware');

// Configure Multer Memory Storage (files processed in memory then sent to Supabase storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

router.post(
    '/print-request',
    upload.single('file'),
    printRequestValidator,
    validate,
    serviceController.createPrintRequest
);

router.get('/requests/:id', authMiddleware, serviceController.getRequestById);

module.exports = router;
