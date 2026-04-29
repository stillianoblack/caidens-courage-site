import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';

type KidsArtworkCard = {
  id: string;
  imageSrc: string;
  caption: string;
  meta: string;
  polaroidBg: string;
  tapeBg: string;
  tapeRotate: string;
  rotate: string;
  icon: 'star' | 'heart' | 'sparkle' | 'bolt';
};

function TinyIcon({ kind }: { kind: KidsArtworkCard['icon'] }) {
  const base = 'inline-block align-middle';
  switch (kind) {
    case 'heart':
      return (
        <svg className={base} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 21s-7-4.6-9.5-9C.7 8.4 2.2 5.7 5 5.1c1.8-.4 3.6.3 4.7 1.7C10.8 5.4 12.6 4.7 14.4 5.1c2.8.6 4.3 3.3 2.5 6.9C19 16.4 12 21 12 21Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'sparkle':
      return (
        <svg className={base} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2l1.6 6.2L20 10l-6.4 1.8L12 18l-1.6-6.2L4 10l6.4-1.8L12 2Z" fill="currentColor" />
        </svg>
      );
    case 'bolt':
      return (
        <svg className={base} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M13 2L3 14h7l-1 8 12-14h-7l-1-6Z" fill="currentColor" />
        </svg>
      );
    case 'star':
    default:
      return (
        <svg className={base} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2l2.9 6.4L22 9.2l-5.2 4.6 1.5 7.1L12 17.7 5.7 21l1.6-7.1L2 9.2l7.1-.8L12 2Z"
            fill="currentColor"
          />
        </svg>
      );
  }
}

function PolaroidCard({ card }: { card: KidsArtworkCard }) {
  return (
    <div className="kids-polaroid-wrap relative flex-shrink-0" style={{ transform: card.rotate }}>
      {/* Tape (child of wrapper; needs overflow visible) */}
      <div
        className="kids-tape absolute left-1/2"
        style={{
          background: card.tapeBg,
          transform: `translateX(-50%) ${card.tapeRotate}`,
        }}
        aria-hidden="true"
      />

      {/* Polaroid (colored card body) */}
      <div
        className="kids-polaroid relative rounded-[14px]"
        style={{
          background: card.polaroidBg,
          border: '1px solid rgba(15, 23, 42, 0.10)',
        }}
      >
        {/* Image frame */}
        <div
          className="kids-polaroid-frame overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid rgba(15, 23, 42, 0.10)',
          }}
        >
          <img
            src={card.imageSrc}
            alt={`${card.caption} coloring page`}
            className="kids-polaroid-img"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Caption area (inside polaroid, like reference) */}
        <div className="kids-polaroid-caption">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="kids-polaroid-name">{card.caption}</div>
              <div className="kids-polaroid-meta">{card.meta}</div>
            </div>
            <div className="kids-polaroid-mark" aria-hidden="true">
              <TinyIcon kind={card.icon} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KidsGallerySection() {
  const cards = useMemo<KidsArtworkCard[]>(
    () => [
      {
        id: 'mariana-8',
        imageSrc: '/images/gallery/Mariana_Coloredpage.webp',
        caption: 'Mariana',
        meta: 'Age 8 • Colored Mariana',
        polaroidBg: '#F6E4C2',
        tapeBg: 'rgba(248, 232, 200, 0.95)',
        tapeRotate: 'rotate(-6deg)',
        rotate: 'rotate(-3deg)',
        icon: 'heart',
      },
      {
        id: 'ollie-7',
        imageSrc: '/images/gallery/Ollie_Coloredpage.webp',
        caption: 'Ollie Buck',
        meta: 'Age 7 • Colored Ollie Buck',
        polaroidBg: '#C9DDF3',
        tapeBg: 'rgba(201, 221, 243, 0.92)',
        tapeRotate: 'rotate(5deg)',
        rotate: 'rotate(2deg)',
        icon: 'star',
      },
      {
        id: 'b4-9',
        imageSrc: '/images/gallery/B-4_Coloredpage.webp',
        caption: 'B-4',
        meta: 'Age 9 • Colored B-4',
        polaroidBg: '#D8EFD2',
        tapeBg: 'rgba(216, 239, 210, 0.92)',
        tapeRotate: 'rotate(-4deg)',
        rotate: 'rotate(-1deg)',
        icon: 'bolt',
      },
      {
        id: 'mariana-6',
        imageSrc: '/images/gallery/Mariana_Coloredpage.webp',
        caption: 'Mariana',
        meta: 'Age 6 • Colored Mariana',
        polaroidBg: '#E8CBEA',
        tapeBg: 'rgba(232, 203, 234, 0.92)',
        tapeRotate: 'rotate(6deg)',
        rotate: 'rotate(3deg)',
        icon: 'sparkle',
      },
    ],
    []
  );

  const marqueeItems = useMemo(() => [...cards, ...cards], [cards]);

  return (
    <section
      className="kids-gallery-section relative bg-[#FAF9F7] overflow-hidden"
      style={{
        paddingTop: 'clamp(48px, 5vw, 72px)',
        paddingBottom: 'clamp(64px, 5vw, 72px)',
      }}
    >
      {/* Subtle decorations */}
      <div
        className="pointer-events-none absolute -top-6 right-10 hidden md:block"
        aria-hidden="true"
        style={{ color: 'rgba(229, 192, 106, 0.40)' }}
      >
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2l2.2 5.6L20 10l-5.8 1.8L12 18l-2.2-6.2L4 10l5.8-2.4L12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <div
        className="pointer-events-none absolute bottom-6 left-6 hidden lg:block"
        aria-hidden="true"
        style={{ color: 'rgba(36, 62, 112, 0.14)' }}
      >
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3l1.7 4.7L19 9.4l-4.6 2.1L12 16l-2.4-4.5L5 9.4l5.3-1.7L12 3Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div
        className="relative max-w-7xl mx-auto px-6 lg:px-8"
        style={{
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        <div className="kids-gallery-inner flex flex-col lg:grid lg:grid-cols-[320px_1fr] gap-8 lg:gap-14 items-center">
          {/* Left intro */}
          <div className="kids-gallery-intro text-center lg:text-left">
            <div className="inline-flex items-center justify-center gap-2 text-golden-500 mb-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2l1.6 6.2L20 10l-6.4 1.8L12 18l-1.6-6.2L4 10l6.4-1.8L12 2Z" fill="currentColor" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-navy-600/70">Created by</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-600 leading-[1.05]">
              Created by
              <br />
              Kids Like Yours
            </h2>

            <p className="mt-4 text-lg sm:text-xl text-navy-600/80 font-medium leading-relaxed">
              Real drawings from kids discovering their power.
            </p>

            <div className="mt-6 flex justify-center lg:justify-start">
              <Button variant="secondary" size="md" as={Link} to="/contact" className="!border-navy-500 !text-navy-600">
                <span className="inline-flex items-center gap-2">
                  Submit Your Artwork
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M13 5l7 7-7 7M4 12h15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Button>
            </div>
          </div>

          {/* Gallery */}
          <div className="kids-gallery-gallery relative w-full">
            {/* Marquee (desktop + mobile) */}
            <div className="kids-marquee kids-marquee--all">
              <div className="kids-marquee-track flex items-stretch gap-6 pr-8">
                {marqueeItems.map((c) => (
                  <PolaroidCard key={`${c.id}-marquee`} card={c} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

