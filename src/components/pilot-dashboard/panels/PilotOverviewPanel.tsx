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
import B4InsightsDrawer from '../../../design-system/components/B4InsightsDrawer';
import {
  buildFacilitatorB4Insights,
  buildFacilitatorStudentB4Insights,
} from '../../../lib/facilitatorB4InsightsBuilders';
import type { FacilitatorB4InsightTopic } from '../../../types/b4Insights';
import '../../../design-system/components/b4-insights-drawer.css';
import { computeNeedsAttention } from '../../../lib/pilotStudentProgress';
import { buildB4Recommendation, buildRecentStudentActivityFeed } from '../../../lib/pilotOverviewInsights';
import type { StudentParticipantRecord } from '../../../lib/pilotTrackingService';
import type { StudentFamilyLink } from '../../../lib/studentFamilyLinkService';
import ProgramAccessCodesCard from '../../pilot-program/ProgramAccessCodesCard';
import { FacilitatorOverviewCoachSlot } from '../coach/FacilitatorOverviewCoachProvider';
import DashboardWidgetSkeleton from '../DashboardWidgetSkeleton';
import { FACILITATOR_B4_ASSETS } from '../../../config/facilitatorB4Assets';
import B4AnimatedImage from '../../b4/B4AnimatedImage';
import { FACILITATOR_B4_RESULTS_PATH, FACILITATOR_GAME_HUDDLE_PATH, PROGRAM_DASHBOARD_PATH } from '../../../config/courageRoutes';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import type { ActivePilotProgram } from '../../../types/pilotProgram';
import {
  fetchFacilitatorApprovedGalleryItems,
  type StudentGalleryItem,
} from '../../../lib/studentGalleryService';
import { useFacilitatorMobileNav } from '../../../hooks/useFacilitatorMobileNav';
import FacilitatorMobileOverviewHero from '../FacilitatorMobileOverviewHero';
import B4AnimatedHead from '../../b4/B4AnimatedHead';
import { friendlyPortalWarning } from '../../../lib/portalFriendlyError';

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
  const { isMobileNav } = useFacilitatorMobileNav();
  const [drawerParticipantId, setDrawerParticipantId] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [insightTopic, setInsightTopic] = useState<FacilitatorB4InsightTopic>('participation');
  const [insightStudentId, setInsightStudentId] = useState<string | null>(null);
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

  const facilitatorInsightPaths = useMemo(
    () => ({
      results: FACILITATOR_B4_RESULTS_PATH,
      participants: `${PROGRAM_DASHBOARD_PATH}/roster`,
    }),
    [],
  );

  const facilitatorInsights = useMemo(() => {
    if (insightTopic === 'student-progress' && insightStudentId) {
      return buildFacilitatorStudentB4Insights({
        participantId: insightStudentId,
        participantLookup,
        assessments: assessmentResults,
        modules: moduleResults,
        programName: activeProgram?.groupName ?? programCode,
        paths: facilitatorInsightPaths,
      });
    }

    return buildFacilitatorB4Insights({
      topic: insightTopic === 'student-progress' ? 'participation' : insightTopic,
      metrics,
      programName: activeProgram?.groupName ?? programCode,
      missingBaselineCount: needsAttention.missingBaseline,
      paths: facilitatorInsightPaths,
    });
  }, [
    activeProgram?.groupName,
    assessmentResults,
    facilitatorInsightPaths,
    insightStudentId,
    insightTopic,
    metrics,
    moduleResults,
    needsAttention.missingBaseline,
    participantLookup,
    programCode,
  ]);

  const openInsights = (topic: FacilitatorB4InsightTopic, participantId?: string | null) => {
    setInsightTopic(topic);
    setInsightStudentId(participantId ?? null);
    setInsightsOpen(true);
  };

  const handleNextStepClick = () => {
    if (recommendedStep.internalNav) {
      onSelectNav?.(recommendedStep.internalNav);
    }
  };

  const readyCount = Math.max(0, metrics.studentsEnrolled - needsAttention.missingBaseline);
  const missionProgress = metrics.studentsEnrolled > 0
    ? Math.round((readyCount / metrics.studentsEnrolled) * 100)
    : 0;
  const programName = activeProgram?.programName || activeProgram?.groupName || 'Today\'s Camp';
  const overviewWarning = useMemo(() => friendlyPortalWarning(warning), [warning]);
  const hasReadyAdventure = readyCount > 0 && metrics.moduleCompletions > 0;

  if (loading) {
    return (
      <div className="pilot-panel pilot-panel--overview">
        {activeProgram ? <ProgramAccessCodesCard program={activeProgram} compact /> : null}
        <DashboardWidgetSkeleton kpiCount={5} showGrowth showActivity />
      </div>
    );
  }

  return (
    <div className={`pilot-panel pilot-panel--overview${isMobileNav ? ' pilot-panel--overviewMobile' : ''}`}>
      {isMobileNav ? (
        <FacilitatorMobileOverviewHero
          activeProgram={activeProgram}
          metrics={metrics}
        />
      ) : null}
      {isMobileNav ? <FacilitatorOverviewCoachSlot slot="afterHero" /> : null}
      {!isMobileNav && activeProgram ? <ProgramAccessCodesCard program={activeProgram} compact /> : null}
      {overviewWarning ? <p className="pilot-syncWarning" role="status">{overviewWarning}</p> : null}

      {!isMobileNav ? (
        <section className="pilot-commandHero" aria-labelledby="pilot-command-hero-title">
          <div className="pilot-commandHeroB4" aria-hidden="true">
            <B4AnimatedImage
              assetType="full-body"
              idleSrc={FACILITATOR_B4_ASSETS.fullBody}
              className="pilot-commandHeroGuide"
              floatProfile={{ travelPx: 7, durationSeconds: 8.2, delaySeconds: -2.7 }}
            />
          </div>
          <div className="pilot-commandHeroCopy">
            <p className="pilot-commandHeroEyebrow">Today&apos;s Camp</p>
            <h2 id="pilot-command-hero-title">{programName}</h2>
            <p className="pilot-commandHeroMessage">
              {hasReadyAdventure
                ? 'Your campers are ready for today\'s adventure.'
                : 'Let’s get your explorers ready for their first adventure.'}
            </p>
            <div className="pilot-commandHeroStats" aria-label="Camp readiness summary">
              <span><strong>{metrics.studentsEnrolled}</strong> Explorers</span>
              <span><strong>{readyCount}</strong> Ready</span>
              <span><strong>{needsAttention.missingBaseline}</strong> Need Setup</span>
            </div>
            <div className="pilot-commandHeroProgress">
              <div className="pilot-commandHeroProgressHead"><span>Mission progress</span><strong>{missionProgress}%</strong></div>
              <div className="pilot-commandHeroTrack"><span style={{ width: `${missionProgress}%` }} /></div>
            </div>
            <Link className="pilot-commandHeroCta" to={FACILITATOR_GAME_HUDDLE_PATH}>
              Launch Game Huddle <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="pilot-commandHeroDecor" aria-hidden="true">
            <span className="pilot-commandHeroOrb pilot-commandHeroOrb--blue"><B4AnimatedHead variant="blue" decorative /></span>
            <span className="pilot-commandHeroOrb pilot-commandHeroOrb--green"><B4AnimatedHead variant="green" decorative /></span>
            <span className="pilot-commandHeroOrb pilot-commandHeroOrb--purple"><B4AnimatedHead variant="purple" decorative /></span>
          </div>
        </section>
      ) : null}

      {!isMobileNav ? (
        <PilotResultsKpiGrid
          metrics={metrics}
          compact
          onCardClick={(topic) => openInsights(topic)}
        />
      ) : null}

      {!isMobileNav ? <FacilitatorOverviewCoachSlot slot="afterMetrics" /> : null}

      <PilotNeedsAttentionCard counts={needsAttention} />

      <section className="pilot-panelBlock pilot-panelBlock--studentActivity">
        <div className="pilot-panelBlockHead">
          <h2 className="pilot-panelBlockTitle">Today&apos;s Camp Journal</h2>
        </div>
        {recentStudentActivity.length === 0 ? (
          <p className="pilot-emptyNote">No recent activity yet.</p>
        ) : (
          <ul className="pilot-activityList">
            {recentStudentActivity.map((item) => (
              <li key={item.id} className="pilot-activityItem">
                <span className={`pilot-activityStoryIcon pilot-activityStoryIcon--${(recentStudentActivity.indexOf(item) % 4) + 1}`} aria-hidden="true">
                  {['✦', '●', '★', '▤'][recentStudentActivity.indexOf(item) % 4]}
                </span>
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

      {!isMobileNav ? (
        <div className="pilot-overviewInsightRow">
          <PilotOverviewGalleryCard programCode={programCode} />
          <PilotB4RecommendationCard
            recommendation={b4Recommendation}
            onOpenInsights={() =>
              openInsights(metrics.baselineChecksCompleted === 0 ? 'baseline' : 'modules')
            }
          />
        </div>
      ) : null}

      {!isMobileNav ? (
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
      ) : null}

      {!isMobileNav ? (
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
      ) : null}

      {!isMobileNav ? (
        <PilotTrackingDataTables
          assessmentResults={assessmentResults}
          moduleResults={moduleResults}
          participantLookup={participantLookup}
          onStudentClick={(participantId) => openInsights('student-progress', participantId)}
          assessmentLimit={5}
          moduleLimit={5}
          showEmptyStates
        />
      ) : null}

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

      {!isMobileNav ? <FacilitatorOverviewCoachSlot slot="footer" /> : null}

      <B4InsightsDrawer
        isOpen={insightsOpen}
        onClose={() => {
          setInsightsOpen(false);
          setInsightStudentId(null);
        }}
        {...facilitatorInsights}
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
    </div>
  );
}
