import React, { useCallback } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import AdultLearningHub from '../components/adult-learning/AdultLearningHub';
import PilotDashboardSidebar from '../components/pilot-dashboard/PilotDashboardSidebar';
import PilotDashboardTopBar from '../components/pilot-dashboard/PilotDashboardTopBar';
import '../components/pilot-dashboard/pilot-dashboard.css';
import '../components/adult-learning/adult-learning-hub.css';
import { FACILITATOR_ADULT_TRAINING_PATH, FACILITATOR_PORTAL_PATH, PORTAL_PATH } from '../config/courageRoutes';
import { readPilotDashboardSession } from '../config/pilotDashboardAccess';
import { getAdultGuideById } from '../data/adult/adultGuideRegistry';
import { BLUE_RIBBON_PILOT_BRAND, type PilotSidebarNavId } from '../data/pilotDashboardContent';

export default function FacilitatorAdultGuideHubPage() {
  const navigate = useNavigate();
  const { guideId } = useParams<{ guideId: string }>();
  const sessionType = readPilotDashboardSession();
  const guide = getAdultGuideById(guideId);

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

  if (!guide) {
    return <Navigate to={FACILITATOR_ADULT_TRAINING_PATH} replace />;
  }

  return (
    <div className="pilot-shell">
      <PilotDashboardSidebar activeId="facilitator-center" onSelect={handleSelectNav} />

      <div className="pilot-main">
        <PilotDashboardTopBar
          pageTitle={guide.hubTitle}
          contextTitle={BLUE_RIBBON_PILOT_BRAND}
          contextSubtitle="Facilitator Portal"
        />

        <div className="pilot-content pilot-content--wide">
          <AdultLearningHub
            guide={guide}
            portal="facilitator"
            backPath={guide.routes.facilitatorSection}
            backLabel="Back to Adult Training"
            embedded
          />
        </div>
      </div>
    </div>
  );
}
