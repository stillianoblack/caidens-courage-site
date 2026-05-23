import React, { useCallback } from 'react';
import Button from '../ui/Button';

const TOOLKIT_SECTION_ID = 'camp-courage-toolkit';

const PILOT_CARDS = [
  {
    title: 'What You Get',
    items: [
      'Guided comic missions',
      'Printable SEL tools',
      'Read-aloud activities',
      'Facilitator guide',
    ],
  },
  {
    title: 'Best Fit',
    items: ['Ages 7–12', 'Camps', 'Classrooms', 'After-school groups'],
  },
  {
    title: 'Pilot Format',
    items: [
      '4–6 sessions',
      '45–60 minutes each',
      'Flexible group size',
      'Feedback loop included',
    ],
  },
] as const;

export default function CampPilotPartnershipsSection() {
  const scrollToToolkit = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const target = document.getElementById(TOOLKIT_SECTION_ID);
    if (!target) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    if (window.history.replaceState) {
      window.history.replaceState(null, '', `#${TOOLKIT_SECTION_ID}`);
    }
  }, []);

  return (
    <section
      id="camp-pilot-partnerships"
      className="scroll-mt-24 border-t border-navy-100/80 bg-[#F6F1E8]"
      aria-labelledby="camp-pilot-title"
    >
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-14 md:py-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-400">
              Pilot Partnerships
            </p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-golden-600">
              Summer 2026
            </p>
            <h2
              id="camp-pilot-title"
              className="mt-3 font-display text-balance text-[42px] leading-[1.1] font-extrabold text-[#1F3C63] md:text-[52px]"
            >
              Test Camp Courage with your students or campers.
            </h2>
            <p className="mt-4 max-w-2xl text-[18px] leading-relaxed text-[#4E6A86]">
              We&apos;re inviting a limited number of schools, camps, after-school programs, and youth
              organizations to pilot Camp Courage this summer. Pilot partners receive early access to guided
              missions, comic-based SEL activities, facilitator tools, and feedback opportunities that help
              shape the program.
            </p>
          </div>

          <figure className="mx-auto w-full max-w-[220px] shrink-0 lg:mx-0 lg:max-w-[200px]">
            <div className="overflow-hidden rounded-2xl border border-navy-100/60 bg-white shadow-[0_12px_32px_rgba(31,60,99,0.12)]">
              <img
                src="/images/camp-courage/courage_story.webp"
                alt="Camp Courage comic spread preview"
                className="block h-auto w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </figure>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {PILOT_CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-navy-100/70 bg-white p-5 shadow-[0_8px_24px_rgba(31,60,99,0.08)] sm:p-6"
            >
              <h3 className="font-display text-lg font-bold text-navy-500">{card.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {card.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm leading-snug text-navy-600"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-golden-500"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <Button
            variant="primary"
            size="md"
            as="a"
            href={`#${TOOLKIT_SECTION_ID}`}
            onClick={scrollToToolkit}
            leftIconSrc={null}
            className="w-full transition-all duration-200 hover:scale-100 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(27,42,68,0.22)] active:translate-y-0 active:scale-[0.99] sm:w-auto sm:min-w-[220px]"
          >
            Apply for Pilot Program
          </Button>
          <Button
            variant="secondary"
            size="md"
            as="a"
            href={`#${TOOLKIT_SECTION_ID}`}
            onClick={scrollToToolkit}
            className="w-full sm:w-auto sm:min-w-[220px]"
          >
            Download Camp Guide
          </Button>
        </div>
      </div>
    </section>
  );
}
