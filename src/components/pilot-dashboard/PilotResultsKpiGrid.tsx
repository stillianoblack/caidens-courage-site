import React from 'react';
import InfoTooltip from '../ui/InfoTooltip';
import { formatGrowthDelta } from '../../lib/formatGrowthDelta';
import { formatAdminPct } from '../../lib/b4BaselineAdminStats';
import type { PilotTrackingMetrics } from '../../lib/pilotTrackingMetrics';

type KpiTopic = 'participation' | 'baseline' | 'modules' | 'program-health';

type KpiCardDef = {
  id: string;
  labelLines: [string] | [string, string];
  value: string;
  topic?: KpiTopic;
  hint?: string;
};

type KpiSectionDef = {
  id: string;
  title: string;
  tooltip?: string;
  cards: KpiCardDef[];
};

type PilotResultsKpiGridProps = {
  metrics: PilotTrackingMetrics;
  compact?: boolean;
  onCardClick?: (topic: KpiTopic) => void;
};

const SECTION_TOOLTIPS: Record<string, string> = {
  'baseline-overview':
    "Average starting score from each student's first completed B-4 Baseline Check.",
  'current-progress':
    "Average score from each student's current weekly missions. Retakes and practice replays are excluded.",
  'growth-since-baseline':
    'Difference between current weekly performance and baseline. Positive numbers show improvement. Negative numbers may indicate students are working through more difficult material.',
  participation:
    'Counts active students, completed baselines, completed modules, and unique modules attempted.',
  'adult-growth':
    'Tracks facilitator or parent pre/post assessments when available.',
};

function buildFullResultsSections(metrics: PilotTrackingMetrics): KpiSectionDef[] {
  return [
    {
      id: 'baseline-overview',
      title: 'Baseline Overview',
      tooltip: SECTION_TOOLTIPS['baseline-overview'],
      cards: [
        {
          id: 'overall-baseline',
          labelLines: ['Overall Baseline', 'Average'],
          value: formatAdminPct(metrics.baselineScores.overall),
        },
        {
          id: 'average-reading',
          labelLines: ['Average', 'Reading'],
          value: formatAdminPct(metrics.baselineScores.reading),
        },
        {
          id: 'average-feelings',
          labelLines: ['Average', 'Feelings'],
          value: formatAdminPct(metrics.baselineScores.confidence),
        },
        {
          id: 'average-focus-moves',
          labelLines: ['Average', 'Focus Moves'],
          value: formatAdminPct(metrics.baselineScores.focus),
        },
      ],
    },
    {
      id: 'current-progress',
      title: 'Current Progress',
      tooltip: SECTION_TOOLTIPS['current-progress'],
      cards: [
        {
          id: 'current-overall',
          labelLines: ['Current', 'Overall'],
          value: formatAdminPct(metrics.currentScores.overall),
        },
        {
          id: 'current-reading',
          labelLines: ['Current', 'Reading'],
          value: formatAdminPct(metrics.currentScores.reading),
        },
        {
          id: 'current-feelings',
          labelLines: ['Current', 'Feelings'],
          value: formatAdminPct(metrics.currentScores.confidence),
        },
        {
          id: 'current-focus',
          labelLines: ['Current', 'Focus Moves'],
          value: formatAdminPct(metrics.currentScores.focus),
        },
      ],
    },
    {
      id: 'growth-since-baseline',
      title: 'Growth Since Baseline',
      tooltip: SECTION_TOOLTIPS['growth-since-baseline'],
      cards: [
        {
          id: 'growth-overall',
          labelLines: ['Growth', 'Overall'],
          value: formatGrowthDelta(metrics.growthSinceBaseline.overall),
        },
        {
          id: 'growth-reading',
          labelLines: ['Growth', 'Reading'],
          value: formatGrowthDelta(metrics.growthSinceBaseline.reading),
        },
        {
          id: 'growth-feelings',
          labelLines: ['Growth', 'Feelings'],
          value: formatGrowthDelta(metrics.growthSinceBaseline.confidence),
        },
        {
          id: 'growth-focus',
          labelLines: ['Growth', 'Focus Moves'],
          value: formatGrowthDelta(metrics.growthSinceBaseline.focus),
        },
      ],
    },
    {
      id: 'participation',
      title: 'Participation',
      tooltip: SECTION_TOOLTIPS.participation,
      cards: [
        { id: 'participation', labelLines: ['Participation'], value: String(metrics.studentsEnrolled) },
        {
          id: 'baseline-completion',
          labelLines: ['Baseline', 'Completion'],
          value: String(metrics.baselineChecksCompleted),
        },
        {
          id: 'module-completions',
          labelLines: ['Module', 'Completions'],
          value: String(metrics.moduleCompletions),
        },
        {
          id: 'unique-modules',
          labelLines: ['Unique', 'Modules'],
          value: String(metrics.uniqueModulesCompleted),
        },
      ],
    },
    {
      id: 'adult-growth',
      title: 'Adult Growth',
      tooltip: SECTION_TOOLTIPS['adult-growth'],
      cards: [
        {
          id: 'adult-pre',
          labelLines: ['Adult', 'Pre-Assessments'],
          value: String(metrics.adultPreAssessments),
        },
        {
          id: 'adult-post',
          labelLines: ['Adult', 'Post-Assessments'],
          value: String(metrics.adultPostAssessments),
        },
        {
          id: 'adult-delta',
          labelLines: ['Adult Growth', 'Delta'],
          value: formatGrowthDelta(metrics.adultGrowthDeltaAvg),
        },
      ],
    },
  ];
}

