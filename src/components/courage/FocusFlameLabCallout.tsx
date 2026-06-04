import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import HeroBackgroundVideo from './HeroBackgroundVideo';
import { FOCUS_FLAME_LAB_PATH } from '../../config/courageNav';

export default function FocusFlameLabCallout() {
  return (
    <section className="cc-ffl-callout border-y border-navy-100/80 bg-[#0B1E3A] px-4 py-14 text-white sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="cc-site-container mx-auto">
        <div className="cc-ffl-callout-grid grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12 xl:gap-16">
          <div className="cc-ffl-callout-copy min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-golden-300/90 sm:text-[11px]">
              Focus Flame Lab
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.65rem]">
              Help Caiden Understand His Feelings
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              The cave is one of Caiden&apos;s first Focus Flame challenges. Kids practice noticing emotions, calming
              their minds, and making brave choices through story-powered play.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <Button variant="primary" size="lg" as={Link} to={FOCUS_FLAME_LAB_PATH} className="w-full sm:w-auto">
                Play Focus Flame Lab
              </Button>
              <Link
                to="/kids"
                className="text-sm font-semibold text-golden-300/95 underline-offset-4 transition-colors hover:text-golden-200 hover:underline"
              >
                Explore Kids Activities
              </Link>
            </div>
          </div>

          <div className="cc-ffl-callout-media min-w-0">
            <div className="cc-ffl-callout-frame relative overflow-hidden rounded-[1.25rem] shadow-[0_24px_56px_-28px_rgba(0,0,0,0.55)] sm:rounded-[1.5rem]">
              <span className="cc-ffl-callout-badge absolute left-4 top-4 z-20 rounded-full bg-navy-900/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-golden-200 backdrop-blur-sm sm:left-5 sm:top-5 sm:text-[11px]">
                Focus Flame Lab Level
              </span>
              <div className="cc-ffl-callout-video" aria-hidden="true">
                <HeroBackgroundVideo />
              </div>
              <div className="cc-ffl-callout-vignette pointer-events-none absolute inset-0 z-10" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
