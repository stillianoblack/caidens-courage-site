import React from 'react';
import { formatAdminPct } from '../../lib/b4BaselineAdminStats';
import type { PilotTrackingMetrics } from '../../lib/pilotTrackingMetrics';

type PilotResultsKpiGridProps = {
  metrics: PilotTrackingMetrics;
  compact?: boolean;
  onCardClick?: (topic: 'participation' | 'baseline' | 'modules' | 'program-health') => void;
};

export default function PilotResultsKpiGrid({
  metrics,
  compact = false,
  onCardClick,
}: PilotResultsKpiGridProps) {
  const cards = compact
    ? [
        { label: 'Participation', value: String(metrics.studentsEnrolled), topic: 'participation' as const },
        { label: 'Baseline Completion', value: String(metrics.baselineChecksCompleted), topic: 'baseline' as const },
        {
          label: 'Overall Baseline Average',
          value: formatAdminPct(metrics.growth.overall),
          highlight: true,
          topic: 'baseline' as const,
        },
        { label: 'Module Completions', value: String(metrics.moduleCompletions), topic: 'modules' as const },
        {
          label: 'Program Health',
          value: `${metrics.completionRate}%`,
          hint: 'Participation rate',
          topic: 'program-health' as const,
        },
      ]
    : [
        { label: 'Participation', value: String(metrics.studentsEnrolled) },
        { label: 'Baseline Completion', value: String(metrics.baselineChecksCompleted) },
        { label: 'Avg Feelings / Confidence', value: formatAdminPct(metrics.growth.confidence) },
        { label: 'Avg Reading', value: formatAdminPct(metrics.growth.reading) },
        { label: 'Avg Focus Moves', value: formatAdminPct(metrics.growth.focus) },
        { label: 'Overall Baseline Average', value: formatAdminPct(metrics.growth.overall), highlight: true },
        { label: 'Module Completions', value: String(metrics.moduleCompletions) },
        { label: 'Unique Modules', value: String(metrics.uniqueModulesCompleted) },
        { label: 'Avg Module Score', value: formatAdminPct(metrics.averageModuleScorePct) },
        { label: 'Adult Pre-Assessments', value: String(metrics.adultPreAssessments) },
        { label: 'Adult Post-Assessments', value: String(metrics.adultPostAssessments) },
        {
          label: 'Adult Growth Delta',
          value:
            metrics.adultGrowthDeltaAvg == null
              ? '—'
              : metrics.adultGrowthDeltaAvg >= 0
                ? `+${metrics.adultGrowthDeltaAvg}`
                : String(metrics.adultGrowthDeltaAvg),
        },
      ];

  return (
    <div
      className={`pilot-resultsKpiGrid${compact ? ' pilot-resultsKpiGrid--compact' : ''}`}
    >
      {cards.map((card) => {
        const Tag = onCardClick && 'topic' in card ? 'button' : 'article';
        return (
          <Tag
            key={card.label}
            type={Tag === 'button' ? 'button' : undefined}
            className={`pilot-kpiCard${card.highlight ? ' pilot-kpiCard--highlight' : ''}${
              onCardClick && 'topic' in card ? ' pilot-kpiCard--clickable' : ''
            }`}
            onClick={
              onCardClick && 'topic' in card ? () => onCardClick(card.topic) : undefined
            }
          >
            <p className="pilot-kpiLabel">{card.label}</p>
            <p className="pilot-kpiValue">{card.value}</p>
            {'hint' in card && card.hint ? <p className="pilot-kpiHint">{card.hint}</p> : null}
          </Tag>
        );
      })}
    </div>
  );
}
