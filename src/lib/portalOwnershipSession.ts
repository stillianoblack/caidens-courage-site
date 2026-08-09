import { supabase } from './supabaseClient';
import { ENABLE_PORTAL_AUTH_OWNERSHIP } from '../config/featureFlags';

export interface PortalOwnershipSession {
  memberships: Array<{ programId: string; role: 'family_guardian' | 'student' | 'facilitator'; compatibilityMode: boolean }>;
  participantAccess: Array<{ participantId: string; scope: 'self' | 'guardian' | 'facilitator' }>;
}

export async function loadPortalOwnershipSession(): Promise<PortalOwnershipSession | null> {
  if (!ENABLE_PORTAL_AUTH_OWNERSHIP) return null;
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return null;
  const response = await fetch('/.netlify/functions/portal-ownership-session', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 401 || response.status === 403 || response.status === 404) return null;
  if (!response.ok) throw new Error('Portal authorization could not be loaded.');
  return response.json();
}
