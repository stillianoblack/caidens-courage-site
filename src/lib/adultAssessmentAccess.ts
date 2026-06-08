import type { AdultAssessmentPhase } from '../data/adultGrowthCheckContent';
import {
  isAdultBaselineComplete,
  isDrVictoriaTrainingComplete,
  isUncleTTrainingComplete,
} from './adultAssessmentStorage';

export function canAccessAdultAssessmentPhase(phase: AdultAssessmentPhase): boolean {
  if (phase === 'baseline') {
    return true;
  }

  return (
    isAdultBaselineComplete() &&
    isDrVictoriaTrainingComplete() &&
    isUncleTTrainingComplete()
  );
}
