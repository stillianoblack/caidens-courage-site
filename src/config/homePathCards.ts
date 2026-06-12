import type { RelatedPathCard } from './personaPages';

/** Homepage "Choose Your Path" — reflects Caiden's Courage brand architecture. */
export const HOMEPAGE_PATH_CARDS: RelatedPathCard[] = [
  {
    title: 'Caiden Vale',
    eyebrow: 'Story World',
    description: 'Enter the world where the Focus Flame begins.',
    bullets: ['Graphic novel', 'Characters', 'Story world'],
    cta: 'Explore the Story',
    to: '/story',
    imageSrc: '/images/caidenscourage/Choose_your_path/caidenvale_card_1.webp',
    imageAlt: 'Caiden Vale story world',
  },
  {
    title: 'Brave Mind Club',
    eyebrow: 'Free Kids + Family Resources',
    description: 'Free activities, coloring pages, and B-4 tools for brave minds.',
    bullets: ['Coloring pages', 'B-4 Reset Tools', 'Printable activities'],
    cta: 'Visit Brave Mind Club',
    to: '/brave-mind-club',
    imageSrc: '/images/caidenscourage/Choose_your_path/kid_card.webp',
    imageAlt: 'Brave Mind Club activities for kids and families',
  },
  {
    title: 'Focus Flame Academy',
    eyebrow: 'Parents • Teachers • Camps • Schools',
    description: 'Story-powered SEL resources for families, classrooms, camps, and school communities.',
    bullets: ['SEL modules', 'Facilitator guides', 'Pilot materials'],
    cta: 'Explore Academy',
    to: '/camps',
    imageSrc: '/images/caidenscourage/Choose_your_path/superintendent_card.webp',
    imageAlt: 'Focus Flame Academy for camps and schools',
  },
  {
    title: 'Focus Flame Lab',
    eyebrow: 'Interactive Experiences',
    description: 'Interactive story-powered focus adventures for kids.',
    bullets: ['Focus practice', 'Feeling check-ins', 'Brave choices'],
    cta: 'Join the Pilot',
    to: '/focus-flame-lab',
    pilotInterest: 'focus_flame_lab',
    pilotBadge: true,
    imageSrc: '/images/caidenscourage/Choose_your_path/caidenvale_card.webp',
    imageAlt: 'Focus Flame Lab interactive adventure',
  },
];
