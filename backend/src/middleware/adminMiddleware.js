const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Admin Authorization Middleware
 * Must be executed AFTER authMiddleware
 * Ensures req.profile.role === 'admin' strictly from database, NEVER frontend
 */
const adminMiddleware = (req, res, next) => {
    if (!req.profile) {
        return ApiResponse.error(res, 'Authentication required.', 401);
    }

    if (req.profile.role !== 'admin') {
        logger.warn(`Forbidden admin access attempt by user: ${req.profile.email}`);
        return ApiResponse.error(res, 'Access denied. Administrator privileges required.', 403);
    }

    next();
};

module.exports = adminMiddleware;
