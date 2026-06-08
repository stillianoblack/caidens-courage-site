import React, { useCallback } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import GameAssessmentFlow from '../components/game-assessment/GameAssessmentFlow';
import PilotDashboardSidebar from '../components/pilot-dashboard/PilotDashboardSidebar';
import PilotDashboardTopBar from '../components/pilot-dashboard/PilotDashboardTopBar';
import '../components/pilot-dashboard/pilot-dashboard.css';
import { FACILITATOR_PORTAL_PATH, PORTAL_PATH } from '../config/courageRoutes';
import { readPilotDashboardSession } from '../config/pilotDashboardAccess';
import { getDrVictoriaMissionById } from '../data/adult';
import { DR_VICTORIA_LEARNING_HUB } from '../data/adult/drVictoriaHub';
import { BLUE_RIBBON_PILOT_BRAND, PILOT_ADULT_TRAINING_INTRO } from '../data/pilotDashboardContent';
import type { PilotSidebarNavId } from '../data/pilotDashboardContent';

export default function FacilitatorDrVictoriaMissionPage() {
  const navigate = useNavigate();
  const { missionId } = useParams<{ missionId: string }>();
  const sessionType = readPilotDashboardSession();
  const mission = getDrVictoriaMissionById(missionId);
  const hubPath = DR_VICTORIA_LEARNING_HUB.routes.facilitatorHub;

  const handleSelectNav = useCallback(
    (id: PilotSidebarNavId) => {
      navigate(`${FACILITATOR_PORTAL_PATH}#${id}`);
    },
    [navigate],
  );

  if (!sessionType) {
    navigate(PORTAL_PATH, { replace: true });
    return null;
  }

  if (!mission) {
    return <Navigate to={hubPath} replace />;
  }

  return (
    <div className="pilot-shell">
      <PilotDashboardSidebar activeId="facilitator-center" onSelect={handleSelectNav} />

      <div className="pilot-main">
        <PilotDashboardTopBar
          pageTitle={PILOT_ADULT_TRAINING_INTRO.title}
          contextTitle={BLUE_RIBBON_PILOT_BRAND}
          contextSubtitle="Facilitator Portal"
        />

        <div className="pilot-content pilot-content--wide">
          <GameAssessmentFlow
            config={mission.config}
            themeClassName={mission.config.shellClassName ?? 'victoria-game'}
            exitPath={hubPath}
            exitLabel="Back to Learning Hub"
            useVictoriaHeader
            embedded
            portalSectionPath={DR_VICTORIA_LEARNING_HUB.routes.facilitatorSection}
            portalSectionLabel="Return to Adult Training"
            victoriaHubContinueLabel="Continue Learning Hub"
          />
        </div>
      </div>
    </div>
  );
}
