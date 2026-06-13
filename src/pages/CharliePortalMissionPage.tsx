import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import CharlieMissionFlow from '../components/charlie/CharlieMissionFlow';
import { getCharlieMissionById } from '../data/charlie';
import { resolveCharlieHubPath, resolvePortalFamilyShellPath } from '../lib/portalGamePaths';

export default function CharliePortalMissionPage() {
  const { missionId } = useParams<{ missionId: string }>();
  const location = useLocation();
  const hubPath = resolveCharlieHubPath(location.pathname);
  const mission = getCharlieMissionById(missionId);

  if (!mission) {
    return <Navigate to={`${hubPath}${location.search}`} replace />;
  }

  return (
    <CharlieMissionFlow
      missionId={mission.id}
      themeClassName="charlie-game"
      exitPath={hubPath}
      exitLabel="Back to Science Lab"
      embedded
      skipLanding
      familyPortalPath={resolvePortalFamilyShellPath(location.pathname)}
    />
  );
}
