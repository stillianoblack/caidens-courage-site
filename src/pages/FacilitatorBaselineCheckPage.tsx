import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import B4BaselineCheckFlow from '../components/b4/B4BaselineCheckFlow';
import PilotDashboardSidebar from '../components/pilot-dashboard/PilotDashboardSidebar';
import PilotDashboardTopBar from '../components/pilot-dashboard/PilotDashboardTopBar';
import '../components/pilot-dashboard/pilot-dashboard.css';
import { readActivePilotProgram, resolveProgramDashboardBrand } from '../config/activePilotProgram';
import { forcePortalRoleForRoute } from '../config/portalContext';
import {
  FACILITATOR_PORTAL_PATH,
  PROGRAM_DASHBOARD_PATH,
  PILOT_PROGRAM_SIGNUP_PATH,
  PORTAL_PATH,
} from '../config/courageRoutes';

import { readPilotDashboardSession } from '../config/pilotDashboardAccess';
import {
  BLUE_RIBBON_PILOT_BRAND,
  BLUE_RIBBON_PILOT_SUBBRAND,
  PILOT_SIDEBAR_NAV,
  PROGRAM_SIDEBAR_NAV,
  type PilotSidebarNavId,
} from '../data/pilotDashboardContent';

type FacilitatorBaselineCheckPageProps = {
  variant: 'program' | 'blueribbon';
};

export default function FacilitatorBaselineCheckPage({ variant }: FacilitatorBaselineCheckPageProps) {
  const navigate = useNavigate();
  const isProgram = variant === 'program';
  const activeProgram = readActivePilotProgram();
  const sessionType = readPilotDashboardSession();
  const brand = isProgram
    ? resolveProgramDashboardBrand(activeProgram)
    : { title: BLUE_RIBBON_PILOT_BRAND, subtitle: BLUE_RIBBON_PILOT_SUBBRAND };
  const exitPath = isProgram ? `${PROGRAM_DASHBOARD_PATH}#assessments` : `${FACILITATOR_PORTAL_PATH}#assessments`;

  useEffect(() => {
    if (isProgram) {
      forcePortalRoleForRoute(PROGRAM_DASHBOARD_PATH);
      if (!activeProgram) {
        navigate(PILOT_PROGRAM_SIGNUP_PATH, { replace: true });
      }
    } else if (!sessionType) {
      navigate(PORTAL_PATH, { replace: true });
    }
  }, [activeProgram, isProgram, navigate, sessionType]);

  const handleSelectNav = (id: PilotSidebarNavId) => {
    const base = isProgram ? PROGRAM_DASHBOARD_PATH : FACILITATOR_PORTAL_PATH;
    navigate(`${base}#${id}`);
  };

  if (isProgram && !activeProgram) return null;
  if (!isProgram && !sessionType) return null;

  return (
    <div className="pilot-shell">
      <PilotDashboardSidebar
        activeId="assessments"
        onSelect={handleSelectNav}
        brandTitle={brand.title}
        brandSubtitle={brand.subtitle}
        navItems={isProgram ? PROGRAM_SIDEBAR_NAV : PILOT_SIDEBAR_NAV}
        pricingTier={isProgram ? activeProgram?.pricingTier : undefined}
        showSupportCard={isProgram}
      />
      <div className="pilot-main">
        <PilotDashboardTopBar
          pageTitle="B-4 Baseline Check"
          contextTitle={brand.title}
          contextSubtitle="Facilitator Portal"
        />
        <div className="pilot-content pilot-content--wide">
          <B4BaselineCheckFlow
            embedded
            onExit={() => navigate(exitPath)}
          />
        </div>
        <footer className="pilot-miniFooter">© 2026 Caiden&apos;s Courage™ Pilot Materials</footer>
      </div>
    </div>
  );
}
