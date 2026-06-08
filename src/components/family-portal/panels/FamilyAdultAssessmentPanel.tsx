import React from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import AdultGrowthCheckFlow from '../../adult-assessment/AdultGrowthCheckFlow';
import type { AdultAssessmentPhase } from '../../../data/adultGrowthCheckContent';
import { canAccessAdultAssessmentPhase } from '../../../lib/adultAssessmentAccess';
import { buildAdultLearningFlowCards } from '../../../lib/adultAssessmentProgress';
import { getPortalRoute } from '../../../lib/portalGamePaths';

function resolvePhase(raw?: string): AdultAssessmentPhase | null {
  if (raw === 'baseline' || raw === 'growth') return raw;
  return null;
}

export default function FamilyAdultAssessmentPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { phase: phaseParam } = useParams<{ phase: string }>();
  const phase = resolvePhase(phaseParam);

  if (!phase || !canAccessAdultAssessmentPhase(phase)) {
    return <Navigate to={getPortalRoute('guide', location.pathname)} replace />;
  }

  const returnHref = getPortalRoute('guide', location.pathname);
  const continueLearningHref = getPortalRoute('guide', location.pathname);
  const flowCards = buildAdultLearningFlowCards(location.pathname);
  const drVictoriaTrainingHref = flowCards[1]?.href;

  return (
    <AdultGrowthCheckFlow
      phase={phase}
      embedded
      familyPortal
      returnHref={returnHref}
      drVictoriaTrainingHref={drVictoriaTrainingHref}
      continueLearningHref={continueLearningHref}
      onExit={() => navigate(returnHref)}
    />
  );
}
