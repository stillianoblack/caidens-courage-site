import { logSessionIsolationWarning } from './sessionIsolationLog';

const LEGACY_GLOBAL_KEYS = [
  'parentClaimEmail',
  'parentClaimPhone',
  'parentClaimLastName',
  'parentClaimConfirmed',
  'activeChildParticipantId',
  'activeChildNickname',
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
