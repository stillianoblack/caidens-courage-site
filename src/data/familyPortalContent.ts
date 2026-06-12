import {
  BMC_COLORING_PATH,
  FAMILY_DR_VICTORIA_MISSION_BASE,
  FAMILY_HUB_PATH,
  FAMILY_PORTAL_PATH,
  KIDS_PORTAL_PATH,
} from '../config/courageRoutes';
import { DR_VICTORIA_GUIDE_SRC, UNCLE_T_GUIDE_SRC } from './adult/sharedAssets';
import { FAMILY_UNCLE_T_MISSION_BASE } from '../config/courageRoutes';
import type { ActivityCategoryId, AdultTrainingCard } from './pilotDashboardContent';
import { countAvailableCharlieMissions } from './charlie';
import { countAvailableB4Missions } from './b4';
import { countAvailableZekeMissions } from './zeke';
import { CAIDEN_QUEST_RANK } from './caiden/missionBoardData';
import { readActivePilotProgram, resolveProgramDashboardBrand } from '../config/activePilotProgram';
import type { CharacterProfileId } from './characterProfiles';

export const FAMILY_PORTAL_BRAND = 'Family Portal';
export const FAMILY_PORTAL_SUBBRAND = 'FOCUS FLAME ACADEMY';
export const FAMILY_PORTAL_TAG = 'Blue Ribbon 2026 Family Access';
export const FAMILY_PORTAL_TITLE = 'Family Portal';

export type FamilySidebarNavId =
  | 'overview'
  | 'results'
  | 'continue-learning'
  | 'character-hub'
  | 'downloads'
  | 'gallery'
  | 'certificates'
  | 'guide';

export type FamilySidebarNavItem = {
  id: FamilySidebarNavId;
  label: string;
  path: string;
  icon: FamilySidebarNavId;
};

function buildFamilySidebarNav(basePath: string): FamilySidebarNavItem[] {
  return [
    { id: 'overview', label: 'Home', path: basePath, icon: 'overview' },
    {
      id: 'continue-learning',
      label: 'Weekly Adventures',
      path: `${basePath}/continue-learning`,
      icon: 'continue-learning',
    },
    {
      id: 'character-hub',
      label: 'Character Hub',
      path: `${basePath}/characters`,
      icon: 'character-hub',
    },
    { id: 'downloads', label: 'Parent Resources', path: `${basePath}/downloads`, icon: 'downloads' },
    { id: 'guide', label: 'Parent Corner', path: `${basePath}/guide`, icon: 'guide' },
    { id: 'gallery', label: 'Gallery', path: `${basePath}/gallery`, icon: 'gallery' },
    {
      id: 'certificates',
      label: 'Certificates',
      path: `${basePath}/certificates`,
      icon: 'certificates',
    },
  ];
}

/** Blue Ribbon backup family portal navigation. */
export const FAMILY_SIDEBAR_NAV = buildFamilySidebarNav(FAMILY_PORTAL_PATH);

/** Program family hub navigation (/family-hub). */
export const PROGRAM_FAMILY_SIDEBAR_NAV = buildFamilySidebarNav(FAMILY_HUB_PATH);

export function resolveFamilyPortalBrand(isProgramHub: boolean): { title: string; subtitle: string } {
  const program = readActivePilotProgram();
  if (program?.programName) {
    return {
      title: program.programName,
      subtitle: 'Focus Flame Academy',
    };
  }
  if (isProgramHub) {
    return resolveProgramDashboardBrand(null);
  }
  return {
    title: FAMILY_PORTAL_BRAND,
    subtitle: FAMILY_PORTAL_SUBBRAND,
  };
}

export const FAMILY_PAGE_SUBTITLES: Partial<Record<FamilySidebarNavId, string>> = {
  guide: 'Guides, discussion tools, and adult learning activities for supporting kids at home.',
  downloads: 'Parent-friendly activities, printables, and calm-down tools to try at home.',
};

export type FamilyParentResourceCategoryId =
  | 'try-at-home'
  | 'printable-activities'
  | 'coloring-pages'
  | 'reflection-journals'
  | 'b4-reset-tools';

