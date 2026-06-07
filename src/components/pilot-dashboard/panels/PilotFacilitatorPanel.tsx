import React from 'react';
import { Link } from 'react-router-dom';
import {
  PILOT_ADULT_TRAINING_CARDS,
  PILOT_ADULT_TRAINING_INTRO,
  PILOT_FACILITATOR_CENTER,
} from '../../../data/pilotDashboardContent';
import AdultTrainingCard from '../../shared/AdultTrainingCard';

export default function PilotFacilitatorPanel() {
  return (
    <div className="pilot-panel">
      <div className="pilot-panelIntro">
        <h2 className="pilot-panelIntroTitle">{PILOT_ADULT_TRAINING_INTRO.title}</h2>
        <p className="pilot-panelIntroSubtitle">{PILOT_ADULT_TRAINING_INTRO.subtitle}</p>
      </div>

      <div className="adultTraining-grid">
        {PILOT_ADULT_TRAINING_CARDS.map((card) => (
          <AdultTrainingCard key={card.title} card={card} />
        ))}
      </div>

      <section className="pilot-resourceSection">
        <h3 className="pilot-resourceSectionTitle">Facilitator Resources</h3>
        <div className="pilot-dash-grid pilot-dash-grid--2">
          {PILOT_FACILITATOR_CENTER.map((item) => {
            const isDownload = item.href.startsWith('/downloads');

            if (isDownload) {
              return (
                <a
                  key={item.title}
                  href={item.href}
                  className="pilot-dash-card pilot-facilitatorCard"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <h3 className="pilot-dash-cardTitle">{item.title}</h3>
                  <span className="pilot-dash-cta">Download Template</span>
                </a>
              );
            }

            return (
              <Link key={item.title} to={item.href} className="pilot-dash-card pilot-facilitatorCard">
                <h3 className="pilot-dash-cardTitle">{item.title}</h3>
                <span className="pilot-dash-cta">Open Guide</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
