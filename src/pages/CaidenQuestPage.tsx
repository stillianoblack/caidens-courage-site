import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import GameAssessmentFlow from '../components/game-assessment/GameAssessmentFlow';
import { getCaidenQuestById } from '../data/caiden';
import { resolveCaidenHubPath, resolvePortalFamilyShellPath } from '../lib/portalGamePaths';

export default function CaidenQuestPage() {
  const { questId } = useParams<{ questId: string }>();
  const location = useLocation();
  const hubPath = resolveCaidenHubPath(location.pathname);
  const quest = getCaidenQuestById(questId);

  if (!quest) {
    return <Navigate to={hubPath} replace />;
  }

  return (
    <GameAssessmentFlow
      config={quest.config}
      themeClassName="caiden-game"
      exitPath={hubPath}
      useCaidenHeader
      embedded
      skipLanding
      familyPortalPath={resolvePortalFamilyShellPath(location.pathname)}
    />
  );
}