export const FAMILY_PARENT_RESOURCE_CATEGORIES: Array<{
  id: FamilyParentResourceCategoryId;
  label: string;
  activityCategory: ActivityCategoryId;
}> = [
  { id: 'try-at-home', label: 'Try at Home', activityCategory: 'weekly-activities' },
  { id: 'printable-activities', label: 'Printables', activityCategory: 'printable-activities' },
  { id: 'coloring-pages', label: 'Coloring Pages', activityCategory: 'coloring-pages' },
  { id: 'reflection-journals', label: 'Reflection Prompts', activityCategory: 'reflection-journals' },
  { id: 'b4-reset-tools', label: 'Calm-Down Tools', activityCategory: 'b4-reset-tools' },
];

export const FAMILY_NAV_TITLE: Record<FamilySidebarNavId, string> = {
  overview: 'Home',
  results: 'Results',
  'continue-learning': 'Weekly Adventures',
  'character-hub': 'Character Hub',
  downloads: 'Parent Resources',
  gallery: 'Gallery',
  certificates: 'Certificates',
  guide: 'Parent Corner',
};

export const FAMILY_OVERVIEW_KPIS = [
  { label: 'Current Week', value: 'Week 1' },
  { label: 'Activities Available', value: '8' },
  { label: 'Character Missions', value: '5' },
  { label: 'Progress', value: 'Getting Started', highlight: true },
] as const;

/** @deprecated Use computeFamilyProgressSnapshot() — kept for label reference only. */
export const FAMILY_PROGRESS_ROWS = [] as Array<{
  key: string;
  label: string;
  pct: number;
  tone: 'story' | 'reading' | 'focus' | 'creative' | 'overall';
}>;

export const FAMILY_PARENT_CORNER_INTRO = {
  title: 'Parent Corner',
  subtitle:
    'Guides, discussion tools, and adult learning activities for supporting kids at home.',
} as const;

export const FAMILY_PARENT_CORNER_CARDS: AdultTrainingCard[] = [
  {
    title: 'Dr. Victoria Learning Hub',
    mission: 'Adult Learning Track',
    description:
      'Short parent-friendly training missions for supporting focus, feelings, and different learning needs at home.',
    audience: 'Parents, Teachers, Counselors, Camp Staff',
    badge: '5 Missions Available',
    cta: 'Open Parent Training',
    href: FAMILY_DR_VICTORIA_MISSION_BASE,
    imageSrc: DR_VICTORIA_GUIDE_SRC,
    available: true,
    theme: 'victoria',
  },
  {
    title: 'Uncle T Coaching Hub',
    mission: 'Adult Learning Track',
    description:
      'Short coaching lessons for encouraging kids through everyday challenges.',
    audience: 'Parents, Teachers, Counselors, Camp Staff',
    badge: '3 Missions Available',
    cta: 'Open Coaching Hub',
    href: FAMILY_UNCLE_T_MISSION_BASE,
    imageSrc: UNCLE_T_GUIDE_SRC,
    available: true,
    theme: 'uncle-t',
  },
];

export const FAMILY_NEXT_STEP = {
  headline: "Start with Caiden's Focus Flame Journey",
  body: "Begin with Caiden's story, then explore Miranda's Mystery Files and B-4's focus activities.",
  cta: 'Continue Learning',
  hrefPath: '/caiden',
};

export type FamilyCharacterId = CharacterProfileId;

export const CHARACTER_IMAGE_PATHS: Record<FamilyCharacterId, string | null> = {
  caiden: '/images/characters/caiden_photo_icon_game.webp',
  miranda: '/images/characters/miranda_photo_icon_game.webp',
  b4: '/images/characters/b-4_photo_icon_game.webp',
  charlie: '/images/characters/charlieperk_photo_icon_game.webp',
  zeke: '/images/characters/zeke_photo_icon_game.webp',
  'dr-victoria': DR_VICTORIA_GUIDE_SRC,
  'uncle-t': UNCLE_T_GUIDE_SRC,
};

export type FamilyCharacterCard = {
  id: FamilyCharacterId;
  title: string;
  description: string;
  status: string;
  statusTone: 'available' | 'locked' | 'complete' | 'review';
  cta: string;
  href: string;
  skillTags: string;
};

export const CHARACTER_HUB_PAGE = {
  title: 'Meet the Characters',
  subtitle:
    'Discover the heroes, guides, and friends who help kids build focus, courage, curiosity, and confidence throughout Focus Flame Academy.',
} as const;

