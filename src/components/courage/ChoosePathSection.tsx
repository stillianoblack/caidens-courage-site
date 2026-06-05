import React from 'react';
import { Link } from 'react-router-dom';
import { VALE_CLASSIC_HOME_URL } from '../../config/valeLinks';

type PathCardConfig = {
  title: string;
  eyebrow: string;
  text: string;
  cta: string;
  to: string;
  imageSrc?: string;
  imageAlt?: string;
  imageObjectPosition?: string;
  imageVignette?: boolean;
  variant: 'photo' | 'brand';
};

const PATH_CARDS: PathCardConfig[] = [
  {
    title: 'Kids',
    eyebrow: 'Games • Comics • Activities',
    text: 'A playful space where kids practice focus, feelings, and brave choices.',
    cta: 'Explore Kids',
    to: '/kids',
    imageSrc: '/images/caidenscourage/Choose_your_path/kid_card.webp',
    imageAlt: 'Kid exploring Caiden’s Courage activities',
    variant: 'photo',
  },
  {
    title: "Caiden's Courage for Schools",
    eyebrow: 'Schools • Districts • Programs',
    text: 'Story-powered SEL tools for classrooms, camps, counselors, and youth programs.',
    cta: 'Explore for Schools',
    to: '/schools',
    imageSrc: '/images/caidenscourage/Choose_your_path/superintendent_card.webp',
    imageAlt: "Educator materials and worksheets for Caiden's Courage for Schools",
    variant: 'photo',
  },
  {
    title: 'Caiden Vale',
    eyebrow: 'GRAPHIC NOVEL • STORY WORLD • CHARACTERS',
    text: 'A graphic novel adventure about focus, courage, and finding your flame.',
    cta: 'Explore the Story',
    to: VALE_CLASSIC_HOME_URL,
    imageSrc: '/images/caidenscourage/Choose_your_path/caidenvale_card_1.webp',
    imageAlt: 'Caiden Vale story world',
    imageVignette: true,
    variant: 'photo',
  },
  {
    title: 'Built for brave minds.',
    eyebrow: 'FOCUS • FEELINGS • COURAGE',
    text: 'Different minds deserve stories, tools, and experiences built for them.',
    cta: 'Join the Courage Club',
    to: '/#join',
    variant: 'brand',
  },
];

const BRAVE_MINDS_CHARACTER = '/images/caidenscourage/Choose_your_path/Caiden_brand_wave.svg';

function isExternalPath(path: string): boolean {
  return path.startsWith('http://') || path.startsWith('https://');
}

