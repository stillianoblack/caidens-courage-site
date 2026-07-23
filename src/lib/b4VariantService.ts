import { supabase } from './supabaseClient';
import { normalizeB4Variant, type B4VariantKey } from '../data/b4/variantManifest';
import { notifyChildProfileUpdated } from '../config/activeChildParticipant';
import {
  familyCompatibilityHeaders,
  hasFamilyCompatibilitySession,
} from './familyPortalChildrenApi';
import {
  readLocalKidPlaySessionId,
  writeLocalKidPlaySessionId,
} from './kidPlaySessionService';
import {
  campCompatibilityHeaders,
  getCampCompatibilityChildSession,
  hasCampCompatibilitySession,
  launchCampCompatibilityChildSession,
} from './campChildSessionApi';
import {
  getFamilyCompatibilityChildSession,
  launchFamilyCompatibilityChildSession,
} from './familyChildSessionApi';

export const B4_VARIANT_UPDATED_EVENT = 'b4:variant-updated';

export type B4Preference = {
  variant: B4VariantKey;
  selectionRequired: boolean;
};

const inFlightLoads = new Map<string, Promise<B4Preference>>();
const inFlightSessionRecovery = new Map<string, Promise<void>>();
const preferenceCache = new Map<string, B4Preference>();
const B4_CACHE_PREFIX = 'kid-play:b4-preference:';
const B4_REQUEST_TIMEOUT_MS = 12_000;

type B4RequestError = Error & { status?: number; correlationId?: string | null };

function cacheKey(participantId: string): string {
  return `${B4_CACHE_PREFIX}${participantId}`;
}

function writeCachedB4Preference(participantId: string, preference: B4Preference): void {
  const id = participantId.trim();
  if (!id) return;
  preferenceCache.set(id, preference);
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(cacheKey(id), JSON.stringify(preference));
  } catch {
    // The in-memory cache still protects route changes when storage is unavailable.
  }
}

export function readCachedB4Preference(participantId?: string | null): B4Preference | null {
  const id = participantId?.trim();
  if (!id) return null;
  const memory = preferenceCache.get(id);
  if (memory) return memory;
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(cacheKey(id)) || 'null');
    if (
      parsed &&
      typeof parsed.variant === 'string' &&
      typeof parsed.selectionRequired === 'boolean'
    ) {
      const preference = {
        variant: normalizeB4Variant(parsed.variant),
        selectionRequired: parsed.selectionRequired,
      };
      preferenceCache.set(id, preference);
      return preference;
    }
  } catch {
    // Ignore malformed or unavailable session storage and perform a foreground load.
  }
  return null;
}

function sessionMatchesParticipant(
  session: { participant_id?: string | null; child_id?: string | null; status?: string | null },
  participantId: string,
): boolean {
  return (
    session.status === 'active' &&
    (session.participant_id === participantId || session.child_id === participantId)
  );
}

async function refreshExpiredSupabaseSession(): Promise<void> {
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) return;
  const expiresAtMs = (session.expires_at ?? 0) * 1000;
  if (expiresAtMs > Date.now() + 30_000) return;
  const { error } = await supabase.auth.refreshSession();
  if (error) throw error;
}

async function ensureCompatibilitySession(participantId: string, force = false): Promise<void> {
  const key = `${participantId}:${force ? 'renew' : 'validate'}`;
  const existing = inFlightSessionRecovery.get(key);
  if (existing) return existing;

  const pending = (async () => {
    await refreshExpiredSupabaseSession();
    const localSessionId = readLocalKidPlaySessionId();

    if (hasFamilyCompatibilitySession()) {
      if (!force && localSessionId) {
        try {
          const session = await getFamilyCompatibilityChildSession(localSessionId);
          if (sessionMatchesParticipant(session, participantId)) return;
        } catch {
          // The compatibility session expired or belongs to a prior child; replace it below.
        }
      }
      const result = await launchFamilyCompatibilityChildSession(participantId);
      if (readLocalKidPlaySessionId() !== result.session.id) {
        writeLocalKidPlaySessionId(result.session.id);
      }
      return;
    }

    if (hasCampCompatibilitySession()) {
      if (!force && localSessionId) {
        try {
          const session = await getCampCompatibilityChildSession(localSessionId);
          if (sessionMatchesParticipant(session, participantId)) return;
        } catch {
          // The facilitator session is stale; the server will safely create or reuse one below.
        }
      }
      const result = await launchCampCompatibilityChildSession({
        participantId,
        localSessionId,
      });
      if (readLocalKidPlaySessionId() !== result.session.id) {
        writeLocalKidPlaySessionId(result.session.id);
      }
    }
  })().finally(() => {
    if (inFlightSessionRecovery.get(key) === pending) inFlightSessionRecovery.delete(key);
  });

  inFlightSessionRecovery.set(key, pending);
  return pending;
}

