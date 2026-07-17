import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  inferDeviceModeFromSessionSource,
  logKidPlaySessionContext,
  resolveKidPlaySessionBehaviorFromRow,
} from './kidPlaySessionContext';
import type {
  CreateKidPlaySessionInput,
  EndKidPlaySessionInput,
  KidPlaySessionRow,
} from './kidPlaySessionTypes';
import { notifyPortalSessionChanged } from './portalSessionEvents';
import { hasFamilyCompatibilitySession } from './familyPortalChildrenApi';
import {
  endFamilyCompatibilityChildSession,
  getFamilyCompatibilityChildSession,
  updateFamilyCompatibilityChildSession,
} from './familyChildSessionApi';

const KID_PLAY_SESSIONS_TABLE = 'kid_play_sessions';
const LOCAL_SESSION_ID_KEY = 'cc-kid-play-session-id';

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeRow(row: Record<string, unknown>): KidPlaySessionRow {
  return {
    id: String(row.id),
    child_id: String(row.child_id),
    participant_id: row.participant_id ? String(row.participant_id) : null,
    organization_id: row.organization_id ? String(row.organization_id) : null,
    launched_by_user_id: row.launched_by_user_id ? String(row.launched_by_user_id) : null,
    session_source: row.session_source as KidPlaySessionRow['session_source'],
    device_mode: row.device_mode as KidPlaySessionRow['device_mode'],
    status: row.status as KidPlaySessionRow['status'],
    started_at: String(row.started_at),
    last_activity_at: String(row.last_activity_at),
    ended_at: row.ended_at ? String(row.ended_at) : null,
    ended_reason: row.ended_reason ? String(row.ended_reason) : null,
    device_label: row.device_label ? String(row.device_label) : null,
    resume_payload:
      row.resume_payload && typeof row.resume_payload === 'object'
        ? (row.resume_payload as Record<string, unknown>)
        : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function readLocalKidPlaySessionId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_SESSION_ID_KEY)?.trim();
    return raw || null;
  } catch {
    return null;
  }
}

export function writeLocalKidPlaySessionId(sessionId: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (sessionId?.trim()) {
      window.localStorage.setItem(LOCAL_SESSION_ID_KEY, sessionId.trim());
    } else {
      window.localStorage.removeItem(LOCAL_SESSION_ID_KEY);
    }
    notifyPortalSessionChanged('kid_play_session_id_write');
  } catch {
    /* localStorage unavailable */
  }
}

export async function getKidPlaySessionById(sessionId: string): Promise<KidPlaySessionRow | null> {
  return fetchSessionById(sessionId);
}

