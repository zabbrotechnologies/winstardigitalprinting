import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.log("No service key available, checking with anon key...");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkUser() {
  const emailToFind = 'sanjay1@gmail.com';
  
  console.log('Fetching users to find:', emailToFind);
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) {
    console.error('Error fetching users (make sure you have service role key):', error);
    return;
  }
  
  const user = data.users.find(u => u.email === emailToFind);
  
  if (!user) {
    console.log('User not found in Auth system.');
    
    // Check profiles table
    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('email', emailToFind).single();
    if (profile) {
      console.log('User exists in profiles table but NOT in Auth table!');
      console.log(profile);
    }
  } else {
    console.log('Found user in Auth:');
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Confirmed at: ${user.email_confirmed_at || 'NOT CONFIRMED'}`);
    console.log(`Created at: ${user.created_at}`);
  }
}

checkUser();
