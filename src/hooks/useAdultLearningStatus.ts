import { useCallback, useEffect, useState } from 'react';
import {
  ADULT_ASSESSMENT_PROGRESS_EVENT,
  findLatestAdultBaselineRecord,
  findLatestAdultGrowthRecord,
  isAdultBaselineComplete,
  isAdultGrowthComplete,
  isDrVictoriaTrainingComplete,
  isUncleTTrainingComplete,
  type AdultAssessmentRecord,
} from '../lib/adultAssessmentStorage';
import {
  buildAdultLearningFlowCards,
  resolveAdultAssessmentPaths,
  resolveAdultLearningBannerVariant,
  resolveAdultTrainingPaths,
  type AdultLearningBannerVariant,
  type AdultLearningFlowCard,
} from '../lib/adultAssessmentProgress';

export type AdultLearningStatus = {
  baselineComplete: boolean;
  drVictoriaComplete: boolean;
  uncleTComplete: boolean;
  growthComplete: boolean;
  trainingComplete: boolean;
  bannerVariant: AdultLearningBannerVariant;
  cards: AdultLearningFlowCard[];
  baselineHref: string;
  growthHref: string;
  drVictoriaHref: string;
  uncleTHref: string;
  baselineRecord: AdultAssessmentRecord | null;
  growthRecord: AdultAssessmentRecord | null;
};

function readAdultLearningStatus(pathname: string): AdultLearningStatus {
  const { baselineHref, growthHref } = resolveAdultAssessmentPaths(pathname);
  const { drVictoriaHref, uncleTHref } = resolveAdultTrainingPaths(pathname);

  return {
    baselineComplete: isAdultBaselineComplete(),
    drVictoriaComplete: isDrVictoriaTrainingComplete(),
    uncleTComplete: isUncleTTrainingComplete(),
    growthComplete: isAdultGrowthComplete(),
    trainingComplete:
      isDrVictoriaTrainingComplete() && isUncleTTrainingComplete(),
    bannerVariant: resolveAdultLearningBannerVariant(),
    cards: buildAdultLearningFlowCards(pathname),
    baselineHref,
    growthHref,
    drVictoriaHref,
    uncleTHref,
    baselineRecord: findLatestAdultBaselineRecord(),
    growthRecord: findLatestAdultGrowthRecord(),
  };
}

export function useAdultLearningStatus(pathname: string): AdultLearningStatus {
  const [status, setStatus] = useState(() => readAdultLearningStatus(pathname));

  const refresh = useCallback(() => {
    setStatus(readAdultLearningStatus(pathname));
  }, [pathname]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleProgress = () => refresh();
    window.addEventListener(ADULT_ASSESSMENT_PROGRESS_EVENT, handleProgress);
    return () => window.removeEventListener(ADULT_ASSESSMENT_PROGRESS_EVENT, handleProgress);
  }, [refresh]);

  return status;
}
