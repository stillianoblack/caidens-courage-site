import React from 'react';
import { Link } from 'react-router-dom';
import {
  PILOT_ADULT_ASSESSMENT_CARDS,
  PILOT_ADULT_ASSESSMENT_SECTION,
  PILOT_STUDENT_ASSESSMENT_CARDS,
  PILOT_STUDENT_ASSESSMENT_SECTION,
} from '../../../data/pilotDashboardContent';
import PilotStatusPill from '../PilotStatusPill';

function AssessmentCard({
  card,
}: {
  card: (typeof PILOT_STUDENT_ASSESSMENT_CARDS)[number];
}) {
  if (card.locked) {
    return (
      <div className="pilot-dash-card pilot-assessCard" aria-disabled="true">
        <PilotStatusPill status={card.status} tone={card.statusTone} showLock />
        <h3 className="pilot-dash-cardTitle">{card.title}</h3>
        <p className="pilot-dash-cardDesc">{card.description}</p>
        <span className="pilot-dash-cta pilot-dash-cta--disabled">{card.cta}</span>
      </div>
    );
  }

  return (
    <Link to={card.href} className="pilot-dash-card pilot-assessCard">
      <PilotStatusPill status={card.status} tone={card.statusTone} />
      <h3 className="pilot-dash-cardTitle">{card.title}</h3>
      <p className="pilot-dash-cardDesc">{card.description}</p>
      <span className="pilot-dash-cta">{card.cta}</span>
    </Link>
  );
}

export default function PilotAssessmentsPanel() {
  return (
    <div className="pilot-panel">
      <section className="pilot-assessSection">
        <div className="pilot-assessSectionHead">
          <h2 className="pilot-assessSectionTitle">{PILOT_STUDENT_ASSESSMENT_SECTION.title}</h2>
          <p className="pilot-assessSectionSubtitle">{PILOT_STUDENT_ASSESSMENT_SECTION.subtitle}</p>
        </div>
        <div className="pilot-assessGrid">
          {PILOT_STUDENT_ASSESSMENT_CARDS.map((card) => (
            <AssessmentCard key={card.title} card={card} />
          ))}
        </div>
      </section>

      <section className="pilot-assessSection pilot-assessSection--adult">
        <div className="pilot-assessSectionHead">
          <h2 className="pilot-assessSectionTitle">{PILOT_ADULT_ASSESSMENT_SECTION.title}</h2>
          <p className="pilot-assessSectionSubtitle">{PILOT_ADULT_ASSESSMENT_SECTION.subtitle}</p>
        </div>
        <div className="pilot-assessGrid">
          {PILOT_ADULT_ASSESSMENT_CARDS.map((card) => (
            <AssessmentCard key={card.title} card={card} />
          ))}
        </div>
      </section>
    </div>
  );
}
