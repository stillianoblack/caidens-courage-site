import { useCallback, useEffect, useMemo, useState } from 'react';
import { CHILD_PROFILE_UPDATED_EVENT } from '../config/activeChildParticipant';
import { resolveTrackingProgramCode } from '../lib/activeProgramContext';
import { ADULT_ASSESSMENT_PROGRESS_EVENT } from '../lib/adultAssessmentStorage';
import { computeFamilyChildrenSummaries, type FamilyChildSummary } from '../lib/familyChildrenMetrics';
import {
  computeFamilyProgressSnapshot,
  type FamilyProgressSnapshot,
} from '../lib/familyProgressMetrics';
import {
  hasAdultBaselineAssessment,
  hasAdultGrowthAssessment,
  loadFamilyDashboardData,
  type FamilyDashboardData,
} from '../lib/familyDashboardDataService';
import {
  logFamilyProgressMetrics,
  partitionAdultAssessments,
  partitionChildAssessments,
  type ProgressCounts,
} from '../lib/familyProgressHelpers';

const EMPTY_DATA: FamilyDashboardData = {
  programCode: '',
  studentParticipants: [],
  studentLegacyBaselines: [],
  adultLegacyAssessments: [],
  v2Assessments: [],
  moduleResults: [],
  errors: [],
};

const EMPTY_SNAPSHOT = computeFamilyProgressSnapshot({ programCode: '' });

export type FamilyDashboardMetrics = {
  programCode: string;
  children: FamilyChildSummary[];
  metrics: FamilyProgressSnapshot;
  adultBaselineComplete: boolean;
  adultGrowthComplete: boolean;
  assessmentCount: number;
  assessmentProgress: ProgressCounts;
  overallProgress: ProgressCounts;
  loading: boolean;
  refresh: () => Promise<void>;
};

export function useFamilyDashboardMetrics(programCode?: string): FamilyDashboardMetrics {
  const resolvedCode = programCode?.trim() || resolveTrackingProgramCode() || '';
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FamilyDashboardData>(EMPTY_DATA);

  const refresh = useCallback(async () => {
    if (!resolvedCode) {
      setData(EMPTY_DATA);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const payload = await loadFamilyDashboardData(resolvedCode);
      setData(payload);
    } finally {
      setLoading(false);
    }
  }, [resolvedCode]);

  useEffect(() => {
    void refresh();

    const handleRefresh = () => {
      void refresh();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refresh();
      }
    };

    window.addEventListener('cc-baseline-complete', handleRefresh);
    window.addEventListener(CHILD_PROFILE_UPDATED_EVENT, handleRefresh);
    window.addEventListener(ADULT_ASSESSMENT_PROGRESS_EVENT, handleRefresh);
    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('cc-baseline-complete', handleRefresh);
      window.removeEventListener(CHILD_PROFILE_UPDATED_EVENT, handleRefresh);
      window.removeEventListener(ADULT_ASSESSMENT_PROGRESS_EVENT, handleRefresh);
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refresh]);

  return useMemo(() => {
    const adultBaselineComplete = hasAdultBaselineAssessment(
      data.v2Assessments,
      data.adultLegacyAssessments,
    );
    const adultGrowthComplete = hasAdultGrowthAssessment(
      data.v2Assessments,
      data.adultLegacyAssessments,
    );

    const children = computeFamilyChildrenSummaries({
      programCode: data.programCode,
      participants: data.studentParticipants,
      moduleResults: data.moduleResults,
      assessmentResults: data.v2Assessments,
      legacyBaselines: data.studentLegacyBaselines,
    });

    const metrics = data.programCode
      ? computeFamilyProgressSnapshot({
          programCode: data.programCode,
          moduleResults: data.moduleResults,
          assessmentResults: data.v2Assessments,
          legacyBaselines: data.studentLegacyBaselines,
          adultBaselineComplete,
          adultGrowthComplete,
          children,
        })
      : EMPTY_SNAPSHOT;

    logFamilyProgressMetrics({
      activeProgramCode: data.programCode,
      children,
      adultAssessments: partitionAdultAssessments(data.v2Assessments),
      childAssessments: partitionChildAssessments(data.v2Assessments),
      moduleResults: data.moduleResults,
      completedCount: metrics.overall.completed,
      totalCount: metrics.overall.total,
      overallPercent: metrics.overall.percent,
    });

    return {
      programCode: data.programCode,
      children,
      metrics,
      adultBaselineComplete,
      adultGrowthComplete,
      assessmentCount: metrics.assessments.completed,
      assessmentProgress: metrics.assessments,
      overallProgress: metrics.overall,
      loading,
      refresh,
    };
  }, [data, loading, refresh]);
}
