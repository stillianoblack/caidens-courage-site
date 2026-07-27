import React from 'react';
import { buildProgramHealthModel } from '../../lib/buildProgramHealthModel';
import type { PilotOutcomeProgram } from '../../types/pilotOutcomes';

type AdminProgramHealthPanelProps = {
  program: PilotOutcomeProgram;
};

export default function AdminProgramHealthPanel({ program }: AdminProgramHealthPanelProps) {
  const { metrics, timeline, statusBanner } = buildProgramHealthModel(program);

  return (
    <section className="pilotOutcomes-panel programHealth" aria-labelledby="program-health-title">
      <div className="programHealth-heading">
        <div>
          <p className="pilotOutcomes-eyebrow">Engagement snapshot</p>
          <h3 id="program-health-title">Program Health</h3>
        </div>
        <p className="programHealth-banner" role="status">
          {statusBanner}
        </p>
      </div>
      <div className="pilotOutcomes-summaryGrid programHealth-metrics">
        {metrics.map((metric) => (
          <article className="pilotOutcomes-metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>
      <ol className="programHealth-timeline" aria-label="Program milestone timeline">
        {timeline.map((step) => (
          <li key={step.key} className="programHealth-timelineStep" data-state={step.state}>
            <span className="programHealth-timelineMarker" aria-hidden="true" />
            <div className="programHealth-timelineBody">
              <strong>{step.label}</strong>
              <span>{step.detail}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
