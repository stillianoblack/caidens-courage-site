import React, { useCallback } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import GameAssessmentFlow from '../components/game-assessment/GameAssessmentFlow';
import PilotDashboardSidebar from '../components/pilot-dashboard/PilotDashboardSidebar';
import PilotDashboardTopBar from '../components/pilot-dashboard/PilotDashboardTopBar';
import '../components/pilot-dashboard/pilot-dashboard.css';
import '../components/portal/portal-shell.css';
import { FACILITATOR_PORTAL_PATH, PORTAL_PATH } from '../config/courageRoutes';
import { readPilotDashboardSession } from '../config/pilotDashboardAccess';
import { getAdultGuideById, getAdultGuideMissionById } from '../data/adult/adultGuideRegistry';
import { PILOT_ADULT_TRAINING_INTRO } from '../data/pilotDashboardContent';
import { useMissionGamePhase } from '../context/MissionGamePhaseContext';
import type { PilotSidebarNavId } from '../data/pilotDashboardContent';

export default function FacilitatorAdultGuideMissionPage() {
  const navigate = useNavigate();
  const missionPhase = useMissionGamePhase();
  const isGameActive = missionPhase === 'quiz';
  const { guideId, missionId } = useParams<{ guideId: string; missionId: string }>();
  const sessionType = readPilotDashboardSession();
  const guide = getAdultGuideById(guideId);
  const mission = getAdultGuideMissionById(guideId, missionId);

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

  if (!guide || !mission) {
    return <Navigate to={guide?.routes.facilitatorHub ?? FACILITATOR_PORTAL_PATH} replace />;
  }

  const useVictoriaHeader = guide.theme.id === 'victoria';
  const useUncleTHeader = guide.theme.id === 'uncle-t';
  const hubContinueLabel =
    guide.theme.id === 'uncle-t' ? 'Continue Coaching Hub' : 'Continue Learning Hub';

  return (
    <div
      className={`pilot-shell portal-shell${isGameActive ? ' pilot-shell--game-active' : ''}`}
    >
      <PilotDashboardSidebar activeId="facilitator-center" onSelect={handleSelectNav} />

      <div className="pilot-main">
        <PilotDashboardTopBar pageTitle={PILOT_ADULT_TRAINING_INTRO.title} />

        <div className="pilot-content pilot-content--wide">
          <GameAssessmentFlow
            config={mission.config}
            themeClassName={mission.config.shellClassName ?? guide.theme.gameShellClassName}
            exitPath={guide.routes.facilitatorHub}
            exitLabel={useUncleTHeader ? 'Back to Coaching Hub' : 'Back to Learning Hub'}
            useVictoriaHeader={useVictoriaHeader}
            useUncleTHeader={useUncleTHeader}
            embedded
            portalSectionPath={guide.routes.facilitatorSection}
            portalSectionLabel="Return to Adult Training"
            adultHubContinueLabel={hubContinueLabel}
            adultGuideId={guide.id}
            adultMissionId={mission.missionId}
          />
        </div>
      </div>
    </div>
  );
}
