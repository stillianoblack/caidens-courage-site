import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';
import { usePricingPlansConfig } from '../../hooks/usePricingPlansConfig';
import ConfigurablePricingCard from '../shared/ConfigurablePricingCard';
import './family-pricing-modal.css';

type FamilyUpgradePricingModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function FamilyUpgradePricingModal({ open, onClose }: FamilyUpgradePricingModalProps) {
  useModalScrollLock(open);
  const { plans } = usePricingPlansConfig();
  const familyPlans = useMemo(
    () => plans.filter((plan) => plan.active && plan.group === 'family'),
    [plans],
  );

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
    <div className="family-pricingModalBackdrop" role="presentation" onClick={onClose}>
      <div
        className="family-pricingModal"
        role="dialog"
        aria-labelledby="family-upgrade-modal-title"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="family-pricingModalClose"
          aria-label="Close pricing plans"
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        <div className="family-pricingModalBody">
          <h2 id="family-upgrade-modal-title" className="family-pricingModalTitle">
            Upgrade Your Family Plan
          </h2>
          <p className="family-pricingModalCopy">
            Unlock family activities, games, digital story access, and premium resources.
          </p>

          <div className="family-pricingGrid">
            {familyPlans.map((plan) => (
              <ConfigurablePricingCard
                key={plan.id}
                plan={plan}
                classNames={{
                  card: 'family-pricingCard',
                  featured: ' family-pricingCard--featured',
                  badge: 'family-pricingBadge',
                  title: 'family-pricingCardTitle',
                  price: 'family-pricingCardPrice',
                  includes: 'family-pricingIncludes',
                  cta: 'family-pricingCardCta',
                  ctaDisabled: 'family-pricingCardCta family-pricingCardCta--disabled',
                  missingNote: 'family-pricingMissingNote',
                }}
              />
            ))}
          </div>

          <button type="button" className="family-pricingModalSecondary" onClick={onClose}>
            Continue Without Payment
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
