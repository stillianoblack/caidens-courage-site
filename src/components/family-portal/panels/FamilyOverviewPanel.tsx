import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import { readParentClaimContext } from '../../../config/parentClaimContext';
import { useFamilyDashboardMetrics } from '../../../hooks/useFamilyDashboardMetrics';
import { resolveTrackingProgramCode } from '../../../lib/activeProgramContext';
import { getPortalRoute } from '../../../lib/portalGamePaths';
import { buildFamilyNeedsAttention } from '../../../lib/familyOverviewInsights';
import {
  buildFamilyOverviewB4QuickActions,
  buildFamilyRecommendedNext,
} from '../../../lib/familyOverviewRecommendations';
import { familyPortalPath } from '../../../lib/familyPortalPaths';
import {
  buildFamilyRecentActivityTimeline,
  computeChildBaselinePct,
  computeChildProgressRows,
  countFamilyCertificatesEarned,
} from '../../../lib/familyProgressMetrics';
import {
  fetchProgramGoals,
  PROGRAM_GOALS_SAVED_EVENT,
} from '../../../lib/programGoalsService';
import type { ProgramGoalsRecord } from '../../../lib/programGoalsService';
import type { StudentFamilyLink } from '../../../lib/studentFamilyLinkService';
import { normalizeGalleryStatus } from '../../../lib/studentGalleryService';
import { fetchFamilyGallerySubmissions } from '../../../lib/studentGalleryService';
import { getFamilyGallerySubmitterKey } from '../../../lib/familyGallerySession';
import AddChildForm from '../AddChildForm';
import ActiveChildSelector from '../ActiveChildSelector';
import { useActiveChild } from '../../../hooks/useActiveChild';
import FamilyAccessCodeCard from '../FamilyAccessCodeCard';
import FamilyB4QuickActions from '../FamilyB4QuickActions';
import FamilyCertificatePreviewCard from '../FamilyCertificatePreviewCard';
import FamilyChildrenSection from '../FamilyChildrenSection';
import FamilyChildProgressDrawer from '../FamilyChildProgressDrawer';
import FamilyGoalsSummaryCard from '../FamilyGoalsSummaryCard';
import FamilyNeedsAttentionCard from '../FamilyNeedsAttentionCard';
import FamilyParentClaimStatus from '../FamilyParentClaimStatus';
import FamilyRecommendedNextCard from '../FamilyRecommendedNextCard';
import { useFamilyPortalShell } from '../../../hooks/useFamilyPortalShell';
import FocusSkillsSnapshot from '../../focus-skills/FocusSkillsSnapshot';
import {
  BaselineOverviewBars,
  MetricCard,
  RecentActivityFeed,
  StatusChip,
} from '../../portal-design-system';
import type { StudentGalleryItem } from '../../../lib/studentGalleryService';
import '../../focus-skills/focus-skills-snapshot.css';
import '../../portal-design-system/portal-design-system.css';

const RECENT_ACTIVITY_EMPTY =
  'No recent activity yet. Try a short activity with your child to get started.';

