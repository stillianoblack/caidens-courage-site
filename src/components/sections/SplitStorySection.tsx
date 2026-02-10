import React from "react";
import { Link } from "react-router-dom";

type Cta = { label: string; href: string };

interface SplitStorySectionProps {
  label: string;
  title: string;
  body: React.ReactNode;
  cta?: Cta;
  imageSrc: string;
  imageAlt?: string;
  reverse?: boolean;

  /** keep visuals consistent across pages */
  radiusClass?: string; // default rounded-[28px]
  imageClassName?: string; // extra classes for the <img>
  wrapClassName?: string; // extra classes for outer section
  imageFrameClassName?: string; // extra classes for image wrapper
}

export default function SplitStorySection({
  label,
  title,
  body,
  cta,
  imageSrc,
  imageAlt = "",
  reverse = false,
  radiusClass = "rounded-[28px]",
  imageClassName = "",
  wrapClassName = "",
  imageFrameClassName = "",
}: SplitStorySectionProps) {
  return (
    <section className={`py-16 md:py-20 ${wrapClassName}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div
          className={`grid items-center gap-10 md:gap-12 md:grid-cols-2 ${
            reverse
              ? "md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1"
              : ""
          }`}
        >
          {/* Image */}
          <div className={`w-full ${imageFrameClassName}`}>
            <div className={`w-full overflow-hidden aspect-square ${radiusClass}`}>
              <img
                src={imageSrc}
                alt={imageAlt}
                className={`w-full h-full object-cover object-center ${imageClassName}`}
              />
            </div>
          </div>

          {/* Text */}
          <div className="max-w-xl">
            <span className="inline-flex items-center mb-4 rounded-full bg-[#F5D77A] px-4 py-1 text-sm font-medium text-[#1F3A5F]">
              {label}
            </span>

            <h2 className="text-4xl md:text-5xl font-bold text-[#1F3A5F] mb-6">
              {title}
            </h2>

            <div className="text-lg leading-relaxed text-[#4A5F7A] space-y-5 mb-8">
              {body}
            </div>

            {cta?.label && cta?.href && (
              <Link
                to={cta.href}
                className="inline-flex items-center justify-center rounded-full bg-[#F5D77A] px-8 py-4 font-semibold text-[#1F3A5F] shadow-sm hover:opacity-90 transition"
              >
                {cta.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
