import React from 'react';
import './portal-design-system.css';

export type MarketingShowcaseAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'ghost';
};

type MarketingShowcaseCardProps = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt?: string;
  actions: MarketingShowcaseAction[];
  className?: string;
};

export default function MarketingShowcaseCard({
  title,
  description,
  imageSrc,
  imageAlt = '',
  actions,
  className = '',
}: MarketingShowcaseCardProps) {
  return (
    <section className={`ds-marketingCard ${className}`.trim()}>
      <div className="ds-marketingCardInner">
        <div className="ds-marketingCardMedia">
          <div className="ds-marketingCardImageRing">
            <img src={imageSrc} alt={imageAlt} decoding="async" />
          </div>
        </div>
        <div className="ds-marketingCardBody">
          <h3 className="ds-marketingCardTitle">{title}</h3>
          <p className="ds-marketingCardText">{description}</p>
          <div className="ds-marketingCardActions">
            {actions.map((action) => {
              const classNames = `ds-marketingCardBtn${
                action.variant === 'ghost' ? ' ds-marketingCardBtn--ghost' : ''
              }`;
              if (action.href) {
                return (
                  <a key={action.label} href={action.href} className={classNames}>
                    {action.label}
                  </a>
                );
              }
              return (
                <button key={action.label} type="button" className={classNames} onClick={action.onClick}>
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
