import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { ActivePilotProgram } from '../../types/pilotProgram';
import type { PilotTrackingMetrics } from '../../lib/pilotTrackingMetrics';
import { facilitatorTabPath } from '../../lib/facilitatorMobileNav';
import { openFacilitatorProgramSettings } from '../../lib/openFacilitatorProgramSettings';
import { resolveFacilitatorRosterProgramCode } from '../../lib/resolveFacilitatorRosterProgramCode';

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
  const weeklyModulesPath = facilitatorTabPath('weekly-modules', location.pathname);
  const resultsPath = facilitatorTabPath('results', location.pathname);

  return (
    <section className="facilitator-mobileOverviewHero" aria-labelledby="facilitator-mobile-overview-title">
      <div className="facilitator-mobileOverviewHeroHead">
        <h2 id="facilitator-mobile-overview-title" className="facilitator-mobileOverviewHeroTitle">
          {title}
        </h2>
        <p className="facilitator-mobileOverviewHeroSub">{subtitle}</p>
      </div>

      {metrics ? (
        <dl className="facilitator-mobileOverviewStats">
          <div>
            <dt>Program Students</dt>
            <dd>{metrics.studentsEnrolled}</dd>
          </div>
          <div>
            <dt>Baseline Checks</dt>
            <dd>{metrics.baselineChecksCompleted}</dd>
          </div>
          <div>
            <dt>Module Completions</dt>
            <dd>{metrics.moduleCompletions}</dd>
          </div>
        </dl>
      ) : null}

      <div className="facilitator-mobileOverviewActions">
        <Link to={rosterPath} className="facilitator-mobileOverviewAction facilitator-mobileOverviewAction--primary">
          Add Student
        </Link>
        <Link to={weeklyModulesPath} className="facilitator-mobileOverviewAction">
          Open Weekly Modules
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
