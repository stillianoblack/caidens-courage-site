import React from 'react';
import { Link } from 'react-router-dom';
import { rosterFilterPath } from '../../lib/askB4DeepLinks';
import type { RosterFilterId } from '../../lib/pilotOverviewInsights';
import type { PilotNeedsAttentionCounts } from '../../lib/pilotStudentProgress';

type PilotNeedsAttentionCardProps = {
  counts: PilotNeedsAttentionCounts;
};

const ATTENTION_ITEMS: Array<{
  label: string;
  key: keyof PilotNeedsAttentionCounts;
  filter: RosterFilterId;
  highlight?: boolean;
}> = [
  { label: 'Missing baseline', key: 'missingBaseline', filter: 'missing-baseline' },
  { label: 'Inactive 7+ days', key: 'inactive7PlusDays', filter: 'inactive' },
  { label: 'No modules completed', key: 'noModules', filter: 'no-modules' },
  { label: 'Certificate ready', key: 'certificateReady', filter: 'certificate-ready', highlight: true },
];

export default function PilotNeedsAttentionCard({ counts }: PilotNeedsAttentionCardProps) {
  return (
    <section className="pilot-panelBlock pilot-needsAttention">
      <div className="pilot-panelBlockHead">
        <h2 className="pilot-panelBlockTitle">Needs Attention</h2>
        <p className="pilot-panelBlockSub">Quick flags for follow-up with students and families.</p>
      </div>
      <div className="pilot-needsAttentionGrid">
        {ATTENTION_ITEMS.map((item) => (
          <Link
            key={item.label}
            to={rosterFilterPath(item.filter)}
            className={`pilot-needsAttentionItem pilot-needsAttentionItem--link${
              item.highlight ? ' pilot-needsAttentionItem--highlight' : ''
            }`}
          >
            <p className="pilot-needsAttentionValue">{counts[item.key]}</p>
            <p className="pilot-needsAttentionLabel">{item.label}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
