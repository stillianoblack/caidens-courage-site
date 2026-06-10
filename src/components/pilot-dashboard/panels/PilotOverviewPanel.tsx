import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from '../../../lib/pilotTrackingLocalStorage';
import type { PilotTrackingMetrics } from '../../../lib/pilotTrackingMetrics';
import type { ParticipantNameLookup } from '../../../lib/pilotResultsDisplay';
import { remapPortalKidsRoute } from '../../../lib/portalGamePaths';
import {
  PILOT_CHARACTER_TRACKS,
  PILOT_CHARACTER_TRACKS_NOTE,
  PILOT_RECOMMENDED_STEPS,
  type PilotSidebarNavId,
} from '../../../data/pilotDashboardContent';
import CharacterLearningTrackCard from '../CharacterLearningTrackCard';
import PilotBaselineOverview from '../PilotBaselineOverview';
import PilotTrackingDataTables from '../PilotTrackingDataTables';
import PilotNeedsAttentionCard from '../PilotNeedsAttentionCard';
import PilotResultsKpiGrid from '../PilotResultsKpiGrid';
import PilotStudentDetailDrawer from '../PilotStudentDetailDrawer';
import PilotOverviewGalleryCard from '../PilotOverviewGalleryCard';
import PilotB4RecommendationCard from '../PilotB4RecommendationCard';
import { computeNeedsAttention } from '../../../lib/pilotStudentProgress';
import { buildB4Recommendation, buildRecentStudentActivityFeed } from '../../../lib/pilotOverviewInsights';
import type { StudentParticipantRecord } from '../../../lib/pilotTrackingService';
import type { StudentFamilyLink } from '../../../lib/studentFamilyLinkService';
import ProgramAccessCodesCard from '../../pilot-program/ProgramAccessCodesCard';
import DashboardWidgetSkeleton from '../DashboardWidgetSkeleton';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import type { ActivePilotProgram } from '../../../types/pilotProgram';
import {
  fetchFacilitatorApprovedGalleryItems,
  type StudentGalleryItem,
} from '../../../lib/studentGalleryService';

type PilotOverviewPanelProps = {
  metrics: PilotTrackingMetrics;
  moduleResults?: LocalModuleResultRecord[];
  assessmentResults?: LocalAssessmentV2Record[];
  participantLookup?: ParticipantNameLookup;
  participants?: StudentParticipantRecord[];
  familyLinks?: StudentFamilyLink[];
  loading?: boolean;
  warning?: string | null;
  onSelectNav?: (id: PilotSidebarNavId) => void;
  activeProgram?: ActivePilotProgram | null;
};

function formatActivityTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function recommendedStepIndex(baselineChecksCompleted: number): number {
  if (baselineChecksCompleted === 0) return 0;
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return 1 + (dayIndex % (PILOT_RECOMMENDED_STEPS.length - 1));
}

