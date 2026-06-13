import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import GameAssessmentFlow from '../components/game-assessment/GameAssessmentFlow';
import { getDrVictoriaMissionById } from '../data/adult';
import { DR_VICTORIA_LEARNING_HUB } from '../data/adult/drVictoriaHub';

export default function FamilyDrVictoriaMissionPage() {
  const { missionId } = useParams<{ missionId: string }>();
  const mission = getDrVictoriaMissionById(missionId);
  const hubPath = DR_VICTORIA_LEARNING_HUB.routes.familyHub;

  if (!mission) {
    return <Navigate to={hubPath} replace />;
  }

  return (
    <GameAssessmentFlow
      config={mission.config}
      themeClassName={mission.config.shellClassName ?? 'victoria-game'}
      exitPath={hubPath}
      exitLabel="Back to Learning Hub"
      useVictoriaHeader
      embedded
      skipLanding
      portalSectionPath={DR_VICTORIA_LEARNING_HUB.routes.familySection}
      portalSectionLabel="Return to Parent Corner"
      victoriaHubContinueLabel="Continue Learning Hub"
    />
  );
}
