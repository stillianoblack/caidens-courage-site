import { useCallback, useEffect, useState } from 'react';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { afterIdle } from '../lib/defer';
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
import {
  hasAdultBaselineAssessment,
  hasAdultGrowthAssessment,
  loadFamilyDashboardData,
} from '../lib/familyDashboardDataService';

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

function readLocalAdultLearningStatus(pathname: string): Omit<
  AdultLearningStatus,
  'baselineComplete' | 'growthComplete' | 'bannerVariant' | 'cards' | 'trainingComplete'
> & {
  localBaselineComplete: boolean;
  localGrowthComplete: boolean;
} {
  const { baselineHref, growthHref } = resolveAdultAssessmentPaths(pathname);
  const { drVictoriaHref, uncleTHref } = resolveAdultTrainingPaths(pathname);

  return {
    localBaselineComplete: isAdultBaselineComplete(),
    drVictoriaComplete: isDrVictoriaTrainingComplete(),
    uncleTComplete: isUncleTTrainingComplete(),
    localGrowthComplete: isAdultGrowthComplete(),
    baselineHref,
    growthHref,
    drVictoriaHref,
    uncleTHref,
    baselineRecord: findLatestAdultBaselineRecord(),
    growthRecord: findLatestAdultGrowthRecord(),
  };
}

function buildStatus(
  pathname: string,
  baselineComplete: boolean,
  growthComplete: boolean,
): AdultLearningStatus {
  const local = readLocalAdultLearningStatus(pathname);
  const trainingComplete = local.drVictoriaComplete && local.uncleTComplete;
  const overrides = { baselineComplete, growthComplete };

  return {
    baselineComplete,
    drVictoriaComplete: local.drVictoriaComplete,
    uncleTComplete: local.uncleTComplete,
    growthComplete,
    trainingComplete,
    bannerVariant: resolveAdultLearningBannerVariant(overrides),
    cards: buildAdultLearningFlowCards(pathname, overrides),
    baselineHref: local.baselineHref,
    growthHref: local.growthHref,
    drVictoriaHref: local.drVictoriaHref,
    uncleTHref: local.uncleTHref,
    baselineRecord: local.baselineRecord,
    growthRecord: local.growthRecord,
  };
}

export function useAdultLearningStatus(pathname: string): AdultLearningStatus {
  const programCode = readActivePilotProgram()?.programCode;
  const local = readLocalAdultLearningStatus(pathname);
  const [remoteBaselineComplete, setRemoteBaselineComplete] = useState(false);
  const [remoteGrowthComplete, setRemoteGrowthComplete] = useState(false);

  const refreshRemote = useCallback(async () => {
    if (!programCode?.trim()) {
      setRemoteBaselineComplete(false);
      setRemoteGrowthComplete(false);
      return;
    }

    const payload = await loadFamilyDashboardData(programCode);
    setRemoteBaselineComplete(
      hasAdultBaselineAssessment(payload.v2Assessments, payload.adultLegacyAssessments),
    );
    setRemoteGrowthComplete(
      hasAdultGrowthAssessment(payload.v2Assessments, payload.adultLegacyAssessments),
    );
  }, [programCode]);

  useEffect(() => {
    afterIdle(() => {
      void refreshRemote();
    });
  }, [refreshRemote]);

  useEffect(() => {
    const handleProgress = () => {
      void refreshRemote();
    };
    window.addEventListener(ADULT_ASSESSMENT_PROGRESS_EVENT, handleProgress);
    return () => window.removeEventListener(ADULT_ASSESSMENT_PROGRESS_EVENT, handleProgress);
  }, [refreshRemote]);

  const baselineComplete = local.localBaselineComplete || remoteBaselineComplete;
  const growthComplete = local.localGrowthComplete || remoteGrowthComplete;

  return buildStatus(pathname, baselineComplete, growthComplete);
}
