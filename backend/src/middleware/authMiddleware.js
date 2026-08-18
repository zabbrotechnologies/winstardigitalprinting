const { supabaseAdmin } = require('../config/supabase');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Authentication Middleware
 * Validates Supabase JWT token passed in Authorization header: Bearer <token>
 */
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return ApiResponse.error(res, 'Authentication required. Missing or malformed token.', 401);
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            logger.warn('Auth token verification failed:', error ? error.message : 'No user found');
            return ApiResponse.error(res, 'Invalid or expired authentication token.', 401);
        }

        // Fetch server-side profile record
        const { data: profile, error: profileErr } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileErr || !profile) {
            return ApiResponse.error(res, 'User profile record not found.', 404);
        }

        req.user = user;
        req.profile = profile;
        next();
    } catch (err) {
        logger.error('Unexpected error in authMiddleware:', err);
        return ApiResponse.error(res, 'Internal server authentication error.', 500);
    }
};

module.exports = authMiddleware;
