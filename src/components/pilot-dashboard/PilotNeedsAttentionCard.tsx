import React from 'react';
import { Link } from 'react-router-dom';
import { certificatesReadyFilterPath, rosterFilterPath } from '../../lib/askB4DeepLinks';
import type { RosterFilterId } from '../../lib/pilotOverviewInsights';
import type { PilotNeedsAttentionCounts } from '../../lib/pilotStudentProgress';

type PilotNeedsAttentionCardProps = {
  counts: PilotNeedsAttentionCounts;
  missingPinCount?: number;
};

type AttentionItem =
  | {
      label: string;
      key: keyof PilotNeedsAttentionCounts;
      filter: RosterFilterId;
      highlight?: boolean;
      icon: string;
      tone: string;
    }
  | {
      label: string;
      countKey: 'missingPin';
      filter: RosterFilterId;
      highlight?: boolean;
      icon: string;
      tone: string;
    };

const ATTENTION_ITEMS: AttentionItem[] = [
  { label: 'Focus Flame waiting', key: 'missingBaseline', filter: 'missing-baseline', icon: '✦', tone: 'flame' },
  { label: 'Inactive explorers', key: 'inactive7PlusDays', filter: 'inactive', icon: '◷', tone: 'time' },
  { label: 'Adventures waiting', key: 'noModules', filter: 'no-modules', icon: '▤', tone: 'learning' },
  { label: 'Certificates ready', key: 'certificateReady', filter: 'certificate-ready', highlight: true, icon: '★', tone: 'award' },
  { label: 'Access setup needed', countKey: 'missingPin', filter: 'missing-pin', icon: '●', tone: 'access' },
];

export default function PilotNeedsAttentionCard({
  counts,
  missingPinCount = 0,
}: PilotNeedsAttentionCardProps) {
  return (
    <section className="pilot-panelBlock pilot-needsAttention">
      <div className="pilot-panelBlockHead">
        <h2 className="pilot-panelBlockTitle">Adventure Watch</h2>
        <p className="pilot-panelBlockSub">Friendly signals that help every explorer stay on the path.</p>
      </div>
      <div className="pilot-needsAttentionGrid">
        {ATTENTION_ITEMS.map((item) => {
          const value =
            'countKey' in item ? missingPinCount : counts[item.key];
          const destination =
            item.filter === 'certificate-ready'
              ? certificatesReadyFilterPath()
              : rosterFilterPath(item.filter);

          return (
            <Link
              key={item.label}
              to={destination}
              className={`pilot-needsAttentionItem pilot-needsAttentionItem--link pilot-needsAttentionItem--${item.tone}${
                item.highlight ? ' pilot-needsAttentionItem--highlight' : ''
              }`}
            >
              <span className="pilot-needsAttentionIcon" aria-hidden="true">{item.icon}</span>
              <div><p className="pilot-needsAttentionValue">{value}</p>
              <p className="pilot-needsAttentionLabel">{item.label}</p></div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
