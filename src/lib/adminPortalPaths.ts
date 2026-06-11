import { ADMIN_PORTAL_PATH } from '../config/courageRoutes';
import {
  ADMIN_PORTAL_TABS,
  DEFAULT_ADMIN_PORTAL_TAB,
  type AdminPortalTabId,
} from '../data/adminPortalContent';

export function resolveAdminPortalTab(value: string | null): AdminPortalTabId {
  const match = ADMIN_PORTAL_TABS.find((tab) => tab.id === value);
  return match?.id ?? DEFAULT_ADMIN_PORTAL_TAB;
}

export function adminPortalTabPath(tab: AdminPortalTabId): string {
  if (tab === DEFAULT_ADMIN_PORTAL_TAB) return ADMIN_PORTAL_PATH;
  return `${ADMIN_PORTAL_PATH}?tab=${encodeURIComponent(tab)}`;
}
