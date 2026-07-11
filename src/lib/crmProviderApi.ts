import { isSupabaseConfigured, supabase } from './supabaseClient';

async function accessToken() { if (!isSupabaseConfigured() || !supabase) return null; const { data } = await supabase.auth.getSession(); return data.session?.access_token || null; }
export async function getProviderView(endpoint: string) {
  const token = await accessToken(); if (!token) return { ok: false, error: 'Sign in with an authorized Supabase account.' };
  try { const response = await fetch(`/.netlify/functions/${endpoint}`, { headers: { Authorization: `Bearer ${token}` } }); const data = await response.json().catch(() => ({})); return { ok: response.ok, data, error: response.ok ? undefined : data.error || 'Provider view unavailable.' }; }
  catch { return { ok: false, error: 'Provider service unavailable.' }; }
}
export async function postProviderAction(payload: Record<string, unknown>) {
  const token = await accessToken(); if (!token) return { ok: false, error: 'Sign in with an authorized Supabase account.' };
  try { const response = await fetch('/.netlify/functions/crm-provider-actions', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const data = await response.json().catch(() => ({})); return { ok: response.ok, data, error: response.ok ? undefined : data.error || 'Provider action unavailable.' }; }
  catch { return { ok: false, error: 'Provider service unavailable.' }; }
}
