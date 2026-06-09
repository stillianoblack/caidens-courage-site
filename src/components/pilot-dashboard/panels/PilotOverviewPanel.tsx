import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { PilotDashboardMetrics } from '../../../lib/pilotDashboardMetrics';
import { formatAdminPct } from '../../../lib/b4BaselineAdminStats';
import { remapPortalKidsRoute } from '../../../lib/portalGamePaths';
import {
  PILOT_CHARACTER_TRACKS,
  PILOT_CHARACTER_TRACKS_NOTE,
  PILOT_RECOMMENDED_STEPS,
  type PilotSidebarNavId,
} from '../../../data/pilotDashboardContent';
import CharacterLearningTrackCard from '../CharacterLearningTrackCard';
import PilotLocalNote from '../PilotLocalNote';
import CampParentLinkCard from '../CampParentLinkCard';
import ProgramAccessCodesCard from '../../pilot-program/ProgramAccessCodesCard';
import DashboardWidgetSkeleton from '../DashboardWidgetSkeleton';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import type { ActivePilotProgram } from '../../../types/pilotProgram';

type PilotOverviewPanelProps = {
  metrics: PilotDashboardMetrics;
  loading?: boolean;
  source?: 'supabase' | 'local';
  warning?: string | null;
  onSelectNav?: (id: PilotSidebarNavId) => void;
  activeProgram?: ActivePilotProgram | null;
};

const GROWTH_BARS: Array<{
  key: keyof PilotDashboardMetrics['growth'];
  label: string;
  tone: 'confidence' | 'reading' | 'focus' | 'overall';
}> = [
  { key: 'confidence', label: 'Feelings / Confidence', tone: 'confidence' },
  { key: 'reading', label: 'Reading', tone: 'reading' },
  { key: 'focus', label: 'Focus Moves', tone: 'focus' },
  { key: 'overall', label: 'Overall', tone: 'overall' },
];

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
  loading = false,
  source = 'local',
  warning = null,
  onSelectNav,
  activeProgram = readActivePilotProgram(),
}: PilotOverviewPanelProps) {
  const location = useLocation();
  const hasData = metrics.baselineChecksCompleted > 0;
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
      return;
    }
  };

  if (loading) {
    return (
      <div className="pilot-panel pilot-panel--overview">
        {activeProgram ? <ProgramAccessCodesCard program={activeProgram} compact /> : null}
        <DashboardWidgetSkeleton kpiCount={4} showGrowth showActivity />
      </div>
    );
  }

  return (
    <div className="pilot-panel pilot-panel--overview">
      {activeProgram ? <ProgramAccessCodesCard program={activeProgram} compact /> : null}
      <CampParentLinkCard />
      {warning ? <p className="pilot-syncWarning">{warning}</p> : null}
      <div className="pilot-kpiRow">
        <article className="pilot-kpiCard">
          <p className="pilot-kpiLabel">Students Enrolled</p>
          <p className="pilot-kpiValue">{metrics.studentsEnrolled}</p>
        </article>
        <article className="pilot-kpiCard">
          <p className="pilot-kpiLabel">Baseline Completed</p>
          <p className="pilot-kpiValue">{metrics.baselineChecksCompleted}</p>
        </article>
        <article className="pilot-kpiCard">
          <p className="pilot-kpiLabel">Current Week</p>
          <p className="pilot-kpiValue">Week {metrics.currentWeek}</p>
        </article>
        <article className="pilot-kpiCard pilot-kpiCard--highlight">
          <p className="pilot-kpiLabel">Completion Rate</p>
          <p className="pilot-kpiValue">{metrics.completionRate}%</p>
        </article>
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

      <section className="pilot-panelBlock">
        <div className="pilot-panelBlockHead">
          <h2 className="pilot-panelBlockTitle">Pilot Progress</h2>
          {!hasData ? (
            <p className="pilot-panelBlockSub">
              Results will appear after students complete the B-4 Baseline Check.
            </p>
          ) : null}
        </div>
        <div className="pilot-growthChart">
          {GROWTH_BARS.map(({ key, label, tone }) => {
            const pct = metrics.growth[key];
            return (
              <div key={key} className="pilot-growthRow">
                <div className="pilot-growthMeta">
                  <span className="pilot-growthLabel">{label}</span>
                  <span className="pilot-growthPct">{formatAdminPct(pct)}</span>
                </div>
                <div className="pilot-growthTrack" aria-hidden="true">
                  <div
                    className={`pilot-growthFill pilot-growthFill--${tone}`}
                    style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <PilotLocalNote source={source} />
      </section>

      <div className="pilot-overviewSplit">
        <section className="pilot-panelBlock pilot-panelBlock--activity">
          <div className="pilot-panelBlockHead">
            <h2 className="pilot-panelBlockTitle">Recent Activity</h2>
          </div>
          {metrics.recentActivity.length === 0 ? (
            <p className="pilot-emptyNote">
              No activity yet. Student progress will appear here after assessments and modules are
              completed.
            </p>
          ) : (
            <ul className="pilot-activityList">
              {metrics.recentActivity.map((item) => (
                <li key={item.id} className="pilot-activityItem">
                  <span className="pilot-activityDot" aria-hidden="true" />
                  <div className="pilot-activityBody">
                    <p className="pilot-activityLabel">{item.label}</p>
                    <p className="pilot-activityDetail">{item.detail}</p>
                  </div>
                  <time className="pilot-activityTime" dateTime={item.at}>
                    {formatActivityTime(item.at)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>

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
