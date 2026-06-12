import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdultLearningHub from '../components/adult-learning/AdultLearningHub';
import PilotDashboardSidebar from '../components/pilot-dashboard/PilotDashboardSidebar';
import PilotDashboardTopBar from '../components/pilot-dashboard/PilotDashboardTopBar';
import '../components/pilot-dashboard/pilot-dashboard.css';
import '../components/portal/portal-shell.css';
import { FACILITATOR_PORTAL_PATH, PORTAL_PATH } from '../config/courageRoutes';
import { readPilotDashboardSession } from '../config/pilotDashboardAccess';
import { DR_VICTORIA_LEARNING_HUB } from '../data/adult/drVictoriaHub';
import { type PilotSidebarNavId } from '../data/pilotDashboardContent';

export default function FacilitatorDrVictoriaHubPage() {
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
    <div className="pilot-shell portal-shell">
      <PilotDashboardSidebar activeId="facilitator-center" onSelect={handleSelectNav} />

      <div className="pilot-main">
        <PilotDashboardTopBar pageTitle={DR_VICTORIA_LEARNING_HUB.hubTitle} />

        <div className="pilot-content pilot-content--wide">
          <AdultLearningHub
            guide={DR_VICTORIA_LEARNING_HUB}
            portal="facilitator"
            backPath={DR_VICTORIA_LEARNING_HUB.routes.facilitatorSection}
            backLabel="Back to Adult Training"
            embedded
          />
        </div>
      </div>
    </div>
  );
}
