const { supabaseAdmin } = require('../config/supabase');
const emailService = require('../services/emailService');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Get Admin Dashboard Overview Statistics
 */
const getDashboardStats = async (req, res, next) => {
    try {
        // Fetch User counts
        const { data: profiles, error: profErr } = await supabaseAdmin
            .from('profiles')
            .select('status, role, created_at');

        if (profErr) throw profErr;

        const usersOnly = profiles.filter(p => p.role !== 'admin');

        const totalUsers = usersOnly.length;
        const pendingUsers = usersOnly.filter(p => p.status === 'pending').length;
        const approvedUsers = usersOnly.filter(p => p.status === 'approved').length;
        const rejectedUsers = usersOnly.filter(p => p.status === 'rejected').length;

        // Fetch Service Requests count
        const { data: serviceReqs, error: reqErr } = await supabaseAdmin
            .from('service_requests')
            .select('id, status, created_at');

        if (reqErr) throw reqErr;

        const totalServiceRequests = serviceReqs.length;
        const pendingRequests = serviceReqs.filter(r => r.status === 'pending').length;
        const processingRequests = serviceReqs.filter(r => r.status === 'processing').length;
        const completedRequests = serviceReqs.filter(r => r.status === 'completed').length;

        return ApiResponse.success(res, 'Dashboard statistics fetched.', {
            stats: {
                totalUsers,
                pendingUsers,
                approvedUsers,
                rejectedUsers,
                totalServiceRequests,
                pendingRequests,
                processingRequests,
                completedRequests
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get Registered Users List with Filtering & Sorting
 */
const getUsers = async (req, res, next) => {
    try {
        const { status, sort } = req.query;

        let query = supabaseAdmin
            .from('profiles')
            .select(`
                *,
                companies (*)
            `)
            .neq('role', 'admin');

        // Apply Status Filter
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        // Apply Sorting
        if (sort === 'oldest') {
            query = query.order('created_at', { ascending: true });
        } else if (sort === 'name_asc') {
            query = query.order('full_name', { ascending: true });
        } else if (sort === 'name_desc') {
            query = query.order('full_name', { ascending: false });
        } else {
            // Default: newest first
            query = query.order('created_at', { ascending: false });
        }

        const { data: users, error } = await query;

        if (error) throw error;

        return ApiResponse.success(res, 'Users fetched successfully.', {
            users: users || []
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get User Details by ID
 */
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select(`
                *,
                companies (*)
            `)
            .eq('id', id)
            .single();

        if (error || !profile) {
            return ApiResponse.error(res, 'User not found.', 404);
        }

        return ApiResponse.success(res, 'User details fetched.', { user: profile });
    } catch (err) {
        next(err);
    }
};

/**
 * Approve User Account
 */
const approveUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const adminId = req.profile.id;

        // Fetch user profile
        const { data: targetUser, error: userErr } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (userErr || !targetUser) {
            return ApiResponse.error(res, 'Target user account not found.', 404);
        }

        // Update status to approved
        const { data: updatedProfile, error: updateErr } = await supabaseAdmin
            .from('profiles')
            .update({
                status: 'approved',
                approved_at: new Date().toISOString(),
                approved_by: adminId,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (updateErr) throw updateErr;

        // Send Approval Email
        await emailService.sendApprovalEmail(targetUser.email, targetUser.full_name);

        logger.info(`User ${targetUser.email} approved by admin ${req.profile.email}`);

        return ApiResponse.success(res, 'User account approved successfully. Notification email sent.', {
            user: updatedProfile
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Reject User Account
 */
const rejectUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.profile.id;

        const { data: targetUser, error: userErr } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (userErr || !targetUser) {
            return ApiResponse.error(res, 'Target user account not found.', 404);
        }

        const { data: updatedProfile, error: updateErr } = await supabaseAdmin
            .from('profiles')
            .update({
                status: 'rejected',
                rejected_at: new Date().toISOString(),
                rejected_by: adminId,
                rejection_reason: reason || 'Not specified',
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (updateErr) throw updateErr;

        // Send Rejection Email
        await emailService.sendRejectionEmail(targetUser.email, targetUser.full_name, reason);

        logger.info(`User ${targetUser.email} rejected by admin ${req.profile.email}`);

        return ApiResponse.success(res, 'User account rejected. Notification email sent.', {
            user: updatedProfile
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get Service Requests List for Admin
 */
const getServiceRequests = async (req, res, next) => {
    try {
        const { status } = req.query;

        let query = supabaseAdmin
            .from('service_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        const { data: requests, error } = await query;

        if (error) throw error;

        return ApiResponse.success(res, 'Service requests fetched.', { requests: requests || [] });
    } catch (err) {
        next(err);
    }
};

/**
 * Update Service Request Status
 */
const updateServiceRequestStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return ApiResponse.error(res, `Invalid status value. Must be one of: ${validStatuses.join(', ')}`, 400);
        }

        const { data: updatedReq, error } = await supabaseAdmin
            .from('service_requests')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return ApiResponse.success(res, 'Service request status updated.', { request: updatedReq });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getDashboardStats,
    getUsers,
    getUserById,
    approveUser,
    rejectUser,
    getServiceRequests,
    updateServiceRequestStatus
};
