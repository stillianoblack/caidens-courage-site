import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import GameAssessmentFlow from '../components/game-assessment/GameAssessmentFlow';
import { MIRANDA_MYSTERY_FILES_PATH } from '../config/courageRoutes';
import { getMirandaMissionById } from '../data/miranda';

export default function MirandaMissionPage() {
  const { missionId } = useParams<{ missionId: string }>();
  const mission = getMirandaMissionById(missionId);

  if (!mission) {
    return <Navigate to={MIRANDA_MYSTERY_FILES_PATH} replace />;
  }

  return (
    <GameAssessmentFlow
      config={mission.config}
      themeClassName="miranda-game"
      exitPath={MIRANDA_MYSTERY_FILES_PATH}
      useMirandaHeader
    />
  );
}
