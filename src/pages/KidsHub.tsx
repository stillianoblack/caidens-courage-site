import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourageHeader from '../components/CourageHeader';
import CourageFooter from '../components/CourageFooter';
import Button from '../components/ui/Button';
import HubCard from '../components/ecosystem/HubCard';
import useHashScroll from '../hooks/useHashScroll';

function KidsSection({
  id,
  title,
  description,
  comingSoon = false,
  cta,
}: {
  id?: string;
  title: string;
  description: string;
  comingSoon?: boolean;
  cta?: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-navy-100/60 py-12 last:border-b-0 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl">{title}</h2>
          {comingSoon ? (
            <span className="rounded-full bg-golden-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-golden-800">
              Coming Soon
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-base leading-relaxed text-navy-600 sm:text-lg">{description}</p>
        {cta ? <div className="mt-6">{cta}</div> : null}
      </div>
    </section>
  );
}

const KidsHub: React.FC = () => {
  useHashScroll();

  useEffect(() => {
    document.title = "Caiden's Courage Kids";
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFBF2] font-body">
      <CourageHeader />

      <section className="relative overflow-hidden border-b border-golden-500/20 bg-gradient-to-br from-[#FFF4D6] via-[#FFFBF2] to-[#E8F4FF]">
        <div className="pointer-events-none absolute -right-16 top-8 h-48 w-48 rounded-full bg-golden-500/20 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-14 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-golden-600">FOR KIDS</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-navy-500 sm:text-5xl">
            Caiden&apos;s Courage Kids
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-navy-600">
            Games, comics, and brave activities for kids learning to focus their flame.
          </p>
          <div className="mt-8">
            <Button variant="primary" size="lg" as={Link} to="/focus-flame-lab" leftIconSrc={null} className="w-full sm:w-auto">
              Enter Focus Flame Lab
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <KidsSection
            title="Focus Flame Lab"
            description="Practice focus, feelings, and brave choices through interactive story moments."
            cta={
              <Button variant="primary" size="lg" as={Link} to="/focus-flame-lab" leftIconSrc={null} className="w-full sm:w-auto">
                Play Focus Flame Lab
              </Button>
            }
          />

          <KidsSection
            id="comics"
            title="Comics"
            description="Short comic adventures that help kids explore courage, respect, focus, and feelings."
            comingSoon
          />

          <KidsSection
            id="coloring-pages"
            title="Coloring Pages"
            description="Printable pages for calm focus, creativity, and character connection."
            comingSoon
          />

          <KidsSection
            id="activities"
            title="Activities"
            description="Quick focus challenges, reflection prompts, and brave choice missions."
            comingSoon
          />

          <KidsSection
            title="Badges & Profiles"
            description="Soon, kids will be able to collect badges and track their Focus Flame progress."
            comingSoon
          />

          <section className="py-12 sm:py-14">
            <div className="mx-auto max-w-3xl rounded-3xl border-2 border-navy-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-2xl font-extrabold text-navy-500">Ask B-4</h2>
              <p className="mt-3 text-base text-navy-600 sm:text-lg">
                Need a focus reset? B-4 is here to help. Tap the <strong>Ask B-4</strong> button in the corner to chat
                anytime.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <img
                  src="/images/icons/B4_Chat_Icon.webp"
                  alt=""
                  className="h-12 w-12 object-contain"
                  decoding="async"
                  aria-hidden
                />
                <p className="text-sm text-navy-500">Look for the floating button at the bottom of your screen.</p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <HubCard
            accent="kids"
            title="Ready to play?"
            description="Jump into Focus Flame Lab and help Caiden navigate feelings, bravery, and focus."
            to="/focus-flame-lab"
          />
        </div>
      </section>

      <CourageFooter />
    </div>
  );
};

export default KidsHub;