export default function FamilyOverviewPanel() {
  const location = useLocation();
  const programCode = resolveTrackingProgramCode() ?? undefined;
  const {
    children,
    visibleChildren,
    familyLinks,
    claimRequired,
    campProgramCode,
    campProgramName,
    parentGuardianName,
    baselineAveragePct,
    certificatesEarned,
    metrics,
    moduleResults,
    v2Assessments,
    studentLegacyBaselines,
    assessmentProgress,
    overallProgress,
    adultBaselineComplete,
    loading,
    refresh,
  } = useFamilyDashboardMetrics(programCode);
  const activeProgram = readActivePilotProgram();
  const parentClaim = readParentClaimContext();
  const { claimStatus } = useFamilyPortalShell(programCode);
  const baselinePath = getPortalRoute('baseline-check', location.pathname);
  const continueLearningPath = familyPortalPath('continue-learning', location.pathname);
  const downloadsPath = familyPortalPath('downloads', location.pathname);
  const certificatesPath = familyPortalPath('certificates', location.pathname);
  const overviewPath = familyPortalPath('', location.pathname);

  const [goalsRecord, setGoalsRecord] = useState<ProgramGoalsRecord | null>(null);
  const [galleryItems, setGalleryItems] = useState<StudentGalleryItem[]>([]);
  const [progressChildId, setProgressChildId] = useState<string | null>(null);

  const galleryPendingCount = useMemo(
    () => galleryItems.filter((item) => normalizeGalleryStatus(item.status) === 'pending').length,
    [galleryItems],
  );
  const gallerySubmissionCount = galleryItems.length;

  useEffect(() => {
    if (!programCode) return;
    void fetchProgramGoals(programCode, 'family').then(setGoalsRecord);
  }, [programCode]);

  useEffect(() => {
    const handleGoalsSaved = (event: Event) => {
      const detail = (event as CustomEvent<ProgramGoalsRecord>).detail;
      if (detail?.program_code === programCode && detail.portal_type === 'family') {
        setGoalsRecord(detail);
      } else if (programCode) {
        void fetchProgramGoals(programCode, 'family').then(setGoalsRecord);
      }
    };
    window.addEventListener(PROGRAM_GOALS_SAVED_EVENT, handleGoalsSaved);
    return () => window.removeEventListener(PROGRAM_GOALS_SAVED_EVENT, handleGoalsSaved);
  }, [programCode]);

  useEffect(() => {
    if (!programCode) return;
    const submitterKey = getFamilyGallerySubmitterKey();
    void fetchFamilyGallerySubmissions(submitterKey, programCode).then(setGalleryItems);
  }, [programCode]);

  const selectableChildren = useMemo(
    () =>
      visibleChildren
        .map((child) => ({
          participantId: child.studentId,
          displayName: child.displayName,
          firstName: child.displayName,
        }))
        .filter((child) => Boolean(child.participantId)),
    [visibleChildren],
  );

  const { activeChild, needsChildSelection, selectChild } = useActiveChild(selectableChildren);

  const activeChildSummary = useMemo(
    () => children.find((child) => child.participantId === activeChild?.participantId) ?? children[0] ?? null,
    [activeChild?.participantId, children],
  );

  const focusChildIds = useMemo(() => {
    const activeId = activeChildSummary?.participantId ?? activeChild?.participantId;
    if (activeId) return [activeId];
    return children.map((child) => child.participantId).filter((id): id is string => Boolean(id));
  }, [activeChild?.participantId, activeChildSummary?.participantId, children]);

  const childNameMap = useMemo(
    () =>
      Object.fromEntries(
        children
          .filter((child) => child.participantId)
          .map((child) => [child.participantId as string, child.displayName]),
      ),
    [children],
  );

  const focusGoal = goalsRecord?.selected_goals?.[0] ?? 'Not set yet';
  const goalsStatus =
    goalsRecord?.completed_at || (goalsRecord?.selected_goals?.length ?? 0) > 0
      ? `${goalsRecord?.selected_goals?.length ?? 0} selected`
      : 'Not set yet';

  const guardianLabel =
    parentGuardianName ||
    parentClaim?.email ||
    activeProgram?.adminFirstName ||
    'Parent/Guardian';

  const campLabel = campProgramName ?? campProgramCode ?? activeProgram?.groupName ?? null;

  const activeChildCertificates = useMemo(() => {
    if (!activeChildSummary?.participantId) return certificatesEarned;
    return countFamilyCertificatesEarned({
      moduleResults,
      allowedStudentIds: [activeChildSummary.participantId],
    });
  }, [activeChildSummary?.participantId, certificatesEarned, moduleResults]);

  const recentActivityItems = useMemo(
    () =>
      buildFamilyRecentActivityTimeline({
        moduleResults,
        v2Assessments,
        legacyBaselines: studentLegacyBaselines,
        allowedStudentIds: focusChildIds,
        familyLinks,
        childNames: childNameMap,
        goalsCompletedAt: goalsRecord?.completed_at,
        goalsCount: goalsRecord?.selected_goals?.length ?? 0,
        gallerySubmissions: galleryItems.map((item) => ({
          id: item.id,
          created_at: item.created_at,
          title: item.title,
        })),
        limit: 5,
      }),
    [
      childNameMap,
      familyLinks,
      focusChildIds,
      galleryItems,
      goalsRecord?.completed_at,
      goalsRecord?.selected_goals?.length,
      moduleResults,
      studentLegacyBaselines,
      v2Assessments,
    ],
  );

  const progressDrawerChild =
    children.find((child) => child.participantId === progressChildId) ?? null;

  const progressDrawerLink = useMemo((): StudentFamilyLink | null => {
    if (!progressChildId) return null;
    return familyLinks.find((link) => link.student_id === progressChildId) ?? familyLinks[0] ?? null;
  }, [familyLinks, progressChildId]);

  const progressDrawerBaselinePct = useMemo(() => {
    if (!progressChildId) return null;
    return computeChildBaselinePct({
      participantId: progressChildId,
      v2Assessments,
      legacyBaselines: studentLegacyBaselines,
    });
  }, [progressChildId, studentLegacyBaselines, v2Assessments]);

  const progressDrawerCertificateCount = useMemo(() => {
    if (!progressChildId) return 0;
    return countFamilyCertificatesEarned({
      moduleResults,
      allowedStudentIds: [progressChildId],
    });
  }, [moduleResults, progressChildId]);

  const progressDrawerBaselineRows = useMemo(() => {
    if (!progressDrawerChild) return [];
    return computeChildProgressRows({
      participantId: progressDrawerChild.participantId,
      baselineStatus: progressDrawerChild.baselineStatus,
      programCode: campProgramCode ?? programCode,
      moduleResults,
    }).map((row) => ({
      key: row.key,
      label: row.label,
      pct: row.pct,
      tone: row.tone,
      labelDetail: row.labelDetail,
    }));
  }, [campProgramCode, moduleResults, progressDrawerChild, programCode]);

  const recommendedNext = useMemo(
    () =>
      buildFamilyRecommendedNext({
        activeChild: activeChildSummary,
        moduleResults,
        baselinePath,
        continueLearningPath,
        downloadsPath,
      }),
    [
      activeChildSummary,
      baselinePath,
      continueLearningPath,
      downloadsPath,
      moduleResults,
    ],
  );

  const b4QuickActions = useMemo(
    () =>
      buildFamilyOverviewB4QuickActions({
        overviewPath,
        continueLearningPath,
        downloadsPath,
      }),
    [continueLearningPath, downloadsPath, overviewPath],
  );

  const openChildDrawer = () => {
    const targetId = activeChildSummary?.participantId ?? children[0]?.participantId;
    if (targetId) setProgressChildId(targetId);
  };

  const metricCards = useMemo(
    () => [
      {
        label: 'Baseline status',
        value: loading ? '—' : activeChildSummary?.baselineStatus ?? '—',
        helperText: activeChildSummary?.displayName,
      },
      {
        label: 'Baseline average',
        value:
          loading || baselineAveragePct == null ? (loading ? '—' : '—') : `${baselineAveragePct}%`,
        helperText: 'Across completed check-ins',
      },
      {
        label: 'Activities completed',
        value: loading ? '—' : String(assessmentProgress.completed),
        helperText: assessmentProgress.label,
      },
      {
        label: 'Modules completed',
        value: loading ? '—' : String(metrics.overall.completed),
        helperText: metrics.overall.label,
      },
      {
        label: 'Certificates earned',
        value: loading ? '—' : String(activeChildCertificates),
        helperText:
          activeChildCertificates > 0 ? 'Modules at 70%+ score' : 'Complete missions to earn',
      },
      {
        label: 'Gallery submissions',
        value: loading ? '—' : String(gallerySubmissionCount),
        helperText: galleryPendingCount > 0 ? `${galleryPendingCount} pending review` : 'Upload artwork anytime',
      },
      {
        label: 'Family goals',
        value: loading ? '—' : goalsStatus,
        helperText: focusGoal !== 'Not set yet' ? `Focus: ${focusGoal}` : 'Set up to 5 support goals',
        accent: Boolean(goalsRecord?.selected_goals?.length),
      },
      {
        label: 'Overall progress',
        value: loading ? '—' : metrics.hasActivity ? `${overallProgress.percent}%` : '0%',
        helperText: overallProgress.label,
        accent: true,
      },
    ],
    [
      activeChildCertificates,
      activeChildSummary,
      assessmentProgress.completed,
      assessmentProgress.label,
      baselineAveragePct,
      focusGoal,
      galleryPendingCount,
      gallerySubmissionCount,
      goalsRecord?.selected_goals?.length,
      goalsStatus,
      loading,
      metrics.hasActivity,
      metrics.overall.completed,
      metrics.overall.label,
      overallProgress.label,
      overallProgress.percent,
    ],
  );

  const needsAttention = useMemo(
    () =>
      buildFamilyNeedsAttention({
        children,
        metrics,
        galleryPendingCount,
        certificateReady: activeChildCertificates > 0,
        baselinePath,
        galleryPath: familyPortalPath('gallery', location.pathname),
        certificatesPath,
        continueLearningPath,
      }),
    [
      activeChildCertificates,
      baselinePath,
      children,
      certificatesPath,
      continueLearningPath,
      galleryPendingCount,
      location.pathname,
      metrics,
    ],
  );

  const baselineRows = useMemo(
    () =>
      metrics.rows.map((row) => ({
        key: row.key,
        label: row.label,
        pct: row.pct,
        tone: row.tone,
        labelDetail: row.labelDetail,
      })),
    [metrics.rows],
  );

  const showProgressBars = !loading && metrics.hasActivity;
  const showEmptyHelper = !loading && !metrics.hasChildActivity && metrics.emptyStateMessage;

  return (
    <div className="family-panel family-panel--overview">
      <FamilyParentClaimStatus status={claimStatus} showDetail className="family-overviewClaim" />

      {activeChildSummary ? (
        <section className="family-overviewSummary">
          <div className="family-overviewSummaryHead">
            <button
              type="button"
              className="family-overviewSummaryNameBtn"
              onClick={openChildDrawer}
            >
              <h2 className="family-overviewSummaryTitle">{activeChildSummary.displayName}</h2>
            </button>
            <StatusChip
              label={activeChildSummary.baselineStatus}
              variant={
                activeChildSummary.baselineStatus === 'Complete'
                  ? 'baseline-complete'
                  : activeChildSummary.baselineStatus === 'In Progress'
                    ? 'in-progress'
                    : 'not-started'
              }
            />
          </div>
          <p className="family-overviewSummaryMeta">
            {guardianLabel ? `Parent/Guardian: ${guardianLabel}` : null}
            {guardianLabel && campLabel ? ' · ' : null}
            {campLabel ? `Camp: ${campLabel}` : null}
            {!campLabel && programCode ? `Program: ${programCode}` : null}
            {' · '}
            Last activity: {activeChildSummary.latestActivity ?? 'No activity yet'}
          </p>
        </section>
      ) : !loading && !claimRequired ? (
        <section className="family-overviewSummary">
          <h2 className="family-overviewSummaryTitle">Family Overview</h2>
          <p className="family-overviewSummaryMeta">
            {guardianLabel ? `Parent/Guardian: ${guardianLabel}` : 'Welcome to your family portal'}
            {campLabel ? ` · Camp: ${campLabel}` : programCode ? ` · Program: ${programCode}` : null}
          </p>
        </section>
      ) : null}

      <div className="family-kpiRow family-kpiRow--ds">
        {metricCards.map((kpi) => (
          <MetricCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            helperText={kpi.helperText}
            accent={kpi.accent}
          />
        ))}
      </div>

      <FamilyAccessCodeCard
        campProgramCode={campProgramCode}
        studentAccessCode={campProgramCode}
      />

      <div className="family-overviewActionRow">
        <FamilyGoalsSummaryCard goals={goalsRecord?.selected_goals ?? []} />
        <FamilyCertificatePreviewCard
          count={activeChildCertificates}
          certificatesPath={certificatesPath}
        />
      </div>

      <FamilyB4QuickActions actions={b4QuickActions} onOpenChildDrawer={openChildDrawer} />
      <FamilyNeedsAttentionCard items={needsAttention} />

      {claimRequired ? (
        <p className="family-panelHelper family-panelHelper--prominent" role="status">
          Enter Parent/Guardian Email to Find Your Child.
        </p>
      ) : null}

      {showEmptyHelper ? (
        <p className="family-panelHelper family-panelHelper--prominent">{metrics.emptyStateMessage}</p>
      ) : null}

      <AddChildForm
        routeToBaseline
        baselinePath={baselinePath}
        onAdded={() => void refresh()}
      />

      {needsChildSelection ? (
        <ActiveChildSelector
          children={selectableChildren}
          activeParticipantId={activeChild?.participantId}
          onSelect={selectChild}
        />
      ) : null}

      <FamilyChildrenSection
        childSummaries={children}
        loading={loading}
        adultBaselineComplete={adultBaselineComplete}
        activeParticipantId={activeChild?.participantId}
        onSelectChild={selectChild}
        onViewProgress={(participantId) => setProgressChildId(participantId)}
      />

      <section className="family-panelBlock">
        <div className="family-panelBlockHead">
          <h2 className="family-panelBlockTitle">Family Progress</h2>
        </div>
        {loading ? (
          <div className="family-progressSkeleton" aria-busy="true" aria-label="Loading progress">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="family-skeletonBar" />
            ))}
          </div>
        ) : null}
        {!loading && !metrics.hasActivity ? (
          <p className="family-panelHelper">
            Progress will appear here after your family completes activities.
          </p>
        ) : null}
        {showProgressBars ? (
          <BaselineOverviewBars rows={baselineRows} />
        ) : null}
      </section>

      <FocusSkillsSnapshot
        className="family-overviewSkills"
        skills={metrics.focusSkills}
        hasActivity={metrics.hasActivity}
        hasChildActivity={metrics.hasChildActivity}
        adultBaselineComplete={adultBaselineComplete}
      />

      <div className="family-overviewSplit">
        <section className="family-panelBlock">
          <div className="family-panelBlockHead">
            <h2 className="family-panelBlockTitle">Recent Activity</h2>
          </div>
          <RecentActivityFeed
            items={recentActivityItems}
            loading={loading}
            emptyMessage={RECENT_ACTIVITY_EMPTY}
          />
        </section>

        <FamilyRecommendedNextCard
          recommendation={recommendedNext}
          fromPath={location.pathname}
        />
      </div>

      <FamilyChildProgressDrawer
        open={Boolean(progressChildId)}
        onClose={() => setProgressChildId(null)}
        child={progressDrawerChild}
        goalsRecord={goalsRecord}
        gallerySubmissionCount={gallerySubmissionCount}
        certificateCount={progressDrawerCertificateCount}
        campProgramCode={campProgramCode}
        campProgramName={campProgramName}
        baselineScorePct={progressDrawerBaselinePct}
        baselineRows={progressDrawerBaselineRows}
        familyLink={progressDrawerLink}
        parentGuardianName={parentGuardianName}
      />
    </div>
  );
}
