import React from "react";
import { Link } from "react-router-dom";

type RecCard = {
  title: string;
  imageSrc: string;
  href: string;
};

export default function ResourcesRecommendationsSection() {
  const cards: RecCard[] = [
    {
      title: "Caiden Coloring Pages",
      imageSrc: "/images/coloringpage_Caiden.jpg",
      href: "/resources?type=coloring",
    },
    {
      title: "Caiden Desktop Wallpaper",
      imageSrc: "/images/CoolCaiden_header.webp",
      href: "/resources?type=wallpaper",
    },
    {
      title: "Emotional Awareness Worksheet",
      imageSrc: "/images/SELThubmails.webp",
      href: "/resources?type=worksheet",
    },
  ];

  return (
    <section className="w-full">
      {/* YOU MAY ALSO LIKE */}
      <div className="mx-auto max-w-6xl px-6 pt-14 pb-14">
        <div className="text-center">
          <h2 className="text-[40px] font-extrabold leading-tight text-[#1F3C63] md:text-[48px]">
            You May Also Like
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[16px] leading-relaxed text-[#6B8198]">
            Free activities and resources to keep the story going.
          </p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.title}
              className="overflow-hidden rounded-[16px] bg-white shadow-[0_16px_40px_rgba(31,60,99,0.12)]"
            >
              <div className="aspect-[4/3] w-full bg-[#F3F6FA]">
                <img
                  src={c.imageSrc}
                  alt={c.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="px-6 pt-6 pb-6">
                <div className="text-[18px] font-extrabold text-[#1F3C63]">
                  {c.title}
                </div>

                <div className="mt-5">
                  <Link
                    to={c.href}
                    className="inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-[#203B63] px-5 text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(32,59,99,0.18)]"
                  >
                    Explore
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KEEP THE COURAGE GOING (BLUE BAND) */}
      <div className="w-full bg-[#203B63]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h3 className="text-[36px] font-extrabold leading-tight text-white md:text-[44px]">
                Keep the Courage going
              </h3>
              <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-[#D5E3F5]">
                More free tools, printable supports, and missions for home and classroom.
              </p>

              <div className="mt-8">
                <Link
                  to="/resources"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#F2D06B] px-8 text-[14px] font-extrabold text-[#1F3C63] shadow-[0_14px_28px_rgba(0,0,0,0.18)]"
                >
                  Explore Resources
                </Link>
              </div>
            </div>

            <div className="relative hidden h-[180px] md:block">
              <svg
                className="absolute right-0 top-1/2 -translate-y-1/2 opacity-35"
                width="360"
                height="200"
                viewBox="0 0 360 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="240" cy="70" r="34" stroke="#D5E3F5" strokeWidth="2" />
                <circle cx="320" cy="120" r="26" stroke="#D5E3F5" strokeWidth="2" />
                <circle cx="250" cy="150" r="18" stroke="#D5E3F5" strokeWidth="2" />
                <path
                  d="M265 90 L300 110"
                  stroke="#D5E3F5"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M260 120 L300 120"
                  stroke="#D5E3F5"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
