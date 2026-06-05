import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourageHeader from '../components/courage/CourageHeader';
import CourageFooter from '../components/courage/CourageFooter';
import KidsHubCard from '../components/courage/KidsHubCard';
import SectionHero from '../components/courage/SectionHero';
import Button from '../components/ui/Button';
import { FOCUS_FLAME_LAB_PATH } from '../config/courageNav';
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
        <div className="mx-auto flex max-w-5xl flex-col gap-5 sm:gap-6 lg:gap-7">
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
                to="/braveminds?type=coloring"
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
              <Button variant="secondary" size="lg" as={Link} to="/braveminds#kids" className="w-full sm:w-auto">
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
            description="Need a focus reset? Try B-4 Reset Tools or tap Ask B-4 in the corner to chat anytime."
            imageSrc="/images/characters/B4_Robot_Hero.webp"
            imageAlt="B-4 robot companion"
            imageFit="contain"
            imagePosition="center bottom"
            cta={
              <Button variant="primary" size="lg" as={Link} to="/b4-tools" className="w-full sm:w-auto">
                Open B-4 Reset Tools
              </Button>
            }
            footerNote={
              <div className="flex items-center gap-3">
                <img
                  src="/images/icons/B4_Chat_Icon.webp"
                  alt=""
                  className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                  decoding="async"
                  aria-hidden
                />
                <p className="text-sm text-navy-500">Or use the floating Ask B-4 button on this site.</p>
              </div>
            }
          />

          <KidsHubCard
            title="Join Brave Mind Club"
            description="Browse the full library of free printables, worksheets, and activities for kids, parents, and educators."
            imageSrc="/images/caidenscourage/backgrounds/community-strategy-story-bg.webp"
            imageAlt="Brave Mind Club community and printable resources"
            cta={
              <Button variant="secondary" size="lg" as={Link} to="/braveminds#kids" className="w-full sm:w-auto">
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
      </section>

      <CourageFooter />
    </div>
  );
};

export default KidsHub;
