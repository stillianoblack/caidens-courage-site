import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourageHeader from '../components/courage/CourageHeader';
import CourageFooter from '../components/courage/CourageFooter';
import SectionHero from '../components/courage/SectionHero';
import Button from '../components/ui/Button';
import {
  STORY_BOOKS_PATH,
  STORY_CHARACTERS_PATH,
} from '../config/courageRoutes';

const STORY_CARDS = [
  {
    title: 'Caiden Vale',
    description: 'Explore the story world where Caiden discovers the Focus Flame.',
    cta: 'Meet Caiden Vale',
    to: '/world',
    imageSrc: '/images/caidenscourage/Choose_your_path/caidenvale_card_1.webp',
  },
  {
    title: 'Characters',
    description: 'Meet Caiden, B-4, Genesis, and the allies who help brave minds find their flame.',
    cta: 'View Characters',
    to: STORY_CHARACTERS_PATH,
    imageSrc: '/images/characters/Caiden_img_profile.webp',
  },
  {
    title: 'Books',
    description: 'The graphic novel adventure that powers Focus Flame Academy and Brave Mind Club.',
    cta: 'Explore Books',
    to: STORY_BOOKS_PATH,
    imageSrc: '/images/comic-book/Comic5_Coverpage_header_2.jpg',
  },
] as const;

export default function StoryHub() {
  useEffect(() => {
    document.title = "Caiden Vale Story World | Caiden's Courage";
  }, []);

  return (
    <div className="min-h-screen bg-cream font-body">
      <CourageHeader />

      <SectionHero
        eyebrow="Caiden Vale"
        title="Story World"
        description="Enter the world where the Focus Flame begins — a graphic novel adventure about focus, courage, and different minds."
        supportingText="Caiden Vale is the story world behind Caiden's Courage™, Brave Mind Club, Focus Flame Lab, and Focus Flame Academy."
      >
        <Button variant="primary" size="lg" as={Link} to={STORY_BOOKS_PATH} leftIconSrc={null} className="w-full sm:w-auto">
          Explore the Graphic Novel
        </Button>
      </SectionHero>

      <section className="cc-schools-section scroll-mt-24">
        <div className="cc-courage-header-shell sm:px-6 lg:px-8">
          <div className="cc-site-container mx-auto">
            <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl">Explore the story</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {STORY_CARDS.map((card) => (
                <Link
                  key={card.title}
                  to={card.to}
                  className="group flex flex-col overflow-hidden rounded-3xl border-2 border-navy-100 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-navy-100">
                    <img
                      src={card.imageSrc}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-xl font-bold text-navy-500">{card.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600 sm:text-base">{card.description}</p>
                    <span className="mt-4 text-sm font-semibold text-golden-700 group-hover:text-golden-800">{card.cta} →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CourageFooter />
    </div>
  );
}
