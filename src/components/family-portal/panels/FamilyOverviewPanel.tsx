import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CHARACTER_IMAGE_PATHS,
  FAMILY_NEXT_STEP,
} from '../../../data/familyPortalContent';
import { useFamilyDashboardMetrics } from '../../../hooks/useFamilyDashboardMetrics';
import { resolveTrackingProgramCode } from '../../../lib/activeProgramContext';
import { resolvePortalKidsBasePath } from '../../../lib/portalGamePaths';
import { getPortalRoute } from '../../../lib/portalGamePaths';
import { buildFamilyNeedsAttention } from '../../../lib/familyOverviewInsights';
import { familyPortalPath } from '../../../lib/familyPortalPaths';
import { fetchProgramGoals } from '../../../lib/programGoalsService';
import type { ProgramGoalsRecord } from '../../../lib/programGoalsService';
import { normalizeGalleryStatus } from '../../../lib/studentGalleryService';
import { fetchFamilyGallerySubmissions } from '../../../lib/studentGalleryService';
import { getFamilyGallerySubmitterKey } from '../../../lib/familyGallerySession';
import AddChildForm from '../AddChildForm';
import ActiveChildSelector from '../ActiveChildSelector';
import { useActiveChild } from '../../../hooks/useActiveChild';
import FamilyAccessCodeCard from '../FamilyAccessCodeCard';
import FamilyChildrenSection from '../FamilyChildrenSection';
import FamilyChildProgressDrawer from '../FamilyChildProgressDrawer';
import FamilyNeedsAttentionCard from '../FamilyNeedsAttentionCard';
import FamilyValueCards from '../FamilyValueCards';
import FocusSkillsSnapshot from '../../focus-skills/FocusSkillsSnapshot';
import {
  BaselineOverviewBars,
  MetricCard,
} from '../../portal-design-system';
import '../../focus-skills/focus-skills-snapshot.css';
import '../../portal-design-system/portal-design-system.css';

export default function FamilyOverviewPanel() {
  const location = useLocation();
  const programCode = resolveTrackingProgramCode() ?? undefined;
  const {
    children,
    visibleChildren,
    claimRequired,
    metrics,
    assessmentProgress,
    overallProgress,
    adultBaselineComplete,
    loading,
    refresh,
  } = useFamilyDashboardMetrics(programCode);
  const nextStepHref = `${resolvePortalKidsBasePath(location.pathname)}${FAMILY_NEXT_STEP.hrefPath}`;
  const baselinePath = getPortalRoute('baseline-check', location.pathname);

  const [goalsRecord, setGoalsRecord] = useState<ProgramGoalsRecord | null>(null);
  const [galleryPendingCount, setGalleryPendingCount] = useState(0);
  const [gallerySubmissionCount, setGallerySubmissionCount] = useState(0);
  const [progressChildId, setProgressChildId] = useState<string | null>(null);

  useEffect(() => {
    if (!programCode) return;
    void fetchProgramGoals(programCode, 'family').then(setGoalsRecord);
  }, [programCode]);

  useEffect(() => {
    if (!programCode) return;
    const submitterKey = getFamilyGallerySubmitterKey();
    void fetchFamilyGallerySubmissions(submitterKey, programCode).then((items) => {
      const pending = items.filter((item) => normalizeGalleryStatus(item.status) === 'pending').length;
      setGalleryPendingCount(pending);
      setGallerySubmissionCount(items.length);
    });
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

  const focusGoal = goalsRecord?.selected_goals?.[0] ?? 'Not set yet';

  const metricCards = useMemo(
    () => [
      {
        label: 'Baseline status',
        value: loading ? '—' : activeChildSummary?.baselineStatus ?? '—',
        helperText: activeChildSummary?.displayName,
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
        label: 'Gallery submissions',
        value: loading ? '—' : String(gallerySubmissionCount),
        helperText: galleryPendingCount > 0 ? `${galleryPendingCount} pending review` : 'Upload artwork anytime',
      },
      {
        label: 'Current focus goal',
        value: loading ? '—' : focusGoal,
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
      activeChildSummary,
      assessmentProgress.completed,
      assessmentProgress.label,
      focusGoal,
      galleryPendingCount,
      gallerySubmissionCount,
      goalsRecord?.selected_goals?.length,
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
        baselinePath,
        galleryPath: familyPortalPath('gallery', location.pathname),
        certificatesPath: familyPortalPath('certificates', location.pathname),
        continueLearningPath: familyPortalPath('continue-learning', location.pathname),
      }),
    [baselinePath, children, galleryPendingCount, location.pathname, metrics],
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
  const progressDrawerChild =
    children.find((child) => child.participantId === progressChildId) ?? null;

  return (
    <div className="family-panel family-panel--overview">
      {activeChildSummary ? (
        <section className="family-overviewSummary">
          <h2 className="family-overviewSummaryTitle">{activeChildSummary.displayName}</h2>
          <p className="family-overviewSummaryMeta">
            {programCode ? `Program: ${programCode}` : 'Family program'} · Last activity:{' '}
            {activeChildSummary.latestActivity ?? 'No activity yet'}
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

      <FamilyAccessCodeCard />
      <FamilyValueCards />
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
          {metrics.recentActivity.length > 0 ? (
            <ul className="family-activityList">
              {metrics.recentActivity.map((item) => (
                <li key={item} className="family-activityItem">
                  <span className="family-activityDot" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="family-panelHelper">
              {metrics.emptyStateMessage ?? 'Completed games and check-ins will show up here.'}
            </p>
          )}
        </section>

        <section className="family-panelBlock family-nextStepCard family-charCard--caiden">
          <div className="family-charCardStrip" aria-hidden="true" />
          <div className="family-panelBlockHead">
            <h2 className="family-panelBlockTitle">Next Recommended Step</h2>
          </div>
          <div className="family-nextCard">
            <div className="family-nextStepHero">
              <img
                src={CHARACTER_IMAGE_PATHS.caiden ?? undefined}
                alt=""
                className="family-charCardAvatar family-charCardAvatar--sm family-charCardAvatar--caiden"
                width={72}
                height={72}
                loading="lazy"
                decoding="async"
              />
              <div>
                <h3 className="family-nextTitle">{FAMILY_NEXT_STEP.headline}</h3>
                <p className="family-nextCopy">{FAMILY_NEXT_STEP.body}</p>
              </div>
            </div>
            <Link to={nextStepHref} state={{ from: location.pathname }} className="family-nextCta">
              {FAMILY_NEXT_STEP.cta}
            </Link>
          </div>
        </section>
      </div>

      <FamilyChildProgressDrawer
        open={Boolean(progressChildId)}
        onClose={() => setProgressChildId(null)}
        child={progressDrawerChild}
        goalsRecord={goalsRecord}
        gallerySubmissionCount={gallerySubmissionCount}
      />
    </div>
  );
}