function buildCompactCards(metrics: PilotTrackingMetrics): KpiCardDef[] {
  return [
    {
      id: 'participation',
      labelLines: ['Participation'],
      value: String(metrics.studentsEnrolled),
      topic: 'participation',
    },
    {
      id: 'baseline-completion',
      labelLines: ['Baseline', 'Completion'],
      value: String(metrics.baselineChecksCompleted),
      topic: 'baseline',
    },
    {
      id: 'overall-baseline',
      labelLines: ['Overall Baseline', 'Average'],
      value: formatAdminPct(metrics.baselineScores.overall),
      topic: 'baseline',
    },
    {
      id: 'module-completions',
      labelLines: ['Module', 'Completions'],
      value: String(metrics.moduleCompletions),
      topic: 'modules',
    },
    {
      id: 'program-health',
      labelLines: ['Program', 'Health'],
      value: `${metrics.completionRate}%`,
      hint: 'Participation rate',
      topic: 'program-health',
    },
  ];
}

function KpiLabel({ lines }: { lines: [string] | [string, string] }) {
  return (
    <p className="pilot-kpiLabel">
      {lines.map((line, index) => (
        <React.Fragment key={`${line}-${index}`}>
          {index > 0 ? <br /> : null}
          {line}
        </React.Fragment>
      ))}
    </p>
  );
}

function KpiCard({
  card,
  onCardClick,
}: {
  card: KpiCardDef;
  onCardClick?: (topic: KpiTopic) => void;
}) {
  const Tag = onCardClick && card.topic ? 'button' : 'article';

  return (
    <Tag
      type={Tag === 'button' ? 'button' : undefined}
      className={[
        'pilot-kpiCard',
        onCardClick && card.topic ? 'pilot-kpiCard--clickable' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onCardClick && card.topic ? () => onCardClick(card.topic!) : undefined}
    >
      <KpiLabel lines={card.labelLines} />
      <p className="pilot-kpiValue">{card.value}</p>
      {card.hint ? <p className="pilot-kpiHint">{card.hint}</p> : null}
    </Tag>
  );
}

export default function PilotResultsKpiGrid({
  metrics,
  compact = false,
  onCardClick,
}: PilotResultsKpiGridProps) {
  if (compact) {
    const cards = buildCompactCards(metrics);
    return (
      <div className="pilot-resultsKpiGrid pilot-resultsKpiGrid--compact">
        {cards.map((card) => (
          <KpiCard key={card.id} card={card} onCardClick={onCardClick} />
        ))}
      </div>
    );
  }

  const sections = buildFullResultsSections(metrics);

  return (
    <div className="pilot-resultsKpiSections">
      {sections.map((section) => (
        <section key={section.id} className="pilot-resultsKpiSection">
          <h3 className="pilot-resultsKpiSectionTitle">
            <span>{section.title}</span>
            {section.tooltip ? <InfoTooltip label={section.tooltip} alignEnd /> : null}
          </h3>
          <div className="pilot-resultsKpiGrid">
            {section.cards.map((card) => (
              <KpiCard key={card.id} card={card} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
