import React from 'react';
import { Link } from 'react-router-dom';

export type HubCardIcon = 'kids' | 'parents' | 'teachers';

type HubCardProps = {
  title: string;
  description: string;
  to?: string;
  comingSoon?: boolean;
  accent?: 'cream' | 'kids' | 'navy' | 'blue' | 'yellow' | 'orange';
  eyebrow?: string;
  icon?: HubCardIcon;
};

const accentStyles = {
  cream:
    'border border-navy-100/90 bg-white shadow-[0_6px_24px_-14px_rgba(36,62,112,0.16)] md:hover:-translate-y-1 md:hover:border-navy-200/90 md:hover:shadow-[0_14px_36px_-16px_rgba(36,62,112,0.2)]',
  kids:
    'border border-golden-500/25 bg-white shadow-[0_6px_24px_-14px_rgba(244,212,119,0.22)] md:hover:-translate-y-1 md:hover:border-golden-500/45 md:hover:shadow-[0_14px_36px_-14px_rgba(244,212,119,0.3)]',
  navy:
    'border border-navy-100/90 bg-[#FAF9F7] shadow-[0_6px_24px_-14px_rgba(36,62,112,0.14)] md:hover:-translate-y-1 md:hover:border-golden-500/35',
  blue:
    'border border-navy-400/50 bg-navy-500 shadow-[0_8px_28px_-14px_rgba(36,62,112,0.38)] md:hover:-translate-y-1 md:hover:border-navy-300/60 md:hover:bg-navy-600 md:hover:shadow-[0_16px_40px_-14px_rgba(36,62,112,0.44)]',
  yellow:
    'border border-golden-600/50 bg-golden-400 shadow-[0_8px_28px_-14px_rgba(229,192,106,0.35)] md:hover:-translate-y-1 md:hover:border-golden-700/55 md:hover:bg-golden-500 md:hover:shadow-[0_16px_40px_-14px_rgba(229,192,106,0.4)]',
  orange:
    'border border-orange-600/50 bg-orange-500 shadow-[0_8px_28px_-14px_rgba(249,115,22,0.35)] md:hover:-translate-y-1 md:hover:border-orange-400/55 md:hover:bg-orange-600 md:hover:shadow-[0_16px_40px_-14px_rgba(249,115,22,0.4)]',
};

const accentText = {
  cream: {
    eyebrow: 'text-navy-500/70',
    title: 'text-navy-700',
    body: 'text-navy-600/90',
    cta: 'text-golden-700',
    icon: 'text-navy-400/70',
  },
  kids: {
    eyebrow: 'text-navy-500/70',
    title: 'text-navy-700',
    body: 'text-navy-600/90',
    cta: 'text-golden-700',
    icon: 'text-navy-400/70',
  },
  navy: {
    eyebrow: 'text-navy-500/70',
    title: 'text-navy-700',
    body: 'text-navy-600/90',
    cta: 'text-golden-700',
    icon: 'text-navy-400/70',
  },
  blue: {
    eyebrow: 'text-white/75',
    title: 'text-white',
    body: 'text-white/92',
    cta: 'text-golden-300',
    icon: 'text-white/55',
  },
  yellow: {
    eyebrow: 'text-navy-800/65',
    title: 'text-navy-800',
    body: 'text-navy-700/90',
    cta: 'text-navy-800',
    icon: 'text-navy-700/45',
  },
  orange: {
    eyebrow: 'text-white/80',
    title: 'text-white',
    body: 'text-white/92',
    cta: 'text-golden-200',
    icon: 'text-white/55',
  },
};

function HubCardIconGraphic({ icon, className }: { icon: HubCardIcon; className: string }) {
  const strokeProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (icon === 'kids') {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden>
        <path
          {...strokeProps}
          d="M12 2.75c1 3.4 4.25 5.75 4.25 9.5a4.25 4.25 0 01-8.5 0c0-3.75 3.25-6.1 4.25-9.5z"
        />
      </svg>
    );
  }

  if (icon === 'parents') {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden>
        <path
          {...strokeProps}
          d="M12 20.5s-6.5-4.2-6.5-9.2a4.2 4.2 0 018.4 0c0 2.6-1.7 4.4-3.4 5.6"
        />
        <path {...strokeProps} d="M5.5 11.3 3 13.8l2 1.5M18.5 11.3 21 13.8l-2 1.5" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path {...strokeProps} d="M6 5.5h12v13H6z" />
      <path {...strokeProps} d="M9 5.5V4.2a1.2 1.2 0 011.2-1.2h3.6A1.2 1.2 0 0115 4.2v1.3" />
      <path {...strokeProps} d="M8.5 10h7M8.5 13h5.5" />
    </svg>
  );
}

export default function HubCard({
  title,
  description,
  to,
  comingSoon = false,
  accent = 'cream',
  eyebrow,
  icon,
}: HubCardProps) {
  const text = accentText[accent];

  const inner = (
    <div className="flex h-full min-h-[11.5rem] flex-col sm:min-h-[12rem]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <p className={`text-[10px] font-semibold uppercase tracking-[0.22em] sm:text-[11px] ${text.eyebrow}`}>
              {eyebrow}
            </p>
          ) : null}
          <h3
            className={`font-display text-[1.5rem] font-black leading-[1.12] sm:text-[1.65rem] ${eyebrow ? 'mt-3' : ''} ${text.title}`}
          >
            {title}
          </h3>
        </div>
        {icon ? (
          <HubCardIconGraphic icon={icon} className={`mt-0.5 h-7 w-7 shrink-0 sm:h-8 sm:w-8 ${text.icon}`} />
        ) : null}
      </div>

      <p className={`mt-4 flex-1 text-[0.8125rem] leading-relaxed sm:text-sm sm:leading-relaxed ${text.body}`}>
        {description}
      </p>

      {comingSoon ? (
        <span className="mt-5 inline-block w-fit rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-inherit">
          Coming Soon
        </span>
      ) : (
        <span
          className={`mt-5 inline-flex min-h-[2.75rem] w-fit items-center text-sm font-semibold ${text.cta}`}
        >
          Explore
          <svg className="ml-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </div>
  );

  const className = [
    'block rounded-3xl p-6 transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out sm:p-7',
    accentStyles[accent],
    comingSoon ? 'opacity-90' : 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-golden-500/70',
  ].join(' ');

  if (comingSoon || !to) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <Link to={to} className={className}>
      {inner}
    </Link>
  );
}
