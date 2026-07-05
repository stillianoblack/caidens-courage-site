import {
  FAMILY_HUB_KIDS_BASE,
  FAMILY_HUB_PATH,
  FAMILY_PORTAL_PATH,
  KID_PLAY_SESSION_PATH,
  KIDS_PORTAL_PATH,
  PROGRAM_DASHBOARD_KIDS_BASE,
} from '../config/courageRoutes';

export type KidPlayShellModuleId =
  | 'weekly-adventures'
  | 'collections'
  | 'inventory'
  | 'character-hub'
  | 'arcade'
  | 'rewards'
  | 'review';

export type KidPlayShellRouteParams = {
  characterId?: string;
  missionId?: string;
  questId?: string;
  week?: number;
  search?: string;
};

const PORTAL_KIDS_BASES = [
  FAMILY_HUB_KIDS_BASE,
  PROGRAM_DASHBOARD_KIDS_BASE,
  KIDS_PORTAL_PATH,
] as const;

export function isKidPlayShellPath(pathname?: string | null): boolean {
  const path = pathname?.trim() ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  return path.startsWith(`${KID_PLAY_SESSION_PATH}/`);
}

export function parseKidPlayShellPath(pathname: string): { sessionId: string } | null {
  const match = /^\/play\/session\/([^/]+)/.exec(pathname.trim());
  if (!match?.[1]) return null;
  return { sessionId: match[1] };
}

export function getKidPlayShellKidsBase(sessionId: string): string {
  const id = sessionId.trim();
  return `${KID_PLAY_SESSION_PATH}/${id}/kids`;
}

export function getKidPlayShellRoute(
  sessionId: string,
  module: KidPlayShellModuleId | 'kids',
  params: KidPlayShellRouteParams = {},
): string {
  const id = sessionId.trim();
  const base = `${KID_PLAY_SESSION_PATH}/${id}`;

  if (module === 'kids') {
    const characterId = params.characterId?.trim();
    const missionOrQuest = params.missionId?.trim() || params.questId?.trim();
    if (characterId && missionOrQuest) {
      return `${base}/kids/${characterId}/${missionOrQuest}${params.search ?? ''}`;
    }
    if (characterId) {
      return `${base}/kids/${characterId}${params.search ?? ''}`;
    }
    return `${base}/kids`;
  }

  if (module === 'character-hub') {
    return `${base}/characters`;
  }

  if (module === 'inventory' || module === 'collections') {
    return `${base}/collections`;
  }

  if (module === 'review' || module === 'weekly-adventures') {
    const search = params.search ?? (params.week ? `?week=${params.week}` : '');
    return `${base}/weekly-adventures${search}`;
  }

  return `${base}/${module}`;
}

/** Remap portal kids routes to stay inside the active kid play shell. */
export function remapRouteToKidPlayShell(route: string, pathname: string): string {
  const ctx = parseKidPlayShellPath(pathname);
  if (!ctx) return route;

  const trimmed = route.trim();
  if (trimmed.startsWith(`${KID_PLAY_SESSION_PATH}/`)) {
    return trimmed;
  }

  for (const portalBase of PORTAL_KIDS_BASES) {
    if (trimmed === portalBase || trimmed.startsWith(`${portalBase}/`)) {
      const remapped = `${getKidPlayShellKidsBase(ctx.sessionId)}${trimmed.slice(portalBase.length)}`;
      logKidShellRoute('remap_portal_kids', { from: trimmed, to: remapped, sessionId: ctx.sessionId });
      return remapped;
    }
  }

  if (trimmed.startsWith(`${FAMILY_HUB_PATH}/`) && !trimmed.startsWith(FAMILY_HUB_KIDS_BASE)) {
    const suffix = trimmed.slice(FAMILY_HUB_PATH.length);
    const shellBase = `${KID_PLAY_SESSION_PATH}/${ctx.sessionId}`;
    if (suffix === '/inventory' || suffix.startsWith('/inventory') || suffix === '/collections' || suffix.startsWith('/collections')) {
      return `${shellBase}/collections`;
    }
    if (suffix === '/weekly-adventures' || suffix === '/continue-learning') {
      return `${shellBase}/weekly-adventures`;
    }
    if (suffix.startsWith('/characters')) {
      return `${shellBase}/characters${suffix.slice('/characters'.length)}`;
    }
  }

  if (trimmed.startsWith(`${FAMILY_PORTAL_PATH}/`) && !trimmed.startsWith(KIDS_PORTAL_PATH)) {
    const suffix = trimmed.slice(FAMILY_PORTAL_PATH.length);
    const shellBase = `${KID_PLAY_SESSION_PATH}/${ctx.sessionId}`;
    if (suffix === '/inventory' || suffix.startsWith('/inventory') || suffix === '/collections' || suffix.startsWith('/collections')) {
      return `${shellBase}/collections`;
    }
    if (suffix === '/weekly-adventures' || suffix === '/continue-learning') {
      return `${shellBase}/weekly-adventures`;
    }
  }

  return trimmed;
}

export function resolveKidPlayShellModule(pathname: string): KidPlayShellModuleId | 'kids' | null {
  const ctx = parseKidPlayShellPath(pathname);
  if (!ctx) return null;
  const remainder = pathname.slice(`${KID_PLAY_SESSION_PATH}/${ctx.sessionId}`.length).replace(/^\//, '');
  if (!remainder || remainder === 'weekly-adventures') return 'weekly-adventures';
  if (remainder === 'inventory' || remainder === 'collections') return 'collections';
  if (remainder === 'characters' || remainder.startsWith('characters/')) return 'character-hub';
  if (remainder === 'arcade' || remainder.startsWith('arcade/')) return 'arcade';
  if (remainder === 'rewards') return 'rewards';
  if (remainder.startsWith('kids/')) return 'kids';
  return null;
}

export function logKidShellRoute(
  event: string,
  detail: Record<string, string | number | boolean | null>,
): void {
  if (process.env.NODE_ENV !== 'development') return;
  console.info('[KID_SHELL_ROUTE]', { event, ...detail });
}

export function logKidShellSession(
  event: string,
  detail: Record<string, string | number | boolean | null>,
): void {
  if (process.env.NODE_ENV !== 'development') return;
  console.info('[KID_SHELL_SESSION]', { event, ...detail });
}

export function logKidShellIdle(
  event: string,
  detail: Record<string, string | number | boolean | null>,
): void {
  if (process.env.NODE_ENV !== 'development') return;
  console.info('[KID_SHELL_IDLE]', { event, ...detail });
}

export const KID_PLAY_FAMILY_RETURN_BASE_KEY = 'cc-kid-play-family-return-base';

export function writeKidPlayFamilyReturnBase(pathname: string): void {
  if (typeof window === 'undefined') return;
  try {
    const base = pathname.startsWith(FAMILY_PORTAL_PATH) ? FAMILY_PORTAL_PATH : FAMILY_HUB_PATH;
    window.sessionStorage.setItem(KID_PLAY_FAMILY_RETURN_BASE_KEY, base);
  } catch {
    /* sessionStorage unavailable */
  }
}

export function readKidPlayFamilyReturnBase(): string {
  if (typeof window === 'undefined') return FAMILY_HUB_PATH;
  try {
    const raw = window.sessionStorage.getItem(KID_PLAY_FAMILY_RETURN_BASE_KEY)?.trim();
    if (raw === FAMILY_PORTAL_PATH || raw === FAMILY_HUB_PATH) return raw;
  } catch {
    /* ignore */
  }
  return FAMILY_HUB_PATH;
}
