import React from 'react';
import { Link } from 'react-router-dom';
import type { ActivePilotProgram } from '../../types/pilotProgram';
import { PROGRAM_DASHBOARD_PATH } from '../../config/courageRoutes';
import { useCopyToast } from '../shared/useCopyToast';

type PilotProgramWelcomeCardProps = {
  program: ActivePilotProgram;
  onDismiss?: () => void;
};

export default function PilotProgramWelcomeCard({ program, onDismiss }: PilotProgramWelcomeCardProps) {
  const { copyWithToast, toast } = useCopyToast();

  return (
    <>
      <section className="pilotWelcome-card" aria-labelledby="pilot-welcome-title">
        <h2 id="pilot-welcome-title" className="pilotWelcome-title">
          Your Pilot Program Is Ready
        </h2>

        <div className="pilotWelcome-row">
          <span className="pilotWelcome-label">Program Dashboard</span>
          <Link to={PROGRAM_DASHBOARD_PATH} className="pilotWelcome-value">
            Go to Dashboard
          </Link>
        </div>

        <div className="pilotWelcome-row">
          <span className="pilotWelcome-label">Facilitator Code</span>
          <span className="pilotWelcome-value">{program.facilitatorAccessCode}</span>
        </div>

        <div className="pilotWelcome-row">
          <span className="pilotWelcome-label">Family Access Code</span>
          <span className="pilotWelcome-value">{program.familyAccessCode}</span>
        </div>

        <p className="pilotWelcome-copy">
          Share the Family Access Code with parents so they can join the Family Hub and access
          kid-friendly activities, games, and downloads.
        </p>

        <div className="pilotWelcome-actions">
          <button
            type="button"
            className="pilotWelcome-btn"
            onClick={() => void copyWithToast(program.familyAccessCode)}
          >
            Copy Family Code
          </button>
          <button
            type="button"
            className="pilotWelcome-btn"
            onClick={() => void copyWithToast(program.facilitatorAccessCode)}
          >
            Copy Facilitator Code
          </button>
          {onDismiss ? (
            <button type="button" className="pilotWelcome-btn pilotWelcome-btn--primary" onClick={onDismiss}>
              Continue to Dashboard
            </button>
          ) : null}
        </div>
      </section>
      {toast}
    </>
  );
}