function PathCardLink({
  to,
  className,
  children,
}: {
  to: string;
  className: string;
  children: React.ReactNode;
}) {
  if (isExternalPath(to)) {
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

function PathCardCta({ label, variant = 'light' }: { label: string; variant?: 'light' | 'onDark' }) {
  const tone =
    variant === 'onDark'
      ? 'text-golden-400 group-hover:text-golden-300'
      : 'text-golden-700 group-hover:text-golden-800';

  return (
    <span className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${tone}`}>
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

function BraveMindsBrandCard({ card }: { card: PathCardConfig }) {
  const className = [
    'group relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-[1.35rem] border border-navy-700/20 bg-[#243e70] text-left',
    'shadow-[0_10px_36px_-22px_rgba(7,20,38,0.45)]',
    'transition-[transform,box-shadow,border-color] duration-300 ease-out',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-golden-500/70',
    'motion-safe:md:hover:-translate-y-1 motion-safe:md:hover:border-navy-600/30',
    'motion-safe:md:hover:shadow-[0_22px_48px_-24px_rgba(7,20,38,0.5)]',
    'sm:min-h-[20rem] lg:min-h-[18.5rem]',
  ].join(' ');

  return (
    <PathCardLink to={card.to} className={className}>
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#2a4a7f] via-[#243e70] to-[#1a2f52]"
          aria-hidden
        />

        <div className="relative flex min-h-0 flex-1 flex-col p-[30px]">
          <div
            className="pointer-events-none absolute bottom-0 right-0 h-[min(72%,14rem)] w-[min(64%,13rem)] opacity-[0.5] sm:h-[68%] sm:w-[58%]"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(160, 192, 230, 0.82) 1.5px, transparent 1.5px)',
              backgroundSize: '11px 11px',
              WebkitMaskImage:
                'linear-gradient(145deg, transparent 0%, rgba(0,0,0,0.12) 32%, rgba(0,0,0,0.88) 70%, black 100%)',
              maskImage:
                'linear-gradient(145deg, transparent 0%, rgba(0,0,0,0.12) 32%, rgba(0,0,0,0.88) 70%, black 100%)',
            }}
            aria-hidden
          />

          <img
            src={BRAVE_MINDS_CHARACTER}
            alt=""
            className="absolute bottom-0 left-[30px] z-[1] h-[65%] max-h-[12rem] w-auto max-w-[min(65%,14rem)] origin-bottom-left object-contain object-bottom drop-shadow-[0_10px_24px_rgba(0,0,0,0.28)] sm:max-h-none sm:h-[83%] sm:max-w-[63%] lg:h-[88%] lg:max-w-[60%]"
            loading="lazy"
            decoding="async"
            aria-hidden
          />

          <div className="relative z-[2] flex flex-col pt-4 sm:ml-[40%] sm:pt-6 lg:ml-[38%]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-golden-500 sm:text-[0.8125rem]">
              {card.eyebrow}
            </p>
            <h3 className="mt-2 font-display text-[1.75rem] font-extrabold leading-[1.02] text-white sm:mt-2.5 sm:text-[2.05rem] lg:text-[2.25rem]">
              Built for
              <br />
              brave minds.
            </h3>
            <p className="mt-2.5 max-w-[18rem] text-[0.9375rem] leading-snug text-white sm:mt-3 sm:max-w-none sm:text-base sm:leading-snug">
              {card.text}
            </p>
            <PathCardCta label={card.cta} variant="onDark" />
          </div>
        </div>
      </div>
    </PathCardLink>
  );
}

function PathCard({ card }: { card: PathCardConfig }) {
  if (card.variant === 'brand') {
    return <BraveMindsBrandCard card={card} />;
  }

  const body = (
    <>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-navy-100">
          <img
            src={card.imageSrc}
            alt={card.imageAlt ?? ''}
            className="h-full w-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
            style={card.imageObjectPosition ? { objectPosition: card.imageObjectPosition } : undefined}
            loading="lazy"
            decoding="async"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-80"
            aria-hidden
          />
          {card.imageVignette ? (
            <>
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_50%_42%,transparent_0%,transparent_48%,rgba(15,28,52,0.22)_72%,rgba(7,14,28,0.62)_100%)]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_50%_50%,transparent_55%,rgba(0,0,0,0.35)_100%)] mix-blend-multiply"
                aria-hidden
              />
            </>
          ) : null}
        </div>

      <div className="flex flex-1 flex-col px-6 py-6 sm:px-7 sm:py-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500/80 sm:text-xs">{card.eyebrow}</p>
        <h3 className="mt-2 font-display text-xl font-extrabold leading-tight text-navy-700 sm:text-2xl">{card.title}</h3>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-navy-600 sm:text-[0.9375rem]">{card.text}</p>
        <PathCardCta label={card.cta} />
      </div>
    </>
  );

  const className = [
    'group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-navy-100/90 bg-white text-left',
    'shadow-[0_10px_36px_-22px_rgba(36,62,112,0.22)]',
    'transition-[transform,box-shadow,border-color] duration-300 ease-out',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-golden-500/70',
    'motion-safe:md:hover:-translate-y-1 motion-safe:md:hover:border-navy-200/90',
    'motion-safe:md:hover:shadow-[0_22px_48px_-24px_rgba(36,62,112,0.28)]',
  ].join(' ');

  return (
    <PathCardLink to={card.to} className={className}>
      {body}
    </PathCardLink>
  );
}

export default function ChoosePathSection() {
  return (
    <section
      className="relative z-0 px-4 pt-20 pb-32 sm:px-6 sm:pt-28 sm:pb-36 lg:px-8 lg:pt-32 lg:pb-52 xl:pb-56"
      aria-labelledby="choose-your-path-heading"
    >
      <div className="cc-site-container mx-auto">
        <h2 id="choose-your-path-heading" className="font-display text-2xl font-extrabold text-navy-700 sm:text-3xl">
          Choose Your Path
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-navy-600 sm:text-lg">
          Start with the story, jump into kid-friendly activities, or bring Focus Flame tools into your classroom or
          program.
        </p>

        <div className="mt-8 grid grid-cols-1 items-stretch gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:mb-16 lg:gap-7 xl:mb-20">
          {PATH_CARDS.map((card) => (
            <PathCard key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
