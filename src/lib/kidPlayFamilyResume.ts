import type { KidPlayResumePayload } from './kidPlaySessionResume';

const FAMILY_RESUME_KEY = 'cc-kid-play-family-resume';

export function writeKidPlayFamilyResumePayload(payload: KidPlayResumePayload): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(FAMILY_RESUME_KEY, JSON.stringify(payload));
  } catch {
    /* sessionStorage unavailable */
  }
}

export function readKidPlayFamilyResumePayload(): KidPlayResumePayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(FAMILY_RESUME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as KidPlayResumePayload;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function clearKidPlayFamilyResumePayload(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(FAMILY_RESUME_KEY);
  } catch {
    /* sessionStorage unavailable */
  }
}

/** Swap session id in a stored kid shell route after a new session is created. */
export function remapKidPlayResumeRoute(
  resumeRoute: string | undefined,
  newSessionId: string,
): string | null {
  if (!resumeRoute?.trim()) return null;
  const trimmed = resumeRoute.trim();
  const queryIndex = trimmed.indexOf('?');
  const hashIndex = trimmed.indexOf('#');
  const pathEnd = Math.min(
    queryIndex >= 0 ? queryIndex : trimmed.length,
    hashIndex >= 0 ? hashIndex : trimmed.length,
  );
  const path = trimmed.slice(0, pathEnd);
  const suffix = trimmed.slice(pathEnd);
  const match = /^\/play\/session\/[^/]+(\/.*)?$/.exec(path);
  if (!match) return null;
  return `/play/session/${newSessionId.trim()}${match[1] ?? ''}${suffix}`;
}
