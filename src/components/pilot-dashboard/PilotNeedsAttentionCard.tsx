import React from 'react';
import type { PilotNeedsAttentionCounts } from '../../lib/pilotStudentProgress';

type PilotNeedsAttentionCardProps = {
  counts: PilotNeedsAttentionCounts;
};

export default function PilotNeedsAttentionCard({ counts }: PilotNeedsAttentionCardProps) {
  const items = [
    { label: 'Missing baseline', value: counts.missingBaseline },
    { label: 'Inactive 7+ days', value: counts.inactive7PlusDays },
    { label: 'No modules completed', value: counts.noModules },
    { label: 'Certificate ready', value: counts.certificateReady, highlight: true },
  ];

  return (
    <section className="pilot-panelBlock pilot-needsAttention">
      <div className="pilot-panelBlockHead">
        <h2 className="pilot-panelBlockTitle">Needs Attention</h2>
        <p className="pilot-panelBlockSub">Quick flags for follow-up with students and families.</p>
      </div>
      <div className="pilot-needsAttentionGrid">
        {items.map((item) => (
          <article
            key={item.label}
            className={`pilot-needsAttentionItem${item.highlight ? ' pilot-needsAttentionItem--highlight' : ''}`}
          >
            <p className="pilot-needsAttentionValue">{item.value}</p>
            <p className="pilot-needsAttentionLabel">{item.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
