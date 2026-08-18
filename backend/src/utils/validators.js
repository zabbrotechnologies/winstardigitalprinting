const { body } = require('express-validator');

const registerValidator = [
    body('name').trim().notEmpty().withMessage('Full name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
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
    body('customerPhone').trim().notEmpty().withMessage('Customer phone is required'),
    body('printCount').isInt({ min: 1 }).withMessage('Print count must be at least 1')
];

module.exports = {
    registerValidator,
    loginValidator,
    printRequestValidator
};
