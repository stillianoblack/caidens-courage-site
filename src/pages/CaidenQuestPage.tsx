import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import GameAssessmentFlow from '../components/game-assessment/GameAssessmentFlow';
import { CAIDEN_QUEST_HUB_PATH } from '../config/courageRoutes';
import { getCaidenQuestById } from '../data/caiden';

export default function CaidenQuestPage() {
  const { questId } = useParams<{ questId: string }>();
  const quest = getCaidenQuestById(questId);

  if (!quest) {
    return <Navigate to={CAIDEN_QUEST_HUB_PATH} replace />;
  }

  return (
    <GameAssessmentFlow
      config={quest.config}
      themeClassName="caiden-game"
      exitPath={CAIDEN_QUEST_HUB_PATH}
      useCaidenHeader
      embedded
      skipLanding
      familyPortalPath="/portal/family"
    />
  );
}
