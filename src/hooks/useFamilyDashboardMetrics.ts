import { useCallback, useEffect, useMemo, useState } from 'react';
import { CHILD_PROFILE_UPDATED_EVENT } from '../config/activeChildParticipant';
import { MODULE_COMPLETE_EVENT } from '../lib/activeChildContext';
import { resolveTrackingProgramCode } from '../lib/activeProgramContext';
import { ADULT_ASSESSMENT_PROGRESS_EVENT } from '../lib/adultAssessmentStorage';
import { computeFamilyChildrenSummaries, type FamilyChildSummary } from '../lib/familyChildrenMetrics';
import type { FamilyVisibleChild, StudentFamilyLink } from '../lib/studentFamilyLinkService';
import {
  computeFamilyProgressSnapshot,
  computeFamilyBaselineAverage,
  countFamilyCertificatesEarned,
  type FamilyProgressSnapshot,
} from '../lib/familyProgressMetrics';
import {
  fetchPilotProgramDisplayName,
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
  visibleChildren: [],
  allowedStudentIds: [],
  familyLinks: [],
  studentLegacyBaselines: [],
  adultLegacyAssessments: [],
  v2Assessments: [],
  moduleResults: [],
  errors: [],
  claimRequired: false,
};

const EMPTY_SNAPSHOT = computeFamilyProgressSnapshot({ programCode: '' });

export type FamilyDashboardMetrics = {
  programCode: string;
  children: FamilyChildSummary[];
  visibleChildren: FamilyVisibleChild[];
  familyLinks: StudentFamilyLink[];
  campProgramCode: string | null;
  campProgramName: string | null;
  parentGuardianName: string | null;
  baselineAveragePct: number | null;
  certificatesEarned: number;
  claimRequired: boolean;
  metrics: FamilyProgressSnapshot;
  moduleResults: FamilyDashboardData['moduleResults'];
  v2Assessments: FamilyDashboardData['v2Assessments'];
  studentLegacyBaselines: FamilyDashboardData['studentLegacyBaselines'];
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
  const [campProgramName, setCampProgramName] = useState<string | null>(null);

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
    window.addEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
    window.addEventListener(CHILD_PROFILE_UPDATED_EVENT, handleRefresh);
    window.addEventListener(ADULT_ASSESSMENT_PROGRESS_EVENT, handleRefresh);
    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('cc-baseline-complete', handleRefresh);
      window.removeEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
      window.removeEventListener(CHILD_PROFILE_UPDATED_EVENT, handleRefresh);
      window.removeEventListener(ADULT_ASSESSMENT_PROGRESS_EVENT, handleRefresh);
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refresh]);

  const campProgramCode = useMemo(() => {
    const campLink = data.familyLinks.find((link) => link.camp_program_code?.trim());
    return campLink?.camp_program_code?.trim() ?? null;
  }, [data.familyLinks]);

  useEffect(() => {
    if (!campProgramCode) {
      setCampProgramName(null);
      return;
    }
    let cancelled = false;
    void fetchPilotProgramDisplayName(campProgramCode).then((name) => {
      if (!cancelled) {
        setCampProgramName(name ?? campProgramCode);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [campProgramCode]);

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
      allowedStudentIds: data.allowedStudentIds,
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

    console.info('[PROGRESS_SYNC]', {
      program_code: data.programCode,
      children_count: children.length,
      overall_percent: metrics.overall.percent,
      module_results: data.moduleResults.length,
    });

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

    const baselineAveragePct = computeFamilyBaselineAverage({
      v2Assessments: data.v2Assessments,
      legacyBaselines: data.studentLegacyBaselines,
      allowedStudentIds: data.allowedStudentIds,
    });

    const certificatesEarned = countFamilyCertificatesEarned({
      moduleResults: data.moduleResults,
      allowedStudentIds: data.allowedStudentIds,
    });

    const parentLink = data.familyLinks[0];
    const parentGuardianName =
      parentLink?.parent_first_name?.trim() ||
      parentLink?.parent_last_name?.trim() ||
      null;

    return {
      programCode: data.programCode,
      children,
      visibleChildren: data.visibleChildren,
      familyLinks: data.familyLinks,
      campProgramCode,
      campProgramName,
      parentGuardianName,
      baselineAveragePct,
      certificatesEarned,
      claimRequired: data.claimRequired,
      metrics,
      moduleResults: data.moduleResults,
      v2Assessments: data.v2Assessments,
      studentLegacyBaselines: data.studentLegacyBaselines,
      adultBaselineComplete,
      adultGrowthComplete,
      assessmentCount: metrics.assessments.completed,
      assessmentProgress: metrics.assessments,
      overallProgress: metrics.overall,
      loading,
      refresh,
    };
  }, [campProgramCode, campProgramName, data, loading, refresh]);
}
