import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CourageHeader from '../components/CourageHeader';
import CourageFooter from '../components/CourageFooter';
import HubCard from '../components/ecosystem/HubCard';
import ChoosePathSection from '../components/courage/ChoosePathSection';
import BuiltFromRealStorySection from '../components/courage/BuiltFromRealStorySection';
import Button from '../components/ui/Button';
import HeroBackgroundVideo from '../components/courage/HeroBackgroundVideo';
import HeroEcosystemVisuals from '../components/courage/HeroEcosystemVisuals';
import CourageEmailSignup from '../components/courage/CourageEmailSignup';
import useHashScroll from '../hooks/useHashScroll';

type HowItWorksStepName = 'Read' | 'Play' | 'Reflect' | 'Grow';

type HowItWorksItem = {
  step: HowItWorksStepName;
  icon: string;
  imageSrc: string;
  imageObjectPosition?: string;
  imageTranslateY?: number;
  hoverTitle: string;
  hoverText: string;
};

const HOW_IT_WORKS: HowItWorksItem[] = [
  {
    step: 'Read',
    icon: '📖',
    imageSrc: '/images/caidenscourage/How_It_Works/read_card_.webp',
    imageTranslateY: -35,
    hoverTitle: 'Read the story',
    hoverText: 'Meet Caiden, B-4, and the Focus Flame through short story moments.',
  },
  {
    step: 'Play',
    icon: '🎮',
    imageSrc: '/images/caidenscourage/How_It_Works/The Opportunity_kid_Courage.webp',
    hoverTitle: 'Practice through play',
    hoverText: 'Interactive moments help kids notice feelings, focus, and make brave choices.',
  },
  {
    step: 'Reflect',
    icon: '💭',
    imageSrc: '/images/caidenscourage/How_It_Works/reflectcard_cc.webp',
    hoverTitle: 'Name the feeling',
    hoverText: 'Simple prompts help kids reflect, reset, and try a next step.',
  },
  {
    step: 'Grow',
    icon: '🌱',
    imageSrc: '/images/focus-flame-lab/thepath.webp',
    hoverTitle: 'Grow over time',
    hoverText: 'Small, repeatable skills build confidence and courage day by day.',
  },
];

const HOW_IT_WORKS_IMAGE_ALT: Record<HowItWorksStepName, string> = {
  Read: "Kid reading a Caiden's Courage story",
  Play: 'Kid practicing courage through play',
  Reflect: 'Kid reflecting on feelings',
  Grow: 'Kid building courage over time',
};

function HowItWorksCard({
  step,
  index,
  imageSrc,
  imageObjectPosition,
  imageTranslateY,
  icon,
  hoverTitle,
  hoverText,
}: HowItWorksItem & { index: number }) {
  const isGrow = step === 'Grow';

  return (
    <article
      tabIndex={0}
      className={[
        'cc-how-card group relative aspect-[16/12] w-full overflow-hidden rounded-[30px] outline-none transition-transform duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-golden-400/80 motion-safe:hover:-translate-y-0.5',
        isGrow
          ? 'cc-how-card--grow bg-golden-500 shadow-[0_18px_54px_-26px_rgba(167,125,28,0.45)]'
          : 'bg-[#0B1E3A] shadow-[0_18px_54px_-26px_rgba(7,20,38,0.55)]',
      ].join(' ')}
    >
      <div className="cc-how-card-media absolute inset-0 overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={HOW_IT_WORKS_IMAGE_ALT[step]}
            className="h-full w-full object-cover object-center"
            style={{
              ...(imageObjectPosition ? { objectPosition: imageObjectPosition } : {}),
              ...(imageTranslateY !== undefined ? { transform: `translateY(${imageTranslateY}px)` } : {}),
            }}
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-navy-800/60">
            <span className="text-6xl" aria-hidden="true">
              {icon}
            </span>
          </div>
        )}
      </div>

      <div
        className={[
          'cc-how-card-panel absolute inset-x-0 bottom-0 z-10 px-6 pb-5 pt-4 text-left',
          isGrow ? 'cc-how-card-panel--grow' : '',
        ].join(' ')}
      >
        <p
          className={[
            'text-xs font-semibold uppercase tracking-wider',
            isGrow ? 'text-navy-600' : 'text-golden-300/90',
          ].join(' ')}
        >
          Step {index + 1}
        </p>
        <p
          className={[
            'mt-1 font-display text-2xl font-extrabold leading-tight',
            isGrow ? 'text-navy-800' : 'text-white',
          ].join(' ')}
        >
          {step}
        </p>
        <div className="cc-how-card-extra">
          <p className={['mt-3 text-sm font-semibold', isGrow ? 'text-navy-800' : 'text-white/95'].join(' ')}>
            {hoverTitle}
          </p>
          <p className={['mt-2 text-sm leading-relaxed', isGrow ? 'text-navy-700' : 'text-white/75'].join(' ')}>
            {hoverText}
          </p>
        </div>
      </div>
    </article>
  );
}

function HowItWorksCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const alignRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const cards = useMemo(() => HOW_IT_WORKS, []);

  const scrollToIndex = useCallback(
    (idx: number) => {
      const track = trackRef.current;
      const alignEl = alignRef.current;
      if (!track) return;

      const nextIndex = Math.max(0, Math.min(cards.length - 1, idx));
      const cardEl = track.querySelector<HTMLElement>(`[data-how-card-index="${nextIndex}"]`);
      if (!cardEl) return;

      if (nextIndex === 0) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
        setActiveIndex(0);
        return;
      }

      const alignRect = alignEl?.getBoundingClientRect();
      const cardRect = cardEl.getBoundingClientRect();
      const isLast = nextIndex === cards.length - 1;

      let scrollDelta = 0;
      if (isLast && alignRect) {
        scrollDelta = cardRect.right - alignRect.right;
      } else if (alignRect) {
        scrollDelta = cardRect.left - alignRect.left;
      } else if (isLast) {
        cardEl.scrollIntoView({ behavior: 'smooth', inline: 'end', block: 'nearest' });
        setActiveIndex(nextIndex);
        return;
      } else {
        cardEl.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        setActiveIndex(nextIndex);
        return;
      }

      track.scrollTo({ left: track.scrollLeft + scrollDelta, behavior: 'smooth' });
      setActiveIndex(nextIndex);
    },
    [cards.length],
  );

  const canPrev = activeIndex > 0;
  const canNext = activeIndex < cards.length - 1;

  return (
    <section className="border-y border-navy-100/80 bg-[#EEF4FF] px-4 pt-20 pb-20 sm:px-6 sm:pt-28 sm:pb-24 lg:px-8 lg:pt-32 lg:pb-28">
      <div ref={alignRef} className="cc-site-container mx-auto">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-extrabold text-navy-700 sm:text-3xl">How It Works</h2>
            <p className="mt-3 max-w-2xl text-base text-navy-600 sm:text-lg">
              Kids enter the world through story, practice focus through play, reflect on emotions, and build courage over
              time.
            </p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex - 1)}
              disabled={!canPrev}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow-sm transition-colors ${
                canPrev ? 'border-navy-200 text-navy-700 hover:bg-navy-50' : 'border-navy-100 text-navy-300'
              }`}
              aria-label="Previous"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex + 1)}
              disabled={!canNext}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow-sm transition-colors ${
                canNext ? 'border-navy-200 text-navy-700 hover:bg-navy-50' : 'border-navy-100 text-navy-300'
              }`}
              aria-label="Next"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className={[
            'cc-hide-scrollbar cc-how-works-track mt-12 flex gap-5 overflow-x-auto sm:mt-14',
            '[-webkit-overflow-scrolling:touch]',
            'sm:gap-6',
          ].join(' ')}
        >
          {cards.map((card, index) => (
            <div
              key={card.step}
              data-how-card-index={index}
              className="shrink-0"
              style={{ flex: '0 0 clamp(300px, 74vw, 420px)' }}
            >
              <HowItWorksCard {...card} index={index} />
            </div>
          ))}
        </div>

        {/* Mobile arrows */}
        <div className="mt-6 flex items-center justify-end gap-2 sm:hidden">
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={!canPrev}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow-sm transition-colors ${
              canPrev ? 'border-navy-200 text-navy-700 hover:bg-navy-50' : 'border-navy-100 text-navy-300'
            }`}
            aria-label="Previous"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={!canNext}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow-sm transition-colors ${
              canNext ? 'border-navy-200 text-navy-700 hover:bg-navy-50' : 'border-navy-100 text-navy-300'
            }`}
            aria-label="Next"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

