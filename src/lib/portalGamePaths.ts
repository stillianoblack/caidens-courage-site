import { readActivePilotProgram } from '../config/activePilotProgram';
import { readParentClaimContext } from '../config/parentClaimContext';
import { readActivePortalRole } from '../config/portalContext';
import type { ActivePilotProgram } from '../types/pilotProgram';
import {
  FACILITATOR_PORTAL_PATH,
  FAMILY_HUB_KIDS_BASE,
  FAMILY_HUB_PATH,
  FAMILY_PORTAL_PATH,
  KIDS_PORTAL_PATH,
  PROGRAM_DASHBOARD_KIDS_BASE,
  PROGRAM_DASHBOARD_PATH,
} from '../config/courageRoutes';

/** Resolves the active portal shell base path from role + URL. */
export function getPortalBasePath(pathname?: string): string {
  const path =
    pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');

  if (path.startsWith(FAMILY_PORTAL_PATH)) {
    return FAMILY_PORTAL_PATH;
  }
  if (path.startsWith(FACILITATOR_PORTAL_PATH) && !path.startsWith(PROGRAM_DASHBOARD_PATH)) {
    return FACILITATOR_PORTAL_PATH;
  }
  if (path.startsWith(PROGRAM_DASHBOARD_PATH)) {
    return PROGRAM_DASHBOARD_PATH;
  }
  if (path.startsWith(FAMILY_HUB_PATH)) {
    return FAMILY_HUB_PATH;
  }

  const role = readActivePortalRole();
  if (role === 'facilitator') return PROGRAM_DASHBOARD_PATH;
  if (role === 'family') return FAMILY_HUB_PATH;

  return readActivePilotProgram() ? FAMILY_HUB_PATH : FAMILY_PORTAL_PATH;
}

/** Builds a route inside the current portal shell. Example: getPortalRoute('kids/caiden') */
export function getPortalRoute(subPath: string, pathname?: string): string {
  const base = getPortalBasePath(pathname);
  const clean = subPath.replace(/^\/+/, '');
  return clean ? `${base}/${clean}` : base;
}

/** Resolves the kids game base path for the current portal shell. */
export function resolvePortalKidsBasePath(pathname: string): string {
  const role = readActivePortalRole();

  if (role === 'facilitator' || pathname.startsWith(PROGRAM_DASHBOARD_PATH)) {
    return PROGRAM_DASHBOARD_KIDS_BASE;
  }

  if (
    role === 'family' ||
    pathname.startsWith(FAMILY_HUB_PATH) ||
    pathname.startsWith(`${FAMILY_HUB_PATH}/`)
  ) {
    return FAMILY_HUB_KIDS_BASE;
  }

  if (pathname.startsWith(FAMILY_HUB_KIDS_BASE) || pathname.startsWith(`${FAMILY_HUB_PATH}/kids`)) {
    return FAMILY_HUB_KIDS_BASE;
  }
  if (pathname.startsWith(PROGRAM_DASHBOARD_KIDS_BASE)) {
    return PROGRAM_DASHBOARD_KIDS_BASE;
  }
  if (pathname.startsWith(FAMILY_PORTAL_PATH)) {
    return KIDS_PORTAL_PATH;
  }
  return KIDS_PORTAL_PATH;
}

/** Rewrites legacy /portal/kids routes to stay inside the active portal shell. */
export function remapPortalKidsRoute(route: string, pathname: string): string {
  if (!route.startsWith(KIDS_PORTAL_PATH)) return route;
  const kidsBase = resolvePortalKidsBasePath(pathname);
  return `${kidsBase}${route.slice(KIDS_PORTAL_PATH.length)}`;
}

export function resolvePortalFamilyShellPath(pathname: string): string {
  if (pathname.startsWith(FAMILY_HUB_PATH)) return FAMILY_HUB_PATH;
  return FAMILY_PORTAL_PATH;
}