export async function findActiveKidPlaySessionForChild(
  childId: string,
): Promise<KidPlaySessionRow | null> {
  const trimmedChildId = childId.trim();
  if (!trimmedChildId || !isSupabaseConfigured() || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from(KID_PLAY_SESSIONS_TABLE)
    .select('*')
    .eq('child_id', trimmedChildId)
    .eq('status', 'active')
    .order('last_activity_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('[KID_PLAY_SESSION] active lookup failed', error);
    return null;
  }
  if (!data) return null;
  return normalizeRow(data as Record<string, unknown>);
}

async function fetchSessionById(sessionId: string): Promise<KidPlaySessionRow | null> {
  if (hasFamilyCompatibilitySession()) {
    try {
      return await getFamilyCompatibilityChildSession(sessionId);
    } catch {
      return null;
    }
  }
  if (!supabase) return null;
  const { data, error } = await supabase
    .from(KID_PLAY_SESSIONS_TABLE)
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();

  if (error) {
    console.warn('[KID_PLAY_SESSION] fetch failed', error);
    return null;
  }
  if (!data) return null;
  return normalizeRow(data as Record<string, unknown>);
}

async function endActiveSessionsForChild(
  childId: string,
  reason: string,
  exceptSessionId?: string,
): Promise<void> {
  if (!supabase) return;

  let query = supabase
    .from(KID_PLAY_SESSIONS_TABLE)
    .update({
      status: 'ended',
      ended_at: nowIso(),
      ended_reason: reason,
      updated_at: nowIso(),
    })
    .eq('child_id', childId)
    .eq('status', 'active');

  if (exceptSessionId) {
    query = query.neq('id', exceptSessionId);
  }

  const { error } = await query;
  if (error) {
    console.warn('[KID_PLAY_SESSION_END] bulk end failed', error);
  }
}

export async function createKidPlaySession(
  input: CreateKidPlaySessionInput,
): Promise<KidPlaySessionRow | null> {
  const childId = input.childId.trim();
  if (!childId || !isSupabaseConfigured() || !supabase) {
    return null;
  }

  const sessionSource = input.sessionSource;
  const deviceMode = input.deviceMode ?? inferDeviceModeFromSessionSource(sessionSource);
  const timestamp = nowIso();

  await endActiveSessionsForChild(childId, 'superseded_by_new_session');

  const insertRow = {
    child_id: childId,
    participant_id: input.participantId?.trim() || childId,
    organization_id: input.organizationId?.trim() || null,
    launched_by_user_id: input.launchedByUserId?.trim() || null,
    session_source: sessionSource,
    device_mode: deviceMode,
    status: 'active',
    started_at: timestamp,
    last_activity_at: timestamp,
    device_label: input.deviceLabel?.trim() || null,
    resume_payload: input.resumePayload ?? null,
    updated_at: timestamp,
  };

  const { data, error } = await supabase
    .from(KID_PLAY_SESSIONS_TABLE)
    .insert(insertRow)
    .select('*')
    .single();

  if (error || !data) {
    console.warn('[KID_PLAY_SESSION_CREATE] insert failed', error);
    return null;
  }

  const session = normalizeRow(data as Record<string, unknown>);
  writeLocalKidPlaySessionId(session.id);

  const behavior = resolveKidPlaySessionBehaviorFromRow(session);
  console.info('[KID_PLAY_SESSION_CREATE]', {
    sessionId: session.id,
    childId: session.child_id,
    sessionSource: session.session_source,
    deviceMode: session.device_mode,
    strictTimeout: behavior.strictTimeout,
    softReturn: behavior.softReturn,
  });
  logKidPlaySessionContext(session, behavior);

  return session;
}

export async function getActiveKidPlaySession(
  explicitSessionId?: string | null,
): Promise<KidPlaySessionRow | null> {
  const sessionId = explicitSessionId?.trim() || readLocalKidPlaySessionId();
  if (!sessionId || !isSupabaseConfigured()) {
    return null;
  }

  const session = await fetchSessionById(sessionId);
  if (!session || session.status !== 'active') {
    if (readLocalKidPlaySessionId() === sessionId) {
      writeLocalKidPlaySessionId(null);
    }
    return null;
  }

  logKidPlaySessionContext(session, resolveKidPlaySessionBehaviorFromRow(session));
  return session;
}

export async function updateKidPlaySessionActivity(
  sessionIdInput?: string | null,
  resumePayload?: Record<string, unknown> | null,
): Promise<KidPlaySessionRow | null> {
  const sessionId = sessionIdInput?.trim() || readLocalKidPlaySessionId();
  if (!sessionId || !isSupabaseConfigured() || !supabase) {
    return null;
  }

  if (hasFamilyCompatibilitySession()) {
    try {
      return await updateFamilyCompatibilityChildSession(sessionId, resumePayload);
    } catch {
      return null;
    }
  }

  const timestamp = nowIso();
  const patch: Record<string, unknown> = {
    last_activity_at: timestamp,
    updated_at: timestamp,
  };
  if (resumePayload) {
    patch.resume_payload = resumePayload;
  }

  const { data, error } = await supabase
    .from(KID_PLAY_SESSIONS_TABLE)
    .update(patch)
    .eq('id', sessionId)
    .eq('status', 'active')
    .select('*')
    .maybeSingle();

  if (error) {
    console.warn('[KID_PLAY_SESSION_ACTIVITY] update failed', error);
    return null;
  }
  if (!data) {
    return null;
  }

  const session = normalizeRow(data as Record<string, unknown>);
  console.info('[KID_PLAY_SESSION_ACTIVITY]', {
    sessionId: session.id,
    childId: session.child_id,
    sessionSource: session.session_source,
    deviceMode: session.device_mode,
  });

  return session;
}

export async function endKidPlaySession(
  input: EndKidPlaySessionInput,
): Promise<KidPlaySessionRow | null> {
  const sessionId = input.sessionId.trim();
  if (!sessionId || !isSupabaseConfigured() || !supabase) {
    return null;
  }

  if (hasFamilyCompatibilitySession()) {
    try {
      const session = await endFamilyCompatibilityChildSession(sessionId, input.reason);
      if (readLocalKidPlaySessionId() === sessionId) writeLocalKidPlaySessionId(null);
      return session;
    } catch {
      return null;
    }
  }

  const timestamp = nowIso();
  const status = input.status ?? 'ended';

  const { data, error } = await supabase
    .from(KID_PLAY_SESSIONS_TABLE)
    .update({
      status,
      ended_at: timestamp,
      ended_reason: input.reason,
      updated_at: timestamp,
    })
    .eq('id', sessionId)
    .eq('status', 'active')
    .select('*')
    .maybeSingle();

  if (error) {
    console.warn('[KID_PLAY_SESSION_END] update failed', error);
    return null;
  }

  if (readLocalKidPlaySessionId() === sessionId) {
    writeLocalKidPlaySessionId(null);
  }

  if (!data) {
    return null;
  }

  const session = normalizeRow(data as Record<string, unknown>);
  console.info('[KID_PLAY_SESSION_END]', {
    sessionId: session.id,
    childId: session.child_id,
    sessionSource: session.session_source,
    deviceMode: session.device_mode,
    status: session.status,
    reason: input.reason,
  });

  return session;
}

/**
 * Resume an existing active session on this device, or re-activate after move.
 * Ends other active sessions for the same child on other logical devices.
 */
export async function moveKidPlaySessionToThisDevice(
  sessionId: string,
  childId: string,
): Promise<KidPlaySessionRow | null> {
  const trimmedSessionId = sessionId.trim();
  const trimmedChildId = childId.trim();
  if (!trimmedSessionId || !trimmedChildId || !isSupabaseConfigured() || !supabase) {
    return null;
  }

  const existing = await fetchSessionById(trimmedSessionId);
  if (!existing) {
    return null;
  }

  if (existing.status === 'active' && existing.child_id === trimmedChildId) {
    await endActiveSessionsForChild(trimmedChildId, 'moved_to_other_device', trimmedSessionId);
    writeLocalKidPlaySessionId(trimmedSessionId);
    const touched = await updateKidPlaySessionActivity(trimmedSessionId);
    logKidPlaySessionContext(
      touched ?? existing,
      resolveKidPlaySessionBehaviorFromRow(existing),
      { action: 'move_resume_active' },
    );
    return touched ?? existing;
  }

  const timestamp = nowIso();
  await endActiveSessionsForChild(trimmedChildId, 'moved_to_this_device');

  const { data, error } = await supabase
    .from(KID_PLAY_SESSIONS_TABLE)
    .update({
      status: 'active',
      child_id: trimmedChildId,
      last_activity_at: timestamp,
      updated_at: timestamp,
      ended_at: null,
      ended_reason: null,
    })
    .eq('id', trimmedSessionId)
    .select('*')
    .maybeSingle();

  if (error || !data) {
    console.warn('[KID_PLAY_SESSION] move to device failed', error);
    return null;
  }

  const session = normalizeRow(data as Record<string, unknown>);
  writeLocalKidPlaySessionId(session.id);
  logKidPlaySessionContext(session, resolveKidPlaySessionBehaviorFromRow(session), {
    action: 'move_reactivated',
  });

  return session;
}

export {
  inferDeviceModeFromSessionSource,
  logKidPlaySessionContext,
  resolveKidPlaySessionBehavior,
  resolveKidPlaySessionBehaviorFromRow,
} from './kidPlaySessionContext';
