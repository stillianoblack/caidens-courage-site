import React from 'react';
import { Link } from 'react-router-dom';
import {
  PILOT_STUDENT_ASSESSMENT_SECTION,
  buildPilotStudentAssessmentCards,
} from '../../../data/pilotDashboardContent';
import AdultLearningFlowSection from '../../shared/AdultLearningFlowSection';
import PilotStatusPill from '../PilotStatusPill';

type AssessmentCardData = {
  title: string;
  status: string;
  statusTone: 'available' | 'locked' | 'complete' | 'review';
  description: string;
  cta: string;
  href: string;
  locked: boolean;
};

function AssessmentCard({ card }: { card: AssessmentCardData }) {
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

type PilotAssessmentsPanelProps = {
  baselineHref: string;
};

export default function PilotAssessmentsPanel({ baselineHref }: PilotAssessmentsPanelProps) {
  const studentCards = buildPilotStudentAssessmentCards(baselineHref);

  return (
    <div className="pilot-panel">
      <section className="pilot-assessSection">
        <div className="pilot-assessSectionHead">
          <h3 className="pilot-assessSectionTitle">{PILOT_STUDENT_ASSESSMENT_SECTION.title}</h3>
          <p className="pilot-assessSectionSubtitle">{PILOT_STUDENT_ASSESSMENT_SECTION.subtitle}</p>
        </div>
        <div className="pilot-assessGrid">
          {studentCards.map((card) => (
            <AssessmentCard key={card.title} card={card} />
          ))}
        </div>
      </section>

      <AdultLearningFlowSection className="pilot-assessSection--adult" showStatusBanner={false} />
    </div>
  );
}
