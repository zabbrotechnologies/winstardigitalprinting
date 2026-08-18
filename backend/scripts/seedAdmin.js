const { supabaseAdmin } = require('../src/config/supabase');
const logger = require('../src/utils/logger');

/**
 * Script to promote a user to admin or create an admin user
 * Usage: node scripts/seedAdmin.js <email> <password> <fullName>
 */
const seedAdmin = async () => {
    const args = process.argv.slice(2);
    const email = args[0] || 'admin@winstardigital.com';
    const password = args[1] || 'AdminPass123!';
    const fullName = args[2] || 'System Administrator';

    logger.info(`Seeding admin user: ${email}...`);

    try {
        // 1. Check if user already exists in auth
        const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
        let existingUser = users ? users.find(u => u.email.toLowerCase() === email.toLowerCase()) : null;

        let userId;

        if (!existingUser) {
            // Create admin user in Supabase Auth
            const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
                email: email.toLowerCase(),
                password,
                email_confirm: true,
                user_metadata: { full_name: fullName }
            });

            if (authErr) {
                logger.error('Error creating admin auth user:', authErr.message);
                process.exit(1);
            }

            userId = authData.user.id;
            logger.info(`Created new Auth user for admin with ID: ${userId}`);
        } else {
            userId = existingUser.id;
            logger.info(`Existing Auth user found with ID: ${userId}`);
        }

        // 2. Insert or update profile with role='admin' & status='approved'
        const { data: profile, error: profErr } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                auth_user_id: userId,
                full_name: fullName,
                email: email.toLowerCase(),
                phone: '9345046665',
                role: 'admin',
                status: 'approved',
                approved_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (profErr) {
            logger.error('Error updating admin profile:', profErr.message);
            process.exit(1);
        }

        logger.info('====================================================');
        logger.info('✅ ADMIN CREATED / PROMOTED SUCCESSFULLY!');
        logger.info(`Email: ${profile.email}`);
        logger.info(`Role: ${profile.role}`);
        logger.info(`Status: ${profile.status}`);
        logger.info('====================================================');
        process.exit(0);
    } catch (err) {
        logger.error('Unexpected error in seedAdmin script:', err);
        process.exit(1);
    }
};

seedAdmin();
