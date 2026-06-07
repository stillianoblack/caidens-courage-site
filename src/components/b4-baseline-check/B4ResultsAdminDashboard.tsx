import React from 'react';
import {
  buildBaselineComparisonRows,
  computeBaselineAdminStats,
  formatAdminPct,
  type BaselineAdminStats,
} from '../../lib/b4BaselineAdminStats';
import type { B4BaselineCheckRecord } from '../../lib/b4BaselineCheckStorage';

type B4ResultsAdminDashboardProps = {
  results: B4BaselineCheckRecord[];
};

const CHART_BARS: Array<{
  key: keyof Pick<
    BaselineAdminStats,
    'avgFeelingsPct' | 'avgReadingPct' | 'avgFocusPct' | 'overallAvgPct'
  >;
  label: string;
  tone: 'gold' | 'navy' | 'green' | 'overall';
}> = [
  { key: 'avgFeelingsPct', label: 'Feelings', tone: 'gold' },
  { key: 'avgReadingPct', label: 'Reading', tone: 'navy' },
  { key: 'avgFocusPct', label: 'Focus Moves', tone: 'green' },
  { key: 'overallAvgPct', label: 'Overall', tone: 'overall' },
];

export default function B4ResultsAdminDashboard({ results }: B4ResultsAdminDashboardProps) {
  const stats = computeBaselineAdminStats(results);
  const comparisonRows = buildBaselineComparisonRows(stats);
  const hasPostProgramData = comparisonRows.some((row) => row.afterPct != null);

  return (
    <section className="bbc-adminDashboard" aria-label="Pilot summary dashboard">
      <div className="bbc-adminStatGrid">
        <article className="bbc-adminStatCard">
          <p className="bbc-adminStatLabel">Total Completed</p>
          <p className="bbc-adminStatValue">{stats.totalCompleted}</p>
        </article>
        <article className="bbc-adminStatCard">
          <p className="bbc-adminStatLabel">Average Feelings Score</p>
          <p className="bbc-adminStatValue">{formatAdminPct(stats.avgFeelingsPct)}</p>
        </article>
        <article className="bbc-adminStatCard">
          <p className="bbc-adminStatLabel">Average Reading Score</p>
          <p className="bbc-adminStatValue">{formatAdminPct(stats.avgReadingPct)}</p>
        </article>
        <article className="bbc-adminStatCard">
          <p className="bbc-adminStatLabel">Average Focus Moves Score</p>
          <p className="bbc-adminStatValue">{formatAdminPct(stats.avgFocusPct)}</p>
        </article>
        <article className="bbc-adminStatCard bbc-adminStatCard--highlight">
          <p className="bbc-adminStatLabel">Overall Baseline Average</p>
          <p className="bbc-adminStatValue">{formatAdminPct(stats.overallAvgPct)}</p>
        </article>
      </div>

      <div className="bbc-adminChartPanel">
        <div className="bbc-adminChartHead">
          <h2 className="bbc-adminChartTitle">Baseline Overview</h2>
          <p className="bbc-adminChartSub">Baseline Scores</p>
        </div>

        <div className="bbc-adminBarList" role="list">
          {CHART_BARS.map(({ key, label, tone }) => {
            const pct = stats[key];
            return (
              <div key={key} className="bbc-adminBarRow" role="listitem">
                <div className="bbc-adminBarMeta">
                  <span className="bbc-adminBarLabel">{label}</span>
                  <span className="bbc-adminBarPct">{formatAdminPct(pct)}</span>
                </div>
                <div className="bbc-adminBarTrack" aria-hidden="true">
                  <div
                    className={`bbc-adminBarFill bbc-adminBarFill--${tone}`}
                    style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {hasPostProgramData ? (
          <div className="bbc-adminCompare">
            <h3 className="bbc-adminCompareTitle">Before / After Growth</h3>
            <div className="bbc-adminCompareGrid">
              {comparisonRows.map((row) => (
                <div key={row.label} className="bbc-adminCompareRow">
                  <span className="bbc-adminCompareLabel">{row.label}</span>
                  <span>Before {formatAdminPct(row.beforePct)}</span>
                  <span>After {row.afterPct != null ? formatAdminPct(row.afterPct) : '—'}</span>
                  <span>Growth {row.growthPct != null ? formatAdminPct(row.growthPct) : '—'}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
