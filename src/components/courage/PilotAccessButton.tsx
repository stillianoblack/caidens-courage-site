import React from 'react';
import Button from '../ui/Button';
import { B4_PILOT_MODAL_DESCRIPTION } from '../../config/pilotAccess';
import { usePilotAccess } from './PilotAccessProvider';
import type { PilotAccessModalOptions } from './PilotAccessProvider';

type PilotAccessButtonProps = PilotAccessModalOptions & {
  label?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  clickSource?: string;
};

export default function PilotAccessButton({
  label = 'Request Access',
  variant = 'primary',
  size = 'lg',
  className = '',
  interestType = 'general_pilot',
  description,
  clickSource,
}: PilotAccessButtonProps) {
  const { openPilotAccessModal } = usePilotAccess();

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() =>
        openPilotAccessModal({
          interestType,
          description:
            description ?? (interestType === 'b4_tools' ? B4_PILOT_MODAL_DESCRIPTION : undefined),
          clickSource,
        })
      }
    >
      {label}
    </Button>
  );
}
