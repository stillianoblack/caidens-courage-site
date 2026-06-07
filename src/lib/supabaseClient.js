import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

if (process.env.NODE_ENV === 'development') {
  console.log('SUPABASE URL EXISTS:', !!supabaseUrl);
  console.log('SUPABASE KEY EXISTS:', !!supabaseAnonKey);
  if (!hasSupabaseEnv) {
    console.warn(
      'Supabase env vars missing. Check .env.local at project root and restart yarn start.',
    );
  }
}

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
export const supabase = hasSupabaseEnv ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function isSupabaseConfigured() {
  return supabase !== null;
}
