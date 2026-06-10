import {
  BLUE_RIBBON_PILOT_PATH,
  CAIDEN_QUEST_HUB_PATH,
  FACILITATOR_PORTAL_PATH,
  FAMILY_HUB_PATH,
  FAMILY_PARENT_CORNER_PATH,
  FAMILY_PORTAL_PATH,
  KIDS_PORTAL_PATH,
  PILOT_DASHBOARD_PATH,
  PROGRAM_DASHBOARD_PATH,
} from '../config/courageRoutes';

/** Routes where B-4 mounts inside AppShell (not App.tsx global slot). */
export function shouldMountPortalB4Assistant(pathname: string): boolean {
  return (
    pathname === FAMILY_PORTAL_PATH ||
    pathname.startsWith(`${FAMILY_PORTAL_PATH}/`) ||
    pathname === FAMILY_HUB_PATH ||
    pathname.startsWith(`${FAMILY_HUB_PATH}/`) ||
    pathname === PROGRAM_DASHBOARD_PATH ||
    pathname.startsWith(`${PROGRAM_DASHBOARD_PATH}/`) ||
    pathname === FACILITATOR_PORTAL_PATH ||
    pathname.startsWith(`${FACILITATOR_PORTAL_PATH}/`) ||
    pathname === BLUE_RIBBON_PILOT_PATH ||
    pathname === PILOT_DASHBOARD_PATH ||
    pathname.startsWith(`${PILOT_DASHBOARD_PATH}/`) ||
    pathname.startsWith(FAMILY_PARENT_CORNER_PATH) ||
    pathname === CAIDEN_QUEST_HUB_PATH ||
    pathname.startsWith(`${CAIDEN_QUEST_HUB_PATH}/`) ||
    pathname.startsWith(`${KIDS_PORTAL_PATH}/`)
  );
}
