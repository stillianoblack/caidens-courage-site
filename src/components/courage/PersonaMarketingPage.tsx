import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import CourageHeader from './CourageHeader';
import CourageFooter from './CourageFooter';
import SectionHero from './SectionHero';
import RelatedPathCards from './RelatedPathCards';
import Button from '../ui/Button';
import useHashScroll from '../../hooks/useHashScroll';
import type { PersonaPageConfig } from '../../config/personaPages';
import { trackCtaClick, trackSalesFunnel } from '../../lib/analytics';

type PersonaMarketingPageProps = {
  config: PersonaPageConfig;
  /** Optional sections rendered before related path cards (e.g. pilot form, kids cross-link). */
  children?: React.ReactNode;
};

function PersonaContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`cc-courage-header-shell sm:px-6 lg:px-8 ${className}`.trim()}>
      <div className="cc-site-container mx-auto">{children}</div>
    </div>
  );
}

function CheckList({ items, className = '' }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-base text-navy-600 sm:text-lg">
          <span className="mt-1 shrink-0 text-golden-600" aria-hidden>
            ✓
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function PricingTierCard({ tier, family = false }: { tier: PersonaPageConfig['pricing'][number]; family?: boolean }) {
  return (
    <div
      className={[
        'flex flex-col rounded-3xl border-2 bg-white p-8 shadow-sm',
        family ? 'persona-familyPricingCard' : '',
        tier.featured ? 'border-golden-400 ring-2 ring-golden-400/30' : 'border-navy-100',
      ].join(' ')}
    >
      {tier.badges?.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {tier.badges.map((badge) => (
            <span
              key={badge}
              className={[
                'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                tier.featured ? 'bg-golden-100 text-navy-600' : 'bg-navy-50 text-navy-600',
              ].join(' ')}
            >
              {badge}
            </span>
          ))}
        </div>
      ) : tier.featured ? (
        <span className="mb-3 inline-flex w-fit rounded-full bg-golden-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-navy-600">
          Recommended
        </span>
      ) : null}

      <h3 className="font-display text-xl font-bold text-navy-500 sm:text-2xl">{tier.title}</h3>
      <p className="mt-3 font-display text-3xl font-extrabold text-navy-600">{tier.price}</p>

      {tier.description ? (
        <p className="mt-4 text-base leading-relaxed text-navy-600 sm:text-lg">{tier.description}</p>
      ) : null}

      {tier.includes?.length ? (
        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-navy-500/70">Includes</p>
          <CheckList items={tier.includes} className="mt-3" />
        </div>
      ) : null}

      {tier.licenseNote ? (
        <p className="mt-4 text-sm leading-relaxed text-navy-500">
          <span className="font-semibold text-navy-600">License note: </span>
          {tier.licenseNote}
        </p>
      ) : null}

      {tier.launchOffer ? (
        <p className="mt-4 rounded-xl border border-golden-300/80 bg-golden-50 px-4 py-3 text-sm font-semibold leading-relaxed text-navy-600">
          {tier.launchOffer}
        </p>
      ) : null}

      {tier.notes?.length ? (
        <ul className="mt-4 space-y-2">
          {tier.notes.map((note) => (
            <li key={note} className="text-sm leading-relaxed text-navy-500">
              {note}
            </li>
          ))}
        </ul>
      ) : null}

      {tier.notIncluded?.length ? (
        <div className="mt-6 border-t border-navy-100 pt-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-navy-500/70">Not included</p>
          <ul className="mt-3 space-y-2">
            {tier.notIncluded.map((item) => (
              <li key={item} className="text-sm text-navy-500">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {tier.cta ? (
        <div className="mt-auto pt-8">
          {tier.cta.external || tier.cta.href.startsWith('http') ? (
            <Button
              variant="primary"
              size="lg"
              as="a"
              href={tier.cta.href}
              target="_blank"
              rel="noopener noreferrer"
              leftIconSrc={null}
              className="w-full"
              onClick={() => trackCtaClick(tier.cta!.label, tier.cta!.href)}
            >
              {tier.cta.label}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              as={Link}
              to={tier.cta.href}
              leftIconSrc={null}
              className="w-full"
              onClick={() => trackCtaClick(tier.cta!.label, tier.cta!.href)}
            >
              {tier.cta.label}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function PersonaMarketingPage({ config, children }: PersonaMarketingPageProps) {
  useHashScroll();
  const pricingViewedRef = useRef(false);

  useEffect(() => {
    document.title = config.documentTitle;
  }, [config.documentTitle]);

  useEffect(() => {
    const pricingSection = document.getElementById('pricing');
    if (!pricingSection || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (pricingViewedRef.current) return;
        if (entries.some((entry) => entry.isIntersecting)) {
          pricingViewedRef.current = true;
          trackSalesFunnel('pricing_viewed');
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(pricingSection);
    return () => observer.disconnect();
  }, []);

  const howItWorksItems = config.howItWorks ?? config.faq ?? [];
  const isFamilyPage = config.slug === 'parents';
  const familyAudienceDescriptions: Record<string, string> = {
    'Parents and caregivers': 'Tools to support everyday conversations and stronger connections.',
    'Homeschool families': 'Flexible resources for learning, growth, and emotional development.',
    'Kids ages 7–12': 'Age-appropriate tools to build confidence and independence.',
    'Neurodivergent-friendly home learning': 'Designed with inclusivity and all kinds of learners in mind.',
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-cream font-body">
      <CourageHeader />

      <SectionHero
        className={isFamilyPage ? 'persona-familyHero' : ''}
        variant={isFamilyPage ? 'compact' : 'default'}
        eyebrow={config.eyebrow}
        title={config.heroTitle}
        description={config.heroSubtitle}
        supportingText={config.intro}
        visual={isFamilyPage ? (
          <div className="persona-familyHeroGuide">
            <div className="persona-familyHeroGuideGlow" />
            <img
              className="persona-familyHeroB4"
              src="/images/Choose-Your-Guide/b-4facilitator-hover.webp"
              alt=""
            />
          </div>
        ) : undefined}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            variant="primary"
            size="lg"
            as={Link}
            to={config.primaryCta.href}
            leftIconSrc={null}
            className="w-full sm:w-auto"
            onClick={() => trackCtaClick(config.primaryCta.label, config.primaryCta.href)}
          >
            {config.primaryCta.label}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            as={Link}
            to={config.secondaryCta.href}
            className="cc-schools-hero-secondary w-full border-white/40 text-white hover:bg-white/10 hover:text-white sm:w-auto"
            onClick={() => trackCtaClick(config.secondaryCta.label, config.secondaryCta.href)}
          >
            {config.secondaryCta.label}
          </Button>
        </div>
      </SectionHero>

      {/* Who it's for */}
      <section id="who-its-for" className={`cc-schools-section scroll-mt-24 border-b border-navy-100/80 bg-white ${isFamilyPage ? 'persona-familyWho' : ''}`}>
        <PersonaContainer>
          <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl lg:text-4xl">Who it&apos;s for</h2>
          <ul className={isFamilyPage ? 'persona-familyWhoGrid mt-8' : 'cc-schools-card-grid mt-8'}>
            {config.whoItsFor.map((item) => (
              <li
                key={item}
                className={isFamilyPage ? 'persona-familyWhoCard' : 'flex min-h-[88px] items-center gap-4 rounded-2xl border border-navy-100 bg-cream px-6 py-5 font-display text-lg font-semibold text-navy-500 sm:text-xl'}
              >
                {isFamilyPage ? (
                  <>
                    <span className="persona-familyIcon" aria-hidden>✦</span>
                    <span>
                      <strong>{item}</strong>
                      <span>{familyAudienceDescriptions[item]}</span>
                    </span>
                    <i aria-hidden />
                  </>
                ) : (
                  <><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-golden-500" aria-hidden />{item}</>
                )}
              </li>
            ))}
          </ul>
        </PersonaContainer>
      </section>

      {/* Benefits */}
      <section id="benefits" className={`cc-schools-section scroll-mt-24 ${isFamilyPage ? 'persona-familyBenefits' : ''}`}>
        <PersonaContainer>
          <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl lg:text-4xl">Benefits</h2>
          <div className={isFamilyPage ? 'persona-familyTileGrid mt-8' : 'cc-schools-card-grid mt-8'}>
            {config.benefits.map((benefit) => (
              <div
                key={benefit}
                className={isFamilyPage ? 'persona-familyTile' : 'rounded-3xl border-2 border-navy-100 bg-white p-6 shadow-sm transition-transform duration-200 md:hover:-translate-y-0.5 sm:p-8'}
              >
                {isFamilyPage ? <span className="persona-familyIcon" aria-hidden>✓</span> : null}
                <p className="text-base leading-relaxed text-navy-600 sm:text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </PersonaContainer>
      </section>

      {/* What's included */}
      <section id="whats-included" className={`cc-schools-section scroll-mt-24 border-y border-navy-100/80 bg-white ${isFamilyPage ? 'persona-familyIncluded' : ''}`}>
        <PersonaContainer>
          <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl lg:text-4xl">What&apos;s included</h2>
          <ul className={isFamilyPage ? 'persona-familyIncludedGrid mt-8' : 'cc-schools-included-grid mt-8'}>
            {config.whatsIncluded.map((item) => (
              <li
                key={item}
                className={isFamilyPage ? 'persona-familyIncludedTile' : 'rounded-3xl border-2 border-navy-100 bg-cream p-6 shadow-sm transition-transform duration-200 md:hover:-translate-y-0.5'}
              >
                {isFamilyPage ? <span className="persona-familyIcon" aria-hidden>✓</span> : null}
                <span className="font-display text-base font-bold text-navy-500 sm:text-lg">{item}</span>
              </li>
            ))}
          </ul>
        </PersonaContainer>
      </section>

      {/* Pricing */}
      <section id="pricing" className="cc-schools-section cc-schools-section--large scroll-mt-24">
        <PersonaContainer>
          <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl lg:text-4xl">Pricing</h2>
          <div
            className={[
              'mt-8 grid grid-cols-1 gap-6 sm:gap-8',
              config.pricing.length === 2 ? 'md:grid-cols-2' : 'cc-schools-card-grid !mt-8',
            ].join(' ')}
          >
            {config.pricing.map((tier) => (
              <PricingTierCard key={tier.title} tier={tier} family={isFamilyPage} />
            ))}
          </div>
          {config.pricingFooterNotes?.length ? (
            <div className={`mt-8 rounded-2xl border border-navy-100 bg-cream px-6 py-5 ${isFamilyPage ? 'persona-familyPricingNote' : ''}`}>
              {isFamilyPage ? <span className="persona-familyInfoIcon" aria-hidden>i</span> : null}
              {config.pricingFooterNotes.map((note) => (
                <p key={note} className="text-sm leading-relaxed text-navy-600 sm:text-base">
                  {note}
                </p>
              ))}
            </div>
          ) : null}
        </PersonaContainer>
      </section>

      {/* CTA banner */}
      <section className={`cc-schools-section cc-schools-section--compact scroll-mt-24 border-y border-navy-100/80 bg-navy-500 text-white ${isFamilyPage ? 'persona-familyFinalCta' : ''}`}>
        <PersonaContainer>
          <div className="cc-schools-final-cta-inner text-center">
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Ready to get started?</h2>
            <p className="mt-4 text-base text-white/85 sm:text-lg">
              {isFamilyPage
                ? 'Give your child the tools to build confidence, focus, and emotional strength—right at home.'
                : config.intro}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
              <Button
                variant="primary"
                size="lg"
                as={Link}
                to={config.primaryCta.href}
                leftIconSrc={null}
                className="w-full sm:w-auto"
                onClick={() => trackCtaClick(config.primaryCta.label, config.primaryCta.href)}
              >
                {config.primaryCta.label}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                as={Link}
                to={config.secondaryCta.href}
                className="cc-schools-final-portal-cta w-full border-white/40 text-white hover:bg-white/10 hover:text-white sm:w-auto"
                onClick={() => trackCtaClick(config.secondaryCta.label, config.secondaryCta.href)}
              >
                {config.secondaryCta.label}
              </Button>
            </div>
          </div>
        </PersonaContainer>
      </section>

      {/* How it works / FAQ */}
      {howItWorksItems.length > 0 ? (
        <section id="how-it-works" className="cc-schools-section scroll-mt-24 bg-white">
          <PersonaContainer>
            <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl lg:text-4xl">
              {config.howItWorksTitle ?? 'How it works'}
            </h2>
            <div className="mt-8 space-y-4">
              {howItWorksItems.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-2xl border border-navy-100 bg-cream px-6 py-5 open:bg-white open:shadow-sm"
                >
                  <summary className="cursor-pointer list-none font-display text-lg font-bold text-navy-500 marker:content-none sm:text-xl [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {item.question}
                      <span className="text-golden-600 transition-transform group-open:rotate-45" aria-hidden>
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-4 text-base leading-relaxed text-navy-600 sm:text-lg">{item.answer}</p>
                </details>
              ))}
            </div>
          </PersonaContainer>
        </section>
      ) : null}

      {children}

      <RelatedPathCards excludeSlug={config.slug} />
      <CourageFooter />
    </div>
  );
}
