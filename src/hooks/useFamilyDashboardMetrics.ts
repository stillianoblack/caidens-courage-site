import { useCallback, useEffect, useMemo, useState } from 'react';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { afterIdle } from '../lib/defer';
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
  loading: boolean;
  refresh: () => Promise<void>;
};

export function useFamilyDashboardMetrics(programCode?: string): FamilyDashboardMetrics {
  const resolvedCode = programCode ?? readActivePilotProgram()?.programCode;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FamilyDashboardData>(EMPTY_DATA);

  const refresh = useCallback(async () => {
    if (!resolvedCode?.trim()) {
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
    afterIdle(() => {
      void refresh();
    });
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

    const childAssessmentsComplete = children.filter(
      (child) => child.baselineStatus === 'Complete',
    ).length;
    const assessmentCount =
      childAssessmentsComplete + (adultBaselineComplete ? 1 : 0) + (adultGrowthComplete ? 1 : 0);

    const metrics = data.programCode
      ? computeFamilyProgressSnapshot({
          programCode: data.programCode,
          moduleResults: data.moduleResults,
          assessmentResults: data.v2Assessments,
          legacyBaselines: data.studentLegacyBaselines,
          adultBaselineComplete,
          adultGrowthComplete,
        })
      : EMPTY_SNAPSHOT;

    return {
      programCode: data.programCode,
      children,
      metrics,
      adultBaselineComplete,
      adultGrowthComplete,
      assessmentCount,
      loading,
      refresh,
    };
  }, [data, loading, refresh]);
}
