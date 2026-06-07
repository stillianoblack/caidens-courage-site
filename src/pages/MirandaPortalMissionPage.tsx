import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import GameAssessmentFlow from '../components/game-assessment/GameAssessmentFlow';
import '../components/game-assessment/miranda-game.css';
import '../components/miranda/miranda-portal-hub.css';
import { KIDS_PORTAL_PATH } from '../config/courageRoutes';
import { getMirandaMissionById } from '../data/miranda';

const MIRANDA_PORTAL_HUB = `${KIDS_PORTAL_PATH}/miranda`;

export default function MirandaPortalMissionPage() {
  const { missionId } = useParams<{ missionId: string }>();
  const mission = getMirandaMissionById(missionId);

  if (!mission) {
    return <Navigate to={MIRANDA_PORTAL_HUB} replace />;
  }

  return (
    <GameAssessmentFlow
      config={mission.config}
      themeClassName="miranda-game"
      exitPath={MIRANDA_PORTAL_HUB}
      useMirandaHeader
      embedded
      skipLanding
      familyPortalPath="/portal/family"
    />
  );
}
