import React from 'react';
import { Link } from 'react-router-dom';
import { PILOT_ASSESSMENT_CARDS } from '../../../data/pilotDashboardContent';
import PilotStatusPill from '../PilotStatusPill';

export default function PilotAssessmentsPanel() {
  return (
    <div className="pilot-panel">
      <div className="pilot-assessGrid">
        {PILOT_ASSESSMENT_CARDS.map((card) =>
          card.locked ? (
            <div key={card.title} className="pilot-dash-card pilot-assessCard" aria-disabled="true">
              <PilotStatusPill status={card.status} tone={card.statusTone} showLock />
              <h3 className="pilot-dash-cardTitle">{card.title}</h3>
              <p className="pilot-dash-cardDesc">{card.description}</p>
              <span className="pilot-dash-cta pilot-dash-cta--disabled">{card.cta}</span>
            </div>
          ) : (
            <Link key={card.title} to={card.href} className="pilot-dash-card pilot-assessCard">
              <PilotStatusPill status={card.status} tone={card.statusTone} />
              <h3 className="pilot-dash-cardTitle">{card.title}</h3>
              <p className="pilot-dash-cardDesc">{card.description}</p>
              <span className="pilot-dash-cta">{card.cta}</span>
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
