import React from 'react';
import { Link } from 'react-router-dom';
import type { PersonaPageConfig } from '../../config/personaPages';
import { trackCtaClick } from '../../lib/analytics';
import Button from '../ui/Button';

export function PersonaContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`cc-courage-header-shell sm:px-6 lg:px-8 ${className}`.trim()}><div className="cc-site-container mx-auto">{children}</div></div>;
}

export function EditorialPricingTierCard({ tier, family = false }: { tier: PersonaPageConfig['pricing'][number]; family?: boolean }) {
  return (
    <article className={`personaEditorial__pricingCard ${family ? 'personaEditorial__pricingCard--family' : ''} ${tier.featured ? 'is-featured' : ''}`}>
      {tier.badges?.length ? <div className="personaEditorial__badges">{tier.badges.map((badge) => <span key={badge}>{badge}</span>)}</div> : tier.featured ? <span className="personaEditorial__recommended">Recommended</span> : null}
      <h3>{tier.title}</h3>
      <p className="personaEditorial__price">{tier.price}</p>
      {tier.description ? <p>{tier.description}</p> : null}
      {tier.includes?.length ? <div className="personaEditorial__includes"><b>Includes</b><ul>{tier.includes.map((item) => <li key={item}>✓ {item}</li>)}</ul></div> : null}
      {tier.licenseNote ? <p className="personaEditorial__tierNote"><b>License note: </b>{tier.licenseNote}</p> : null}
      {tier.launchOffer ? <p className="personaEditorial__offer">{tier.launchOffer}</p> : null}
      {tier.notes?.map((note) => <p className="personaEditorial__tierNote" key={note}>{note}</p>)}
      {tier.notIncluded?.length ? <div className="personaEditorial__notIncluded"><b>Not included</b><ul>{tier.notIncluded.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
      {tier.cta ? <Button variant="primary" size="lg" as={tier.cta.external || tier.cta.href.startsWith('http') ? 'a' : Link} {...(tier.cta.external || tier.cta.href.startsWith('http') ? { href: tier.cta.href, target: '_blank', rel: 'noopener noreferrer' } : { to: tier.cta.href })} leftIconSrc={null} className="personaEditorial__pricingCta" onClick={() => trackCtaClick(tier.cta!.label, tier.cta!.href)}>{tier.cta.label}</Button> : null}
    </article>
  );
}
