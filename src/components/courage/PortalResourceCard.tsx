import React from 'react';
import { Link } from 'react-router-dom';
import type { PortalResourceItem } from '../../config/portalAccess';

type PortalResourceCardProps = PortalResourceItem;

export default function PortalResourceCard({ title, description, href, comingSoon = false }: PortalResourceCardProps) {
  const cardClass =
    'cc-portal-resource-card group flex h-full min-h-[9.5rem] flex-col rounded-2xl border border-navy-100/90 bg-white p-5 shadow-[0_6px_24px_-14px_rgba(36,62,112,0.16)] transition-all duration-200 sm:min-h-[10rem] sm:p-6';

  const content = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-display text-lg font-extrabold leading-snug text-navy-600 sm:text-xl">{title}</h3>
        {comingSoon ? (
          <span className="shrink-0 rounded-full bg-golden-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-golden-800 sm:text-xs">
            Coming Soon
          </span>
        ) : null}
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600/90 sm:text-base">{description}</p>
      {!comingSoon && href ? (
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-golden-700 transition-colors group-hover:text-golden-600">
          Open resource
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      ) : null}
    </>
  );

  if (comingSoon || !href) {
    return (
      <div className={`${cardClass} opacity-90`} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link to={href} className={`${cardClass} md:hover:-translate-y-0.5 md:hover:border-golden-500/35 md:hover:shadow-[0_14px_36px_-16px_rgba(36,62,112,0.2)]`}>
      {content}
    </Link>
  );
}
