const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Centralized Error Handling Middleware
 */
const errorMiddleware = (err, req, res, next) => {
    logger.error('Unhandled Server Error:', err);

    // Sanitize database or sensitive stack traces in response
    const message = process.env.NODE_ENV === 'production' 
        ? 'An unexpected server error occurred. Please try again later.'
        : err.message || 'Internal server error';

    return ApiResponse.error(res, message, err.status || 500);
};

module.exports = errorMiddleware;
