import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { ActivePilotProgram } from '../../types/pilotProgram';
import type { PilotTrackingMetrics } from '../../lib/pilotTrackingMetrics';
import { facilitatorTabPath } from '../../lib/facilitatorMobileNav';
import { openFacilitatorProgramSettings } from '../../lib/openFacilitatorProgramSettings';
import { resolveFacilitatorRosterProgramCode } from '../../lib/resolveFacilitatorRosterProgramCode';
import { FACILITATOR_GAME_HUDDLE_PATH } from '../../config/courageRoutes';
import { FACILITATOR_B4_ASSETS } from '../../config/facilitatorB4Assets';

type FacilitatorMobileOverviewHeroProps = {
  activeProgram?: ActivePilotProgram | null;
  metrics?: PilotTrackingMetrics;
  brandTitle?: string;
  brandSubtitle?: string;
};

export default function FacilitatorMobileOverviewHero({
  activeProgram,
  metrics,
  brandTitle,
  brandSubtitle,
}: FacilitatorMobileOverviewHeroProps) {
  const location = useLocation();
  const programCode = resolveFacilitatorRosterProgramCode(activeProgram?.programCode);
  const title = activeProgram?.programName || brandTitle || 'Focus Flame Academy';
  const subtitle = activeProgram?.groupName || brandSubtitle || 'Facilitator Portal';

  const rosterPath = `${facilitatorTabPath('roster', location.pathname)}?addStudent=1`;
  const resultsPath = facilitatorTabPath('results', location.pathname);

  return (
    <section className="facilitator-mobileOverviewHero" aria-labelledby="facilitator-mobile-overview-title">
      <div className="facilitator-mobileOverviewHeroHead">
        <img className="facilitator-mobileOverviewHeroGuide" src={FACILITATOR_B4_ASSETS.fullBody} alt="" />
        <div>
          <p className="facilitator-mobileOverviewHeroEyebrow">Today&apos;s Camp</p>
          <h2 id="facilitator-mobile-overview-title" className="facilitator-mobileOverviewHeroTitle">
            {title}
          </h2>
          <p className="facilitator-mobileOverviewHeroSub">{subtitle}</p>
          <p className="facilitator-mobileOverviewHeroMessage">
            {metrics && metrics.studentsEnrolled > 0 && metrics.moduleCompletions > 0
              ? 'Your campers are ready for today\'s adventure.'
              : 'Let’s get your explorers ready for their first adventure.'}
          </p>
        </div>
      </div>

      {metrics ? (
        <dl className="facilitator-mobileOverviewStats">
          <div>
            <dt>Explorers</dt>
            <dd>{metrics.studentsEnrolled}</dd>
          </div>
          <div>
            <dt>Focus Flames</dt>
            <dd>{metrics.baselineChecksCompleted}</dd>
          </div>
          <div>
            <dt>Adventures</dt>
            <dd>{metrics.moduleCompletions}</dd>
          </div>
        </dl>
      ) : null}

      <div className="facilitator-mobileOverviewActions">
        <Link to={rosterPath} className="facilitator-mobileOverviewAction facilitator-mobileOverviewAction--primary">
          Add Student
        </Link>
        <Link to={FACILITATOR_GAME_HUDDLE_PATH} className="facilitator-mobileOverviewAction">
          Launch Game Huddle
        </Link>
        <Link to={resultsPath} className="facilitator-mobileOverviewAction">
          View Results
        </Link>
        <button
          type="button"
          className="facilitator-mobileOverviewAction"
          onClick={() => openFacilitatorProgramSettings('access-codes')}
          disabled={!programCode}
        >
          Access Codes
        </button>
      </div>
    </section>
  );
}
