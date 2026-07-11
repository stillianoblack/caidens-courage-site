import { isSupabaseConfigured, supabase } from './supabaseClient';

export type CrmView = 'overview' | 'contacts' | 'organizations' | 'classification';

export type CrmApiResult = {
  ok: boolean;
  status: number;
  data?: Record<string, unknown>;
  error?: string;
};

export async function fetchCrmView(view: CrmView, query = ''): Promise<CrmApiResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, status: 503, error: 'Supabase authentication is not configured.' };
  }
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { ok: false, status: 401, error: 'Sign in with an authorized Supabase account.' };
  const endpoint = view === 'classification' ? 'crm-classification-preview' : `crm-${view}`;
  try {
    const response = await fetch(`/.netlify/functions/${endpoint}${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string } & Record<string, unknown>;
    return { ok: response.ok, status: response.status, data: response.ok ? payload : undefined, error: response.ok ? undefined : payload.error || 'CRM request failed.' };
  } catch {
    return { ok: false, status: 503, error: 'CRM service is unavailable.' };
  }
}

export async function fetchCrmRecord(kind: 'contact' | 'organization', id: string): Promise<CrmApiResult> {
  if (!isSupabaseConfigured() || !supabase) return { ok: false, status: 503, error: 'Supabase authentication is not configured.' };
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { ok: false, status: 401, error: 'Sign in with an authorized Supabase account.' };
  try {
    const response = await fetch(`/.netlify/functions/crm-${kind}?id=${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` } });
    const payload = (await response.json().catch(() => ({}))) as { error?: string } & Record<string, unknown>;
    return { ok: response.ok, status: response.status, data: response.ok ? payload : undefined, error: response.ok ? undefined : payload.error || 'CRM request failed.' };
  } catch {
    return { ok: false, status: 503, error: 'CRM service is unavailable.' };
  }
}
