import React, { useEffect } from 'react';
import { hasPilotExperienceAccess } from '../../config/pilotAccess';
import type { PilotInterestType } from '../../types/pilotWaitlist';
import PilotAccessButton from './PilotAccessButton';
import { usePilotAccess } from './PilotAccessProvider';
import './pilot-access.css';

type PublicPilotExperienceGateProps = {
  interestType: PilotInterestType;
  description?: string;
  title?: string;
  children: React.ReactNode;
};

export default function PublicPilotExperienceGate({
  interestType,
  description,
  title = 'Join the Focus Flame Pilot',
  children,
}: PublicPilotExperienceGateProps) {
  const { openPilotAccessModal } = usePilotAccess();
  const hasAccess = hasPilotExperienceAccess();

  useEffect(() => {
    if (!hasAccess) {
      openPilotAccessModal({
        interestType,
        description,
        clickSource: 'direct_url',
      });
    }
  }, [description, hasAccess, interestType, openPilotAccessModal]);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="pilotAccessLockedScreen">
      <div className="pilotAccessLockedCard">
        <h1>{title}</h1>
        <p>
          {description ??
            'Focus Flame Adventures are currently available through select schools, camps, homeschool programs, and pilot families.'}
        </p>
        <div className="pilotAccessLockedActions">
          <PilotAccessButton
            label="Request Access"
            interestType={interestType}
            description={description}
            clickSource="locked_screen"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
