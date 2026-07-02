import { isKidPlayFamilySoftLocked } from './kidPlayFamilySoftLock';
import { readKidPlayFamilyResumePayload } from './kidPlayFamilyResume';
import { readLocalKidPlaySessionId } from './kidPlaySessionService';

/** True when the app runs as an installed PWA / standalone display mode. */
export function isStandaloneDisplayMode(): boolean {
  if (typeof window === 'undefined') return false;

  const standaloneMq =
    typeof window.matchMedia === 'function' &&
    Boolean(window.matchMedia('(display-mode: standalone)')?.matches);

  const iosStandalone =
    'standalone' in window.navigator &&
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

  return standaloneMq || iosStandalone;
}

/** Paused kid shell session (idle timeout soft lock or stored resume payload). */
export function hasPausedKidPlaySession(): boolean {
  return isKidPlayFamilySoftLocked() || Boolean(readKidPlayFamilyResumePayload());
}

/** Any resumable or in-progress kid play session on this device. */
export function hasActiveChildPlaySession(): boolean {
  return hasPausedKidPlaySession() || Boolean(readLocalKidPlaySessionId());
}
