import React from 'react';
import { Link } from 'react-router-dom';
import {
  PILOT_RESULTS_ADMIN_PATH,
} from '../../../data/pilotDashboardContent';
import { formatAdminPct } from '../../../lib/b4BaselineAdminStats';
import type { B4BaselineCheckRecord } from '../../../lib/b4BaselineCheckStorage';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from '../../../lib/pilotTrackingLocalStorage';
import type { PilotTrackingMetrics } from '../../../lib/pilotTrackingMetrics';
import {
  formatAssessmentScore,
  formatModuleScore,
  resolveParticipantDisplayName,
  type ParticipantNameLookup,
} from '../../../lib/pilotResultsDisplay';
import DashboardWidgetSkeleton from '../DashboardWidgetSkeleton';
import PilotLocalNote, { PilotResultsStatusCopy } from '../PilotLocalNote';

type PilotResultsPanelProps = {
  refreshKey?: number;
  results: B4BaselineCheckRecord[];
  moduleResults?: LocalModuleResultRecord[];
  assessmentResults?: LocalAssessmentV2Record[];
  participantLookup?: ParticipantNameLookup;
  metrics: PilotTrackingMetrics;
  source?: 'supabase' | 'local';
  warning?: string | null;
  loading?: boolean;
};

const GROWTH_BARS: Array<{
  key: keyof PilotTrackingMetrics['growth'];
  label: string;
  tone: 'confidence' | 'reading' | 'focus' | 'overall';
}> = [
  { key: 'confidence', label: 'Feelings / Confidence', tone: 'confidence' },
  { key: 'reading', label: 'Reading', tone: 'reading' },
  { key: 'focus', label: 'Focus Moves', tone: 'focus' },
  { key: 'overall', label: 'Overall', tone: 'overall' },
];

