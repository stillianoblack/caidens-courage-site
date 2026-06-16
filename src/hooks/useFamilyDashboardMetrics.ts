import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CHILD_PROFILE_UPDATED_EVENT } from '../config/activeChildParticipant';
import { ACTIVE_CHILD_EVENT, MODULE_COMPLETE_EVENT } from '../lib/activeChildContext';
import { resolveTrackingProgramCode } from '../lib/activeProgramContext';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { isKidFacingPortalRoute } from '../lib/kidFacingPortalRoutes';
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
import type { StudentParticipantRecord } from '../lib/pilotTrackingService';
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
  errors: string[];
  refresh: () => Promise<void>;
  studentParticipants: StudentParticipantRecord[];
};

export function useFamilyDashboardMetrics(programCode?: string): FamilyDashboardMetrics {
  const location = useLocation();
  const resolvedCode = programCode?.trim() || resolveTrackingProgramCode() || '';
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FamilyDashboardData>(EMPTY_DATA);
  const [campProgramName, setCampProgramName] = useState<string | null>(null);

  const scopedParticipantIds = useMemo(() => {
    if (!isKidFacingPortalRoute(location.pathname)) return undefined;
    const activeId = readActiveChildParticipantId().trim();
    return activeId ? [activeId] : undefined;
  }, [location.pathname]);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    if (!resolvedCode) {
      setData(EMPTY_DATA);
      setLoading(false);
      return;
    }

    if (!options?.silent) {
      setLoading(true);
    }
    try {
      const payload = await loadFamilyDashboardData(resolvedCode, {
        scopedParticipantIds,
      });
      setData(payload);
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, [resolvedCode, scopedParticipantIds]);

  useEffect(() => {
    void refresh();

    const handleRefresh = () => {
      void refresh();
    };
    const handleProfileRefresh = () => {
      void refresh({ silent: true });
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refresh();
      }
    };

    window.addEventListener('cc-baseline-complete', handleRefresh);
    window.addEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
    window.addEventListener(ACTIVE_CHILD_EVENT, handleRefresh);
    window.addEventListener(CHILD_PROFILE_UPDATED_EVENT, handleProfileRefresh);
    window.addEventListener(ADULT_ASSESSMENT_PROGRESS_EVENT, handleRefresh);
    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('cc-baseline-complete', handleRefresh);
      window.removeEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
      window.removeEventListener(ACTIVE_CHILD_EVENT, handleRefresh);
      window.removeEventListener(CHILD_PROFILE_UPDATED_EVENT, handleProfileRefresh);
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
          allowedStudentIds: data.allowedStudentIds,
        })
      : EMPTY_SNAPSHOT;

    if (process.env.NODE_ENV === 'development') {
      console.info('[PROGRESS_SYNC]', {
        program_code: data.programCode,
        children_count: children.length,
        overall_percent: metrics.overall.percent,
        module_results: data.moduleResults.length,
      });
    }

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
      errors: data.errors,
      refresh,
      studentParticipants: data.studentParticipants,
    };
  }, [campProgramCode, campProgramName, data, loading, refresh]);
}
