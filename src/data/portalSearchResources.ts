import {
  B4_BASELINE_CHECK_PATH,
  CAIDEN_QUEST_HUB_PATH,
  FACILITATOR_B4_RESULTS_PATH,
  FACILITATOR_PORTAL_PATH,
  FAMILY_PORTAL_PATH,
  KIDS_PORTAL_PATH,
} from '../config/courageRoutes';

export type PortalSearchPortal = 'family' | 'facilitator';

export type PortalSearchResource = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  character?: string;
  href: string;
  /** Call ensureFamilyPortalAccess before navigating (kids routes from facilitator). */
  grantFamilyAccess?: boolean;
};

function facilitatorHash(section: string): string {
  return `${FACILITATOR_PORTAL_PATH}#${section}`;
}

export const FAMILY_PORTAL_SEARCH_RESOURCES: PortalSearchResource[] = [
  {
    id: 'family-overview',
    title: 'Overview',
    description: 'Family dashboard with progress and next steps',
    category: 'Navigation',
    tags: ['home', 'dashboard', 'family'],
    href: FAMILY_PORTAL_PATH,
  },
  {
    id: 'family-continue',
    title: 'Continue Learning',
    description: 'Pick up where your learner left off',
    category: 'Navigation',
    tags: ['learning', 'progress', 'family'],
    href: `${FAMILY_PORTAL_PATH}/continue-learning`,
  },
  {
    id: 'family-characters',
    title: 'Character Hub',
    description: 'Meet Caiden, Miranda, B-4, and more brave guides',
    category: 'Navigation',
    tags: ['characters', 'hub', 'family'],
    href: `${FAMILY_PORTAL_PATH}/characters`,
  },
  {
    id: 'family-games',
    title: 'Game Hub',
    description: 'Interactive story games and focus missions',
    category: 'Game Hub',
    tags: ['games', 'play', 'activities'],
    href: `${FAMILY_PORTAL_PATH}/games`,
  },
  {
    id: 'family-downloads',
    title: 'Downloads',
    description: 'Coloring pages, worksheets, and printable activities',
    category: 'Downloads',
    tags: ['downloads', 'print', 'resources'],
    href: `${FAMILY_PORTAL_PATH}/downloads`,
  },
  {
    id: 'family-gallery',
    title: 'Gallery',
    description: 'Share and view approved student artwork',
    category: 'Gallery',
    tags: ['gallery', 'upload', 'artwork', 'student'],
    href: `${FAMILY_PORTAL_PATH}/gallery`,
  },
  {
    id: 'family-certificates',
    title: 'Certificates',
    description: 'Printable courage and completion certificates',
    category: 'Downloads',
    tags: ['certificates', 'celebrate', 'print'],
    href: `${FAMILY_PORTAL_PATH}/certificates`,
  },
  {
    id: 'family-guide',
    title: 'Family Guide',
    description: 'Discussion prompts and home activity instructions',
    category: 'Guide',
    tags: ['guide', 'parents', 'family', 'instructions'],
    href: `${FAMILY_PORTAL_PATH}/guide`,
  },
  {
    id: 'family-caiden',
    title: "Caiden's Focus Flame Journey",
    description: 'Interactive story quests to build focus and courage',
    category: 'Game Hub',
    tags: ['caiden', 'focus', 'story', 'quest', 'games'],
    character: 'Caiden',
    href: CAIDEN_QUEST_HUB_PATH,
  },
  {
    id: 'family-miranda',
    title: "Miranda's Mystery Files",
    description: 'Reading games and comprehension detective cases',
    category: 'Game Hub',
    tags: ['miranda', 'reading', 'mystery', 'comprehension', 'games'],
    character: 'Miranda',
    href: `${KIDS_PORTAL_PATH}/miranda`,
  },
  {
    id: 'family-b4',
    title: 'B-4 Focus Missions',
    description: 'Focus moves, feelings check-ins, and brave choices',
    category: 'Game Hub',
    tags: ['b-4', 'b4', 'focus', 'check-in', 'missions', 'games'],
    character: 'B-4',
    href: `${KIDS_PORTAL_PATH}/b4`,
  },
  {
    id: 'family-zeke',
    title: "Zeke's Logic Lab",
    description: 'Patterns, puzzles, and critical-thinking challenges',
    category: 'Game Hub',
    tags: ['zeke', 'logic', 'puzzles', 'games'],
    character: 'Zeke',
    href: `${KIDS_PORTAL_PATH}/zeke`,
  },
  {
    id: 'family-coloring',
    title: 'Coloring Pages',
    description: 'Print and color brave characters and story scenes',
    category: 'Downloads',
    tags: ['coloring', 'print', 'art', 'downloads'],
    href: `${FAMILY_PORTAL_PATH}/downloads`,
  },
  {
    id: 'family-printable',
    title: 'Printable Activities',
    description: 'Hands-on worksheets and creative activities for families',
    category: 'Downloads',
    tags: ['printable', 'worksheet', 'activities', 'downloads'],
    href: `${FAMILY_PORTAL_PATH}/downloads`,
  },
  {
    id: 'family-sel-worksheet',
    title: 'B-4 SEL Scan Worksheet',
    description: 'Printable SEL scan worksheet for feelings and focus',
    category: 'Downloads',
    tags: ['worksheet', 'sel', 'b-4', 'b4', 'printable', 'scan'],
    character: 'B-4',
    href: `${FAMILY_PORTAL_PATH}/downloads`,
  },
];

