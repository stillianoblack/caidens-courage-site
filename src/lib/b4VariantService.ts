import { supabase } from './supabaseClient';
import { normalizeB4Variant, type B4VariantKey } from '../data/b4/variantManifest';
import { notifyChildProfileUpdated } from '../config/activeChildParticipant';
import {
  familyCompatibilityHeaders,
  hasFamilyCompatibilitySession,
} from './familyPortalChildrenApi';

export const B4_VARIANT_UPDATED_EVENT = 'b4:variant-updated';

export type B4Preference = {
  variant: B4VariantKey;
  selectionRequired: boolean;
};

async function request(participantId: string, init?: RequestInit): Promise<B4Preference> {
  const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : null;
  const compatibilityHeaders = !token && hasFamilyCompatibilitySession()
    ? familyCompatibilityHeaders()
    : {};
  if (!token && !Object.keys(compatibilityHeaders).length) {
    throw new Error('Sign in or reopen your family session to manage this B-4 choice.');
  }
  const response = await fetch(`/.netlify/functions/portal-b4-variant?participantId=${encodeURIComponent(participantId)}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : compatibilityHeaders),
      ...init?.headers,
    },
  });
  if (!response.ok) throw new Error(response.status === 403 ? 'This participant is not available to this account.' : 'B-4 preference could not be loaded.');
  const body = await response.json();
  return {
    variant: normalizeB4Variant(body.variant),
    selectionRequired: Boolean(body.selectionRequired),
  };
}

export function loadB4Variant(participantId: string): Promise<B4Preference> {
  return request(participantId);
}

export async function saveB4Variant(participantId: string, variant: B4VariantKey): Promise<B4VariantKey> {
  const saved = await request(participantId, { method: 'PUT', body: JSON.stringify({ variant }) });
  window.dispatchEvent(new CustomEvent(B4_VARIANT_UPDATED_EVENT, { detail: { participantId, variant: saved.variant, selectionRequired: false } }));
  notifyChildProfileUpdated();
  return saved.variant;
}
