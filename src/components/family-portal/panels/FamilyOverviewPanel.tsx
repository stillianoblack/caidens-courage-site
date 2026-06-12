import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import { readParentClaimContext } from '../../../config/parentClaimContext';
import { useFamilyDashboardMetrics } from '../../../hooks/useFamilyDashboardMetrics';
import { resolveTrackingProgramCode } from '../../../lib/activeProgramContext';
import { getPortalRoute } from '../../../lib/portalGamePaths';
import { buildFamilyNeedsAttention } from '../../../lib/familyOverviewInsights';
import { buildFamilyRecommendedNext } from '../../../lib/familyOverviewRecommendations';
import { buildFamilyB4Insights } from '../../../lib/familyB4InsightsBuilders';
import {
  familyGoalsPath,
  familyPortalPath,
  familySettingsChildrenGradePath,
  familySettingsTabPath,
} from '../../../lib/familyPortalPaths';
import type { FamilyB4InsightTopic } from '../../../types/b4Insights';
import { useFamilyOnboardingStatus } from '../../../hooks/useFamilyOnboardingStatus';
import {
  buildFamilyRecentActivityTimeline,
  computeChildBaselinePct,
  countFamilyCertificatesEarned,
} from '../../../lib/familyProgressMetrics';
import {
  fetchProgramGoals,
  PROGRAM_GOALS_SAVED_EVENT,
} from '../../../lib/programGoalsService';
import type { ProgramGoalsRecord } from '../../../lib/programGoalsService';
import { normalizeGalleryStatus } from '../../../lib/studentGalleryService';
import { fetchFamilyGallerySubmissions } from '../../../lib/studentGalleryService';
import { getFamilyGallerySubmitterKey } from '../../../lib/familyGallerySession';
import { FOCUS_FLAME_ADD_CHILD_EVENT } from '../../../lib/focusFlameJourney';
import AddChildForm from '../AddChildForm';
import ActiveChildSelector from '../ActiveChildSelector';
import { useActiveChild } from '../../../hooks/useActiveChild';
import FamilyChildrenSection from '../FamilyChildrenSection';
import B4InsightsDrawer from '../../../design-system/components/B4InsightsDrawer';
import FamilyChildSummaryCard from '../FamilyChildSummaryCard';
import FamilyNeedsAttentionCard from '../FamilyNeedsAttentionCard';
import FamilyParentClaimStatus from '../FamilyParentClaimStatus';
import FamilyRecommendedNextCard from '../FamilyRecommendedNextCard';
import { FamilyJourneyCoachInline } from '../FamilyJourneyCoachPlacement';
import FamilyOnboardingMobileCard from '../FamilyOnboardingMobileCard';
import { useFamilyPortalShell } from '../../../hooks/useFamilyPortalShell';
import { resolveSelectableFamilyChildren } from '../../../lib/familyOnboardingUtils';
import FamilyMissingActionPrompt from '../FamilyMissingActionPrompt';
import {
  formatFamilyRelativeActivityDate,
  resolveChildModuleCounts,
  resolveChildDisplayInitials,
  resolveFamilyChildAvatarSrc,
} from '../../../lib/familyChildSummaryCard';
import FocusSkillsSnapshot from '../../focus-skills/FocusSkillsSnapshot';
import {
  BaselineOverviewBars,
  MetricCard,
  RecentActivityFeed,
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
    baselineAveragePct,
    certificatesEarned,
    metrics,
    moduleResults,
    v2Assessments,
    studentLegacyBaselines,
    studentParticipants,
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
  const addChildRef = useRef<HTMLDivElement | null>(null);

  const [goalsRecord, setGoalsRecord] = useState<ProgramGoalsRecord | null>(null);
  const [galleryItems, setGalleryItems] = useState<StudentGalleryItem[]>([]);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [insightTopic, setInsightTopic] = useState<FamilyB4InsightTopic>('overall');
  const [insightChildId, setInsightChildId] = useState<string | null>(null);
  const onboarding = useFamilyOnboardingStatus();

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
    () => resolveSelectableFamilyChildren(visibleChildren, children),
    [children, visibleChildren],
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

  const insightChild = useMemo(() => {
    const targetId =
      insightChildId ?? activeChildSummary?.participantId ?? children[0]?.participantId ?? null;
    if (!targetId) return activeChildSummary;
    return children.find((child) => child.participantId === targetId) ?? activeChildSummary;
  }, [activeChildSummary, children, insightChildId]);

  const insightCertificateCount = useMemo(() => {
    if (!insightChild?.participantId) return 0;
    return countFamilyCertificatesEarned({
      moduleResults,
      allowedStudentIds: [insightChild.participantId],
    });
  }, [insightChild?.participantId, moduleResults]);

  const insightBaselinePct = useMemo(() => {
    if (!insightChild?.participantId) return null;
    return computeChildBaselinePct({
      participantId: insightChild.participantId,
      v2Assessments,
      legacyBaselines: studentLegacyBaselines,
    });
  }, [insightChild?.participantId, studentLegacyBaselines, v2Assessments]);

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

  const metricCards = useMemo(
    () => [
      {
        key: 'overall' as const,
        label: 'Overall progress',
        value: loading ? '—' : metrics.hasActivity ? `${overallProgress.percent}%` : '0%',
        helperText: overallProgress.label,
        accent: true,
      },
      {
        key: 'modules' as const,
        label: 'Weekly adventures',
        value: loading ? '—' : String(metrics.overall.completed),
        helperText: metrics.overall.label,
      },
      {
        key: 'baseline' as const,
        label: 'Baseline status',
        value: loading ? '—' : activeChildSummary?.baselineStatus ?? '—',
        helperText: activeChildSummary?.displayName,
      },
      {
        key: 'family-goals' as const,
        label: 'Family goals',
        value: loading ? '—' : goalsStatus,
        helperText: focusGoal !== 'Not set yet' ? `Focus: ${focusGoal}` : 'Set up to 5 support goals',
        accent: Boolean(goalsRecord?.selected_goals?.length),
      },
    ],
    [
      activeChildSummary,
      focusGoal,
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

  const childrenGradeSettingsPath = familySettingsChildrenGradePath(location.pathname);
  const familyGoalsSettingsPath = familyGoalsPath(location.pathname);

  const showAddChildForm = !claimRequired && !loading && !onboarding.hasChild;
  const showAddGradePrompt = !claimRequired && !loading && onboarding.hasChild && !onboarding.hasChildGrade;
  const showSetGoalsPrompt =
    !claimRequired && !loading && onboarding.hasChild && onboarding.hasChildGrade && !onboarding.hasFamilyGoals;
  const showB4CheckInPrompt =
    !claimRequired &&
    !loading &&
    onboarding.hasChild &&
    onboarding.hasChildGrade &&
    onboarding.hasFamilyGoals &&
    !onboarding.hasCompletedB4CheckIn;

  const showChildSummaryCard = onboarding.hasChild && Boolean(activeChildSummary);

  const childSummaryProgramName =
    campProgramName ?? campProgramCode ?? activeProgram?.groupName ?? programCode ?? 'Your Program';

  const openInsights = (topic: FamilyB4InsightTopic, participantId?: string | null) => {
    setInsightTopic(topic);
    setInsightChildId(participantId ?? activeChildSummary?.participantId ?? children[0]?.participantId ?? null);
    setInsightsOpen(true);
  };

  const insightsPayload = useMemo(
    () =>
      buildFamilyB4Insights({
        topic: insightTopic,
        child: insightChild,
        programName: childSummaryProgramName,
        metrics,
        overallProgress,
        goalsStatus,
        onboarding: {
          hasChild: onboarding.hasChild,
          hasChildGrade: onboarding.hasChildGrade,
          hasFamilyGoals: onboarding.hasFamilyGoals,
          hasCompletedB4CheckIn: onboarding.hasCompletedB4CheckIn,
          hasChosenPath: onboarding.hasChosenPath,
        },
        needsAttention,
        baselineAveragePct,
        assessmentProgress,
        gallerySubmissionCount,
        certificateCount: insightCertificateCount,
        baselineScorePct: insightBaselinePct,
        paths: {
          baseline: baselinePath,
          continueLearning: continueLearningPath,
          familyGoals: familyGoalsPath(location.pathname),
          childrenSettings: familySettingsTabPath('children', location.pathname),
          settingsOverview: familySettingsTabPath('overview', location.pathname),
        },
      }),
    [
      assessmentProgress,
      baselineAveragePct,
      baselinePath,
      childSummaryProgramName,
      continueLearningPath,
      goalsStatus,
      insightBaselinePct,
      insightCertificateCount,
      insightChild,
      insightTopic,
      location.pathname,
      metrics,
      needsAttention,
      onboarding.hasChild,
      onboarding.hasChildGrade,
      onboarding.hasChosenPath,
      onboarding.hasCompletedB4CheckIn,
      onboarding.hasFamilyGoals,
      overallProgress,
      gallerySubmissionCount,
    ],
  );

  const childSummaryModuleCounts = useMemo(
    () =>
      resolveChildModuleCounts(activeChildSummary?.participantId ?? null, moduleResults),
    [activeChildSummary?.participantId, moduleResults],
  );

  const childSummaryAvatarSrc = useMemo(
    () =>
      resolveFamilyChildAvatarSrc({
        participantId: activeChildSummary?.participantId ?? null,
        moduleResults,
      }),
    [activeChildSummary?.participantId, moduleResults],
  );

  const activeChildParticipant = useMemo(
    () =>
      studentParticipants.find(
        (row) => row.id === (activeChildSummary?.participantId ?? activeChild?.participantId),
      ),
    [activeChild?.participantId, activeChildSummary?.participantId, studentParticipants],
  );

  const childSummaryLastActivity = useMemo(
    () => formatFamilyRelativeActivityDate(activeChildSummary?.lastActivityAt),
    [activeChildSummary?.lastActivityAt],
  );

  const childSummaryOptions = useMemo(
    () =>
      children
        .filter((child) => child.participantId)
        .map((child) => ({
          participantId: child.participantId as string,
          displayName: child.displayName,
        })),
    [children],
  );

  useEffect(() => {
    if (loading) return;
    const linkedChildFound = familyLinks.some((link) => Boolean(link.student_id?.trim()));
    console.info('[FAMILY_CHILD_SUMMARY]', {
      family_user_id: parentClaim?.email?.trim() || parentClaim?.phone?.trim() || null,
      participant_id: activeChildSummary?.participantId ?? null,
      program_code: programCode ?? null,
      linked_child_found: linkedChildFound || Boolean(activeChildSummary?.participantId),
    });
  }, [
    activeChildSummary?.participantId,
    familyLinks,
    loading,
    parentClaim?.email,
    parentClaim?.phone,
    programCode,
  ]);

  const scrollToAddChild = () => {
    addChildRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const handleAddChildFocus = () => scrollToAddChild();
    window.addEventListener(FOCUS_FLAME_ADD_CHILD_EVENT, handleAddChildFocus);
    return () => window.removeEventListener(FOCUS_FLAME_ADD_CHILD_EVENT, handleAddChildFocus);
  }, []);

  return (
    <div className="family-overviewPage">
      <FamilyOnboardingMobileCard />
      <div className="family-panel family-panel--overview">
      <FamilyParentClaimStatus status={claimStatus} showDetail className="family-overviewClaim" />

      {showChildSummaryCard && activeChildSummary ? (
        <FamilyChildSummaryCard
          childName={activeChildSummary.displayName}
          programName={childSummaryProgramName}
          baselineStatus={activeChildSummary.baselineStatus}
          modulesCompleted={childSummaryModuleCounts.completed}
          modulesTotal={childSummaryModuleCounts.total}
          lastActivityLabel={childSummaryLastActivity}
          gradeLevel={activeChildParticipant?.grade_level}
          gradeBand={activeChildParticipant?.grade_band}
          avatarSrc={childSummaryAvatarSrc}
          avatarInitials={resolveChildDisplayInitials(activeChildSummary.displayName)}
          childOptions={childSummaryOptions}
          activeParticipantId={activeChild?.participantId ?? activeChildSummary.participantId}
          onSelectChild={(participantId) => {
            const match = selectableChildren.find((child) => child.participantId === participantId);
            if (match) selectChild(match);
          }}
          onViewProgress={() => openInsights('child-progress')}
          onOpenInsights={() => openInsights('child-progress')}
          loading={loading}
        />
      ) : null}

      {showAddChildForm ? (
        <div id="family-add-child" ref={addChildRef}>
          <AddChildForm
            routeToBaseline
            baselinePath={baselinePath}
            onAdded={() => {
              void refresh();
            }}
          />
        </div>
      ) : null}

      {showAddGradePrompt ? (
        <FamilyMissingActionPrompt
          kind="add-grade"
          actionHref={childrenGradeSettingsPath}
        />
      ) : null}

      {showSetGoalsPrompt ? (
        <FamilyMissingActionPrompt
          kind="set-goals"
          actionHref={familyGoalsSettingsPath}
        />
      ) : null}

      {showB4CheckInPrompt ? (
        <FamilyMissingActionPrompt
          kind="b4-check-in"
          actionHref={baselinePath}
        />
      ) : null}

      <div className="family-kpiRow family-kpiRow--ds">
        {metricCards.map((kpi) => (
          <MetricCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            helperText={kpi.helperText}
            accent={kpi.accent}
            onClick={() => openInsights(kpi.key)}
          />
        ))}
      </div>

      <FamilyNeedsAttentionCard
        items={needsAttention}
        onItemClick={() => openInsights('needs-attention')}
      />

      {claimRequired ? (
        <p className="family-panelHelper family-panelHelper--prominent" role="status">
          Enter Parent/Guardian Email to Find Your Child.
        </p>
      ) : null}

      {showEmptyHelper ? (
        <p className="family-panelHelper family-panelHelper--prominent">{metrics.emptyStateMessage}</p>
      ) : null}

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
        onViewProgress={(participantId) => openInsights('child-progress', participantId)}
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
      </div>

      <FamilyJourneyCoachInline />

      <B4InsightsDrawer
        isOpen={insightsOpen}
        onClose={() => {
          setInsightsOpen(false);
          setInsightChildId(null);
        }}
        {...insightsPayload}
      />
    </div>
  );
}
