import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { PARENTS_PATH } from '../../config/courageRoutes';

const ACADEMY_SCENES = [
  {
    src: '/images/B-4FlightGame/Marketing%20Images/B-4FocusFlight_Thumbnail.webp',
    alt: 'B-4 Focus Flight gameplay, collecting spark flames over a rainy forest',
    title: 'B-4 Focus Flight',
    caption: 'The flight game already in the Academy. Collect spark flames and stay with the path.',
  },
  {
    src: '/images/B-4FlightGame/Marketing%20Images/StoryQuests_Thumbnail.webp',
    alt: 'Finding Your Voice story quest map with weekly missions',
    title: 'Story Quests',
    caption: 'Weekly story quests on the Finding Your Voice map.',
  },
  {
    src: '/images/B-4FlightGame/Marketing%20Images/learningmissions_thumbnail.webp',
    alt: 'A learning mission asking for the best multi-step plan',
    title: 'Learning missions',
    caption: 'Guided missions that ask kids to read a situation and choose a plan.',
  },
] as const;

export default function BookstoreAcademyPreview() {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollScenes = (direction: -1 | 1) => {
    const node = scroller.current;
    if (!node) return;
    const card = node.querySelector<HTMLElement>('[data-academy-scene]');
    const distance = (card?.offsetWidth || 280) + 16;
    node.scrollBy({ left: direction * distance, behavior: 'smooth' });
  };

  return (
    <section className="border-y border-navy-100/80 bg-white px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="beyond-the-book-heading">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b0892e]">Focus Flame Academy</p>
            <h2 id="beyond-the-book-heading" className="mt-2 font-display text-3xl font-extrabold text-navy-500 sm:text-4xl">
              The Adventure Doesn&apos;t End on the Last Page.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-navy-600">
              Step into the Focus Flame Academy, where young Guardians can continue their journey through interactive story quests, games, and learning adventures.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy-200 text-navy-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-300"
              aria-label="Show previous Academy scene"
              onClick={() => scrollScenes(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy-200 text-navy-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-300"
              aria-label="Show next Academy scene"
              onClick={() => scrollScenes(1)}
            >
              ›
            </button>
          </div>
        </div>

        <div
          ref={scroller}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
          tabIndex={0}
          aria-label="Focus Flame Academy scenes"
        >
          {ACADEMY_SCENES.map((scene) => (
            <figure
              key={scene.title}
              data-academy-scene
              className="w-[82%] flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-navy-100 bg-cream shadow-sm sm:w-[46%] lg:w-[32%]"
            >
              <img src={scene.src} alt={scene.alt} className="h-52 w-full object-cover sm:h-56" loading="lazy" decoding="async" />
              <figcaption className="p-4">
                <p className="font-display text-lg font-bold text-navy-500">{scene.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-navy-600">{scene.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-6">
          <Link
            to={PARENTS_PATH}
            className="inline-flex items-center justify-center rounded-full border-2 border-navy-500 px-6 py-3 text-[15px] font-semibold text-navy-600 transition hover:bg-navy-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-300 focus-visible:ring-offset-2"
          >
            Explore Focus Flame Academy
          </Link>
        </p>
      </div>
    </section>
  );
}
