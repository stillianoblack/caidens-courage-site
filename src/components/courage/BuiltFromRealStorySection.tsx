import React, { useEffect, useRef } from 'react';
import { VALE_CLASSIC_HOME_URL } from '../../config/valeLinks';

const STORY_SECTION_BG = '/images/caidenscourage/backgrounds/community-strategy-background-story-bg.webp';
const STORY_PORTRAIT = '/images/caidenscourage/backgrounds/caidenandme.webp';

const PARALLAX_MAX_SHIFT_PX = 36;
const SCROLL_ZOOM_MIN = 1.08;
const SCROLL_ZOOM_MAX = 1.16;

export default function BuiltFromRealStorySection() {
  const photoRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sectionEl = photoRef.current;
    const parallaxEl = parallaxRef.current;
    if (!sectionEl || !parallaxEl) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 1024px)');

    let frame = 0;

    const updateParallax = () => {
      const rect = sectionEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
      const zoom = SCROLL_ZOOM_MIN + progress * (SCROLL_ZOOM_MAX - SCROLL_ZOOM_MIN);

      if (reducedMotion.matches) {
        parallaxEl.style.transform = 'translate3d(0, 0, 0) scale(1)';
        return;
      }

      if (!desktop.matches) {
        parallaxEl.style.transform = `translate3d(0, 0, 0) scale(${zoom.toFixed(3)})`;
        return;
      }

      const shift = (progress - 0.5) * PARALLAX_MAX_SHIFT_PX * 2;
      parallaxEl.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0) scale(${zoom.toFixed(3)})`;
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    reducedMotion.addEventListener('change', updateParallax);
    desktop.addEventListener('change', updateParallax);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      reducedMotion.removeEventListener('change', updateParallax);
      desktop.removeEventListener('change', updateParallax);
    };
  }, []);

  return (
    <section className="cc-real-story relative w-full" aria-labelledby="built-from-real-story-heading">
      {/* White card — overlaps Choose Your Path; bleeds to viewport left on desktop */}
      <div className="relative z-20 -mt-10 sm:-mt-14 lg:-mt-24">
        <div className="cc-site-container mx-auto w-full px-4 sm:px-6 lg:px-8">
          <article className="cc-real-story-card-bleed border border-navy-100/90 bg-white shadow-[0_28px_72px_-34px_rgba(7,20,38,0.48)]">
            <div className="cc-real-story-card__body relative p-9 sm:p-11 lg:py-12 lg:px-0 lg:pr-14 xl:py-14 xl:pr-16">
              <div className="cc-real-story-card__text flex min-w-0 flex-col items-center gap-7 lg:flex-row lg:items-start lg:gap-10">
                <div className="shrink-0 lg:pt-1">
                  <div className="relative h-[7.5rem] w-[7.5rem] overflow-hidden rounded-full border-4 border-white shadow-[0_12px_32px_-12px_rgba(36,62,112,0.35)] ring-1 ring-navy-100/80 sm:h-[9rem] sm:w-[9rem] lg:h-[11rem] lg:w-[11rem]">
                    <img
                      src={STORY_PORTRAIT}
                      alt="Creator with Caiden"
                      width={1074}
                      height={1112}
                      className="h-full w-full object-cover object-[center_22%]"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>

                <div className="min-w-0 w-full flex-1 text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-golden-700 sm:text-[11px]">
                    Built from a real story
                  </p>
                  <h2
                    id="built-from-real-story-heading"
                    className="mt-3.5 font-display text-[1.65rem] font-extrabold leading-[1.12] text-navy-700 sm:mt-4 sm:text-[1.85rem] lg:text-[2.125rem] xl:text-[2.25rem]"
                  >
                    Inspired by a real kid learning to find his focus.
                  </h2>
                  <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-navy-600 sm:mt-5 sm:text-base sm:leading-[1.65] lg:mt-6">
                    Inspired by my nephew&apos;s journey learning to overcome reading and focus challenges,
                    Caiden&apos;s Courage was created to help kids build confidence, understand their feelings, and
                    discover the power already inside them.
                  </p>

                  <div className="mt-8 border-t border-navy-100 pt-6 sm:mt-9 sm:pt-7 lg:mt-10 lg:pt-8">
                    <a
                      href={VALE_CLASSIC_HOME_URL}
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[2.75rem] items-center gap-2 text-base font-semibold text-navy-700 transition-colors hover:text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-golden-500/80"
                    >
                      Explore the Story
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Full-width photo under the card */}
      <div
        ref={photoRef}
        className="cc-real-story-photo relative z-0 -mt-12 min-h-[30rem] sm:-mt-16 sm:min-h-[36rem] lg:-mt-[10rem] lg:min-h-[44rem] xl:-mt-[11rem] xl:min-h-[50rem]"
      >
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div ref={parallaxRef} className="cc-real-story-photo__frame absolute inset-0 will-change-transform">
            <img
              src={STORY_SECTION_BG}
              alt=""
              width={1920}
              height={1373}
              sizes="100vw"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="cc-real-story-photo__overlay pointer-events-none absolute inset-0" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
