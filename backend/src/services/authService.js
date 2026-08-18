const { supabaseAdmin, supabase } = require('../config/supabase');
const emailService = require('./emailService');
const logger = require('../utils/logger');

/**
 * Register a new business company user
 * Default status: 'pending'
 */
const registerUser = async (userData) => {
    const { name, email, phone, password, companyName, gstNumber, designation, address } = userData;

    // 1. Check if email already registered in profiles
    const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

    if (existingProfile) {
        throw new Error('A business account with this email address already exists.');
    }

    // 2. Create User in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        password: password,
        email_confirm: true,
        user_metadata: {
            full_name: name,
            company_name: companyName
        }
    });

    if (authError || !authData.user) {
        logger.error('Supabase Auth user creation failed:', authError);
        throw new Error(authError ? authError.message : 'Failed to create user authentication account.');
    }

    const userId = authData.user.id;

    // 3. Create Profile in PostgreSQL
    const { data: profile, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: userId,
            auth_user_id: userId,
            full_name: name,
            email: email.toLowerCase(),
            phone: phone,
            role: 'user',
            status: 'pending'
        })
        .select()
        .single();

    if (profileErr) {
        logger.error('Database profile insertion error:', profileErr);
        // Clean up auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw new Error('Failed to initialize user profile database record.');
    }

    // 4. Create Company Record in PostgreSQL
    const { error: companyErr } = await supabaseAdmin
        .from('companies')
        .insert({
            user_id: userId,
            company_name: companyName,
            company_email: email.toLowerCase(),
            company_phone: phone,
            gst_number: gstNumber || null,
            designation: designation || 'Representative',
            address_line1: address.line1,
            address_line2: address.line2 || null,
            city: address.city || 'Dindigul',
            state: address.state || 'Tamil Nadu',
            pincode: address.pincode
        });

    if (companyErr) {
        logger.error('Database company insertion error:', companyErr);
    }

    // 5. Send Registration Confirmation Email
    await emailService.sendRegistrationConfirmationEmail(email, name);

    return {
        userId,
        email: profile.email,
        name: profile.full_name,
        companyName,
        status: 'pending',
        message: 'Your registration has been submitted successfully. Your account is currently awaiting approval from the administrator.'
    };
};

/**
 * Login User via Supabase Auth & check Approval Status
 */
const loginUser = async (email, password) => {
    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password
    });

    if (authError || !authData.user || !authData.session) {
        throw new Error('Invalid email or password.');
    }

    const userId = authData.user.id;

    // 2. Fetch server-side profile record
    const { data: profile, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profileErr || !profile) {
        throw new Error('User profile record not found.');
    }

    // 3. Fetch Company details if present
    const { data: company } = await supabaseAdmin
        .from('companies')
        .select('*')
        .eq('user_id', userId)
        .single();

    // 4. ENFORCE APPROVAL STATUS (Unless role === 'admin')
    if (profile.role !== 'admin') {
        if (profile.status === 'pending') {
            const err = new Error('Your account is currently awaiting administrator approval.');
            err.statusCode = 403;
            err.status = 'pending';
            throw err;
        }

        if (profile.status === 'rejected') {
            const err = new Error('Your registration request was not approved. Please contact the administrator.');
            err.statusCode = 403;
            err.status = 'rejected';
            throw err;
        }

        if (profile.status !== 'approved') {
            const err = new Error('Account status unverified.');
            err.statusCode = 403;
            throw err;
        }
    }

    return {
        token: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        user: {
            id: profile.id,
            email: profile.email,
            name: profile.full_name,
            phone: profile.phone,
            role: profile.role,
            status: profile.status,
            companyName: company ? company.company_name : null,
            gstNumber: company ? company.gst_number : null,
            companyAddress: company ? company : null
        }
    };
};

module.exports = {
    registerUser,
    loginUser
};