export default function PilotResultsPanel({
  refreshKey = 0,
  results,
  moduleResults = [],
  assessmentResults = [],
  participantLookup = new Map(),
  metrics,
  source = 'local',
  warning = null,
  loading = false,
}: PilotResultsPanelProps) {
  void refreshKey;
  const hasData = metrics.baselineChecksCompleted > 0;
  const hasTrackingRows = assessmentResults.length > 0 || moduleResults.length > 0;

  if (loading) {
    return (
      <div className="pilot-panel pilot-panel--results">
        <DashboardWidgetSkeleton kpiCount={6} showGrowth />
      </div>
    );
  }

  return (
    <div className="pilot-panel pilot-panel--results">
      <PilotResultsStatusCopy source={source} />
      {warning ? <p className="pilot-syncWarning">{warning}</p> : null}
      <PilotLocalNote source={source} />

      <div className="pilot-resultsKpiGrid">
        <article className="pilot-kpiCard">
          <p className="pilot-kpiLabel">Participation</p>
          <p className="pilot-kpiValue">{metrics.studentsEnrolled}</p>
        </article>
        <article className="pilot-kpiCard">
          <p className="pilot-kpiLabel">Baseline Completion</p>
          <p className="pilot-kpiValue">{metrics.baselineChecksCompleted}</p>
        </article>
        <article className="pilot-kpiCard">
          <p className="pilot-kpiLabel">Avg Feelings / Confidence</p>
          <p className="pilot-kpiValue">{formatAdminPct(metrics.growth.confidence)}</p>
        </article>
        <article className="pilot-kpiCard">
          <p className="pilot-kpiLabel">Avg Reading</p>
          <p className="pilot-kpiValue">{formatAdminPct(metrics.growth.reading)}</p>
        </article>
        <article className="pilot-kpiCard">
          <p className="pilot-kpiLabel">Avg Focus Moves</p>
          <p className="pilot-kpiValue">{formatAdminPct(metrics.growth.focus)}</p>
        </article>
        <article className="pilot-kpiCard pilot-kpiCard--highlight">
          <p className="pilot-kpiLabel">Overall</p>
          <p className="pilot-kpiValue">{formatAdminPct(metrics.growth.overall)}</p>
        </article>
        <article className="pilot-kpiCard">
          <p className="pilot-kpiLabel">Module Completions</p>
          <p className="pilot-kpiValue">{metrics.moduleCompletions}</p>
        </article>
        <article className="pilot-kpiCard">
          <p className="pilot-kpiLabel">Unique Modules</p>
          <p className="pilot-kpiValue">{metrics.uniqueModulesCompleted}</p>
        </article>
        <article className="pilot-kpiCard">
          <p className="pilot-kpiLabel">Avg Module Score</p>
          <p className="pilot-kpiValue">{formatAdminPct(metrics.averageModuleScorePct)}</p>
        </article>
        <article className="pilot-kpiCard">
          <p className="pilot-kpiLabel">Adult Pre-Assessments</p>
          <p className="pilot-kpiValue">{metrics.adultPreAssessments}</p>
        </article>
        <article className="pilot-kpiCard">
          <p className="pilot-kpiLabel">Adult Post-Assessments</p>
          <p className="pilot-kpiValue">{metrics.adultPostAssessments}</p>
        </article>
        <article className="pilot-kpiCard">
          <p className="pilot-kpiLabel">Adult Growth Delta</p>
          <p className="pilot-kpiValue">
            {metrics.adultGrowthDeltaAvg == null
              ? '—'
              : metrics.adultGrowthDeltaAvg >= 0
                ? `+${metrics.adultGrowthDeltaAvg}`
                : metrics.adultGrowthDeltaAvg}
          </p>
        </article>
      </div>

      <section className="pilot-panelBlock pilot-resultsChartBlock">
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
      </section>

      {!loading && assessmentResults.length > 0 ? (
        <section className="pilot-panelBlock pilot-resultsTableSection">
          <h2 className="pilot-panelBlockTitle">Student Assessments</h2>
          <div className="pilot-resultsTableWrap">
            <table className="pilot-resultsTable">
              <thead>
                <tr>
                  <th scope="col">Child</th>
                  <th scope="col">Program Code</th>
                  <th scope="col">Assessment</th>
                  <th scope="col">Score</th>
                  <th scope="col">Completed</th>
                </tr>
              </thead>
              <tbody>
                {assessmentResults.map((row) => (
                  <tr key={row.id}>
                    <td>{resolveParticipantDisplayName(row.participant_id, participantLookup)}</td>
                    <td>{row.program_code || '—'}</td>
                    <td>{row.assessment_type}</td>
                    <td>{formatAssessmentScore(row)}</td>
                    <td>{row.completed_at ? new Date(row.completed_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!loading && moduleResults.length > 0 ? (
        <section className="pilot-panelBlock pilot-resultsTableSection">
          <h2 className="pilot-panelBlockTitle">Module Completions</h2>
          <div className="pilot-resultsTableWrap">
            <table className="pilot-resultsTable">
              <thead>
                <tr>
                  <th scope="col">Child</th>
                  <th scope="col">Program Code</th>
                  <th scope="col">Module</th>
                  <th scope="col">Score</th>
                  <th scope="col">Completed</th>
                </tr>
              </thead>
              <tbody>
                {moduleResults.map((row) => (
                  <tr key={row.id}>
                    <td>{resolveParticipantDisplayName(row.participant_id, participantLookup)}</td>
                    <td>{row.program_code || '—'}</td>
                    <td>
                      {row.module_title || row.module_id}
                      {row.character ? ` · ${row.character}` : ''}
                    </td>
                    <td>{formatModuleScore(row)}</td>
                    <td>{row.completed_at ? new Date(row.completed_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!loading && results.length > 0 ? (
        <section className="pilot-panelBlock pilot-resultsTableSection">
          <h2 className="pilot-panelBlockTitle">Legacy Baseline Submissions</h2>
          <div className="pilot-resultsTableWrap">
          <table className="pilot-resultsTable">
            <thead>
              <tr>
                <th scope="col">Nickname</th>
                <th scope="col">Group</th>
                <th scope="col">Feelings</th>
                <th scope="col">Reading</th>
                <th scope="col">Focus</th>
                <th scope="col">Completed</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={`${row.anonymousStudentId}-${row.completedAt}`}>
                  <td>{row.nickname || '—'}</td>
                  <td>{row.groupName || '—'}</td>
                  <td>{row.feelingsScore}</td>
                  <td>{row.readingScore}</td>
                  <td>{row.focusMovesScore}</td>
                  <td>{row.completedAt ? new Date(row.completedAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>
      ) : null}

      {!loading && !hasData && !hasTrackingRows ? (
        <p className="pilot-panelHelper">
          Results will appear here after students complete B-4 Check-In and character modules.
        </p>
      ) : null}

      <div className="pilot-resultsAdminCta">
        <Link to={PILOT_RESULTS_ADMIN_PATH} className="pilot-dash-cta">
          Open Full Results Admin
        </Link>
      </div>
    </div>
  );
}
