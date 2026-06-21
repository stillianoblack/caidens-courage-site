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
    }
  | {
      label: string;
      countKey: 'missingPin';
      filter: RosterFilterId;
      highlight?: boolean;
    };

const ATTENTION_ITEMS: AttentionItem[] = [
  { label: 'Missing baseline', key: 'missingBaseline', filter: 'missing-baseline' },
  { label: 'Inactive 7+ days', key: 'inactive7PlusDays', filter: 'inactive' },
  { label: 'No modules completed', key: 'noModules', filter: 'no-modules' },
  { label: 'Certificate ready', key: 'certificateReady', filter: 'certificate-ready', highlight: true },
  { label: 'Missing student PINs', countKey: 'missingPin', filter: 'missing-pin' },
];

export default function PilotNeedsAttentionCard({
  counts,
  missingPinCount = 0,
}: PilotNeedsAttentionCardProps) {
  return (
    <section className="pilot-panelBlock pilot-needsAttention">
      <div className="pilot-panelBlockHead">
        <h2 className="pilot-panelBlockTitle">Needs Attention</h2>
        <p className="pilot-panelBlockSub">Quick flags for follow-up with students and families.</p>
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
              className={`pilot-needsAttentionItem pilot-needsAttentionItem--link${
                item.highlight ? ' pilot-needsAttentionItem--highlight' : ''
              }`}
            >
              <p className="pilot-needsAttentionValue">{value}</p>
              <p className="pilot-needsAttentionLabel">{item.label}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
