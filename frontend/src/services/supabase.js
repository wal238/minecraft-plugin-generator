import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (supabasePublishableKey?.startsWith('sb_secret_')) {
  throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY must not be a secret key');
}

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn('Supabase not configured — auth features disabled');
}

export const supabase = supabaseUrl && supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;
