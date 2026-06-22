import {
  PARENT_CLAIM_CONFIRMED_KEY,
  PARENT_CLAIM_EMAIL_KEY,
  PARENT_CLAIM_LAST_NAME_KEY,
  PARENT_CLAIM_PHONE_KEY,
} from '../config/parentClaimContext';
import { ACTIVE_CHILD_NICKNAME_KEY } from '../config/activeChildNickname';
import { ACTIVE_CHILD_PARTICIPANT_ID_KEY } from '../config/activeChildEvents';
import { logSessionIsolationWarning } from './sessionIsolationLog';

const LEGACY_GLOBAL_KEYS = [
  PARENT_CLAIM_EMAIL_KEY,
  PARENT_CLAIM_PHONE_KEY,
  PARENT_CLAIM_LAST_NAME_KEY,
  PARENT_CLAIM_CONFIRMED_KEY,
  ACTIVE_CHILD_PARTICIPANT_ID_KEY,
  ACTIVE_CHILD_NICKNAME_KEY,
  'lastPilotProgram',
  'program_code',
  'program_name',
  'selectedPilot',
  'activePilot',
  'caidens-courage-b4-baseline-check',
  'caidens-courage-week0-assessment',
] as const;

/** Remove retired global identity keys that can bleed across students/programs. */
export function purgeLegacyIdentityStorage(reason: string): void {
  if (typeof window === 'undefined') return;
  try {
    for (const key of LEGACY_GLOBAL_KEYS) {
      if (window.localStorage.getItem(key) !== null) {
        logSessionIsolationWarning('legacy_identity_key_purged', { key, reason });
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    /* localStorage unavailable */
  }
}
