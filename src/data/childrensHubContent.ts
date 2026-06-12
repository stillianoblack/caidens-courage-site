import {
  BMC_ACTIVITIES_PATH,
  BMC_COLORING_PATH,
  FAMILY_HUB_KIDS_BASE,
  FOCUS_FLAME_LAB_PATH,
  KIDS_PORTAL_PATH,
} from '../config/courageRoutes';

export type ChildrensHubLink = {
  id: string;
  title: string;
  description: string;
  cta: string;
  href: string;
};

export const CHILDRENS_HUB_INTRO = {
  title: "Children\u2019s Hub",
  subtitle: 'Character games, Focus Flame Lab, coloring pages, and kid activities in one place.',
};

export function buildChildrensHubLinks(kidsBasePath: string): ChildrensHubLink[] {
  return [
    {
      id: 'caiden',
      title: "Caiden's Focus Flame Journey",
      description: 'Story quests for planning, focus, and brave choices.',
      cta: 'Open Caiden Quests',
      href: `${kidsBasePath}/caiden`,
    },
    {
      id: 'miranda',
      title: "Miranda's Mystery Files",
      description: 'Reading mysteries with clues, vocabulary, and comprehension.',
      cta: 'Open Mystery Files',
      href: `${kidsBasePath}/miranda`,
    },
    {
      id: 'b4',
      title: 'B-4 Focus Missions',
      description: 'Feelings check-ins, focus moves, and brave choices with B-4.',
      cta: 'Open B-4 Missions',
      href: `${kidsBasePath}/b4`,
    },
    {
      id: 'charlie',
      title: "Charlie Perk\u2019s Science Lab",
      description: 'Science experiments, observation missions, and clever problem solving with Charlie.',
      cta: 'Open Science Lab',
      href: `${kidsBasePath}/charlie`,
    },
    {
      id: 'zeke',
      title: "Zeke's Team Quest",
      description: 'Practice courage, teamwork, and speaking up with Zeke.',
      cta: 'Open Team Quest',
      href: `${kidsBasePath}/zeke`,
    },
    {
      id: 'focus-flame-lab',
      title: 'Focus Flame Lab',
      description: 'Interactive story moments to practice focus and courage.',
      cta: 'Open Focus Flame Lab',
      href: FOCUS_FLAME_LAB_PATH,
    },
    {
      id: 'coloring',
      title: 'Coloring Pages',
      description: 'Print and color brave characters and story scenes.',
      cta: 'Browse Coloring Pages',
      href: BMC_COLORING_PATH,
    },
    {
      id: 'activities',
      title: 'Kid Activities',
      description: 'Printables, reflection tools, and courage-building activities.',
      cta: 'Explore Activities',
      href: BMC_ACTIVITIES_PATH,
    },
  ];
}

export const PORTAL_KIDS_BASE = KIDS_PORTAL_PATH;
export { FAMILY_HUB_KIDS_BASE };

export const CHILDRENS_HUB_LINKS = buildChildrensHubLinks(PORTAL_KIDS_BASE);
