import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import B4MissionFlow from '../components/b4/B4MissionFlow';
import { B4_RESERVED_MISSION_ROUTES, getB4MissionById } from '../data/b4';
import { resolveB4HubPath, resolvePortalFamilyShellPath } from '../lib/portalGamePaths';

export default function B4PortalMissionPage() {
  const { missionId } = useParams<{ missionId: string }>();
  const location = useLocation();
  const hubPath = resolveB4HubPath(location.pathname);
  const mission = getB4MissionById(missionId);

  if (!missionId || B4_RESERVED_MISSION_ROUTES.has(missionId) || !mission) {
    return <Navigate to={`${hubPath}${location.search}`} replace />;
  }

  return (
    <B4MissionFlow
      missionId={mission.id}
      themeClassName="b4-game"
      exitPath={hubPath}
      exitLabel="Back to B-4 Missions"
      embedded
      familyPortalPath={resolvePortalFamilyShellPath(location.pathname)}
    />
  );
}
