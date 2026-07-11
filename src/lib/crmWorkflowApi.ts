import { isSupabaseConfigured, supabase } from './supabaseClient';

async function token(): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

export async function postCrmWorkflow(endpoint: string, payload: Record<string, unknown>) {
  const accessToken = await token();
  if (!accessToken) return { ok: false, status: 401, error: 'Sign in with an authorized Supabase account.' };
  try {
    const response = await fetch(`/.netlify/functions/${endpoint}`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data, error: response.ok ? undefined : data.error || 'CRM request failed.' };
  } catch { return { ok: false, status: 503, error: 'CRM service unavailable.' }; }
}

export async function getCrmActivities() {
  const accessToken = await token();
  if (!accessToken) return { ok: false, status: 401, error: 'Sign in with an authorized Supabase account.' };
  try {
    const response = await fetch('/.netlify/functions/crm-activities', { headers: { Authorization: `Bearer ${accessToken}` } });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data, error: response.ok ? undefined : data.error || 'CRM request failed.' };
  } catch { return { ok: false, status: 503, error: 'CRM service unavailable.' }; }
}
