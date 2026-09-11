import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://jjyxrozkrhrqfqpegayh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqeXhyb3prcmhycWZxcGVnYXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MTQ2MzUsImV4cCI6MjEwMjk5MDYzNX0.So8FK5VZ1sM_Rdj-oR5IA5PAnTRPulNFtEGPWXPzVXA';

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY is not set. Server operations will use anon key.');
}

// Admin client — uses service role key if present, or anon key
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
