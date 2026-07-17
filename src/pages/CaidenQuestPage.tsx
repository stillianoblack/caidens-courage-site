import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import CaidenQuestFlow from '../components/caiden/CaidenQuestFlow';
import { getCaidenPlayableMissionById } from '../data/caiden';
import { resolveCaidenHubPath, resolvePortalFamilyShellPath } from '../lib/portalGamePaths';

export default function CaidenQuestPage() {
  const { questId } = useParams<{ questId: string }>();
  const location = useLocation();
  const hubPath = resolveCaidenHubPath(location.pathname);
  const quest = getCaidenPlayableMissionById(questId);

  if (!quest) {
    return <Navigate to={`${hubPath}${location.search}`} replace />;
  }

  return (
    <CaidenQuestFlow
      questId={quest.id}
      exitPath={hubPath}
      exitLabel="Back to Focus Flame Journey"
      embedded
      skipLanding
      familyPortalPath={resolvePortalFamilyShellPath(location.pathname)}
    />
  );
}
