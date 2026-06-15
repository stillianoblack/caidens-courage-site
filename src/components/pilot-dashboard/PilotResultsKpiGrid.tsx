import React from 'react';
import { formatAdminPct } from '../../lib/b4BaselineAdminStats';
import type { PilotTrackingMetrics } from '../../lib/pilotTrackingMetrics';

type KpiTopic = 'participation' | 'baseline' | 'modules' | 'program-health';

type KpiCardDef = {
  id: string;
  labelLines: [string] | [string, string];
  value: string;
  highlight?: boolean;
  topic?: KpiTopic;
  hint?: string;
};

type KpiSectionDef = {
  id: string;
  title: string;
  cards: KpiCardDef[];
};

type PilotResultsKpiGridProps = {
  metrics: PilotTrackingMetrics;
  compact?: boolean;
  onCardClick?: (topic: KpiTopic) => void;
};

function formatAdultGrowthDelta(value: number | null | undefined): string {
  if (value == null) return '—';
  return value >= 0 ? `+${value}` : String(value);
}

function buildFullResultsSections(metrics: PilotTrackingMetrics): KpiSectionDef[] {
  return [
    {
      id: 'student-outcomes',
      title: 'Student Outcomes',
      cards: [
        {
          id: 'overall-baseline',
          labelLines: ['Overall Baseline', 'Average'],
          value: formatAdminPct(metrics.growth.overall),
          highlight: true,
        },
        {
          id: 'average-reading',
          labelLines: ['Average', 'Reading'],
          value: formatAdminPct(metrics.growth.reading),
        },
        {
          id: 'average-feelings',
          labelLines: ['Average', 'Feelings'],
          value: formatAdminPct(metrics.growth.confidence),
        },
        {
          id: 'average-focus-moves',
          labelLines: ['Average', 'Focus Moves'],
          value: formatAdminPct(metrics.growth.focus),
        },
      ],
    },
    {
      id: 'participation',
      title: 'Participation',
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
          value: formatAdultGrowthDelta(metrics.adultGrowthDeltaAvg),
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
      value: formatAdminPct(metrics.growth.overall),
      highlight: true,
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
        card.highlight ? 'pilot-kpiCard--highlight' : '',
        onCardClick && card.topic ? ' pilot-kpiCard--clickable' : '',
      ]
        .filter(Boolean)
        .join('')}
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
          <h3 className="pilot-resultsKpiSectionTitle">{section.title}</h3>
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
