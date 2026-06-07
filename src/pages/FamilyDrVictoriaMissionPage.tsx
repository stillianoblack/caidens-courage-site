import React from 'react';
import { Navigate } from 'react-router-dom';
import GameAssessmentFlow from '../components/game-assessment/GameAssessmentFlow';
import { FAMILY_PORTAL_PATH } from '../config/courageRoutes';
import { DR_VICTORIA_MISSION_1_CONFIG } from '../data/adult';

export default function FamilyDrVictoriaMissionPage() {
  if (!DR_VICTORIA_MISSION_1_CONFIG) {
    return <Navigate to={`${FAMILY_PORTAL_PATH}/guide`} replace />;
  }

  return (
    <GameAssessmentFlow
      config={DR_VICTORIA_MISSION_1_CONFIG}
      themeClassName="victoria-game"
      exitPath={`${FAMILY_PORTAL_PATH}/guide`}
      exitLabel="Back to Parent Corner"
      useVictoriaHeader
      embedded
      familyPortalPath={FAMILY_PORTAL_PATH}
    />
  );
}