export const CHARACTER_HUB_KIDS_SECTION = {
  title: "Kids' Characters",
  description:
    'Characters kids will meet through stories, games, adventures, and missions.',
} as const;

export const CHARACTER_HUB_ADULT_SECTION = {
  title: 'Adult Guides',
  description:
    'Trusted mentors who help families, educators, and caregivers support children along the journey.',
} as const;

function buildCharacterHubCard(
  shellBasePath: string,
  card: Omit<FamilyCharacterCard, 'href'>,
): FamilyCharacterCard {
  return {
    ...card,
    href: `${shellBasePath}/characters/${card.id}`,
  };
}

function buildKidsCharacterCards(shellBasePath: string): FamilyCharacterCard[] {
  return [
    buildCharacterHubCard(shellBasePath, {
      id: 'caiden',
      title: 'Caiden',
      description: 'Follow Caiden\'s story and discover how focus becomes power.',
      status: CAIDEN_QUEST_RANK.statusLine,
      statusTone: 'available',
      cta: 'Meet Caiden',
      skillTags: 'Focus • Courage • Executive Function',
    }),
    buildCharacterHubCard(shellBasePath, {
      id: 'miranda',
      title: 'Miranda',
      description: 'Read clues, solve mysteries, and build vocabulary and comprehension skills.',
      status: '5 Cases Available',
      statusTone: 'available',
      cta: 'Meet Miranda',
      skillTags: 'Reading • Vocabulary • Problem Solving',
    }),
    buildCharacterHubCard(shellBasePath, {
      id: 'b4',
      title: 'B-4',
      description: 'Practice focus moves, feelings check-ins, and brave choices.',
      status: `${countAvailableB4Missions()} Missions Available`,
      statusTone: 'available',
      cta: 'Meet B-4',
      skillTags: 'Feelings • SEL • Self-Regulation',
    }),
    buildCharacterHubCard(shellBasePath, {
      id: 'charlie',
      title: 'Charlie Perk',
      description: 'Explore outdoor clues, animal facts, camp safety, and funny SEL moments with Charlie.',
      status: `${countAvailableCharlieMissions()} Missions Available`,
      statusTone: 'available',
      cta: 'Meet Charlie',
      skillTags: 'Nature • Safety • Curiosity',
    }),
    buildCharacterHubCard(shellBasePath, {
      id: 'zeke',
      title: 'Zeke',
      description: 'Practice courage, teamwork, and speaking up with Zeke.',
      status: `${countAvailableZekeMissions()} Missions Available`,
      statusTone: 'available',
      cta: 'Meet Zeke',
      skillTags: 'Social Skills • Teamwork • Courage',
    }),
  ];
}

function buildAdultGuideCards(shellBasePath: string): FamilyCharacterCard[] {
  return [
    buildCharacterHubCard(shellBasePath, {
      id: 'dr-victoria',
      title: 'Dr. Victoria',
      description: 'Adult learning missions for understanding different minds and supporting kids at home.',
      status: '5 Missions Available',
      statusTone: 'available',
      cta: 'Meet Dr. Victoria',
      skillTags: 'Educator Support • ADHD Awareness • Family Learning',
    }),
    buildCharacterHubCard(shellBasePath, {
      id: 'uncle-t',
      title: 'Uncle T',
      description: 'Coaching lessons for encouragement, resilience, and brave choices at home.',
      status: '3 Missions Available',
      statusTone: 'available',
      cta: 'Meet Uncle T',
      skillTags: 'Confidence • Resilience • Coaching',
    }),
  ];
}

export function buildFamilyKidsCharacters(shellBasePath: string): FamilyCharacterCard[] {
  return buildKidsCharacterCards(shellBasePath);
}

export function buildFamilyAdultGuides(shellBasePath: string): FamilyCharacterCard[] {
  return buildAdultGuideCards(shellBasePath);
}

/** @deprecated Use buildFamilyKidsCharacters + buildFamilyAdultGuides */
export function buildFamilyCharacters(shellBasePath: string): FamilyCharacterCard[] {
  return [...buildKidsCharacterCards(shellBasePath), ...buildAdultGuideCards(shellBasePath)];
}

export const FAMILY_CHARACTERS = buildFamilyCharacters(FAMILY_PORTAL_PATH);

