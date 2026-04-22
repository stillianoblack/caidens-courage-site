import React, { useMemo, useState } from "react";

type Item = {
  title: string;
  body: string;
};

export default function ExploreInsideCampCourageSection() {
  const items: Item[] = useMemo(
    () => [
      {
        title: "Guided Missions",
        body:
          "Short, guided SEL missions designed for calm, predictable use—at home and in the classroom.",
      },
      {
        title: "Companion Activities",
        body:
          "Hands-on activities that extend the story into real moments and build confidence through practice.",
      },
      {
        title: "Classroom Pilots",
        body:
          "A classroom-ready pilot structure for educators to introduce routines, reflection, and group support.",
      },
      {
        title: "Training & Guides",
        body:
          "Clear implementation guidance for adults supporting kids—simple, practical, and repeatable.",
      },
    ],
    []
  );

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section aria-labelledby="explore-inside" className="w-full">
      <div className="mx-auto max-w-6xl px-6 pb-16 md:pb-20">
        {/* Match the same eyebrow + h2 + subtext style used above */}
        <div className="pt-12 text-center">
          <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#2B4A73]">
            FOR PARENTS + EDUCATORS
          </div>

          <h2
            id="explore-inside"
            className="mt-3 font-display text-balance text-[42px] leading-[1.1] font-extrabold text-[#1F3C63] md:text-[52px]"
          >
            Explore what&apos;s inside Camp Courage
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-[18px] leading-relaxed text-[#4E6A86]">
            Tap a module to see what you&apos;ll get — designed for calm, predictable use at home and in the classroom.
          </p>
        </div>

        {/* Two-column layout: image left, accordion right */}
        <div className="mt-10 grid gap-10 md:grid-cols-2 md:items-center md:gap-14">
          {/* Left: image card */}
          <div className="w-full">
            <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_18px_45px_rgba(31,60,99,0.18)]">
              <img
                src="/images/NeuroCamp_explore.webp"
                alt="Explore what's inside Camp Courage"
                className="block h-auto w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right: accordion list */}
          <div className="w-full">
            <div className="space-y-0">
              {items.map((item, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div key={item.title} className="border-b border-[#D7E3F2] py-6">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-6 text-left"
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                    >
                      <span className="text-[22px] font-extrabold text-[#1F3C63] md:text-[26px]">
                        {item.title}
                      </span>

                      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#FF7A2F] text-white shadow-[0_10px_22px_rgba(255,122,47,0.35)]">
                        <span className="text-[22px] leading-none" aria-hidden>
                          {isOpen ? "–" : "+"}
                        </span>
                      </span>
                    </button>

                    {isOpen && (
                      <div className="mt-4 pr-14 text-[16px] leading-relaxed text-[#4E6A86]">
                        {item.body}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
