import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const COURAGE_WEEK1_WELCOME_STATE_KEY = 'week-1-courage-welcome-dismissed';

function localStorageKey(participantId: string, stateKey: string): string {
  return `cc-participant-ui:${participantId}:${stateKey}`;
}

function readLocalDismissed(participantId: string, stateKey: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(localStorageKey(participantId, stateKey)) === 'true';
  } catch {
    return false;
  }
}

function writeLocalDismissed(participantId: string, stateKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(localStorageKey(participantId, stateKey), 'true');
  } catch {
    /* ignore */
  }
}

export async function readParticipantUiDismissed(
  stateKey: string,
  explicitParticipantId?: string,
): Promise<boolean> {
  const participantId = explicitParticipantId?.trim() || readActiveChildParticipantId();
  if (!participantId) return false;

  if (readLocalDismissed(participantId, stateKey)) {
    return true;
  }

  if (!isSupabaseConfigured() || !supabase) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('participant_ui_state')
      .select('state_value')
      .eq('participant_id', participantId)
      .eq('state_key', stateKey)
      .maybeSingle();

    if (error) {
      console.warn('[PARTICIPANT_UI_STATE] Read failed — using local fallback', error);
      return readLocalDismissed(participantId, stateKey);
    }

    const dismissed = Boolean(
      data?.state_value &&
        typeof data.state_value === 'object' &&
        (data.state_value as { dismissed?: boolean }).dismissed,
    );

    if (dismissed) {
      writeLocalDismissed(participantId, stateKey);
    }

    return dismissed;
  } catch (err) {
    console.warn('[PARTICIPANT_UI_STATE] Read error — using local fallback', err);
    return readLocalDismissed(participantId, stateKey);
  }
}

export async function saveParticipantUiDismissed(
  stateKey: string,
  explicitParticipantId?: string,
): Promise<void> {
  const participantId = explicitParticipantId?.trim() || readActiveChildParticipantId();
  if (!participantId) return;

  writeLocalDismissed(participantId, stateKey);

  if (!isSupabaseConfigured() || !supabase) {
    return;
  }

  const payload = {
    participant_id: participantId,
    state_key: stateKey,
    state_value: { dismissed: true, dismissed_at: new Date().toISOString() },
    updated_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase.from('participant_ui_state').upsert(payload, {
      onConflict: 'participant_id,state_key',
    });

    if (error) {
      console.warn('[PARTICIPANT_UI_STATE] Save failed — local fallback kept', error);
    }
  } catch (err) {
    console.warn('[PARTICIPANT_UI_STATE] Save error — local fallback kept', err);
  }
}