export function buildFamilyValueCards(kidsBasePath: string) {
  return [
    {
      id: 'caiden-journey',
      characterId: 'caiden' as const,
      title: 'Help Caiden Build Focus',
      body: 'Practice planning, prioritizing, and bringing attention back.',
      imageSrc: CHARACTER_IMAGE_PATHS.caiden!,
      cta: "Start Caiden's Journey",
      href: `${kidsBasePath}/caiden`,
    },
    {
      id: 'miranda-reading',
      characterId: 'miranda' as const,
      title: 'Practice Reading with Miranda',
      body: 'Solve mysteries while building vocabulary, comprehension, and inference skills.',
      imageSrc: CHARACTER_IMAGE_PATHS.miranda!,
      cta: 'Open Mystery Files',
      href: `${kidsBasePath}/miranda`,
    },
    {
      id: 'b4-checkin',
      characterId: 'b4' as const,
      title: 'Check In with B-4',
      body: 'Explore feelings, focus moves, and brave choices with B-4.',
      imageSrc: CHARACTER_IMAGE_PATHS.b4!,
      cta: 'Start B-4 Check-In',
      href: `${kidsBasePath}/b4/check-in`,
    },
  ] as const;
}

export function buildFamilyContinueLearning(kidsBasePath: string) {
  return [
    {
      characterId: 'caiden' as const,
      title: "Caiden's Focus Flame Journey",
      description: 'Start with Caiden\'s story and discover how focus becomes power.',
      cta: 'Start Journey',
      href: `${kidsBasePath}/caiden`,
      status: 'Main Character',
      statusTone: 'complete' as const,
    },
    {
      characterId: 'miranda' as const,
      title: "Miranda's Mystery Files",
      description: 'Pick a case and practice reading clues together.',
      cta: 'Open Mystery Files',
      href: `${kidsBasePath}/miranda`,
      status: '5 Cases Available',
      statusTone: 'available' as const,
    },
    {
      characterId: 'b4' as const,
      title: 'B-4 Focus Missions',
      description: 'Try focus moves and feelings check-ins with B-4.',
      cta: 'Start Mission',
      href: `${kidsBasePath}/b4`,
      status: 'Available',
      statusTone: 'available' as const,
    },
  ];
}

export const CHARACTER_ASSETS: Record<
  FamilyCharacterId,
  { imageSrc: string | null; theme: FamilyCharacterId }
> = {
  caiden: { imageSrc: CHARACTER_IMAGE_PATHS.caiden, theme: 'caiden' },
  miranda: { imageSrc: CHARACTER_IMAGE_PATHS.miranda, theme: 'miranda' },
  b4: { imageSrc: CHARACTER_IMAGE_PATHS.b4, theme: 'b4' },
  charlie: { imageSrc: CHARACTER_IMAGE_PATHS.charlie, theme: 'charlie' },
  zeke: { imageSrc: null, theme: 'zeke' },
  'dr-victoria': { imageSrc: CHARACTER_IMAGE_PATHS['dr-victoria'], theme: 'dr-victoria' },
  'uncle-t': { imageSrc: CHARACTER_IMAGE_PATHS['uncle-t'], theme: 'uncle-t' },
};

export type FamilyDownloadCard = {
  title: string;
  description: string;
  cta: string;
  href: string;
  comingSoon?: boolean;
};

export const FAMILY_DOWNLOADS: FamilyDownloadCard[] = [
  {
    title: 'Parent Corner',
    description: 'Adult learning activities and discussion tools for supporting kids at home.',
    cta: 'Open Parent Corner',
    href: `${FAMILY_HUB_PATH}/guide`,
  },
  {
    title: 'Coloring Pages',
    description: 'Print and color brave characters and story scenes.',
    cta: 'View Pages',
    href: BMC_COLORING_PATH,
  },
  {
    title: 'Printable Activities',
    description: 'Hands-on worksheets and creative activities for families.',
    cta: 'Browse Activities',
    href: `${FAMILY_HUB_PATH}/downloads`,
    comingSoon: true,
  },
  {
    title: 'Certificates',
    description: 'Celebrate progress with printable courage certificates.',
    cta: 'View Certificates',
    href: `${FAMILY_HUB_PATH}/certificates`,
  },
];

export const FAMILY_CONTINUE_LEARNING = buildFamilyContinueLearning(KIDS_PORTAL_PATH);