const Home: React.FC = () => {
  useHashScroll();

  useEffect(() => {
    document.title = "Caiden's Courage";
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip bg-cream font-body">
      <CourageHeader />

      {/* Hero — masked rounded container on warm page background */}
      <section className="bg-cream px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-5 lg:px-8 lg:pb-5">
        <div className="cc-site-container mx-auto">
          <div className="cc-hero-mask relative overflow-hidden rounded-[1.35rem] text-white sm:rounded-[1.75rem] lg:rounded-[2rem]">
            <div className="cc-hero-media" aria-hidden="true">
              <HeroBackgroundVideo />
              <div className="cc-hero-vignette" aria-hidden="true" />
            </div>

            <div className="cc-hero-content relative z-10">
              <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-8 lg:gap-10 xl:gap-12">
                <div className="min-w-0 flex-1 md:max-w-[50%]">
                  <div className="max-w-[19rem] sm:max-w-md lg:max-w-[26rem]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-golden-300/90 sm:text-[11px]">
                      Story &bull; Play &bull; SEL &bull; Focus Flame Academy
                    </p>
                    <h1 className="mt-3 font-display text-[2rem] font-extrabold leading-[1.08] drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:mt-4 sm:text-5xl lg:text-6xl">
                      Caiden&apos;s Courage
                    </h1>
                    <p className="mt-3 text-base leading-relaxed text-white/92 sm:mt-4 sm:text-lg lg:text-xl">
                      A story-powered SEL world helping kids turn focus, feelings, and courage into everyday strengths.
                    </p>
                    <div className="mt-6 flex flex-col gap-3 sm:mt-8">
                      <Button variant="primary" size="lg" as={Link} to="/kids" className="w-full">
                        Explore Kids
                      </Button>
                      <Button
                        variant="secondary"
                        size="lg"
                        as={Link}
                        to="/focus-flame-academy"
                        className="w-full !border-white/80 !text-white hover:!bg-white/15"
                      >
                        View Focus Flame Academy
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="cc-hero-visual max-w-[46%] overflow-hidden">
                  <HeroEcosystemVisuals />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audience Cards */}
      <section className="px-4 pt-5 pb-12 sm:px-6 sm:pt-6 sm:pb-14 lg:px-8 lg:pt-7 lg:pb-16" aria-label="Choose your audience">
        <div className="cc-site-container mx-auto grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          <HubCard
            accent="blue"
            eyebrow="FOR KIDS"
            icon="kids"
            title="Build Focus"
            description="Games, comics, and brave activities that help kids practice focus, feelings, and courage."
            to="/kids"
          />
          <HubCard
            accent="yellow"
            eyebrow="FOR FAMILIES"
            icon="parents"
            title="Build Confidence"
            description="Simple tools that help kids name feelings, reset, and build confidence at home."
            to="/#join"
          />
          <HubCard
            accent="orange"
            eyebrow="FOR EDUCATORS"
            icon="teachers"
            title="Build Courage"
            description="Story-based SEL experiences built for classrooms, camps, counselors, and groups."
            to="/focus-flame-academy"
          />
        </div>
      </section>

      <HowItWorksCarousel />

      <ChoosePathSection />

      <BuiltFromRealStorySection />

      {/* Email Signup */}
      <section id="join" className="scroll-mt-24 border-t border-navy-100/80 bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="cc-site-container mx-auto text-left">
          <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl">Join the Courage Club</h2>
          <p className="mt-3 max-w-2xl text-base text-navy-600 sm:text-lg">
            Get new activities, updates, and Focus Flame tools for kids, parents, and educators.
          </p>
          <div className="max-w-xl">
            <CourageEmailSignup />
          </div>
        </div>
      </section>

      <CourageFooter />
    </div>
  );
};

export default Home;
