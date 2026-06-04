import React from 'react';

type KidsHubCardProps = {
  id?: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  comingSoon?: boolean;
  featured?: boolean;
  /** cover (default) or contain — use contain to show full artwork scaled down */
  imageFit?: 'cover' | 'contain';
  /** CSS object-position, e.g. "50% 30%" */
  imagePosition?: string;
  cta?: React.ReactNode;
  /** Optional note below CTA (e.g. Ask B-4 floating chat hint) */
  footerNote?: React.ReactNode;
};

export default function KidsHubCard({
  id,
  title,
  description,
  imageSrc,
  imageAlt,
  comingSoon = false,
  featured = false,
  imageFit = 'cover',
  imagePosition = 'center',
  cta,
  footerNote,
}: KidsHubCardProps) {
  return (
    <article
      id={id}
      className={[
        'cc-kids-hub-card scroll-mt-24 overflow-hidden rounded-2xl border bg-white shadow-[0_6px_24px_-14px_rgba(36,62,112,0.12)]',
        featured
          ? 'border-golden-500/30 shadow-[0_8px_28px_-14px_rgba(244,212,119,0.28)]'
          : 'border-navy-100/90',
      ].join(' ')}
    >
      <div className="flex flex-col gap-5 p-5 sm:gap-6 sm:p-6 md:flex-row md:items-center md:gap-8 lg:p-7">
        <div className="cc-kids-hub-card-thumb relative flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-navy-100/80 bg-[#FAF9F7] shadow-sm md:w-[min(100%,20rem)] lg:w-[min(100%,22.5rem)]">
          <img
            src={imageSrc}
            alt={imageAlt}
            className={[
              'h-full w-full',
              imageFit === 'contain' ? 'object-contain p-3 sm:p-4' : 'object-cover',
            ].join(' ')}
            style={{ objectPosition: imagePosition }}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="cc-kids-hub-card-body flex min-w-0 flex-1 flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <h2 className="font-display text-xl font-extrabold text-navy-500 sm:text-2xl lg:text-[1.65rem]">
              {title}
            </h2>
            {comingSoon ? (
              <span className="rounded-full bg-golden-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-golden-800 sm:text-xs">
                Coming Soon
              </span>
            ) : null}
          </div>

          <p className="mt-2.5 text-sm leading-relaxed text-navy-600 sm:mt-3 sm:text-base lg:text-lg">
            {description}
          </p>

          {cta ? <div className="mt-5 sm:mt-6">{cta}</div> : null}
          {footerNote ? <div className="mt-4">{footerNote}</div> : null}
        </div>
      </div>
    </article>
  );
}
