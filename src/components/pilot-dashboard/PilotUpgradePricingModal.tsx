import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';

const CAMP_PILOT_STRIPE_LINK = 'https://buy.stripe.com/dRmfZg0rJ1dC4078Ry3Ru05';
const CAMP_PLUS_STRIPE_LINK = 'https://buy.stripe.com/6oUcN45M33lK1RZ3xe3Ru06';

type PilotUpgradePricingModalProps = {
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
    <article className={`pilot-pricingCard${featured ? ' pilot-pricingCard--featured' : ''}`}>
      {badge ? <span className="pilot-pricingBadge">{badge}</span> : null}
      <h3 className="pilot-pricingCardTitle">{title}</h3>
      <p className="pilot-pricingCardPrice">{price}</p>
      <ul className="pilot-pricingIncludes">
        {includes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <a href={href} target="_blank" rel="noopener noreferrer" className="pilot-pricingCardCta">
        {cta}
      </a>
    </article>
  );
}

export default function PilotUpgradePricingModal({ open, onClose }: PilotUpgradePricingModalProps) {
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
          <PricingCard
            title="Camp Pilot"
            price="$750"
            includes={[
              'Digital story access',
              '9 weekly SEL modules',
              'Facilitator guide',
              'Printable activities & coloring pages',
              'Focus Flame Lab access',
              'Up to 50 participants',
            ]}
            cta="Start Camp Pilot"
            href={CAMP_PILOT_STRIPE_LINK}
          />
          <PricingCard
            title="Camp Plus"
            price="$1,000"
            includes={[
              'Everything in Camp Pilot',
              'Up to 100 participants',
              'Expanded group activity use',
              'Priority pilot support',
              'Parent book purchase link',
            ]}
            badge="Launch Offer"
            cta="Claim Launch Offer"
            href={CAMP_PLUS_STRIPE_LINK}
            featured
          />
        </div>

        <button type="button" className="pilot-supportModalSecondary" onClick={onClose}>
          Continue Without Payment
        </button>
      </div>
    </div>,
    document.body,
  );
}

export { CAMP_PILOT_STRIPE_LINK };
