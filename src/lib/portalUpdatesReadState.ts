export type PortalUpdatesPortal = 'family' | 'facilitator';

const READ_STATE_PREFIX = 'cc-portal-updates-read';

type PortalUpdatesReadState = {
  readIds: string[];
  lastOpenedAt?: string;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function buildPortalUpdatesReadKey(portal: PortalUpdatesPortal, scopeId: string): string {
  const safeScope = scopeId.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-') || 'default';
  return `${READ_STATE_PREFIX}:${portal}:${safeScope}`;
}

function parseReadState(raw: string): PortalUpdatesReadState {
  try {
    const parsed = JSON.parse(raw) as PortalUpdatesReadState;
    if (!Array.isArray(parsed?.readIds)) return { readIds: [] };
    return {
      readIds: parsed.readIds.filter((id) => typeof id === 'string'),
      lastOpenedAt: parsed.lastOpenedAt,
    };
  } catch {
    return { readIds: [] };
  }
}

export function readPortalUpdatesReadState(
  portal: PortalUpdatesPortal,
  scopeId: string,
): PortalUpdatesReadState {
  if (!isBrowser()) return { readIds: [] };
  try {
    const raw = window.localStorage.getItem(buildPortalUpdatesReadKey(portal, scopeId));
    if (!raw) return { readIds: [] };
    return parseReadState(raw);
  } catch {
    return { readIds: [] };
  }
}

export function writePortalUpdatesReadState(
  portal: PortalUpdatesPortal,
  scopeId: string,
  state: PortalUpdatesReadState,
): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(
      buildPortalUpdatesReadKey(portal, scopeId),
      JSON.stringify({
        readIds: Array.from(new Set(state.readIds)),
        lastOpenedAt: state.lastOpenedAt,
      }),
    );
  } catch {
    /* localStorage unavailable */
  }
}

export function markPortalUpdatesRead(
  portal: PortalUpdatesPortal,
  scopeId: string,
  updateIds: string[],
): void {
  if (!updateIds.length) return;
  const current = readPortalUpdatesReadState(portal, scopeId);
  const merged = new Set([...current.readIds, ...updateIds]);
  writePortalUpdatesReadState(portal, scopeId, {
    readIds: Array.from(merged),
    lastOpenedAt: new Date().toISOString(),
  });
}

export function isPortalUpdateRead(
  portal: PortalUpdatesPortal,
  scopeId: string,
  updateId: string,
): boolean {
  return readPortalUpdatesReadState(portal, scopeId).readIds.includes(updateId);
}

export function countUnreadPortalUpdates(
  portal: PortalUpdatesPortal,
  scopeId: string,
  updateIds: string[],
): number {
  const readIds = new Set(readPortalUpdatesReadState(portal, scopeId).readIds);
  return updateIds.filter((id) => !readIds.has(id)).length;
}

export function clearPortalUpdatesReadState(portal: PortalUpdatesPortal, scopeId: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(buildPortalUpdatesReadKey(portal, scopeId));
  } catch {
    /* localStorage unavailable */
  }
}
