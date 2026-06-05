import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { useInViewReveal } from '../../hooks/useInViewReveal';

const PILOT_HIGHLIGHTS = [
  'Comic-based SEL',
  'Guided activities',
  'Facilitator-ready tools',
] as const;

export default function PilotProgramSummerSection() {
  const cardRef = useInViewReveal<HTMLDivElement>();

  return (
    <section
      id="pilot-program-summer-2026"
      className="px-4 sm:px-6 lg:px-8 py-10 sm:py-12"
      aria-labelledby="pilot-summer-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div
          ref={cardRef}
          className="fade-in-up overflow-hidden rounded-2xl border border-navy-100/70 bg-[#F6F1E8] shadow-[0_12px_40px_rgba(31,60,99,0.1)]"
        >
          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:gap-10 lg:p-9">
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-md bg-golden-500 px-3 py-1 text-sm font-semibold text-navy-500">
                Summer 2026 Pilot Program
              </span>

              <h2
                id="pilot-summer-heading"
                className="mt-2 font-display text-2xl font-extrabold leading-[1.15] text-navy-500 sm:text-[1.65rem] lg:text-[1.85rem]"
              >
                Bring Caiden&apos;s Courage to your camp, classroom,
                <br />
                or youth program.
              </h2>

              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-navy-600 sm:text-base">
                We&apos;re inviting a limited number of camps, schools, and youth programs to pilot
                Caiden&apos;s Courage — a comic-based SEL experience for kids ages 7–12.
              </p>

              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {PILOT_HIGHLIGHTS.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm font-medium text-navy-600"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-golden-500"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  variant="primary"
                  size="md"
                  as={Link}
                  to="/schools#pilot"
                  leftIconSrc={null}
                  className="w-full transition-all duration-200 hover:scale-100 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(27,42,68,0.22)] active:translate-y-0 sm:w-auto sm:min-w-[200px]"
                >
                  Apply for Pilot Program
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  as={Link}
                  to="/schools"
                  className="w-full sm:w-auto sm:min-w-[200px]"
                >
                  Explore for Schools
                </Button>
              </div>
            </div>

            <figure className="mx-auto w-full max-w-[280px] shrink-0 lg:mx-0 lg:max-w-[260px]">
              <img
                src="/images/camp-courage/stackworksheets.webp"
                alt="Stack of printable Camp Courage SEL worksheets"
                className="block h-auto w-full object-contain drop-shadow-[0_12px_28px_rgba(31,60,99,0.14)]"
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
