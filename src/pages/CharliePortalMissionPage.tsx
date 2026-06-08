import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import GameAssessmentFlow from '../components/game-assessment/GameAssessmentFlow';
import { getCharlieMissionById } from '../data/charlie';
import { resolveCharlieHubPath, resolvePortalFamilyShellPath } from '../lib/portalGamePaths';

export default function CharliePortalMissionPage() {
  const { missionId } = useParams<{ missionId: string }>();
  const location = useLocation();
  const hubPath = resolveCharlieHubPath(location.pathname);
  const mission = getCharlieMissionById(missionId);

  if (!mission) {
    return <Navigate to={hubPath} replace />;
  }

  return (
    <GameAssessmentFlow
      config={mission.config}
      themeClassName="charlie-game"
      exitPath={hubPath}
      exitLabel="Back to Nature Nook"
      useCharlieHeader
      embedded
      familyPortalPath={resolvePortalFamilyShellPath(location.pathname)}
    />
  );
}
