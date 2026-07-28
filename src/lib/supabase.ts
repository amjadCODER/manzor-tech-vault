import { createClient } from '@supabase/supabase-js';

const fallbackUrl = 'https://udasfetzhftousewwtwp.supabase.co';
const fallbackAnonKey = 'sb_publishable_qKBo6Nd1Her3KWFCUBPUJw_CniAY8c5';

const url = import.meta.env.VITE_SUPABASE_URL || fallbackUrl;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackAnonKey;

/**
 * Vault uses a dedicated PostgreSQL schema inside the shared Mail Sender
 * Supabase project. Storage remains project-wide and uses the vault-files bucket.
 */
export const supabase = createClient(url, anonKey, {
  db: { schema: 'manzor_vault' },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
