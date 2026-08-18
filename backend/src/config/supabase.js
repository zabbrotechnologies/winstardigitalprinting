const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

// Public Anon Client (for user-context requests)
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

// Privileged Service Role Client (for admin operations & server-side bypass)
const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

module.exports = {
    supabase,
    supabaseAdmin
};
