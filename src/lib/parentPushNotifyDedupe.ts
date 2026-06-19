const PUSH_NOTIFY_DEDUPE_KEY = 'cc-parent-push-notified';
const MAX_DEDUPE_ENTRIES = 200;

function readDedupeMap(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PUSH_NOTIFY_DEDUPE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeDedupeMap(map: Record<string, number>): void {
  if (typeof window === 'undefined') return;
  try {
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, MAX_DEDUPE_ENTRIES);
    window.localStorage.setItem(PUSH_NOTIFY_DEDUPE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    /* localStorage unavailable */
  }
}

/** Returns true when this event was already notified — prevents replay duplicates. */
export function shouldSkipParentPushNotify(dedupeKey: string): boolean {
  const key = dedupeKey.trim();
  if (!key) return false;
  return Boolean(readDedupeMap()[key]);
}

export function markParentPushNotifySent(dedupeKey: string): void {
  const key = dedupeKey.trim();
  if (!key) return;
  const map = readDedupeMap();
  map[key] = Date.now();
  writeDedupeMap(map);
}

export function buildMissionCompletePushDedupeKey(participantId: string, missionId: string): string {
  return `mission-complete:${participantId.trim()}:${missionId.trim()}`;
}

export function buildRewardReadyPushDedupeKey(participantId: string, rewardKey: string): string {
  return `reward-ready:${participantId.trim()}:${rewardKey.trim()}`;
}

export function buildSessionPausedPushDedupeKey(sessionId: string): string {
  return `session-paused:${sessionId.trim()}`;
}

export function buildSessionEndedPushDedupeKey(sessionId: string): string {
  return `session-ended:${sessionId.trim()}`;
}
