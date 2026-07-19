import { supabase } from './supabaseClient';
import { normalizeB4Variant, type B4VariantKey } from '../data/b4/variantManifest';
import { notifyChildProfileUpdated } from '../config/activeChildParticipant';
import {
  familyCompatibilityHeaders,
  hasFamilyCompatibilitySession,
} from './familyPortalChildrenApi';
import { readLocalKidPlaySessionId } from './kidPlaySessionService';
import { campCompatibilityHeaders, hasCampCompatibilitySession } from './campChildSessionApi';

export const B4_VARIANT_UPDATED_EVENT = 'b4:variant-updated';

export type B4Preference = {
  variant: B4VariantKey;
  selectionRequired: boolean;
};

const inFlightLoads = new Map<string, Promise<B4Preference>>();

function campKidCompatibilityHeaders(): Record<string, string> {
  const sessionId = readLocalKidPlaySessionId();
  if (!sessionId?.trim() || !hasCampCompatibilitySession()) return {};
  return campCompatibilityHeaders(sessionId);
}

async function request(participantId: string, init?: RequestInit): Promise<B4Preference> {
  const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : null;
  const familyHeaders = hasFamilyCompatibilitySession()
    ? familyCompatibilityHeaders()
    : {};
  const campHeaders = campKidCompatibilityHeaders();
  if (!token && !Object.keys(familyHeaders).length && !Object.keys(campHeaders).length) {
    throw new Error('Sign in or reopen your family session to manage this B-4 choice.');
  }
  const response = await fetch(`/.netlify/functions/portal-b4-variant?participantId=${encodeURIComponent(participantId)}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...familyHeaders,
      ...campHeaders,
      ...init?.headers,
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(response.status === 403 ? 'This participant is not available to this account.' : 'B-4 preference could not be loaded.') as Error & { status?: number; correlationId?: string | null };
    error.status = response.status;
    error.correlationId = response.headers.get('X-Correlation-Id') || body?.correlationId || null;
    throw error;
  }
  if (!body || !['saved', 'onboarding_required'].includes(body.state)) {
    throw new Error('B-4 preference response was invalid.');
  }
  return {
    variant: normalizeB4Variant(body.variant),
    selectionRequired: body.state === 'onboarding_required',
  };
}

export function loadB4Variant(participantId: string): Promise<B4Preference> {
  const id = participantId.trim();
  const existing = inFlightLoads.get(id);
  if (existing) return existing;
  const pending = request(id).finally(() => {
    if (inFlightLoads.get(id) === pending) inFlightLoads.delete(id);
  });
  inFlightLoads.set(id, pending);
  return pending;
}

export async function saveB4Variant(participantId: string, variant: B4VariantKey): Promise<B4VariantKey> {
  const saved = await request(participantId, { method: 'PUT', body: JSON.stringify({ variant }) });
  window.dispatchEvent(new CustomEvent(B4_VARIANT_UPDATED_EVENT, { detail: { participantId, variant: saved.variant, selectionRequired: false } }));
  notifyChildProfileUpdated();
  return saved.variant;
}

export const _test = { campKidCompatibilityHeaders, inFlightLoads };