export default function PilotOverviewPanel({
  metrics,
  moduleResults = [],
  assessmentResults = [],
  participantLookup = new Map(),
  participants = [],
  familyLinks = [],
  loading = false,
  warning = null,
  onSelectNav,
  activeProgram = readActivePilotProgram(),
}: PilotOverviewPanelProps) {
  const location = useLocation();
  const [drawerParticipantId, setDrawerParticipantId] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<StudentGalleryItem[]>([]);
  const programCode = activeProgram?.programCode?.trim() ?? '';

  const needsAttention = useMemo(
    () =>
      computeNeedsAttention({
        participants,
        assessments: assessmentResults,
        modules: moduleResults,
      }),
    [assessmentResults, moduleResults, participants],
  );

  useEffect(() => {
    if (!programCode) return;
    let cancelled = false;
    void fetchFacilitatorApprovedGalleryItems(programCode).then((items) => {
      if (!cancelled) setGalleryItems(items);
    });
    return () => {
      cancelled = true;
    };
  }, [programCode]);

  const recentStudentActivity = useMemo(
    () =>
      buildRecentStudentActivityFeed({
        assessments: assessmentResults,
        modules: moduleResults,
        participants,
        galleryItems,
        participantLookup,
        limit: 5,
      }),
    [assessmentResults, galleryItems, moduleResults, participantLookup, participants],
  );

  const b4Recommendation = useMemo(
    () =>
      buildB4Recommendation({
        missingBaseline: needsAttention.missingBaseline,
        noModules: needsAttention.noModules,
      }),
    [needsAttention.missingBaseline, needsAttention.noModules],
  );

  const stepIndex = useMemo(
    () => recommendedStepIndex(metrics.baselineChecksCompleted),
    [metrics.baselineChecksCompleted],
  );

  const recommendedStep = useMemo(
    () => PILOT_RECOMMENDED_STEPS[stepIndex] ?? PILOT_RECOMMENDED_STEPS[0],
    [stepIndex],
  );

  const handleNextStepClick = () => {
    if (recommendedStep.internalNav) {
      onSelectNav?.(recommendedStep.internalNav);
    }
  };

  if (loading) {
    return (
      <div className="pilot-panel pilot-panel--overview">
        {activeProgram ? <ProgramAccessCodesCard program={activeProgram} compact /> : null}
        <DashboardWidgetSkeleton kpiCount={5} showGrowth showActivity />
      </div>
    );
  }

  return (
    <div className="pilot-panel pilot-panel--overview">
      {activeProgram ? <ProgramAccessCodesCard program={activeProgram} compact /> : null}
      {warning ? <p className="pilot-syncWarning">{warning}</p> : null}

      <PilotResultsKpiGrid metrics={metrics} compact />

      <PilotNeedsAttentionCard counts={needsAttention} />

      <section className="pilot-panelBlock pilot-panelBlock--studentActivity">
        <div className="pilot-panelBlockHead">
          <h2 className="pilot-panelBlockTitle">Recent Student Activity</h2>
        </div>
        {recentStudentActivity.length === 0 ? (
          <p className="pilot-emptyNote">No recent activity yet.</p>
        ) : (
          <ul className="pilot-activityList">
            {recentStudentActivity.map((item) => (
              <li key={item.id} className="pilot-activityItem">
                <span className="pilot-activityDot" aria-hidden="true" />
                <div className="pilot-activityBody">
                  <p className="pilot-activityLabel">{item.label}</p>
                </div>
                <time className="pilot-activityTime" dateTime={item.at}>
                  {formatActivityTime(item.at)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="pilot-overviewInsightRow">
        <PilotOverviewGalleryCard programCode={programCode} />
        <PilotB4RecommendationCard recommendation={b4Recommendation} />
      </div>

      <section className="pilot-panelBlock pilot-characterTracks">
        <div className="pilot-panelBlockHead">
          <h2 className="pilot-panelBlockTitle">Character Learning Tracks</h2>
          <p className="pilot-panelBlockSub pilot-characterTracksNote">{PILOT_CHARACTER_TRACKS_NOTE}</p>
        </div>
        <div className="pilot-characterTrackGrid">
          {PILOT_CHARACTER_TRACKS.map((track) => (
            <CharacterLearningTrackCard
              key={track.id}
              id={track.id}
              name={track.name}
              track={track.track}
              imageSrc={track.imageSrc}
              previewHref={remapPortalKidsRoute(track.previewHref, location.pathname)}
              metrics={track.metrics}
              baselineChecksCompleted={metrics.baselineChecksCompleted}
            />
          ))}
        </div>
      </section>

      <section className="pilot-panelBlock pilot-panelBlock--baselineOverview pilot-panelBlock--compact">
        <div className="pilot-panelBlockHead">
          <h2 className="pilot-panelBlockTitle">Baseline Overview</h2>
          <p className="pilot-panelBlockSub">Live baseline averages for this program.</p>
        </div>
        <PilotBaselineOverview
          assessmentResults={assessmentResults}
          participantLookup={participantLookup}
        />
      </section>

      <PilotTrackingDataTables
        assessmentResults={assessmentResults}
        moduleResults={moduleResults}
        participantLookup={participantLookup}
        onStudentClick={setDrawerParticipantId}
        assessmentLimit={5}
        moduleLimit={5}
        showEmptyStates
      />

      <PilotStudentDetailDrawer
        open={Boolean(drawerParticipantId)}
        participantId={drawerParticipantId}
        onClose={() => setDrawerParticipantId(null)}
        participants={participants}
        familyLinks={familyLinks}
        assessmentResults={assessmentResults}
        moduleResults={moduleResults}
        programCode={activeProgram?.programCode}
      />

      <div className="pilot-overviewSplit">
        <section className="pilot-panelBlock pilot-panelBlock--next">
          <div className="pilot-panelBlockHead pilot-panelBlockHead--next">
            <h2 className="pilot-panelBlockTitle">Next Recommended Step</h2>
            <div className="pilot-nextDots" aria-hidden="true">
              {PILOT_RECOMMENDED_STEPS.map((step, index) => (
                <span
                  key={step.id}
                  className={`pilot-nextDot${index === stepIndex ? ' pilot-nextDot--active' : ''}`}
                />
              ))}
            </div>
          </div>
          <div className="pilot-nextCard">
            <h3 className="pilot-nextTitle">{recommendedStep.title}</h3>
            <p className="pilot-nextCopy">{recommendedStep.copy}</p>
            {recommendedStep.internalNav ? (
              <button type="button" className="pilot-nextCta" onClick={handleNextStepClick}>
                {recommendedStep.cta}
              </button>
            ) : (
              <Link to={recommendedStep.href} className="pilot-nextCta">
                {recommendedStep.cta}
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