export function resolvePortalCharacterHubPath(pathname?: string): string {
  return getPortalRoute('characters', pathname);
}

export function resolvePortalGameHubPath(pathname?: string): string {
  return getPortalRoute('characters', pathname);
}

/** @deprecated Use resolvePortalCharacterHubPath */
export function resolvePortalChildrenHubPath(pathname: string): string {
  return resolvePortalCharacterHubPath(pathname);
}

export function resolveCaidenHubPath(pathname: string): string {
  return `${resolvePortalKidsBasePath(pathname)}/caiden`;
}

export function resolveMirandaHubPath(pathname: string): string {
  return `${resolvePortalKidsBasePath(pathname)}/miranda`;
}

export function resolveB4HubPath(pathname: string): string {
  return `${resolvePortalKidsBasePath(pathname)}/b4`;
}

export function resolveCharlieHubPath(pathname: string): string {
  return `${resolvePortalKidsBasePath(pathname)}/charlie`;
}

export function resolveZekeHubPath(pathname: string): string {
  return `${resolvePortalKidsBasePath(pathname)}/zeke`;
}

export function resolvePortalRailBrand(): { title: string; subtitle: string } {
  return {
    title: '',
    subtitle: '',
  };
}

/** Formats a family program code for dropdown display (e.g. FAMILY-MENDOZA-2026 → MENDOZA-2026). */
export function formatFamilyPortalIdentityCode(code: string): string {
  const trimmed = code.trim();
  if (!trimmed) return '';
  const withoutAccessSuffix = trimmed.replace(/-FAMILY$/i, '');
  return withoutAccessSuffix.replace(/^FAMILY-/i, '') || withoutAccessSuffix;
}

export function resolveFamilyPortalIdentityCode(program: ActivePilotProgram | null): string | null {
  if (!program) return null;

  const programCode = program.programCode?.trim();
  if (programCode) {
    const formatted = formatFamilyPortalIdentityCode(programCode);
    if (formatted) return formatted;
  }

  const accessCode = program.familyAccessCode?.trim();
  if (accessCode) {
    const formatted = formatFamilyPortalIdentityCode(accessCode);
    if (formatted) return formatted;
  }

  return null;
}

const PORTAL_SWITCHER_DISPLAY_MAX_CHARS = 20;

/** Truncates long facilitator program names for the trigger label (full name stays in title/aria). */
export function truncatePortalSwitcherDisplayLabel(
  fullLabel: string,
  maxChars = PORTAL_SWITCHER_DISPLAY_MAX_CHARS,
): string {
  const trimmed = fullLabel.trim();
  if (trimmed.length <= maxChars) return trimmed;

  const slice = trimmed.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace >= Math.floor(maxChars * 0.55) ? slice.slice(0, lastSpace) : slice.trimEnd();
  return `${cut}…`;
}

export type PortalSwitcherLabels = {
  full: string;
  display: string;
};

export function resolvePortalSwitcherLabels(input?: {
  familyDisplayName?: string | null;
}): PortalSwitcherLabels {
  const program = readActivePilotProgram();
  const role = readActivePortalRole();

  if (role === 'facilitator') {
    const full =
      program?.programName?.trim() ||
      program?.groupName?.trim() ||
      'Facilitator';
    return {
      full,
      display: truncatePortalSwitcherDisplayLabel(full),
    };
  }

  if (role === 'family') {
    const full =
      resolveFamilyPortalIdentityCode(program) ||
      readParentClaimContext()?.lastName?.trim() ||
      input?.familyDisplayName?.trim() ||
      'Family';
    return { full, display: full };
  }

  return { full: 'Portal', display: 'Portal' };
}

/** @deprecated Use resolvePortalSwitcherLabels for display + accessibility text. */
export function resolvePortalSwitcherLabel(input?: {
  familyDisplayName?: string | null;
}): string {
  return resolvePortalSwitcherLabels(input).full;
}
