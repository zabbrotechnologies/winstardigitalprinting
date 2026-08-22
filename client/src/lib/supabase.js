import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dcjssexnlnakndvvmgnw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjanNzZXhubG5ha25kdnZtZ253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzg3NTUsImV4cCI6MjEwMjk1NDc1NX0.EgsXD610wtX8WEmHrsmGxxf0pBrpeJ_nn7BE4EddyVU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
