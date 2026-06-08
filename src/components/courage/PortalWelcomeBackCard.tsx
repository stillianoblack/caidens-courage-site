import React from 'react';
import { useNavigate } from 'react-router-dom';
import { applyProgramPortalUnlock } from '../../config/portalContext';
import { FAMILY_HUB_PATH, PROGRAM_DASHBOARD_PATH } from '../../config/courageRoutes';
import { maskAccessCode, type LastPilotProgram } from '../../config/lastPilotProgram';
type PortalWelcomeBackCardProps = {
  saved: LastPilotProgram;
  onUseDifferentCode: () => void;
};

export default function PortalWelcomeBackCard({ saved, onUseDifferentCode }: PortalWelcomeBackCardProps) {
  const navigate = useNavigate();

  const continueAs = (role: 'facilitator' | 'family') => {
    const code =
      role === 'family' ? saved.family_access_code : saved.facilitator_access_code;
    applyProgramPortalUnlock(saved.program, role, code);
    navigate(role === 'family' ? FAMILY_HUB_PATH : PROGRAM_DASHBOARD_PATH, { replace: true });
  };

  return (
    <section className="portal-welcomeBack" aria-labelledby="portal-welcome-back-title">
      <h3 id="portal-welcome-back-title" className="portal-welcomeBackTitle">
        Welcome back
      </h3>
      <p className="portal-welcomeBackCopy">We found your recent pilot program.</p>
      <p className="portal-welcomeBackProgram">{saved.program_name}</p>

      <div className="portal-welcomeBackCodes">
        <p>
          <span className="portal-welcomeBackLabel">Facilitator:</span>{' '}
          {maskAccessCode(saved.facilitator_access_code)}
        </p>
        <p>
          <span className="portal-welcomeBackLabel">Family:</span>{' '}
          {maskAccessCode(saved.family_access_code)}
        </p>
      </div>

      <div className="portal-welcomeBackActions">
        <button type="button" className="portal-welcomeBackBtn" onClick={() => continueAs('facilitator')}>
          Continue as Facilitator
        </button>
        <button type="button" className="portal-welcomeBackBtn" onClick={() => continueAs('family')}>
          Continue as Family
        </button>
        <button type="button" className="portal-welcomeBackLink" onClick={onUseDifferentCode}>
          Use Different Code
        </button>
      </div>
    </section>
  );
}
