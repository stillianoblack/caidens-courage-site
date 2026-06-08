import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  initAnalytics,
  refreshAnalyticsIdentity,
  resolveAnalyticsPageSection,
  resolveAnalyticsPageTitle,
  resolveCurrentProgramCode,
  resolveCurrentUserRole,
  resolvePortalType,
  trackFacilitatorPortalViewed,
  trackFamilyPortalViewed,
  trackPageView,
  trackPortalViewed,
  trackWeeklyModuleOpened,
} from '../../lib/analytics';

/**
 * Fires page_view on every route change (pathname, search, or hash).
 * Mount once inside the Router.
 */
export default function AnalyticsRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    const portalType = resolvePortalType(location.pathname);

    if (portalType === 'portal_gateway') {
      trackPortalViewed();
    } else if (portalType === 'family') {
      trackFamilyPortalViewed();
    } else if (portalType === 'facilitator') {
      trackFacilitatorPortalViewed();
    }

    refreshAnalyticsIdentity();

    trackPageView({
      page_path: `${location.pathname}${location.search}${location.hash}`,
      page_title: resolveAnalyticsPageTitle(location.pathname, location.hash),
      page_section: resolveAnalyticsPageSection(location.pathname, location.hash),
      portal_type: portalType,
      user_role: resolveCurrentUserRole(),
      program_code: resolveCurrentProgramCode(),
    });

    const navId = location.hash.replace('#', '');
    if (portalType === 'facilitator' && navId === 'weekly-modules') {
      trackWeeklyModuleOpened({
        week: 0,
        title: 'Weekly Modules',
        role: resolveCurrentUserRole() ?? 'facilitator',
      });
    }
  }, [location.pathname, location.search, location.hash]);

  return null;
}
