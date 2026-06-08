import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import GameAssessmentFlow from '../components/game-assessment/GameAssessmentFlow';
import '../components/game-assessment/miranda-game.css';
import '../components/miranda/miranda-portal-hub.css';
import { getMirandaMissionById } from '../data/miranda';
import { resolveMirandaHubPath, resolvePortalFamilyShellPath } from '../lib/portalGamePaths';

export default function MirandaPortalMissionPage() {
  const { missionId } = useParams<{ missionId: string }>();
  const location = useLocation();
  const hubPath = resolveMirandaHubPath(location.pathname);
  const mission = getMirandaMissionById(missionId);

  if (!mission) {
    return <Navigate to={hubPath} replace />;
  }

  return (
    <GameAssessmentFlow
      config={mission.config}
      themeClassName="miranda-game"
      exitPath={hubPath}
      useMirandaHeader
      embedded
      skipLanding
      familyPortalPath={resolvePortalFamilyShellPath(location.pathname)}
    />
  );
}
