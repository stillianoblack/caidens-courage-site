import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import MirandaMissionFlow from '../components/miranda/MirandaMissionFlow';
import '../components/miranda/miranda-portal-hub.css';
import { getMirandaMissionById } from '../data/miranda';
import { resolveMirandaHubPath, resolvePortalFamilyShellPath } from '../lib/portalGamePaths';

export default function MirandaPortalMissionPage() {
  const { missionId } = useParams<{ missionId: string }>();
  const location = useLocation();
  const hubPath = resolveMirandaHubPath(location.pathname);
  const mission = getMirandaMissionById(missionId);

  if (!mission) {
    return <Navigate to={`${hubPath}${location.search}`} replace />;
  }

  return (
    <MirandaMissionFlow
      missionId={mission.id}
      exitPath={hubPath}
      exitLabel="Back to Mystery Files"
      embedded
      skipLanding
      familyPortalPath={resolvePortalFamilyShellPath(location.pathname)}
    />
  );
}
