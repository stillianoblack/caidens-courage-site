import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { readActivePilotProgram } from '../../config/activePilotProgram';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';
import { usePricingPlansConfig } from '../../hooks/usePricingPlansConfig';
import { resolvePricingPlanGroup } from '../../lib/pricingPlanResolver';
import ConfigurablePricingCard from '../shared/ConfigurablePricingCard';

type PilotUpgradePricingModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function PilotUpgradePricingModal({ open, onClose }: PilotUpgradePricingModalProps) {
  useModalScrollLock(open);
  const { plans: allPlans } = usePricingPlansConfig();
  const programType = readActivePilotProgram()?.programType;
  const plans = useMemo(() => {
    const group = resolvePricingPlanGroup(programType);
    return allPlans.filter((plan) => plan.active && plan.group === group);
  }, [allPlans, programType]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return createPortal(
    <div className="pilot-supportModalBackdrop" role="presentation" onClick={onClose}>
      <div
        className="pilot-supportModal pilot-supportModal--pricing"
        role="dialog"
        aria-labelledby="pilot-upgrade-modal-title"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="pilot-upgrade-modal-title" className="pilot-supportModalTitle">
          Upgrade Your Plan
        </h2>
        <p className="pilot-supportModalCopy">
          Support your pilot and unlock expanded program access with Focus Flame Academy partner plans.
        </p>

        <div className="pilot-pricingGrid">
          {plans.map((plan) => (
            <ConfigurablePricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        <button type="button" className="pilot-supportModalSecondary" onClick={onClose}>
          Continue Without Payment
        </button>
      </div>
    </div>,
    document.body,
  );
}
