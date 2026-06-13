const STORAGE_PREFIX = 'cc-monthly-coins';

function storageKey(participantId: string, monthAnchor = new Date().toISOString().slice(0, 7)): string {
  return `${STORAGE_PREFIX}-${participantId}-${monthAnchor}`;
}

export function readMonthlyCoinsEarned(participantId: string | null | undefined): number {
  if (!participantId || typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(storageKey(participantId));
    const parsed = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function trackMonthlyCoinsEarned(participantId: string, coins: number): void {
  if (!participantId || coins <= 0 || typeof window === 'undefined') return;
  try {
    const key = storageKey(participantId);
    const current = readMonthlyCoinsEarned(participantId);
    window.localStorage.setItem(key, String(current + coins));
  } catch {
    /* ignore */
  }
}
