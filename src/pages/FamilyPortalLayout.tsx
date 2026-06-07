import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import FamilyDashboardSidebar from '../components/family-portal/FamilyDashboardSidebar';
import FamilyDashboardTopBar from '../components/family-portal/FamilyDashboardTopBar';
import '../components/family-portal/family-dashboard.css';
import { FAMILY_PORTAL_PATH, PORTAL_PATH } from '../config/courageRoutes';
import { readFamilyPortalSession } from '../config/familyPortalAccess';
import { FAMILY_PORTAL_TITLE } from '../data/familyPortalContent';
import { isWidePortalContentRoute, resolvePortalPageTitle } from '../lib/familyPortalNav';

export default function FamilyPortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasSession = readFamilyPortalSession();
  const pageTitle = resolvePortalPageTitle(location.pathname);
  const isWideContent = isWidePortalContentRoute(location.pathname);

  useEffect(() => {
    document.title = `${FAMILY_PORTAL_TITLE} | Caiden's Courage`;
  }, []);

  useEffect(() => {
    if (!hasSession) {
      navigate(PORTAL_PATH, { replace: true, state: { redirect: FAMILY_PORTAL_PATH } });
    }
  }, [hasSession, navigate]);

  if (!hasSession) {
    return null;
  }

  return (
    <div className="family-shell">
      <FamilyDashboardSidebar />

      <div className="family-main">
        <FamilyDashboardTopBar pageTitle={pageTitle} />

        <div className={`family-content${isWideContent ? ' family-content--wide' : ''}`}>
          <Outlet />
        </div>

        <footer className="family-miniFooter">
          © 2026 Caiden&apos;s Courage™ Family Portal
        </footer>
      </div>
    </div>
  );
}
