import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GameAssessmentFlow from '../components/game-assessment/GameAssessmentFlow';
import PilotDashboardSidebar from '../components/pilot-dashboard/PilotDashboardSidebar';
import PilotDashboardTopBar from '../components/pilot-dashboard/PilotDashboardTopBar';
import '../components/pilot-dashboard/pilot-dashboard.css';
import { FACILITATOR_PORTAL_PATH, PORTAL_PATH } from '../config/courageRoutes';
import { readPilotDashboardSession } from '../config/pilotDashboardAccess';
import { DR_VICTORIA_MISSION_1_CONFIG } from '../data/adult';
import { PILOT_ADULT_TRAINING_INTRO } from '../data/pilotDashboardContent';
import type { PilotSidebarNavId } from '../data/pilotDashboardContent';

export default function FacilitatorDrVictoriaMissionPage() {
  const navigate = useNavigate();
  const sessionType = readPilotDashboardSession();

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

  return (
    <div className="pilot-shell">
      <PilotDashboardSidebar activeId="facilitator-center" onSelect={handleSelectNav} />

      <div className="pilot-main">
        <PilotDashboardTopBar
          pageTitle={PILOT_ADULT_TRAINING_INTRO.title}
          pageSubtitle={PILOT_ADULT_TRAINING_INTRO.subtitle}
        />

        <div className="pilot-content pilot-content--wide">
          <GameAssessmentFlow
            config={DR_VICTORIA_MISSION_1_CONFIG}
            themeClassName="victoria-game"
            exitPath={`${FACILITATOR_PORTAL_PATH}#facilitator-center`}
            exitLabel="Back to Adult Training"
            useVictoriaHeader
            embedded
          />
        </div>
      </div>
    </div>
  );
}
