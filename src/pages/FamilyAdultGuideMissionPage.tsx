import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import GameAssessmentFlow from '../components/game-assessment/GameAssessmentFlow';
import { getAdultGuideById, getAdultGuideMissionById } from '../data/adult/adultGuideRegistry';
import { FAMILY_PORTAL_PATH } from '../config/courageRoutes';

export default function FamilyAdultGuideMissionPage() {
  const { guideId, missionId } = useParams<{ guideId: string; missionId: string }>();
  const guide = getAdultGuideById(guideId);
  const mission = getAdultGuideMissionById(guideId, missionId);

  if (!guide || !mission) {
    return <Navigate to={guide?.routes.familyHub ?? `${FAMILY_PORTAL_PATH}/guide`} replace />;
  }

  const useVictoriaHeader = guide.theme.id === 'victoria';
  const useUncleTHeader = guide.theme.id === 'uncle-t';
  const hubContinueLabel =
    guide.theme.id === 'uncle-t' ? 'Continue Coaching Hub' : 'Continue Parent Training';

  return (
    <GameAssessmentFlow
      config={mission.config}
      themeClassName={mission.config.shellClassName ?? guide.theme.gameShellClassName}
      exitPath={guide.routes.familyHub}
      exitLabel={useUncleTHeader ? 'Back to Coaching Hub' : 'Back to Parent Training'}
      useVictoriaHeader={useVictoriaHeader}
      useUncleTHeader={useUncleTHeader}
      embedded
      familyPortalPath={FAMILY_PORTAL_PATH}
      portalSectionPath={guide.routes.familySection}
      portalSectionLabel="Return to Parent Corner"
      adultHubContinueLabel={hubContinueLabel}
      adultGuideId={guide.id}
      adultMissionId={mission.missionId}
    />
  );
}
