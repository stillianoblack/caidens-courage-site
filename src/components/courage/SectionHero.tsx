import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export type SectionHeroVariant = 'default' | 'compact' | 'kids';

export type SectionHeroProps = {
  /** Small uppercase gold label above the title */
  eyebrow: string;
  /** Main page headline (text after optional gold accent) */
  title: string;
  /** Optional gold-emphasis prefix, e.g. "B-4" */
  titleAccent?: string;
  /** Primary description — max ~700–800px */
  description: string;
  /** Optional supporting sentence beneath the description */
  supportingText?: string;
  /** Optional id for anchors / scroll targets */
  id?: string;
  /** Optional CTA row — overrides ctaLabel / ctaHref / ctaOnClick when provided */
  children?: React.ReactNode;
  /** Header clearance — CourageHeader (default) or Vale multi-row Header */
  headerOffset?: 'courage' | 'vale';
  /** Tighter top padding for pages that sit higher under the header */
  variant?: SectionHeroVariant;
  /** Convenience CTA — rendered when children is not provided */
  ctaLabel?: string;
  /** Hash or path for CTA link, e.g. "#modules" */
  ctaHref?: string;
  /** Button click handler for CTA */
  ctaOnClick?: () => void;
};

function SectionHeroCta({
  ctaLabel,
  ctaHref,
  ctaOnClick,
}: Pick<SectionHeroProps, 'ctaLabel' | 'ctaHref' | 'ctaOnClick'>) {
  if (!ctaLabel) return null;

  if (ctaOnClick) {
    return (
      <Button variant="primary" size="lg" onClick={ctaOnClick} leftIconSrc={null} className="w-full sm:w-auto">
        {ctaLabel}
      </Button>
    );
  }

  if (ctaHref) {
    const isInternalRoute = ctaHref.startsWith('/') && !ctaHref.startsWith('//');
    const isHashLink = ctaHref.startsWith('#');

    if (isInternalRoute) {
      return (
        <Button variant="primary" size="lg" as={Link} to={ctaHref} leftIconSrc={null} className="w-full sm:w-auto">
          {ctaLabel}
        </Button>
      );
    }

    return (
      <Button
        variant="primary"
        size="lg"
        as="a"
        href={ctaHref}
        leftIconSrc={null}
        className="w-full sm:w-auto"
        {...(isHashLink ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {ctaLabel}
      </Button>
    );
  }

  return null;
}

/**
 * Premium cinematic hero for Caiden's Courage second-level educational pages.
 * Deep navy gradient, gold eyebrow, left-aligned editorial layout.
 */
export default function SectionHero({
  eyebrow,
  title,
  titleAccent,
  description,
  supportingText,
  id,
  children,
  headerOffset = 'courage',
  variant = 'default',
  ctaLabel,
  ctaHref,
  ctaOnClick,
}: SectionHeroProps) {
  const ctaContent = children ?? (
    <SectionHeroCta ctaLabel={ctaLabel} ctaHref={ctaHref} ctaOnClick={ctaOnClick} />
  );

  return (
    <section
      id={id}
      data-section="header"
      className={[
        'cc-section-hero relative overflow-hidden text-left text-white',
        headerOffset === 'vale' ? 'cc-section-hero--vale' : 'cc-section-hero--courage',
        variant === 'compact' || variant === 'kids' ? 'cc-section-hero--compact' : '',
      ].join(' ')}
    >
      <div className="cc-section-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="cc-section-hero-noise pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="cc-section-hero-inner relative z-10 mx-auto max-w-[75rem] px-4 sm:px-6 lg:px-8">
        <p className="cc-section-hero-eyebrow text-[10px] font-semibold uppercase tracking-[0.22em] text-golden-400 sm:text-[11px]">
          {eyebrow}
        </p>
        <h1 className="cc-section-hero-title mt-4 font-display font-extrabold leading-[1.06] text-white sm:mt-5">
          {titleAccent ? (
            <>
              <span className="text-golden-400">{titleAccent}</span>
              {title ? ` ${title}` : null}
            </>
          ) : (
            title
          )}
        </h1>
        <p className="cc-section-hero-description mt-5 max-w-[50rem] text-base leading-relaxed text-white/[0.85] sm:mt-6 sm:text-lg sm:leading-relaxed lg:text-xl">
          {description}
        </p>
        {supportingText ? (
          <p className="cc-section-hero-support mt-4 max-w-[50rem] text-sm leading-relaxed text-white/[0.65] sm:mt-5 sm:text-base">
            {supportingText}
          </p>
        ) : null}
        {ctaContent ? <div className="cc-section-hero-actions mt-8 sm:mt-10">{ctaContent}</div> : null}
      </div>
    </section>
  );
}
