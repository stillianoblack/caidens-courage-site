import React from 'react';
import type { PricingPlanRecord } from '../../types/pricingPlans';
import { isStripeLinkConfigured, warnMissingStripeLink } from '../../lib/pricingPlansService';

type ConfigurablePricingCardProps = {
  plan: PricingPlanRecord;
  classNames?: {
    card?: string;
    featured?: string;
    badge?: string;
    title?: string;
    price?: string;
    includes?: string;
    cta?: string;
    ctaDisabled?: string;
    missingNote?: string;
  };
};

export default function ConfigurablePricingCard({ plan, classNames = {} }: ConfigurablePricingCardProps) {
  const stripeReady = isStripeLinkConfigured(plan.stripeUrl);
  if (!stripeReady) warnMissingStripeLink(plan);

  const cardClass = [
    classNames.card ?? 'pilot-pricingCard',
    plan.featured ? classNames.featured ?? ' pilot-pricingCard--featured' : '',
  ]
    .filter(Boolean)
    .join('');

  return (
    <article className={cardClass}>
      {plan.recommendedBadge ? (
        <span className={classNames.badge ?? 'pilot-pricingBadge'}>{plan.recommendedBadge}</span>
      ) : null}
      <h3 className={classNames.title ?? 'pilot-pricingCardTitle'}>{plan.planName}</h3>
      <p className={classNames.price ?? 'pilot-pricingCardPrice'}>{plan.priceLabel}</p>
      <ul className={classNames.includes ?? 'pilot-pricingIncludes'}>
        {plan.features.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {stripeReady ? (
        <a
          href={plan.stripeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={classNames.cta ?? 'pilot-pricingCardCta'}
        >
          {plan.ctaLabel}
        </a>
      ) : (
        <>
          <button type="button" className={classNames.ctaDisabled ?? 'pilot-pricingCardCta pilot-pricingCardCta--disabled'} disabled>
            {plan.ctaLabel}
          </button>
          <p className={classNames.missingNote ?? 'pilot-pricingMissingNote'}>Payment link not configured</p>
        </>
      )}
    </article>
  );
}
