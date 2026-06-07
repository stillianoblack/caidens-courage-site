import { BMC_COLORING_PATH, FAMILY_PORTAL_PATH, KIDS_PORTAL_PATH, CAIDEN_QUEST_HUB_PATH } from '../config/courageRoutes';

export const FAMILY_PORTAL_BRAND = 'Family Portal';
export const FAMILY_PORTAL_SUBBRAND = 'FOCUS FLAME ACADEMY';
export const FAMILY_PORTAL_TAG = 'Blue Ribbon 2026 Family Access';
export const FAMILY_PORTAL_TITLE = 'Family Portal';

export type FamilySidebarNavId =
  | 'overview'
  | 'continue-learning'
  | 'characters'
  | 'games'
  | 'downloads'
  | 'gallery'
  | 'certificates'
  | 'guide';

export const FAMILY_SIDEBAR_NAV: Array<{
  id: FamilySidebarNavId;
  label: string;
  path: string;
  icon: FamilySidebarNavId;
}> = [
  { id: 'overview', label: 'Overview', path: FAMILY_PORTAL_PATH, icon: 'overview' },
  {
    id: 'continue-learning',
    label: 'Continue Learning',
    path: `${FAMILY_PORTAL_PATH}/continue-learning`,
    icon: 'continue-learning',
  },
  {
    id: 'characters',
    label: 'Character Hub',
    path: `${FAMILY_PORTAL_PATH}/characters`,
    icon: 'characters',
  },
  { id: 'games', label: 'Game Hub', path: `${FAMILY_PORTAL_PATH}/games`, icon: 'games' },
  { id: 'downloads', label: 'Downloads', path: `${FAMILY_PORTAL_PATH}/downloads`, icon: 'downloads' },
  { id: 'gallery', label: 'Gallery', path: `${FAMILY_PORTAL_PATH}/gallery`, icon: 'gallery' },
  {
    id: 'certificates',
    label: 'Certificates',
    path: `${FAMILY_PORTAL_PATH}/certificates`,
    icon: 'certificates',
  },
  { id: 'guide', label: 'Family Guide', path: `${FAMILY_PORTAL_PATH}/guide`, icon: 'guide' },
];

export const FAMILY_NAV_TITLE: Record<FamilySidebarNavId, string> = Object.fromEntries(
  FAMILY_SIDEBAR_NAV.map((item) => [item.id, item.label]),
) as Record<FamilySidebarNavId, string>;

export const FAMILY_OVERVIEW_KPIS = [
  { label: 'Current Week', value: 'Week 1' },
  { label: 'Activities Available', value: '8' },
  { label: 'Character Missions', value: '5' },
  { label: 'Progress', value: 'Getting Started', highlight: true },
] as const;

export const FAMILY_PROGRESS_ROWS: Array<{
  key: string;
  label: string;
  pct: number;
  tone: 'story' | 'reading' | 'focus' | 'creative' | 'overall';
}> = [
  { key: 'story', label: 'Story Activities', pct: 20, tone: 'story' },
  { key: 'reading', label: 'Reading Games', pct: 60, tone: 'reading' },
  { key: 'focus', label: 'Focus Moves', pct: 25, tone: 'focus' },
  { key: 'creative', label: 'Creative Activities', pct: 0, tone: 'creative' },
  { key: 'overall', label: 'Overall', pct: 35, tone: 'overall' },
];

export const FAMILY_RECENT_ACTIVITY = [
  'Miranda Mystery Files available',
  'B-4 Focus Lab available',
  'Coloring pages ready',
  'Family guide unlocked',
];

export const FAMILY_NEXT_STEP = {
  headline: "Start with Caiden's Focus Flame Journey",
  body: "Begin with Caiden's story, then explore Miranda's Mystery Files and B-4's focus activities.",
  cta: 'Continue Learning',
  href: CAIDEN_QUEST_HUB_PATH,
};

export type FamilyCharacterId = 'caiden' | 'miranda' | 'b4' | 'zeke';

export const CHARACTER_IMAGE_PATHS: Record<FamilyCharacterId, string | null> = {
  caiden: '/images/characters/caiden_photo_icon_game.webp',
  miranda: '/images/characters/miranda_photo_icon_game.webp',
  b4: '/images/characters/b-4_photo_icon_game.webp',
  zeke: null,
};

export const FAMILY_VALUE_CARDS = [
  {
    id: 'caiden-journey',
    characterId: 'caiden' as const,
    title: 'Help Caiden Build Focus',
    body: 'Practice planning, prioritizing, and bringing attention back.',
    imageSrc: CHARACTER_IMAGE_PATHS.caiden!,
    cta: "Start Caiden's Journey",
    href: CAIDEN_QUEST_HUB_PATH,
  },
  {
    id: 'miranda-reading',
    characterId: 'miranda' as const,
    title: 'Practice Reading with Miranda',
    body: 'Solve mysteries while building vocabulary, comprehension, and inference skills.',
    imageSrc: CHARACTER_IMAGE_PATHS.miranda!,
    cta: 'Open Mystery Files',
    href: `${KIDS_PORTAL_PATH}/miranda`,
  },
  {
    id: 'b4-checkin',
    characterId: 'b4' as const,
    title: 'Check In with B-4',
    body: 'Explore feelings, focus moves, and brave choices with B-4.',
    imageSrc: CHARACTER_IMAGE_PATHS.b4!,
    cta: 'Start B-4 Check-In',
    href: `${KIDS_PORTAL_PATH}/b4/check-in`,
  },
] as const;

