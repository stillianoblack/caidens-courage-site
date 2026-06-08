import React, { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import AdultGrowthCheckFlow from '../components/adult-assessment/AdultGrowthCheckFlow';
import PilotDashboardSidebar from '../components/pilot-dashboard/PilotDashboardSidebar';
import PilotDashboardTopBar from '../components/pilot-dashboard/PilotDashboardTopBar';
import '../components/pilot-dashboard/pilot-dashboard.css';
import { readActivePilotProgram, resolveProgramDashboardBrand } from '../config/activePilotProgram';
import { forcePortalRoleForRoute } from '../config/portalContext';
import {
  FACILITATOR_DR_VICTORIA_MISSION_BASE,
  FACILITATOR_PORTAL_PATH,
  PILOT_PROGRAM_SIGNUP_PATH,
  PORTAL_PATH,
  PROGRAM_DASHBOARD_PATH,
} from '../config/courageRoutes';
import { programDashboardTabPath } from '../lib/programDashboardNav';
import type { AdultAssessmentPhase } from '../data/adultGrowthCheckContent';
import { canAccessAdultAssessmentPhase } from '../lib/adultAssessmentAccess';
import { readPilotDashboardSession } from '../config/pilotDashboardAccess';
import {
  BLUE_RIBBON_PILOT_BRAND,
  BLUE_RIBBON_PILOT_SUBBRAND,
  PILOT_SIDEBAR_NAV,
  PROGRAM_SIDEBAR_NAV,
  type PilotSidebarNavId,
} from '../data/pilotDashboardContent';

type AdultAssessmentPageProps = {
  variant: 'program' | 'blueribbon';
};

function resolvePhase(raw?: string): AdultAssessmentPhase | null {
  if (raw === 'baseline' || raw === 'growth') return raw;
  return null;
}

export default function AdultAssessmentPage({ variant }: AdultAssessmentPageProps) {
  const navigate = useNavigate();
  const { phase: phaseParam } = useParams<{ phase: string }>();
  const phase = resolvePhase(phaseParam);
  const isProgram = variant === 'program';
  const activeProgram = readActivePilotProgram();
  const sessionType = readPilotDashboardSession();
  const brand = isProgram
    ? resolveProgramDashboardBrand(activeProgram)
    : { title: BLUE_RIBBON_PILOT_BRAND, subtitle: BLUE_RIBBON_PILOT_SUBBRAND };
  const basePath = isProgram ? PROGRAM_DASHBOARD_PATH : FACILITATOR_PORTAL_PATH;
  const returnHref = isProgram
    ? programDashboardTabPath('assessments')
    : `${basePath}#assessments`;
  const continueLearningHref = isProgram
    ? programDashboardTabPath('facilitator-center')
    : `${basePath}#facilitator-center`;

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
    if (isProgram) {
      navigate(programDashboardTabPath(id));
      return;
    }
    navigate(`${basePath}#${id}`);
  };

  if (!phase || !canAccessAdultAssessmentPhase(phase)) {
    return <Navigate to={returnHref} replace />;
  }

  if (isProgram && !activeProgram) return null;
  if (!isProgram && !sessionType) return null;

  const pageTitle = phase === 'baseline' ? 'Adult Baseline Assessment' : 'Adult Growth Assessment';

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
          pageTitle={pageTitle}
          contextTitle={brand.title}
          contextSubtitle="Facilitator Portal"
        />
        <div className="pilot-content pilot-content--wide">
          <AdultGrowthCheckFlow
            phase={phase}
            embedded
            returnHref={returnHref}
            drVictoriaTrainingHref={FACILITATOR_DR_VICTORIA_MISSION_BASE}
            continueLearningHref={continueLearningHref}
            onExit={() => navigate(returnHref)}
          />
        </div>
        <footer className="pilot-miniFooter">© 2026 Caiden&apos;s Courage™ Pilot Materials</footer>
      </div>
    </div>
  );
}
