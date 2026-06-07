import React from 'react';
import { Link } from 'react-router-dom';
import { getRelatedPathCards, type RelatedPathCard } from '../../config/personaPages';
import { HOMEPAGE_PATH_CARDS } from '../../config/homePathCards';

function isExternalPath(path: string): boolean {
  return path.startsWith('http://') || path.startsWith('https://');
}

function PathCardLink({
  to,
  className,
  children,
  external,
}: {
  to: string;
  className: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  if (external || isExternalPath(to)) {
    return (
      <a href={to} className={className} rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

function PathCardCta({ label }: { label: string }) {
  return (
    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-golden-700 transition-colors group-hover:text-golden-800">
      {label}
      <svg
        className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </span>
  );
}

function PathCard({ card, horizontalFeatured = false }: { card: RelatedPathCard; horizontalFeatured?: boolean }) {
  const className = [
    'group flex h-full overflow-hidden rounded-[1.35rem] border bg-white text-left',
    horizontalFeatured ? 'flex-col md:flex-row md:items-stretch' : 'flex-col',
    'shadow-[0_10px_36px_-22px_rgba(36,62,112,0.22)]',
    'transition-[transform,box-shadow,border-color] duration-300 ease-out',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-golden-500/70',
    'motion-safe:md:hover:-translate-y-1 motion-safe:md:hover:shadow-[0_22px_48px_-24px_rgba(36,62,112,0.28)]',
    card.featured
      ? 'border-golden-400/80 ring-2 ring-golden-400/25 motion-safe:md:hover:border-golden-500/80'
      : 'border-navy-100/90 motion-safe:md:hover:border-navy-200/90',
  ].join(' ');

  return (
    <PathCardLink to={card.to} className={className} external={card.external}>
      {card.imageSrc ? (
        <div
          className={[
            'relative w-full overflow-hidden bg-navy-100',
            horizontalFeatured ? 'aspect-[16/10] md:aspect-auto md:min-h-[16rem] md:w-[42%] md:max-w-md md:shrink-0' : 'aspect-[16/10]',
          ].join(' ')}
        >
          <img
            src={card.imageSrc}
            alt={card.imageAlt ?? ''}
            className={[
              'h-full w-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]',
              horizontalFeatured ? 'md:absolute md:inset-0' : '',
            ].join(' ')}
            loading="lazy"
            decoding="async"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-80 md:bg-gradient-to-r"
            aria-hidden
          />
          {card.featured ? (
            <span className="absolute left-4 top-4 rounded-full bg-golden-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-navy-700">
              {card.title === 'Focus Flame Academy' ? 'Academy' : 'Pilot offer'}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col px-6 py-6 sm:px-7 sm:py-7 md:justify-center">
        {card.eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500/80 sm:text-xs">{card.eyebrow}</p>
        ) : null}
        <h3 className={`font-display text-xl font-extrabold leading-tight text-navy-700 sm:text-2xl ${card.eyebrow ? 'mt-2' : ''}`}>
          {card.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-navy-600 sm:text-[0.9375rem]">{card.description}</p>
        <ul className="mt-4 space-y-2">
          {card.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2 text-sm text-navy-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-golden-500" aria-hidden />
              {bullet}
            </li>
          ))}
        </ul>
        <PathCardCta label={card.cta} />
      </div>
    </PathCardLink>
  );
}

type RelatedPathCardsProps = {
  excludeSlug?: 'parents' | 'teachers' | 'camps' | 'schools';
  heading?: string;
  description?: string;
  /** When true, renders the full homepage Choose Your Path section wrapper. */
  variant?: 'related' | 'homepage';
};

export default function RelatedPathCards({
  excludeSlug,
  heading = 'Explore other paths',
  description = 'Find the Focus Flame Academy experience built for your role.',
  variant = 'related',
}: RelatedPathCardsProps) {
  const isHomepage = variant === 'homepage';
  const cards = isHomepage ? HOMEPAGE_PATH_CARDS : getRelatedPathCards(excludeSlug);
  const featuredCard = isHomepage ? undefined : cards.find((c) => c.to === '/camps');
  const gridCards = isHomepage ? cards : featuredCard ? cards.filter((c) => c.to !== '/camps') : cards;

  const sectionHeading = isHomepage ? 'Choose Your Path' : heading;
  const sectionDescription = isHomepage
    ? 'Explore the Caiden\'s Courage story world, free Brave Mind Club resources, Focus Flame Academy programs, and interactive adventures.'
    : description;

  return (
    <section
      className={
        isHomepage
          ? 'relative z-0 px-4 pt-20 pb-32 sm:px-6 sm:pt-28 sm:pb-36 lg:px-8 lg:pt-32 lg:pb-52 xl:pb-56'
          : 'cc-schools-section cc-schools-section--large scroll-mt-24 border-t border-navy-100/80'
      }
      aria-labelledby="choose-your-path-heading"
    >
      <div className="cc-site-container mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          id="choose-your-path-heading"
          className="font-display text-2xl font-extrabold text-navy-700 sm:text-3xl"
        >
          {sectionHeading}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-navy-600 sm:text-lg">{sectionDescription}</p>

        <div
          className={[
            'mt-8 grid grid-cols-1 items-stretch gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:mb-16 lg:gap-7 xl:mb-20',
            !isHomepage ? 'lg:grid-cols-3' : '',
          ].join(' ')}
        >
          {!isHomepage && featuredCard ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <PathCard card={featuredCard} horizontalFeatured />
            </div>
          ) : null}
          {gridCards.map((card) => (
            <PathCard key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