export const CHARACTER_ASSETS: Record<
  FamilyCharacterId,
  { imageSrc: string | null; theme: FamilyCharacterId }
> = {
  caiden: { imageSrc: CHARACTER_IMAGE_PATHS.caiden, theme: 'caiden' },
  miranda: { imageSrc: CHARACTER_IMAGE_PATHS.miranda, theme: 'miranda' },
  b4: { imageSrc: CHARACTER_IMAGE_PATHS.b4, theme: 'b4' },
  zeke: { imageSrc: null, theme: 'zeke' },
};

export type FamilyCharacterCard = {
  id: FamilyCharacterId;
  title: string;
  description: string;
  status: string;
  statusTone: 'available' | 'locked' | 'complete' | 'review';
  cta: string;
  href: string;
};

export const FAMILY_CHARACTERS: FamilyCharacterCard[] = [
  {
    id: 'caiden',
    title: "Caiden's Focus Flame Journey",
    description: 'Follow Caiden\'s story and discover how focus becomes power.',
    status: 'Main Character',
    statusTone: 'complete',
    cta: 'Start Journey',
    href: CAIDEN_QUEST_HUB_PATH,
  },
  {
    id: 'miranda',
    title: "Miranda's Mystery Files",
    description: 'Read clues, solve mysteries, and build vocabulary and comprehension skills.',
    status: '5 Cases Available',
    statusTone: 'available',
    cta: 'Open Mystery Files',
    href: `${KIDS_PORTAL_PATH}/miranda`,
  },
  {
    id: 'b4',
    title: 'B-4 Focus Missions',
    description: 'Practice focus moves, feelings check-ins, and brave choices.',
    status: 'Available',
    statusTone: 'available',
    cta: 'Start Mission',
    href: `${KIDS_PORTAL_PATH}/b4`,
  },
  {
    id: 'zeke',
    title: "Zeke's Logic Lab",
    description: 'Solve patterns, puzzles, and critical-thinking challenges.',
    status: 'Coming Soon',
    statusTone: 'locked',
    cta: 'Preview',
    href: `${KIDS_PORTAL_PATH}/zeke`,
  },
];

export type FamilyGameCard = {
  characterId: FamilyCharacterId;
  title: string;
  description: string;
  cta: string;
  href: string;
};

export const FAMILY_GAMES: FamilyGameCard[] = [
  {
    characterId: 'caiden',
    title: 'Focus Flame Lab',
    description: "Caiden's Focus Flame Journey — interactive story moments to practice focus and courage.",
    cta: 'Open Journey',
    href: CAIDEN_QUEST_HUB_PATH,
  },
  {
    characterId: 'miranda',
    title: "Miranda's Mystery Files",
    description: 'Detective reading games with clues, cases, and vocabulary challenges.',
    cta: 'Open Mystery Files',
    href: `${KIDS_PORTAL_PATH}/miranda`,
  },
  {
    characterId: 'b4',
    title: 'B-4 Focus Missions',
    description: 'Focus moves, feelings check-ins, and brave choices with B-4.',
    cta: 'Start Mission',
    href: `${KIDS_PORTAL_PATH}/b4`,
  },
  {
    characterId: 'zeke',
    title: "Zeke's Logic Lab",
    description: 'Patterns, puzzles, and critical-thinking challenges.',
    cta: 'Preview',
    href: `${KIDS_PORTAL_PATH}/zeke`,
  },
];

export type FamilyDownloadCard = {
  title: string;
  description: string;
  cta: string;
  href: string;
  comingSoon?: boolean;
};

export const FAMILY_DOWNLOADS: FamilyDownloadCard[] = [
  {
    title: 'Family Guide',
    description: 'Discussion prompts and activity instructions for home learning.',
    cta: 'Open Guide',
    href: `${FAMILY_PORTAL_PATH}/guide`,
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
    href: `${FAMILY_PORTAL_PATH}/downloads`,
    comingSoon: true,
  },
  {
    title: 'Certificates',
    description: 'Celebrate progress with printable courage certificates.',
    cta: 'View Certificates',
    href: `${FAMILY_PORTAL_PATH}/certificates`,
  },
];

export const FAMILY_CONTINUE_LEARNING: Array<{
  characterId: FamilyCharacterId;
  title: string;
  description: string;
  cta: string;
  href: string;
  status?: string;
  statusTone?: 'available' | 'locked' | 'complete' | 'review';
}> = [
  {
    characterId: 'caiden',
    title: "Caiden's Focus Flame Journey",
    description: 'Start with Caiden\'s story and discover how focus becomes power.',
    cta: 'Start Journey',
    href: CAIDEN_QUEST_HUB_PATH,
    status: 'Main Character',
    statusTone: 'complete',
  },
  {
    characterId: 'miranda',
    title: "Miranda's Mystery Files",
    description: 'Pick a case and practice reading clues together.',
    cta: 'Open Mystery Files',
    href: `${KIDS_PORTAL_PATH}/miranda`,
    status: '5 Cases Available',
    statusTone: 'available',
  },
  {
    characterId: 'b4',
    title: 'B-4 Focus Missions',
    description: 'Try focus moves and feelings check-ins with B-4.',
    cta: 'Start Mission',
    href: `${KIDS_PORTAL_PATH}/b4`,
    status: 'Available',
    statusTone: 'available',
  },
];
