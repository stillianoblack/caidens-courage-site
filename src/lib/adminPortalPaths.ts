import { ADMIN_PORTAL_PATH } from '../config/courageRoutes';
import {
  ADMIN_PORTAL_TABS,
  DEFAULT_ADMIN_PORTAL_TAB,
  type AdminPortalTabId,
} from '../data/adminPortalContent';

export function resolveAdminPortalTab(value: string | null): AdminPortalTabId {
  if (value === 'pricing-plans' || value === 'commerce-products') return 'commerce';
  const match = ADMIN_PORTAL_TABS.find((tab) => tab.id === value);
  return match?.id ?? DEFAULT_ADMIN_PORTAL_TAB;
}

export function adminPortalTabPath(tab: AdminPortalTabId): string {
  if (tab === 'commerce') return `${ADMIN_PORTAL_PATH}/commerce?tab=products`;
  if (tab === DEFAULT_ADMIN_PORTAL_TAB) return ADMIN_PORTAL_PATH;
  return `${ADMIN_PORTAL_PATH}?tab=${encodeURIComponent(tab)}`;
}
