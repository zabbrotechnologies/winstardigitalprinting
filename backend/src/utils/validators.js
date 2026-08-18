const { body } = require('express-validator');

const registerValidator = [
    body('name').trim().notEmpty().withMessage('Full name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('phone').trim().matches(/^[0-9+\s-]{10,15}$/).withMessage('Valid phone number (at least 10 digits) is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('address.line1').trim().notEmpty().withMessage('Address Line 1 is required'),
    body('address.city').trim().notEmpty().withMessage('City is required'),
    body('address.state').trim().notEmpty().withMessage('State is required'),
    body('address.pincode').trim().notEmpty().withMessage('Postal pincode is required')
];

const loginValidator = [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

const printRequestValidator = [
    body('customerName').trim().notEmpty().withMessage('Customer name is required'),
    body('customerPhone').trim().matches(/^[0-9+\s-]{10,15}$/).withMessage('Valid 10-digit customer phone number is required'),
    body('printCount').isInt({ min: 1 }).withMessage('Print count must be at least 1'),
    body('estimatedAmount').optional().isFloat({ min: 0 }).withMessage('Estimated amount must be a positive number')
];

module.exports = {
    registerValidator,
    loginValidator,
    printRequestValidator
};
