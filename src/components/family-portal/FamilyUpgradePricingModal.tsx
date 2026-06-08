import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';
import './family-pricing-modal.css';

// TODO: Replace placeholder Stripe links with live checkout URLs.
const FAMILY_PORTAL_STRIPE_LINK = '#family-portal-stripe-link';
const DIGITAL_BOOK_FAMILY_PORTAL_STRIPE_LINK = '#digital-book-family-portal-stripe-link';

type FamilyUpgradePricingModalProps = {
  open: boolean;
  onClose: () => void;
};

function PricingCard({
  title,
  price,
  includes,
  badge,
  cta,
  href,
  featured = false,
}: {
  title: string;
  price: string;
  includes: string[];
  badge?: string;
  cta: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <article className={`family-pricingCard${featured ? ' family-pricingCard--featured' : ''}`}>
      {badge ? <span className="family-pricingBadge">{badge}</span> : null}
      <h3 className="family-pricingCardTitle">{title}</h3>
      <p className="family-pricingCardPrice">{price}</p>
      <ul className="family-pricingIncludes">
        {includes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <a href={href} target="_blank" rel="noopener noreferrer" className="family-pricingCardCta">
        {cta}
      </a>
    </article>
  );
}

export default function FamilyUpgradePricingModal({ open, onClose }: FamilyUpgradePricingModalProps) {
  useModalScrollLock(open);

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
            <PricingCard
              title="Family Portal"
              price="$79/year"
              includes={[
                'Family activities',
                'Coloring pages',
                'Printable tools',
                'B-4 focus exercises',
                'Character games',
                'Parent Corner',
              ]}
              cta="Start Family Portal"
              href={FAMILY_PORTAL_STRIPE_LINK}
            />
            <PricingCard
              title="Digital Book + Family Portal"
              price="$129/year"
              includes={[
                'Digital graphic novel access',
                'One year of Family Portal resources',
                'Character missions',
                'Parent training tools',
                'Premium downloads',
              ]}
              badge="Recommended"
              cta="Get Digital Book + Family Portal"
              href={DIGITAL_BOOK_FAMILY_PORTAL_STRIPE_LINK}
              featured
            />
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
