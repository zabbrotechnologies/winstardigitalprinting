import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY is not set. Server operations will use anon key (limited).');
}

// Admin client — uses service role key, bypasses RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Table names
export const ORDERS_TABLE = 'orders';
export const PROFILES_TABLE = 'profiles';
export const WHOLESALE_TABLE = 'wholesale_applications';
export const STORAGE_BUCKET = 'print-files';

export default supabaseAdmin;
