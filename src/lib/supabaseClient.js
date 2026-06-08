import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const hasSupabaseEnv = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('.supabase.co'),
);

if (process.env.NODE_ENV === 'development') {
  console.log('SUPABASE_CONFIG_READY', hasSupabaseEnv);
  if (!hasSupabaseEnv) {
    console.warn(
      'Supabase env vars missing or invalid. Check .env.local at project root and restart yarn start.',
    );
  }
}

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
export const supabase = hasSupabaseEnv ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function isSupabaseConfigured() {
  return supabase !== null;
}

/** True when REACT_APP_SUPABASE_URL + REACT_APP_SUPABASE_ANON_KEY are present and valid. */
export function isSupabaseConfigReady() {
  return hasSupabaseEnv;
}
