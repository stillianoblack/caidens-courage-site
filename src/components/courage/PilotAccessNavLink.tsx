import React from 'react';
import { B4_PILOT_MODAL_DESCRIPTION } from '../../config/pilotAccess';
import type { PilotInterestType } from '../../types/pilotWaitlist';
import { usePilotAccess } from './PilotAccessProvider';

type PilotAccessNavLinkProps = {
  label: string;
  className: string;
  interestType: PilotInterestType;
  description?: string;
  clickSource?: string;
  onNavigate?: () => void;
};

export default function PilotAccessNavLink({
  label,
  className,
  interestType,
  description,
  clickSource,
  onNavigate,
}: PilotAccessNavLinkProps) {
  const { openPilotAccessModal } = usePilotAccess();

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        onNavigate?.();
        openPilotAccessModal({
          interestType,
          description: description ?? (interestType === 'b4_tools' ? B4_PILOT_MODAL_DESCRIPTION : undefined),
          clickSource,
        });
      }}
    >
      {label}
    </button>
  );
}
