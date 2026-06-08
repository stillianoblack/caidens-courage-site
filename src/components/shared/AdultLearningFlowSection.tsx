import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdultLearningStatus } from '../../hooks/useAdultLearningStatus';
import { ADULT_LEARNING_FLOW_SECTION } from '../../lib/adultAssessmentProgress';
import type { AdultLearningFlowCard } from '../../lib/adultAssessmentProgress';
import AdultLearningStatusBanner from './AdultLearningStatusBanner';
import PilotStatusPill from '../pilot-dashboard/PilotStatusPill';
import '../pilot-dashboard/pilot-dashboard.css';
import '../family-portal/weekly-adventures-unlock-card.css';

function AdultLearningFlowCardItem({ card }: { card: AdultLearningFlowCard }) {
  if (card.locked) {
    return (
      <div className="pilot-dash-card pilot-assessCard pilot-assessCard--locked" aria-disabled="true">
        <PilotStatusPill status={card.status} tone={card.statusTone} showLock />
        <h3 className="pilot-dash-cardTitle">{card.title}</h3>
        <p className="pilot-dash-cardDesc">
          {card.lockedDescription ?? card.description}
        </p>
        {card.lockedFooter ? (
          <p className="pilot-assessCardLockedFoot">{card.lockedFooter}</p>
        ) : null}
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

type AdultLearningFlowSectionProps = {
  className?: string;
  placement?: 'parent' | 'facilitator';
  showStatusBanner?: boolean;
};

export default function AdultLearningFlowSection({
  className = '',
  placement = 'facilitator',
  showStatusBanner = placement === 'parent',
}: AdultLearningFlowSectionProps) {
  const location = useLocation();
  const status = useAdultLearningStatus(location.pathname);

  return (
    <section className={['pilot-assessSection', 'adultLearningFlowSection', className].filter(Boolean).join(' ')}>
      <div className="pilot-assessSectionHead">
        <h3 className="pilot-assessSectionTitle">{ADULT_LEARNING_FLOW_SECTION.title}</h3>
        <p className="pilot-assessSectionSubtitle">{ADULT_LEARNING_FLOW_SECTION.subtitle}</p>
      </div>

      {showStatusBanner ? (
        <AdultLearningStatusBanner placement={placement} status={status} />
      ) : null}

      <div className="pilot-assessGrid">
        {status.cards.map((card) => (
          <AdultLearningFlowCardItem key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
