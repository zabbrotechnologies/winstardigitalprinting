const { supabaseAdmin } = require('../config/supabase');
const ApiResponse = require('../utils/response');

const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        const { data: company } = await supabaseAdmin
            .from('companies')
            .select('*')
            .eq('user_id', userId)
            .single();

        return ApiResponse.success(res, 'User profile fetched successfully.', {
            user: {
                id: profile.id,
                name: profile.full_name,
                email: profile.email,
                phone: profile.phone,
                role: profile.role,
                status: profile.status,
                createdAt: profile.created_at,
                company: company || null
            }
        });
    } catch (err) {
        next(err);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, phone } = req.body;

        const { data: updatedProfile, error } = await supabaseAdmin
            .from('profiles')
            .update({
                full_name: name,
                phone: phone,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return ApiResponse.success(res, 'Profile updated successfully.', { profile: updatedProfile });
    } catch (err) {
        next(err);
    }
};

const getUserRequests = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const { data: requests, error } = await supabaseAdmin
            .from('service_requests')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return ApiResponse.success(res, 'User requests fetched successfully.', { requests: requests || [] });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getUserRequests
};
