import { createClient } from '@supabase/supabase-js';

const fallbackUrl = 'https://htevlpsnqislrhwhlhsp.supabase.co';
const fallbackAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0ZXZscHNucWlzbHJod2hsaHNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDExMzMsImV4cCI6MjA5ODkxNzEzM30.8dCRs4mc-KuOYl6-mLzRXBDpIFXGjvgijqlfzpJfDlA';

const url = import.meta.env.VITE_SUPABASE_URL || fallbackUrl;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackAnonKey;

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
