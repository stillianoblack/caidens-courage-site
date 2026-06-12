import React from 'react';
import { Link } from 'react-router-dom';
import { CAMPS_PATH } from '../../config/courageNav';
import { VALE_CLASSIC_HOME_URL } from '../../config/valeLinks';
import { B4_PILOT_MODAL_DESCRIPTION } from '../../config/pilotAccess';
import type { PilotInterestType } from '../../types/pilotWaitlist';
import { usePilotAccess } from './PilotAccessProvider';
import PilotAccessBadge from './PilotAccessBadge';

type Accent = 'gold' | 'blue' | 'teal';

type WayCard = {
  title: string;
  label: string;
  description: string;
  cta: string;
  href: string;
  external?: boolean;
  accent: Accent;
  bullets?: readonly string[];
  pilotInterest?: PilotInterestType;
  pilotBadge?: boolean;
};

const WAYS: WayCard[] = [
  {
    title: 'Read the Story',
    label: 'Caiden Vale',
    description: "Follow Caiden's adventure through the Focus Flame journey.",
    cta: 'Explore Caiden Vale',
    href: VALE_CLASSIC_HOME_URL,
    external: true,
    accent: 'gold',
  },
  {
    title: 'Play the Games',
    label: 'Focus Flame Adventures',
    description: 'Interactive SEL adventures that help kids practice focus and courage.',
    cta: 'Join the Pilot',
    href: '/focus-flame-lab',
    accent: 'blue',
    pilotInterest: 'focus_flame_lab',
    pilotBadge: true,
  },
  {
    title: 'Bring Focus Flame Academy to Your Program',
    label: 'Focus Flame Academy',
    description:
      'Story-powered SEL experiences for families, classrooms, camps, after-school programs, and school communities.',
    cta: 'Explore Focus Flame Academy',
    href: CAMPS_PATH,
    accent: 'teal',
    bullets: ['SEL Modules', 'Facilitator Guides', 'Camp & School Pilots'],
  },
];

const accentStyles: Record<Accent, { card: string; label: string; title: string; cta: string }> = {
  gold: {
    card: [
      'border-2 border-golden-400/60 bg-gradient-to-br from-golden-100 via-golden-50 to-[#fffbf0]',
      'shadow-[0_12px_36px_-18px_rgba(229,192,106,0.38)]',
      'hover:border-golden-500 hover:shadow-[0_18px_44px_-16px_rgba(229,192,106,0.45)]',
    ].join(' '),
    label: 'text-golden-800',
    title: 'text-navy-800',
    cta: 'text-golden-900 group-hover:text-golden-950',
  },
  blue: {
    card: [
      'border-2 border-navy-300/70 bg-gradient-to-br from-[#dce8fc] via-[#eef4ff] to-white',
      'shadow-[0_12px_36px_-18px_rgba(36,62,112,0.22)]',
      'hover:border-navy-400 hover:shadow-[0_18px_44px_-16px_rgba(36,62,112,0.28)]',
    ].join(' '),
    label: 'text-navy-600',
    title: 'text-navy-800',
    cta: 'text-navy-700 group-hover:text-navy-900',
  },
  teal: {
    card: [
      'border-2 border-teal-400/65 bg-gradient-to-br from-teal-100 via-teal-50 to-[#f0fdfa]',
      'shadow-[0_12px_36px_-18px_rgba(20,184,166,0.28)]',
      'hover:border-teal-500 hover:shadow-[0_18px_44px_-16px_rgba(20,184,166,0.34)]',
    ].join(' '),
    label: 'text-teal-800',
    title: 'text-teal-950',
    cta: 'text-teal-900 group-hover:text-teal-950',
  },
};

function WayCardLink({
  card,
  className,
  children,
}: {
  card: WayCard;
  className: string;
  children: React.ReactNode;
}) {
  if (card.external) {
    return (
      <a href={card.href} className={className} rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link to={card.href} className={className}>
      {children}
    </Link>
  );
}

function ExperienceCard({ card }: { card: WayCard }) {
  const { openPilotAccessModal } = usePilotAccess();
  const styles = accentStyles[card.accent];
  const className = [
    'group flex h-full flex-col rounded-[1.35rem] border p-6 text-left shadow-[0_10px_36px_-22px_rgba(36,62,112,0.18)]',
    'transition-[transform,box-shadow,border-color] duration-300 ease-out',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-golden-500/70',
    'motion-safe:md:hover:-translate-y-1',
    styles.card,
  ].join(' ');

  const content = (
    <>
      {card.pilotBadge ? <PilotAccessBadge className="mb-3" /> : null}
      <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs ${styles.label}`}>{card.label}</p>
      <h3 className={`mt-2 font-display text-xl font-extrabold leading-tight sm:text-2xl ${styles.title}`}>
        {card.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-600 sm:text-[0.9375rem]">{card.description}</p>
      {card.bullets?.length ? (
        <ul className="mt-4 space-y-2">
          {card.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2 text-sm text-navy-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden />
              {bullet}
            </li>
          ))}
        </ul>
      ) : null}
      <span className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${styles.cta}`}>
        {card.cta}
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
    </>
  );

  if (card.pilotInterest) {
    return (
      <button
        type="button"
        className={className}
        onClick={() =>
          openPilotAccessModal({
            interestType: card.pilotInterest,
            description:
              card.pilotInterest === 'b4_tools' ? B4_PILOT_MODAL_DESCRIPTION : undefined,
            clickSource: 'three_ways_section',
          })
        }
      >
        {content}
      </button>
    );
  }

  return (
    <WayCardLink card={card} className={className}>
      {content}
    </WayCardLink>
  );
}

export default function ThreeWaysSection() {
  return (
    <section
      className="px-4 pb-12 pt-5 sm:px-6 sm:pb-14 sm:pt-6 lg:px-8 lg:pb-16 lg:pt-8"
      aria-labelledby="three-ways-heading"
    >
      <div className="cc-site-container mx-auto">
        <h2 id="three-ways-heading" className="font-display text-2xl font-extrabold text-navy-700 sm:text-3xl">
          Three Ways to Experience Courage
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-navy-600 sm:text-lg">
          Start with the story, explore the activities, or bring the experience to your community.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
          {WAYS.map((card) => (
            <ExperienceCard key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
