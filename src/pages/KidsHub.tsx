import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourageHeader from '../components/courage/CourageHeader';
import CourageFooter from '../components/courage/CourageFooter';
import KidsHubCard from '../components/courage/KidsHubCard';
import SectionHero from '../components/courage/SectionHero';
import Button from '../components/ui/Button';
import { BMC_RESET_TOOLS_PATH, BRAVE_MIND_CLUB_PATH, FOCUS_FLAME_LAB_PATH } from '../config/courageRoutes';
import useHashScroll from '../hooks/useHashScroll';

const KidsHub: React.FC = () => {
  useHashScroll();

  useEffect(() => {
    document.title = "Caiden's Courage Kids";
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F7] font-body">
      <CourageHeader />

      <SectionHero
        variant="kids"
        eyebrow="For Kids"
        titleAccent="Caiden's Courage"
        title="Kids"
        description="Play in Focus Flame Lab, explore Brave Mind Club activities, and reset with B-4 — your kid-facing hub for courage and focus."
        ctaLabel="Enter Focus Flame Lab"
        ctaHref={FOCUS_FLAME_LAB_PATH}
      />

      <section className="cc-kids-hub-list px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 rounded-2xl border border-navy-100 bg-white px-6 py-5 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6 sm:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-500/80">For Parents</p>
              <p className="mt-1 font-display text-lg font-bold text-navy-600 sm:text-xl">
                Explore family tools for focus, feelings, and courage at home.
              </p>
            </div>
            <Button variant="secondary" size="md" as={Link} to="/parents" className="mt-4 w-full shrink-0 sm:mt-0 sm:w-auto">
              Parents: explore family tools
            </Button>
          </div>

          <div className="flex flex-col gap-5 sm:gap-6 lg:gap-7">
          <KidsHubCard
            title="Train Your Focus"
            description="Practice focus, feelings, and brave choices through interactive story moments."
            imageSrc="/images/caidenscourage/backgrounds/chooseyournextadvernture.webp"
            imageAlt="Choose your next Focus Flame Lab adventure"
            cta={
              <Button
                variant="primary"
                size="lg"
                as={Link}
                to={FOCUS_FLAME_LAB_PATH}
                leftIconSrc={null}
                className="w-full sm:w-auto"
              >
                Play Focus Flame Lab
              </Button>
            }
          />

          {/* TODO(thumbnail): Replace with dedicated kids comics preview when available */}
          <KidsHubCard
            id="comics"
            title="Read Brave Stories"
            description="Short comic adventures that help kids explore courage, respect, focus, and feelings."
            imageSrc="/images/comic-book/Comic5_Coverpage_header_2.jpg"
            imageAlt="Caiden's Courage comic cover preview"
            comingSoon
          />

          <KidsHubCard
            id="coloring-pages"
            title="Coloring Pages"
            description="Printable pages from Brave Mind Club for calm focus, creativity, and character connection."
            imageSrc="/images/gallery/Caiden_Coloredpage.webp"
            imageAlt="Brave Mind Club coloring page preview"
            cta={
              <Button
                variant="secondary"
                size="lg"
                as={Link}
                to={`${BRAVE_MIND_CLUB_PATH}?type=coloring`}
                className="w-full sm:w-auto"
              >
                Browse coloring pages
              </Button>
            }
          />

          <KidsHubCard
            id="activities"
            title="Choose a Courage Mission"
            description="Quick focus challenges, reflection prompts, and brave choice missions from Brave Mind Club."
            imageSrc="/images/camp-courage/stackworksheets.webp"
            imageAlt="Brave Mind Club activity worksheets stack"
            imageFit="contain"
            imagePosition="center"
            cta={
              <Button variant="secondary" size="lg" as={Link} to={`${BRAVE_MIND_CLUB_PATH}#kids`} className="w-full sm:w-auto">
                Start a Mission
              </Button>
            }
          />

          <KidsHubCard
            title="Earn Your Flame Badge"
            description="Soon, kids will be able to collect badges and track their Focus Flame progress."
            imageSrc="/images/caidenscourage/backgrounds/certificate.webp"
            imageAlt="Courage certificate and badge preview"
            comingSoon
          />

          <KidsHubCard
            title="Get a B-4 Reset"
            description="Need a focus reset? Open B-4 Reset Tools for quick focus and feelings activities."
            imageSrc="/images/characters/B4_Robot_Hero.webp"
            imageAlt="B-4 robot companion"
            imageFit="contain"
            imagePosition="center bottom"
            cta={
              <Button variant="primary" size="lg" as={Link} to={BMC_RESET_TOOLS_PATH} className="w-full sm:w-auto">
                Open B-4 Reset Tools
              </Button>
            }
          />

          <KidsHubCard
            title="Join Brave Mind Club"
            description="Browse the full library of free printables, worksheets, and activities for kids, parents, and educators."
            imageSrc="/images/caidenscourage/backgrounds/community-strategy-story-bg.webp"
            imageAlt="Brave Mind Club community and printable resources"
            cta={
              <Button variant="secondary" size="lg" as={Link} to={`${BRAVE_MIND_CLUB_PATH}#kids`} className="w-full sm:w-auto">
                Join the Club
              </Button>
            }
          />

          <KidsHubCard
            title="Ready to play?"
            description="Jump into Focus Flame Lab and help Caiden navigate feelings, bravery, and focus."
            imageSrc="/images/focus-flame-lab/themove_intro_image.webp"
            imageAlt="Focus Flame Lab gameplay preview"
            featured
            cta={
              <Button
                variant="primary"
                size="lg"
                as={Link}
                to={FOCUS_FLAME_LAB_PATH}
                leftIconSrc={null}
                className="w-full sm:w-auto"
              >
                Enter Focus Flame Lab
              </Button>
            }
          />
          </div>
        </div>
      </section>

      <CourageFooter />
    </div>
  );
};

export default KidsHub;
