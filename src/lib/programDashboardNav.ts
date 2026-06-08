import { PROGRAM_DASHBOARD_KIDS_BASE, PROGRAM_DASHBOARD_PATH } from '../config/courageRoutes';
import { PROGRAM_SIDEBAR_NAV, type PilotSidebarNavId } from '../data/pilotDashboardContent';

const VALID_NAV_IDS = new Set(PROGRAM_SIDEBAR_NAV.map((item) => item.id));

const RESERVED_SEGMENTS = new Set(['kids', 'adult-assessment', 'baseline-check']);

export function programDashboardTabPath(tab: PilotSidebarNavId): string {
  return tab === 'overview' ? PROGRAM_DASHBOARD_PATH : `${PROGRAM_DASHBOARD_PATH}/${tab}`;
}

export function resolveProgramDashboardTab(pathname: string): PilotSidebarNavId {
  if (pathname === PROGRAM_DASHBOARD_PATH || pathname === `${PROGRAM_DASHBOARD_PATH}/`) {
    return 'overview';
  }

  const prefix = `${PROGRAM_DASHBOARD_PATH}/`;
  if (!pathname.startsWith(prefix)) {
    return 'overview';
  }

  const segment = pathname.slice(prefix.length).split('/')[0];
  if (!segment || RESERVED_SEGMENTS.has(segment)) {
    return 'overview';
  }

  if (VALID_NAV_IDS.has(segment as PilotSidebarNavId)) {
    return segment as PilotSidebarNavId;
  }

  return 'overview';
}

export function isProgramDashboardKidsPath(pathname: string): boolean {
  return pathname.startsWith(`${PROGRAM_DASHBOARD_KIDS_BASE}/`);
}
