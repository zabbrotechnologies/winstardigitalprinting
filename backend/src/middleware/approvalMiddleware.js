const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Account Approval Verification Middleware
 * Must be executed AFTER authMiddleware
 * Ensures req.profile.status === 'approved' for protected company features
 */
const approvalMiddleware = (req, res, next) => {
    if (!req.profile) {
        return ApiResponse.error(res, 'Authentication required.', 401);
    }

    // Admins bypass approval check
    if (req.profile.role === 'admin') {
        return next();
    }

    if (req.profile.status === 'pending') {
        return ApiResponse.error(res, 'Your account is currently awaiting administrator approval.', 403, { status: 'pending' });
    }

    if (req.profile.status === 'rejected') {
        return ApiResponse.error(res, 'Your registration request was not approved. Please contact the administrator.', 403, { status: 'rejected' });
    }

    if (req.profile.status !== 'approved') {
        return ApiResponse.error(res, 'Account status invalid or unverified.', 403);
    }

    next();
};

module.exports = approvalMiddleware;
