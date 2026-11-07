import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { HOLIDAY_PATH } from '../../config/courageRoutes';
import { VALE_COMICBOOK_URL } from '../../config/valeLinks';

const AUTOPLAY_MS = 7000;
const SLIDE_MS = 650;
const STORY_SLIDE_INDEX = 2;

type HeroSlide = {
  id: 'holiday' | 'academy' | 'story';
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  primary: { label: string; href?: string; to?: string };
  secondary: { label: string; href?: string; to?: string };
  background?: string;
  image?: { src: string; alt: string };
};

const SLIDES: HeroSlide[] = [
  {
    id: 'holiday',
    label: 'Season of Courage',
    eyebrow: 'Season of Courage',
    title: 'Give the Gift of Courage This Holiday Season',
    body: 'Big imagination. Brave hearts. A little holiday magic.\n\nGive the kids in your life more than a gift. Give them a world to explore.',
    primary: { label: 'Explore the Season of Courage', to: HOLIDAY_PATH },
    secondary: { label: 'Order the Book', href: VALE_COMICBOOK_URL },
    background: '/images/backgrounds/holiday_carousel_slide_1.webp',
    image: {
      src: '/images/backgrounds/holidayseason_text.webp',
      alt: 'The Season of Courage',
    },
  },
  {
    id: 'academy',
    label: 'Focus Flame Academy',
    eyebrow: 'Focus Flame Academy',
    title: 'Story, play, and practice in one place.',
    body: 'B-4 and Focus Flame Academy give kids games, activities, and guided practice. Academy access is not turned on from this page.',
    primary: { label: 'Explore Kids Activities', to: '/kids' },
    secondary: { label: 'Play B-4 Focus Flight', to: '/games' },
    background: '/images/B-4FlightGame/background/GameplayBackgrounds.webp',
    image: {
      src: '/images/backgrounds/Device-mocks.webp',
      alt: 'Focus Flame Academy on a desktop monitor, phone, and laptop',
    },
  },
  {
    id: 'story',
    label: 'Story-powered SEL',
    eyebrow: 'STORY-POWERED SEL',
    title: 'The story where focus becomes a superpower.',
    body: 'An unforgettable graphic novel adventure helping kids discover focus, confidence, courage, and the hidden power already inside them.',
    primary: { label: 'Order the Book', href: VALE_COMICBOOK_URL },
    secondary: { label: 'Explore Kids Activities', to: '/kids' },
    background: '/images/backgrounds/backgroundFocusFlame.webp',
    image: {
      src: '/images/backgrounds/caidenvale_book_hero.webp',
      alt: 'Caiden Vale and the Focus Flame hardcover graphic novel',
    },
  },
];

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function SlideAction({
  action,
  variant,
}: {
  action: HeroSlide['primary'];
  variant: 'primary' | 'secondary';
}) {
  const className = variant === 'secondary' ? 'cc-hero-cta cc-hero-secondary-cta' : 'cc-hero-cta';
  if (action.href) {
    return (
      <Button variant={variant} size="lg" as="a" href={action.href} className={className}>
        {action.label}
      </Button>
    );
  }
  return (
    <Button variant={variant} size="lg" as={Link} to={action.to} className={className}>
      {action.label}
    </Button>
  );
}

function slideShift(slideIndex: number, active: number, from: number | null, direction: 1 | -1): -1 | 0 | 1 {
  if (from == null) {
    if (slideIndex === active) return 0;
    if (slideIndex === (active + 1) % SLIDES.length) return 1;
    return -1;
  }
  if (slideIndex === active) return 0;
  if (slideIndex === from) return direction === 1 ? -1 : 1;
  return direction === 1 ? 1 : -1;
}

