import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import {
  PILOT_ADULT_TRAINING_CARDS,
  PILOT_ADULT_TRAINING_INTRO,
  PILOT_FACILITATOR_CENTER,
} from '../../../data/pilotDashboardContent';
import ProgramAccessCodesCard from '../../pilot-program/ProgramAccessCodesCard';
import AdultTrainingCard from '../../shared/AdultTrainingCard';
import { trackDownload } from '../../../lib/analytics';
import { PortalPageIntro } from '../../portal-design-system';
import PortalCategoryLayout from '../PortalCategoryLayout';

type TrainingSection = 'results' | 'dr-victoria' | 'uncle-t';

const TRAINING_SECTIONS = [
  { id: 'results', label: 'Results' },
  { id: 'dr-victoria', label: 'Dr. Victoria Training' },
  { id: 'uncle-t', label: 'Uncle T Training' },
] as const;

export default function PilotFacilitatorPanel({ results }: { results?: React.ReactNode }) {
  const activeProgram = readActivePilotProgram();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('section');
  const section: TrainingSection = requested === 'dr-victoria' || requested === 'uncle-t' ? requested : 'results';
  const selectSection = (next: TrainingSection) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'results') params.delete('section');
    else params.set('section', next);
    setSearchParams(params);
  };
  const trainingCards = PILOT_ADULT_TRAINING_CARDS.filter((card) =>
    section === 'dr-victoria' ? card.theme === 'victoria' : card.theme === 'uncle-t',
  );

  return (
    <div className="pilot-panel">
      <PortalCategoryLayout
        items={TRAINING_SECTIONS}
        activeItem={section}
        ariaLabel="Training and results sections"
        onSelect={selectSection}
      >
        {section === 'results' ? results : (
      <>
      {activeProgram ? <ProgramAccessCodesCard program={activeProgram} /> : null}

      <PortalPageIntro>{PILOT_ADULT_TRAINING_INTRO.subtitle}</PortalPageIntro>

      <div className="adultTraining-grid">
        {trainingCards.map((card) => (
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
                  onClick={() => {
                    const eventName = item.title.toLowerCase().includes('guide')
                      ? 'facilitator_guide_downloaded'
                      : 'activity_downloaded';
                    trackDownload(eventName, item.title, 'facilitator_resource');
                  }}
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
      </>
        )}
      </PortalCategoryLayout>
    </div>
  );
}
