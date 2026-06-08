import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { PilotDashboardPage } from '../routes/lazyPages';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { readActivePortalRole } from '../config/portalContext';
import { readPortalSessionUnlock } from '../config/portalAccess';
import { FACILITATOR_PORTAL_PATH, PROGRAM_DASHBOARD_PATH } from '../config/courageRoutes';
import { logPortalRedirect } from '../lib/portalDebug';

/**
 * Legacy facilitator entry (`/portal/facilitator`).
 * Only redirect to canonical `/program-dashboard` when a real program-backed
 * facilitator session exists; otherwise keep the legacy facilitator shell.
 */
export default function FacilitatorPortalEntry() {
  const location = useLocation();
  const activeProgram = readActivePilotProgram();
  const role = readActivePortalRole();
  const sessionType = readPortalSessionUnlock();

  if (activeProgram && role === 'facilitator' && sessionType) {
    logPortalRedirect(
      location.pathname || FACILITATOR_PORTAL_PATH,
      PROGRAM_DASHBOARD_PATH,
      'legacy-facilitator-portal-to-program-dashboard',
    );
    return <Navigate to={PROGRAM_DASHBOARD_PATH} replace />;
  }

  return <PilotDashboardPage />;
}

