import { readActivePilotProgram } from '../config/activePilotProgram';

const ROSTER_LOCK_KEY = 'cc-kid-play-roster-locked';

export function setKidPlayRosterLocked(locked: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (locked) {
      window.sessionStorage.setItem(ROSTER_LOCK_KEY, '1');
    } else {
      window.sessionStorage.removeItem(ROSTER_LOCK_KEY);
    }
  } catch {
    /* sessionStorage unavailable */
  }
}

export function isKidPlayRosterLocked(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(ROSTER_LOCK_KEY) === '1';
  } catch {
    return false;
  }
}

export function verifyFacilitatorRosterUnlockEmail(email: string): boolean {
  const program = readActivePilotProgram();
  const expected = program?.adminEmail?.trim().toLowerCase();
  const entered = email.trim().toLowerCase();
  if (!expected || !entered) return false;
  return entered === expected;
}

export function clearKidPlayRosterLockWithEmail(email: string): boolean {
  if (!verifyFacilitatorRosterUnlockEmail(email)) {
    return false;
  }
  setKidPlayRosterLocked(false);
  return true;
}