function campKidCompatibilityHeaders(): Record<string, string> {
  const sessionId = readLocalKidPlaySessionId();
  if (!sessionId?.trim() || !hasCampCompatibilitySession()) return {};
  return campCompatibilityHeaders(sessionId);
}

async function requestOnce(participantId: string, init?: RequestInit): Promise<B4Preference> {
  const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : null;
  const familyHeaders = hasFamilyCompatibilitySession()
    ? familyCompatibilityHeaders()
    : {};
  const campHeaders = campKidCompatibilityHeaders();
  if (!token && !Object.keys(familyHeaders).length && !Object.keys(campHeaders).length) {
    throw new Error('Sign in or reopen your family session to manage this B-4 choice.');
  }
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort();
  init?.signal?.addEventListener('abort', abortFromCaller, { once: true });
  const timeout = window.setTimeout(() => controller.abort(), B4_REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(
      `/.netlify/functions/portal-b4-variant?participantId=${encodeURIComponent(participantId)}`,
      {
        ...init,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...familyHeaders,
          ...campHeaders,
          ...init?.headers,
        },
      },
    );
  } finally {
    window.clearTimeout(timeout);
    init?.signal?.removeEventListener('abort', abortFromCaller);
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(response.status === 403 ? 'This participant is not available to this account.' : 'B-4 preference could not be loaded.') as B4RequestError;
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

function shouldRetryAfterSessionRecovery(error: unknown): boolean {
  const status = (error as B4RequestError | null)?.status;
  return status == null || status === 401 || status === 403 || status === 408 || status === 429 || status >= 500;
}

async function request(participantId: string, init?: RequestInit): Promise<B4Preference> {
  await ensureCompatibilitySession(participantId);
  try {
    return await requestOnce(participantId, init);
  } catch (error) {
    if (!shouldRetryAfterSessionRecovery(error)) throw error;
    await ensureCompatibilitySession(participantId, true);
    return requestOnce(participantId, init);
  }
}

export function loadB4Variant(participantId: string): Promise<B4Preference> {
  const id = participantId.trim();
  const existing = inFlightLoads.get(id);
  if (existing) return existing;
  const pending = request(id)
    .then((preference) => {
      writeCachedB4Preference(id, preference);
      return preference;
    })
    .finally(() => {
      if (inFlightLoads.get(id) === pending) inFlightLoads.delete(id);
    });
  inFlightLoads.set(id, pending);
  return pending;
}

export async function saveB4Variant(participantId: string, variant: B4VariantKey): Promise<B4VariantKey> {
  const saved = await request(participantId, { method: 'PUT', body: JSON.stringify({ variant }) });
  writeCachedB4Preference(participantId, {
    variant: saved.variant,
    selectionRequired: false,
  });
  window.dispatchEvent(new CustomEvent(B4_VARIANT_UPDATED_EVENT, { detail: { participantId, variant: saved.variant, selectionRequired: false } }));
  notifyChildProfileUpdated();
  return saved.variant;
}

export const _test = {
  campKidCompatibilityHeaders,
  ensureCompatibilitySession,
  inFlightLoads,
  inFlightSessionRecovery,
  preferenceCache,
  readCachedB4Preference,
  B4_REQUEST_TIMEOUT_MS,
  refreshExpiredSupabaseSession,
  sessionMatchesParticipant,
  shouldRetryAfterSessionRecovery,
};
