import { detectReturnSessionParentEmailMatch } from './kidPlayReturnSessionVerify';

const FAMILY_SOFT_LOCK_KEY = 'cc-kid-play-family-soft-lock';

export function setKidPlayFamilySoftLocked(locked: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (locked) {
      window.sessionStorage.setItem(FAMILY_SOFT_LOCK_KEY, '1');
    } else {
      window.sessionStorage.removeItem(FAMILY_SOFT_LOCK_KEY);
    }
  } catch {
    /* sessionStorage unavailable */
  }
}

export function isKidPlayFamilySoftLocked(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(FAMILY_SOFT_LOCK_KEY) === '1';
  } catch {
    return false;
  }
}

export function verifyFamilySoftLockParentEmail(email: string): boolean {
  return detectReturnSessionParentEmailMatch(email);
}

export function clearKidPlayFamilySoftLockWithEmail(email: string): boolean {
  if (!verifyFamilySoftLockParentEmail(email)) {
    return false;
  }
  setKidPlayFamilySoftLocked(false);
  return true;
}
