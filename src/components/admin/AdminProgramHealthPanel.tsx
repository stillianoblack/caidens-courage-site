import React from 'react';
import { buildProgramHealthModel } from '../../lib/buildProgramHealthModel';
import type { PilotOutcomeProgram } from '../../types/pilotOutcomes';
import './admin-program-health-visual.css';

type AdminProgramHealthPanelProps = {
  program: PilotOutcomeProgram;
};

export default function AdminProgramHealthPanel({ program }: AdminProgramHealthPanelProps) {
  const { metrics, timeline, statusBanner } = buildProgramHealthModel(program);

  return (
    <section className="phVisual-panel programHealth" aria-labelledby="program-health-title">
      <p className="phVisual-eyebrow">{program.programName}</p>
      <h2 id="program-health-title">Program Health</h2>
      <p className="phVisual-meta">Live operational progress during the active pilot.</p>
      <div className="phVisual-health">
        {metrics.map((metric) => (
          <article className="phVisual-healthCard" key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </div>
      <ol className="phVisual-timeline" aria-label="Program milestone timeline">
        {timeline.map((step) => (
          <li key={step.key} className="phVisual-timelineStep" data-state={step.state}>
            <b aria-hidden="true">{step.marker}</b>
            {step.label}
          </li>
        ))}
      </ol>
      <p className="phVisual-notice phVisual-currentStatus" role="status">
        <strong>Current status:</strong> {statusBanner}
      </p>
    </section>
  );
}