export const FACILITATOR_PORTAL_SEARCH_RESOURCES: PortalSearchResource[] = [
  {
    id: 'facilitator-overview',
    title: 'Overview',
    description: 'Pilot dashboard with character tracks and progress',
    category: 'Navigation',
    tags: ['home', 'dashboard', 'facilitator'],
    href: facilitatorHash('overview'),
  },
  {
    id: 'facilitator-weekly',
    title: 'Weekly Modules',
    description: 'Weekly kits, story pages, and facilitator notes',
    category: 'Navigation',
    tags: ['weekly', 'modules', 'curriculum'],
    href: facilitatorHash('weekly-modules'),
  },
  {
    id: 'facilitator-activities',
    title: 'Activities Library',
    description: 'Coloring pages, printables, journals, and reset tools',
    category: 'Activities Library',
    tags: ['activities', 'downloads', 'library'],
    href: facilitatorHash('activities-library'),
  },
  {
    id: 'facilitator-assessments',
    title: 'Assessments',
    description: 'Baseline and growth checks for pilot data',
    category: 'Assessments',
    tags: ['assessments', 'baseline', 'check'],
    href: facilitatorHash('assessments'),
  },
  {
    id: 'facilitator-results',
    title: 'Results',
    description: 'Pilot progress charts and baseline submissions',
    category: 'Results',
    tags: ['results', 'data', 'progress'],
    href: facilitatorHash('results'),
  },
  {
    id: 'facilitator-certificates',
    title: 'Certificates',
    description: 'Student and camp completion certificate templates',
    category: 'Downloads',
    tags: ['certificates', 'templates'],
    href: facilitatorHash('certificates'),
  },
  {
    id: 'facilitator-gallery',
    title: 'Student Gallery',
    description: 'Upload, review, and approve student artwork',
    category: 'Gallery',
    tags: ['gallery', 'student', 'upload'],
    href: facilitatorHash('student-gallery'),
  },
  {
    id: 'facilitator-gallery-approval',
    title: 'Gallery Approval',
    description: 'Approve, reject, or request changes on family uploads',
    category: 'Gallery',
    tags: ['gallery', 'approval', 'review', 'pending'],
    href: facilitatorHash('student-gallery'),
  },
  {
    id: 'facilitator-center',
    title: 'Facilitator Center',
    description: 'Quick start guides, discussion questions, and SEL alignment',
    category: 'Facilitator Center',
    tags: ['facilitator', 'guide', 'training'],
    href: facilitatorHash('facilitator-center'),
  },
  {
    id: 'facilitator-baseline-check',
    title: 'B-4 Baseline Check',
    description: 'Starting assessment before Week 1 activities',
    category: 'Assessments',
    tags: ['baseline', 'b-4', 'b4', 'assessment', 'check-in'],
    character: 'B-4',
    href: B4_BASELINE_CHECK_PATH,
  },
  {
    id: 'facilitator-baseline-results',
    title: 'B-4 Baseline Results',
    description: 'Full baseline check results, export, and review',
    category: 'Results',
    tags: ['baseline', 'results', 'b-4', 'b4', 'data', 'export'],
    character: 'B-4',
    href: FACILITATOR_B4_RESULTS_PATH,
  },
  {
    id: 'facilitator-coloring',
    title: 'Coloring Pages',
    description: 'Character coloring pages for camp and classroom',
    category: 'Activities Library',
    tags: ['coloring', 'print', 'downloads'],
    href: facilitatorHash('activities-library'),
  },
  {
    id: 'facilitator-printable',
    title: 'Printable Activities',
    description: 'Worksheets and hands-on printable adventures',
    category: 'Activities Library',
    tags: ['printable', 'worksheet', 'activities'],
    href: facilitatorHash('activities-library'),
  },
  {
    id: 'facilitator-sel-worksheet',
    title: 'B-4 SEL Scan Worksheet',
    description: 'Printable SEL scan worksheet for classroom use',
    category: 'Activities Library',
    tags: ['worksheet', 'sel', 'b-4', 'b4', 'printable', 'scan'],
    character: 'B-4',
    href: facilitatorHash('activities-library'),
  },
  {
    id: 'facilitator-caiden-preview',
    title: "Caiden's Focus Flame Journey",
    description: 'Preview Caiden story quests for assignment',
    category: 'Character Preview',
    tags: ['caiden', 'focus', 'preview', 'games'],
    character: 'Caiden',
    href: CAIDEN_QUEST_HUB_PATH,
    grantFamilyAccess: true,
  },
  {
    id: 'facilitator-miranda-preview',
    title: "Miranda's Mystery Files",
    description: 'Preview reading games and mystery cases',
    category: 'Character Preview',
    tags: ['miranda', 'reading', 'preview', 'games', 'comprehension'],
    character: 'Miranda',
    href: `${KIDS_PORTAL_PATH}/miranda`,
    grantFamilyAccess: true,
  },
  {
    id: 'facilitator-b4-preview',
    title: 'B-4 Focus Missions',
    description: 'Preview B-4 focus moves and check-ins',
    category: 'Character Preview',
    tags: ['b-4', 'b4', 'focus', 'preview', 'missions'],
    character: 'B-4',
    href: `${KIDS_PORTAL_PATH}/b4`,
    grantFamilyAccess: true,
  },
];

export function getPortalSearchResources(portal: PortalSearchPortal): PortalSearchResource[] {
  return portal === 'family' ? FAMILY_PORTAL_SEARCH_RESOURCES : FACILITATOR_PORTAL_SEARCH_RESOURCES;
}
