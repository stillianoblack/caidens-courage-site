import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';

export type HeroSlide = {
  eyebrow: string;
  headline: string;
  mobileHeadline?: string;
  desktopPosition?: string;
  mobilePosition?: string;
  highlight?: string;
  description: string;
  primaryCta: { label: string; to: string };
  secondaryCta: { label: string; to: string };
  desktopImage: string;
  mobileImage: string;
  tabLabel: string;
};

type HeroCarouselProps = {
  slides?: HeroSlide[];
  activeIndex?: number;
  onActiveIndexChange?: (next: number) => void;
  autoplayMs?: number;
  isMobile?: boolean;
};

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    eyebrow: "A CAIDEN’S COURAGE UNIVERSE",
    headline: 'Where focus becomes power.',
    mobileHeadline: 'Where focus becomes power.',
    desktopPosition: 'center top',
    mobilePosition: 'center 65%',
    highlight: 'power',
    description:
      "A story that helps kids with ADHD turn creativity into focus—without feeling like something is wrong with them.",
    primaryCta: { label: 'Pre-Order Volume 1', to: '/comicbook' },
    secondaryCta: { label: 'Explore the World', to: '/world' },
    desktopImage: '/images/heros/hero-desktop_slide_1.webp',
    mobileImage: '/images/heros/hero-mobile_slide_1.webp',
    tabLabel: 'The Focus Flame',
  },
  {
    eyebrow: 'MEET CAIDEN VALE',
    headline: 'Not every hero looks fearless.',
    mobileHeadline: 'Not every hero looks fearless.',
    mobilePosition: 'center 70%',
    description:
      'Caiden is a fast-thinking, deeply creative kid learning that what makes him different may be his greatest strength.',
    primaryCta: { label: 'Meet Caiden', to: '/mission' },
    secondaryCta: { label: 'Read His Story', to: '/mission' },
    desktopImage: '/images/heros/hero-desktop_slide_2.webp',
    mobileImage: '/images/heros/hero-mobile_slide_2.webp',
    tabLabel: 'Caiden Vale',
  },
  {
    eyebrow: 'MEET B-4',
    headline: 'More than a robot. Your focus companion.',
    mobileHeadline: 'More than a robot. Your focus companion.',
    mobilePosition: 'center 18%',
    description: "B-4 helps kids understand their mind, name big feelings, and take the next brave step.",
    primaryCta: { label: 'Talk to B-4', to: '/b4-tools' },
    secondaryCta: { label: 'Learn About B-4', to: '/braveminds' },
    desktopImage: '/images/heros/hero-desktop_slide_3.webp',
    mobileImage: '/images/heros/hero-mobile_slide_3.webp',
    tabLabel: 'B-4',
  },
];