function HeroSlidePanel({
  slide,
  slideIndex,
  active,
  shift,
  instant,
}: {
  slide: HeroSlide;
  slideIndex: number;
  active: boolean;
  shift: -1 | 0 | 1;
  instant: boolean;
}) {
  return (
    <div
      className={`cc-hero-layout cc-hero-slide${instant ? ' is-instant' : ''}`}
      style={{ ['--slide-offset' as string]: String(shift) }}
      role="group"
      aria-roledescription="slide"
      aria-label={`${slideIndex + 1} of ${SLIDES.length}: ${slide.label}`}
      aria-hidden={active ? undefined : true}
      {...(active ? {} : { inert: '' })}
    >
      <div className="cc-hero-main">
        <div className="cc-hero-copy">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-golden-600 sm:text-[11px]">
            {slide.eyebrow}
          </p>
          <h1 className="cc-hero-title mt-2.5 font-display font-extrabold leading-[1.08] text-navy-500 sm:mt-4 sm:text-5xl lg:text-6xl">
            {slide.title}
          </h1>
          {slide.body.split('\n\n').map((paragraph) => (
            <p key={paragraph} className="cc-hero-subtitle mt-2.5 text-[0.9375rem] leading-snug text-[#B0E0E6] sm:mt-4 sm:max-w-none sm:text-lg sm:leading-relaxed lg:text-xl">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="cc-hero-ctas">
          <SlideAction action={slide.primary} variant="primary" />
          <SlideAction action={slide.secondary} variant="secondary" />
        </div>
      </div>
      {slide.image ? (
        <div className="cc-hero-brand-visual cc-story-book-visual">
          <img
            src={slide.image.src}
            alt={slide.image.alt}
            className={
              slide.id === 'academy'
                ? 'cc-story-book-hero cc-hero-device-visual'
                : slide.id === 'holiday'
                  ? 'cc-story-book-hero cc-hero-holiday-lockup'
                  : 'cc-story-book-hero'
            }
            decoding="async"
          />
        </div>
      ) : null}
    </div>
  );
}

export default function CourageHeroCarousel() {
  const regionRef = useRef<HTMLElement>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const [index, setIndex] = useState(() => (prefersReducedMotion() ? STORY_SLIDE_INDEX : 0));
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [motion, setMotion] = useState<{ from: number | null; direction: 1 | -1 }>({ from: null, direction: 1 });
  const indexRef = useRef(index);
  const autoplayPaused = reducedMotion || manuallyPaused || hoverPaused || focusPaused;

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      const reduced = media.matches;
      setReducedMotion(reduced);
      if (reduced) setIndex(STORY_SLIDE_INDEX);
    };
    apply();
    media.addEventListener?.('change', apply);
    return () => media.removeEventListener?.('change', apply);
  }, []);

  const showSlide = useCallback((nextRaw: number) => {
    const current = indexRef.current;
    const next = (nextRaw + SLIDES.length) % SLIDES.length;
    if (next === current) return;
    const direction: 1 | -1 = next === (current + 1) % SLIDES.length ? 1 : -1;
    indexRef.current = next;
    setMotion({ from: current, direction });
    setIndex(next);
  }, []);

  useEffect(() => {
    if (autoplayPaused) return undefined;
    const timer = window.setInterval(() => {
      showSlide(indexRef.current + 1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [autoplayPaused, showSlide]);

  useEffect(() => {
    if (motion.from == null) return undefined;
    const timeout = window.setTimeout(() => {
      setMotion((current) => ({ ...current, from: null }));
    }, reducedMotion ? 0 : SLIDE_MS);
    return () => window.clearTimeout(timeout);
  }, [motion.from, index, reducedMotion]);

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('a, button')) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dy) > Math.abs(dx) || Math.abs(dx) < 40) return;
    showSlide(index + (dx < 0 ? 1 : -1));
  };

  return (
    <section className="bg-cream px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5 lg:px-8 lg:pb-8">
      <div className="cc-site-container mx-auto">
        <section
          ref={regionRef}
          className="cc-hero-mask cc-hero-mask--brand cc-hero-mask--story relative overflow-hidden rounded-[1.35rem] sm:rounded-[1.75rem] lg:rounded-[2rem]"
          aria-roledescription="carousel"
          aria-label="Featured Caiden's Courage stories"
          onMouseEnter={() => setHoverPaused(true)}
          onMouseLeave={() => setHoverPaused(false)}
          onFocusCapture={() => setFocusPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusPaused(false);
          }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            pointerStart.current = null;
          }}
          style={{ touchAction: 'pan-y' }}
        >
          {SLIDES.map((item, slideIndex) => {
            const shift = slideShift(slideIndex, index, motion.from, motion.direction);
            const instant = motion.from != null && slideIndex !== index && slideIndex !== motion.from;
            return item.background ? (
              <div
                key={`${item.id}-background`}
                className={`cc-hero-slide-bg cc-hero-slide-bg--${item.id}${slideIndex === index ? ' is-active' : ''}${instant ? ' is-instant' : ''}`}
                style={{
                  backgroundImage: `url("${item.background}")`,
                  ['--slide-offset' as string]: String(shift),
                }}
                aria-hidden="true"
              />
            ) : null;
          })}
          <div className="cc-hero-content relative z-10">
            <div className="cc-hero-slide-stack">
              {SLIDES.map((item, slideIndex) => (
                <HeroSlidePanel
                  key={item.id}
                  slide={item}
                  slideIndex={slideIndex}
                  active={slideIndex === index}
                  shift={slideShift(slideIndex, index, motion.from, motion.direction)}
                  instant={motion.from != null && slideIndex !== index && slideIndex !== motion.from}
                />
              ))}
            </div>
            <div className="cc-hero-controls">
              <button type="button" className="cc-hero-control" onClick={() => showSlide(index - 1)}>
                <span className="sr-only">Previous slide</span>
                <span aria-hidden>‹</span>
              </button>
              <button
                type="button"
                className="cc-hero-control cc-hero-control--label"
                aria-pressed={manuallyPaused || reducedMotion}
                onClick={() => setManuallyPaused((paused) => !paused)}
              >
                {manuallyPaused || reducedMotion ? 'Play' : 'Pause'}
              </button>
              <button type="button" className="cc-hero-control" onClick={() => showSlide(index + 1)}>
                <span className="sr-only">Next slide</span>
                <span aria-hidden>›</span>
              </button>
              <div className="flex items-center" role="group" aria-label="Choose a slide">
                {SLIDES.map((item, slideIndex) => (
                  <button
                    key={item.id}
                    type="button"
                    className="cc-hero-control"
                    aria-label={`Show ${item.label}`}
                    aria-current={slideIndex === index ? 'true' : undefined}
                    onClick={() => showSlide(slideIndex)}
                  >
                    <span className={`cc-hero-dot${slideIndex === index ? ' is-active' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
