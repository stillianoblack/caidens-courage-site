import React from 'react';

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

export default function FamilyUpgradePricingModal({ open, onClose }: FamilyUpgradePricingModalProps) {
  if (!open) return null;

  return (
    <div className="pilot-supportModalBackdrop" role="presentation" onClick={onClose}>
      <div
        className="pilot-supportModal pilot-supportModal--pricing"
        role="dialog"
        aria-labelledby="family-upgrade-modal-title"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="family-upgrade-modal-title" className="pilot-supportModalTitle">
          Upgrade Your Family Plan
        </h2>
        <p className="pilot-supportModalCopy">
          Unlock family activities, games, digital story access, and premium resources.
        </p>

        <div className="pilot-pricingGrid">
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

        <button type="button" className="pilot-supportModalSecondary" onClick={onClose}>
          Continue Without Payment
        </button>
      </div>
    </div>
  );
}
