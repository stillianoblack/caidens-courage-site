import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import ZekeMissionFlow from '../components/zeke/ZekeMissionFlow';
import { getZekeMissionById } from '../data/zeke';
import { resolvePortalFamilyShellPath, resolveZekeHubPath } from '../lib/portalGamePaths';

export default function ZekePortalMissionPage() {
  const { missionId } = useParams<{ missionId: string }>();
  const location = useLocation();
  const hubPath = resolveZekeHubPath(location.pathname);
  const mission = getZekeMissionById(missionId);

  if (!mission) {
    return <Navigate to={`${hubPath}${location.search}`} replace />;
  }

  return (
    <ZekeMissionFlow
      missionId={mission.id}
      themeClassName="zeke-game"
      exitPath={hubPath}
      exitLabel="Back to Team Quest"
      embedded
      familyPortalPath={resolvePortalFamilyShellPath(location.pathname)}
    />
  );
}
