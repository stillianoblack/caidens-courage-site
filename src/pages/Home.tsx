import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CourageHeader from '../components/CourageHeader';
import CourageFooter from '../components/CourageFooter';
import HubCard from '../components/ecosystem/HubCard';
import ChoosePathSection from '../components/courage/ChoosePathSection';
import BuiltFromRealStorySection from '../components/courage/BuiltFromRealStorySection';
import Button from '../components/ui/Button';
import FocusFlameLabCallout from '../components/courage/FocusFlameLabCallout';
import CourageEmailSignup from '../components/courage/CourageEmailSignup';
import useHashScroll from '../hooks/useHashScroll';
import { CAIDEN_VALE_HOME_PATH } from '../config/nav';

const HERO_BRAND_IMAGE = '/images/camp-courage/stackworksheets.webp';

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

      {/* Hero — clean brand-led SEL platform intro */}
      <section className="bg-cream px-4 pb-2 pt-4 sm:px-6 sm:pb-2 sm:pt-5 lg:px-8 lg:pb-3">
        <div className="cc-site-container mx-auto">
          <div className="cc-hero-mask cc-hero-mask--brand relative overflow-hidden rounded-[1.35rem] sm:rounded-[1.75rem] lg:rounded-[2rem]">
            <div className="cc-hero-content relative z-10">
              <div className="cc-hero-layout">
                <div className="cc-hero-main">
                  <div className="cc-hero-copy">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-golden-600 sm:text-[11px]">
                      Story-Powered SEL
                    </p>
                    <h1 className="cc-hero-title mt-2.5 font-display font-extrabold leading-[1.08] text-navy-500 sm:mt-4 sm:text-5xl lg:text-6xl">
                      Caiden&apos;s Courage
                    </h1>
                    <p className="cc-hero-subtitle mt-2.5 text-[0.9375rem] leading-snug text-navy-600 sm:mt-4 sm:max-w-none sm:text-lg sm:leading-relaxed lg:text-xl">
                      A story-powered SEL world helping kids build focus, confidence, and courage.
                    </p>
                  </div>
                  <div className="cc-hero-ctas">
                    <Button variant="primary" size="lg" as={Link} to="/kids" className="cc-hero-cta">
                      Explore Kids
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      as={Link}
                      to={CAIDEN_VALE_HOME_PATH}
                      className="cc-hero-cta cc-hero-secondary-cta"
                    >
                      Explore Caiden Vale
                    </Button>
                  </div>
                </div>
                <div className="cc-hero-brand-visual">
                  <img
                    src={HERO_BRAND_IMAGE}
                    alt="Camp Courage Experience Guide — SEL worksheets and activities"
                    className="cc-hero-brand-img"
                    decoding="async"
                  />
                  <div className="cc-hero-flyer-caption">
                    <p className="cc-hero-flyer-caption-title">Camp Courage Experience Guide</p>
                    <p className="cc-hero-flyer-caption-body">
                      Story-based SEL activities for schools, camps, and families.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audience Cards */}
      <section className="px-4 pt-3 pb-12 sm:px-6 sm:pt-4 sm:pb-14 lg:px-8 lg:pt-5 lg:pb-16" aria-label="Choose your audience">
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
            to="/braveminds#parents"
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

      <FocusFlameLabCallout />

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
