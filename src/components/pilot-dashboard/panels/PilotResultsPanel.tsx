import React from 'react';
import { Link } from 'react-router-dom';
import {
  PILOT_RESULTS_ADMIN_PATH,
  PILOT_RESULTS_COPY,
} from '../../../data/pilotDashboardContent';
import { formatAdminPct } from '../../../lib/b4BaselineAdminStats';
import type { B4BaselineCheckRecord } from '../../../lib/b4BaselineCheckStorage';
import type { PilotDashboardMetrics } from '../../../lib/pilotDashboardMetrics';
import PilotLocalNote from '../PilotLocalNote';

type PilotResultsPanelProps = {
  refreshKey?: number;
  results: B4BaselineCheckRecord[];
  metrics: PilotDashboardMetrics;
  source?: 'supabase' | 'local';
  warning?: string | null;
  loading?: boolean;
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

export default function PilotResultsPanel({
  refreshKey = 0,
  results,
  metrics,
  source = 'local',
  warning = null,
  loading = false,
}: PilotResultsPanelProps) {
  void refreshKey;
  const hasData = metrics.baselineChecksCompleted > 0;

  return (
    <div className="pilot-panel pilot-panel--results">
      <p className="pilot-panelIntro">{PILOT_RESULTS_COPY}</p>
      {warning ? <p className="pilot-syncWarning">{warning}</p> : null}
      <PilotLocalNote source={source} />

      {loading ? <p className="pilot-emptyNote">Loading results…</p> : null}

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

      {!loading && results.length > 0 ? (
        <section className="pilot-panelBlock pilot-resultsTableSection">
          <h2 className="pilot-panelBlockTitle">Baseline Submissions</h2>
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

      <div className="pilot-resultsAdminCta">
        <Link to={PILOT_RESULTS_ADMIN_PATH} className="pilot-dash-cta">
          Open Full Results Admin
        </Link>
      </div>
    </div>
  );
}