export default function HeroCarousel({
  slides: slidesProp,
  activeIndex: activeIndexProp,
  onActiveIndexChange,
  autoplayMs = 6000,
  isMobile,
}: HeroCarouselProps) {
  const slides = useMemo(() => slidesProp ?? DEFAULT_SLIDES, [slidesProp]);
  const isControlled = activeIndexProp != null && onActiveIndexChange != null;
  const [uncontrolledIndex, setUncontrolledIndex] = useState(0);
  const activeIndex = isControlled ? (activeIndexProp as number) : uncontrolledIndex;

  const intervalRef = useRef<number | null>(null);

  const resolvedIsMobile = useMemo(() => {
    if (typeof isMobile === 'boolean') return isMobile;
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(max-width: 768px)').matches ?? false;
  }, [isMobile]);

  const setIndex = useCallback((next: number) => {
    const clamped = ((next % slides.length) + slides.length) % slides.length;
    if (isControlled) onActiveIndexChange?.(clamped);
    else setUncontrolledIndex(clamped);
  }, [isControlled, onActiveIndexChange, slides.length]);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current != null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (slides.length <= 1) return;
    if (autoplayMs <= 0) return;
    if (intervalRef.current != null) return;
    intervalRef.current = window.setInterval(() => {
      setIndex(activeIndex + 1);
    }, autoplayMs);
  }, [activeIndex, autoplayMs, setIndex, slides.length]);

  const restartAutoplay = useCallback(() => {
    stopAutoplay();
    startAutoplay();
  }, [startAutoplay, stopAutoplay]);

  // Always reset interval on slide change (prevents "dead timer" after interactions).
  useEffect(() => {
    restartAutoplay();
    return () => stopAutoplay();
  }, [activeIndex, autoplayMs, slides.length, restartAutoplay, stopAutoplay]);

  const active = slides[activeIndex];

  // Mobile: subtle fade transition between slides (image + content)
  const [mobilePrevIndex, setMobilePrevIndex] = useState<number | null>(null);
  const [mobileIsTransitioning, setMobileIsTransitioning] = useState(false);
  useEffect(() => {
    if (!resolvedIsMobile) return;
    setMobilePrevIndex((prev) => (prev === activeIndex ? prev : activeIndex));
    setMobileIsTransitioning(true);
    const t = window.setTimeout(() => setMobileIsTransitioning(false), 320);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, resolvedIsMobile]);

  // Mobile swipe support (apply to full mobile carousel block)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchLastRef = useRef<{ x: number; y: number } | null>(null);
  const touchIsDraggingRef = useRef(false);

  const onMobileTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
    touchLastRef.current = { x: t.clientX, y: t.clientY };
    touchIsDraggingRef.current = true;
    stopAutoplay(); // pause only while actively touching
  };

  const onMobileTouchMove = (e: React.TouchEvent) => {
    if (!touchIsDraggingRef.current) return;
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    touchLastRef.current = { x: t.clientX, y: t.clientY };
  };

  const onMobileTouchEnd = () => {
    if (!touchIsDraggingRef.current) return;
    touchIsDraggingRef.current = false;

    const start = touchStartRef.current;
    const last = touchLastRef.current;
    touchStartRef.current = null;
    touchLastRef.current = null;

    if (!start || !last) {
      restartAutoplay();
      return;
    }

    const dx = last.x - start.x;
    const dy = last.y - start.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Ignore mostly vertical gestures (allow page scroll)
    if (absDy > absDx * 1.15) {
      restartAutoplay();
      return;
    }

    // Ignore small accidental swipes
    if (absDx < 40) {
      restartAutoplay();
      return;
    }

    if (dx < 0) setIndex(activeIndex + 1);
    else setIndex(activeIndex - 1);
    restartAutoplay();
  };

  const onMobileTouchCancel = () => {
    touchIsDraggingRef.current = false;
    touchStartRef.current = null;
    touchLastRef.current = null;
    restartAutoplay();
  };

  const renderHeadline = (slide: HeroSlide) => {
    const text = resolvedIsMobile && slide.mobileHeadline ? slide.mobileHeadline : slide.headline;
    if (!slide.highlight) return text;
    const idx = text.toLowerCase().indexOf(slide.highlight.toLowerCase());
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const mid = text.slice(idx, idx + slide.highlight.length);
    const after = text.slice(idx + slide.highlight.length);
    return (
      <>
        {before}
        <span className="hero-power text-brand-gold">{mid}</span>
        {after}
      </>
    );
  };

  return (
    <div
      className="relative w-full"
      onMouseEnter={stopAutoplay}
      onMouseLeave={restartAutoplay}
      onFocusCapture={stopAutoplay}
      onBlurCapture={restartAutoplay}
    >
      {resolvedIsMobile ? (
        <div
          className="w-full"
          style={{ paddingTop: 'var(--mobile-header-stack-height)', background: '#000000', touchAction: 'pan-y' }}
          onTouchStart={onMobileTouchStart}
          onTouchMove={onMobileTouchMove}
          onTouchEnd={onMobileTouchEnd}
          onTouchCancel={onMobileTouchCancel}
        >
          {/* Mobile image area (no text overlay) */}
          <div
            className="relative w-full overflow-hidden"
            style={{
              aspectRatio: '16 / 9',
              width: '100%',
              maxHeight: '60vh',
              background: '#05070D',
            }}
          >
            {mobilePrevIndex != null && mobileIsTransitioning && mobilePrevIndex !== activeIndex && (
              <img
                src={slides[mobilePrevIndex]?.mobileImage}
                alt=""
                className="absolute inset-0"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: slides[mobilePrevIndex]?.mobilePosition ?? 'center',
                  opacity: 0,
                  transition: 'opacity 320ms ease',
                }}
                aria-hidden="true"
                decoding="async"
              />
            )}
            <img
              src={active.mobileImage}
              alt=""
              className="absolute inset-0"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: active.mobilePosition ?? 'center',
                opacity: 1,
                transition: 'opacity 320ms ease',
              }}
              aria-hidden="true"
              loading="eager"
              decoding="async"
            />
          </div>

          {/* Mobile indicators (Marvel-style bars) */}
          <div className="bg-black py-4">
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-6">
              {slides.map((s, idx) => {
                const isActiveBar = idx === activeIndex;
                return (
                  <button
                    key={s.tabLabel}
                    type="button"
                    onClick={() => {
                      setIndex(idx);
                      restartAutoplay();
                    }}
                    className="h-[4px] w-[26px] rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C06A]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    style={{ backgroundColor: isActiveBar ? '#E5C06A' : 'rgba(255,255,255,0.28)' }}
                    aria-label={`Go to ${s.tabLabel}`}
                    aria-current={isActiveBar ? 'true' : undefined}
                  />
                );
              })}
            </div>
          </div>

          {/* Mobile text panel */}
          <div
            style={{
              background: '#111111',
              transition: 'opacity 320ms ease, transform 320ms ease',
              opacity: mobileIsTransitioning ? 0.98 : 1,
              transform: mobileIsTransitioning ? 'translateY(2px)' : 'translateY(0)',
            }}
          >
            <div className="mx-auto max-w-7xl px-7" style={{ paddingTop: '28px', paddingBottom: '30px' }}>
              <div
                className="text-xs font-semibold uppercase"
                style={{
                  letterSpacing: '0.12em',
                  opacity: 0.85,
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: '10px',
                }}
              >
                {active.eyebrow}
              </div>

              <h1
                className="font-display font-extrabold text-white"
                style={{
                  fontSize: '2.05rem',
                  lineHeight: '1.1',
                  letterSpacing: '-0.5px',
                  marginBottom: '12px',
                  maxWidth: '18ch',
                }}
              >
                {renderHeadline(active)}
              </h1>

              <p
                className="font-medium"
                style={{
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: '17px',
                  lineHeight: '1.55',
                  marginBottom: '18px',
                  maxWidth: '62ch',
                }}
              >
                {active.description}
              </p>

              <div className="flex flex-col gap-3">
                <Button variant="primary" size="md" as={Link} to={active.primaryCta.to} className="w-full">
                  {active.primaryCta.label}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  as={Link}
                  to={active.secondaryCta.to}
                  className="w-full !bg-transparent !border-2 !border-white/60 !text-white hover:!bg-white/10"
                >
                  {active.secondaryCta.label}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="relative w-full flex flex-col"
          style={{ minHeight: 'clamp(860px, 92vh, 1150px)' }}
        >
          {/* Desktop background (active slide as background-image) */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${slides[activeIndex]?.desktopImage})`,
              backgroundSize: 'cover',
              backgroundPosition: slides[activeIndex]?.desktopPosition ?? 'center',
              backgroundRepeat: 'no-repeat',
              zIndex: 0,
            }}
            aria-hidden="true"
          />

          {/* Desktop overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,.78) 0%, rgba(0,0,0,.45) 45%, rgba(0,0,0,.18) 100%)',
              zIndex: 1,
            }}
            aria-hidden="true"
          />

          {/* Desktop content */}
          <div
            className="relative w-full flex-1 flex flex-col justify-center"
            style={{
              paddingTop: 'var(--desktop-header-height)',
              paddingBottom: '160px',
              zIndex: 2,
            }}
          >
            <div className="max-w-7xl mx-auto w-full px-6 md:px-4 md:sm:px-6 md:lg:px-8">
              <div className="max-w-md md:max-w-[560px]">
                <div
                  className="text-xs sm:text-sm font-semibold uppercase"
                  style={{
                    letterSpacing: '0.12em',
                    opacity: 0.85,
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '12px',
                  }}
                >
                  {active.eyebrow}
                </div>

                <h1
                  className="font-display font-extrabold text-white"
                  style={{
                    fontSize: 'clamp(44px, 4.7vw, 62px)',
                    lineHeight: '1.04',
                    letterSpacing: '-1px',
                    marginBottom: '16px',
                    maxWidth: '26ch',
                  }}
                >
                  {renderHeadline(active)}
                </h1>

                <p
                  className="text-white/90 font-medium"
                  style={{
                    fontSize: '22px',
                    lineHeight: '1.5',
                    marginBottom: '16px',
                    maxWidth: '60ch',
                  }}
                >
                  {active.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Button variant="primary" size="md" as={Link} to={active.primaryCta.to} className="w-full sm:w-auto">
                    {active.primaryCta.label}
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    as={Link}
                    to={active.secondaryCta.to}
                    className="w-full sm:w-auto !bg-transparent !border-2 !border-white !text-white hover:!bg-white/10"
                  >
                    {active.secondaryCta.label}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-golden-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M10 0 L12.5 7.5 L20 10 L12.5 12.5 L10 20 L7.5 12.5 L0 10 L7.5 7.5 Z" fill="currentColor" />
                  </svg>
                  <span className="text-sm text-white/80">Built for ages 6–12 • Loved by parents & educators</span>
                </div>
              </div>
            </div>

            {/* Desktop tabs */}
            <div className="mt-10">
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center gap-6">
                  {slides.map((s, idx) => {
                    const isActiveTab = idx === activeIndex;
                    return (
                      <button
                        key={s.tabLabel}
                        type="button"
                        onClick={() => {
                          setIndex(idx);
                          restartAutoplay();
                        }}
                        className="relative px-2 py-2 text-sm font-semibold tracking-wide transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C06A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-md"
                        style={{ color: isActiveTab ? '#FFFFFF' : 'rgba(255,255,255,0.72)' }}
                        aria-current={isActiveTab ? 'true' : undefined}
                      >
                        <span
                          className="absolute left-0 right-0 -top-2 h-[2px]"
                          style={{ background: isActiveTab ? '#E5C06A' : 'transparent' }}
                          aria-hidden="true"
                        />
                        {s.tabLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

