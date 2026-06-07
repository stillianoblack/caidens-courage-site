import {
  B4_BASELINE_CHECK_PATH,
  BMC_COLORING_PATH,
  CAIDEN_QUEST_HUB_PATH,
  FACILITATOR_B4_RESULTS_PATH,
  FACILITATOR_DR_VICTORIA_MISSION_1_PATH,
  FACILITATOR_PORTAL_PATH,
  FOCUS_FLAME_LAB_PATH,
  KIDS_PORTAL_PATH,
  STUDENT_GALLERY_SUBMIT_PATH,
} from '../config/courageRoutes';
import { DR_VICTORIA_GUIDE_SRC } from './adult/sharedAssets';
import {
  PORTAL_COLORING_PAGES,
  PORTAL_PRINTABLE_ACTIVITIES,
} from './portalDownloadAssets';

export type PilotWeekStatus = 'available' | 'locked' | 'complete';

export type PilotWeek = {
  week: number;
  title: string;
  selFocus: string;
  status: PilotWeekStatus;
  kitCta: string;
  kitHref: string;
};

export type PilotSidebarNavId =
  | 'overview'
  | 'weekly-modules'
  | 'activities-library'
  | 'assessments'
  | 'results'
  | 'certificates'
  | 'student-gallery'
  | 'facilitator-center';

export type ActivityCategoryId =
  | 'coloring-pages'
  | 'printable-activities'
  | 'reflection-journals'
  | 'b4-reset-tools'
  | 'focus-flame-lab';

export type ActivityAssetStatus = 'available' | 'locked';

export type ActivityAsset = {
  id: string;
  title: string;
  status: ActivityAssetStatus;
  href: string;
};

export const BLUE_RIBBON_PILOT_BRAND = 'Blue Ribbon Pilot';
export const BLUE_RIBBON_PILOT_SUBBRAND = 'Focus Flame Academy';
export const BLUE_RIBBON_PILOT_TAG = 'Blue Ribbon 2026 Pilot';

export const PILOT_DASHBOARD_TITLE = 'Focus Flame Academy Pilot Dashboard';

export const PILOT_LOCAL_TESTING_NOTE =
  'Local testing mode: results are saved on this device only.';

export const PILOT_CONNECTED_NOTE = 'Connected to Pilot Database';

export const PILOT_WEEKLY_KIT_NOTE =
  'Each weekly kit includes the story pages, discussion guide, activity, reflection journal, coloring page, and facilitator notes.';

export const PILOT_SIDEBAR_NAV: Array<{
  id: PilotSidebarNavId;
  label: string;
  icon: PilotSidebarNavId;
}> = [
  { id: 'overview', label: 'Overview', icon: 'overview' },
  { id: 'weekly-modules', label: 'Weekly Modules', icon: 'weekly-modules' },
  { id: 'activities-library', label: 'Activities Library', icon: 'activities-library' },
  { id: 'assessments', label: 'Assessments', icon: 'assessments' },
  { id: 'results', label: 'Results', icon: 'results' },
  { id: 'certificates', label: 'Certificates', icon: 'certificates' },
  { id: 'student-gallery', label: 'Student Gallery', icon: 'student-gallery' },
  { id: 'facilitator-center', label: 'Adult Training', icon: 'facilitator-center' },
];

export const PILOT_PAGE_SUBTITLES: Partial<Record<PilotSidebarNavId, string>> = {
  assessments: 'Student and adult reflection checks in one place.',
  'facilitator-center':
    'Training games and guides for parents, teachers, counselors, and camp staff.',
};

/**
 * TODO: Replace placeholder links with uploaded PDF module files.
 * TODO: Add unlock-by-date or unlock-by-admin logic for Weeks 2–9.
 */
export const PILOT_WEEKLY_JOURNEY: PilotWeek[] = [
  {
    week: 1,
    title: 'Courage in the Dark',
    selFocus: 'Facing Uncertainty',
    status: 'available',
    kitCta: 'Download Week 1 Kit',
    kitHref: '#week-1-kit-download',
  },
  {
    week: 2,
    title: 'Finding Your Voice',
    selFocus: 'Communication',
    status: 'locked',
    kitCta: 'Locked',
    kitHref: '#',
  },
  {
    week: 3,
    title: 'Better Together',
    selFocus: 'Teamwork',
    status: 'locked',
    kitCta: 'Locked',
    kitHref: '#',
  },
  {
    week: 4,
    title: 'Staying Present',
    selFocus: 'Focus',
    status: 'locked',
    kitCta: 'Locked',
    kitHref: '#',
  },
  {
    week: 5,
    title: 'Big Feelings',
    selFocus: 'Emotional Awareness',
    status: 'locked',
    kitCta: 'Locked',
    kitHref: '#',
  },
  {
    week: 6,
    title: 'Brave Choices',
    selFocus: 'Decision Making',
    status: 'locked',
    kitCta: 'Locked',
    kitHref: '#',
  },
  {
    week: 7,
    title: 'Solving Problems Together',
    selFocus: 'Problem Solving',
    status: 'locked',
    kitCta: 'Locked',
    kitHref: '#',
  },
  {
    week: 8,
    title: 'Keep Going',
    selFocus: 'Perseverance',
    status: 'locked',
    kitCta: 'Locked',
    kitHref: '#',
  },
  {
    week: 9,
    title: 'Focus Flame Celebration',
    selFocus: 'Confidence + Reflection',
    status: 'locked',
    kitCta: 'Locked',
    kitHref: '#',
  },
];

export const PILOT_ACTIVITY_CATEGORIES: Array<{
  id: ActivityCategoryId;
  label: string;
}> = [
  { id: 'coloring-pages', label: 'Coloring Pages' },
  { id: 'printable-activities', label: 'Printable Activities' },
  { id: 'reflection-journals', label: 'Reflection Journals' },
  { id: 'b4-reset-tools', label: 'B-4 Reset Tools' },
  { id: 'focus-flame-lab', label: 'Focus Flame Lab' },
];

export const PILOT_ACTIVITY_ASSETS: Record<Exclude<ActivityCategoryId, 'focus-flame-lab'>, ActivityAsset[]> = {
  'coloring-pages': PORTAL_COLORING_PAGES.map((page) => ({
    id: page.id,
    title: page.title,
    status: page.status === 'available' ? 'available' : 'locked',
    href: page.href,
  })),
  'printable-activities': [
    ...PORTAL_PRINTABLE_ACTIVITIES.map((activity) => ({
      id: activity.id,
      title: activity.title,
      status: activity.status === 'available' ? ('available' as const) : ('locked' as const),
      href: activity.href,
    })),
    { id: 'teamwork', title: 'Teamwork Mission', status: 'locked' as const, href: '#' },
    { id: 'flame-tracker', title: 'Focus Flame Tracker', status: 'locked' as const, href: '#' },
  ],
  'reflection-journals': [
    { id: 'w1', title: 'Week 1 Reflection Journal', status: 'available', href: '/downloads/pilot/journals/week-1.pdf' },
    { id: 'w2', title: 'Week 2 Reflection Journal', status: 'locked', href: '#' },
    { id: 'w3', title: 'Week 3 Reflection Journal', status: 'locked', href: '#' },
    { id: 'w4', title: 'Week 4 Reflection Journal', status: 'locked', href: '#' },
    { id: 'w5', title: 'Week 5 Reflection Journal', status: 'locked', href: '#' },
    { id: 'w6', title: 'Week 6 Reflection Journal', status: 'locked', href: '#' },
    { id: 'w7', title: 'Week 7 Reflection Journal', status: 'locked', href: '#' },
    { id: 'w8', title: 'Week 8 Reflection Journal', status: 'locked', href: '#' },
    { id: 'w9', title: 'Week 9 Reflection Journal', status: 'locked', href: '#' },
  ],
  'b4-reset-tools': [
    { id: 'fire', title: 'The Fire', status: 'available', href: '/downloads/pilot/reset/the-fire.pdf' },
    { id: 'static', title: 'The Static', status: 'available', href: '/downloads/pilot/reset/the-static.pdf' },
    { id: 'cloud', title: 'The Cloud', status: 'available', href: '/downloads/pilot/reset/the-cloud.pdf' },
    { id: 'spark', title: 'The Spark', status: 'available', href: '/downloads/pilot/reset/the-spark.pdf' },
  ],
};

export const PILOT_FOCUS_FLAME_LAB_CARD = {
  description: 'Interactive story moments to practice focus and courage.',
  cta: 'Open Focus Flame Lab',
  href: FOCUS_FLAME_LAB_PATH,
};

export const PILOT_STUDENT_ASSESSMENT_SECTION = {
  title: 'Student Assessments',
  subtitle: 'Checks for students before, during, and after the program.',
} as const;

export const PILOT_ADULT_ASSESSMENT_SECTION = {
  title: 'Adult Assessments',
  subtitle: 'Short reflection checks for parents, teachers, counselors, and camp staff.',
} as const;

export const PILOT_STUDENT_ASSESSMENT_CARDS = [
  {
    title: 'B-4 Baseline Check',
    status: 'Available' as const,
    statusTone: 'available' as const,
    description: 'Complete before Week 1 to capture starting data.',
    cta: 'Start Baseline',
    href: B4_BASELINE_CHECK_PATH,
    locked: false,
  },
  {
    title: 'Final Growth Check',
    status: 'Locked until Week 9',
    statusTone: 'locked' as const,
    description: 'Repeat the same check at the end to measure growth.',
    cta: 'Coming Soon',
    href: '#',
    locked: true,
  },
  {
    title: 'Reading + Focus Review',
    status: 'Coming Soon',
    statusTone: 'locked' as const,
    description: 'Optional follow-up check for comprehension and strategy growth.',
    cta: 'Coming Soon',
    href: '#',
    locked: true,
  },
];

/** @deprecated Use PILOT_STUDENT_ASSESSMENT_CARDS */
export const PILOT_ASSESSMENT_CARDS = PILOT_STUDENT_ASSESSMENT_CARDS;

export const PILOT_ADULT_ASSESSMENT_CARDS = [
  {
    title: 'Adult Understanding Check',
    status: 'Coming Soon' as const,
    statusTone: 'locked' as const,
    description: 'A quick reflection on how adults understand student behavior and needs.',
    cta: 'Coming Soon',
    href: '#',
    locked: true,
  },
  {
    title: 'Adult Growth Reflection',
    status: 'Coming Soon' as const,
    statusTone: 'locked' as const,
    description: 'Track how your perspective and support strategies evolve over time.',
    cta: 'Coming Soon',
    href: '#',
    locked: true,
  },
  {
    title: 'Support Strategy Review',
    status: 'Coming Soon' as const,
    statusTone: 'locked' as const,
    description: 'Review the support strategies you use most with learners.',
    cta: 'Coming Soon',
    href: '#',
    locked: true,
  },
];

export type AdultTrainingCard = {
  title: string;
  mission: string;
  audience: string;
  badge: string;
  cta: string;
  href: string;
  imageSrc: string;
  available: boolean;
};

export const PILOT_ADULT_TRAINING_INTRO = {
  title: 'Adult Training',
  subtitle:
    'Training games and guides for parents, teachers, counselors, and camp staff.',
} as const;

export const PILOT_ADULT_TRAINING_CARDS: AdultTrainingCard[] = [
  {
    title: "Dr. Victoria\u2019s Understanding Different Minds",
    mission: 'Looking Beyond the Behavior',
    audience: 'Parents, Teachers, Counselors, Camp Staff',
    badge: 'Understanding Guide Badge',
    cta: 'Start Training',
    href: FACILITATOR_DR_VICTORIA_MISSION_1_PATH,
    imageSrc: DR_VICTORIA_GUIDE_SRC,
    available: true,
  },
];

export const PILOT_CERTIFICATES = [
  {
    title: 'Student Completion Certificate',
    cta: 'Download Template',
    href: '/downloads/Certificates/focus-flame-certificate.pdf',
  },
  {
    title: 'Camp Completion Certificate',
    cta: 'Download Template',
    href: '/downloads/pilot/camp-completion-certificate.pdf',
  },
  {
    title: 'Facilitator Certificate',
    cta: 'Download Template',
    href: '/downloads/pilot/facilitator-certificate.pdf',
  },
] as const;

export const PILOT_FACILITATOR_CENTER = [
  {
    title: 'Facilitator Quick Start Guide',
    href: '/downloads/pilot/facilitator-quick-start.pdf',
  },
  {
    title: 'Full Facilitator Guide',
    href: '/training-guides',
  },
  {
    title: 'Discussion Questions',
    href: '/downloads/pilot/discussion-questions.pdf',
  },
  {
    title: 'Weekly Objectives',
    href: '/downloads/pilot/weekly-objectives.pdf',
  },
  {
    title: 'SEL Alignment',
    href: '/downloads/pilot/sel-alignment.pdf',
  },
  {
    title: 'Troubleshooting Guide',
    href: '/downloads/pilot/troubleshooting-guide.pdf',
  },
] as const;

export const PILOT_STUDENT_GALLERY = {
  title: 'Student Gallery',
  description: 'Collect student drawings, coloring pages, and reflections from the pilot.',
  submitTitle: 'Submit Student Work',
  submitCta: 'Open Submission Form',
  href: STUDENT_GALLERY_SUBMIT_PATH,
  bulkTitle: 'Bulk Upload Coming Soon',
  bulkCopy:
    'For now, facilitators can collect artwork offline and email selected examples to hello@caidenscourage.com.',
};

export const PILOT_RESULTS_ADMIN_PATH = FACILITATOR_B4_RESULTS_PATH;

export type PilotCharacterTrackId = 'caiden' | 'miranda' | 'b4';

export type PilotCharacterTrackMetric = {
  label: string;
  /** Static display value when not driven by live metrics. */
  value?: string;
  /** When true, show placeholder until player profiles sync adventure progress. */
  placeholder?: boolean;
  /** Pull from facilitator dashboard metrics when available. */
  metricKey?: 'baselineChecksCompleted';
};

export const PILOT_CHARACTER_TRACKS_NOTE =
  'Student progress will appear here as learners complete activities. Assessments collect nickname and group now; adventure games can use a lightweight player profile later.';

export const PILOT_CHARACTER_TRACKS: Array<{
  id: PilotCharacterTrackId;
  name: string;
  track: string;
  imageSrc: string;
  previewHref: string;
  metrics: PilotCharacterTrackMetric[];
}> = [
  {
    id: 'caiden',
    name: 'Caiden',
    track: 'Focus Flame Journey',
    imageSrc: '/images/characters/caiden_photo_icon_game.webp',
    previewHref: CAIDEN_QUEST_HUB_PATH,
    metrics: [
      { label: 'Quests Available', value: '2' },
      { label: 'Completed', placeholder: true },
      { label: 'Focus Skills', placeholder: true },
    ],
  },
  {
    id: 'miranda',
    name: 'Miranda',
    track: 'Mystery Files',
    imageSrc: '/images/characters/miranda_photo_icon_game.webp',
    previewHref: `${KIDS_PORTAL_PATH}/miranda`,
    metrics: [
      { label: 'Cases Available', value: '5' },
      { label: 'Reading Games', placeholder: true },
      { label: 'Completion', placeholder: true },
    ],
  },
  {
    id: 'b4',
    name: 'B-4',
    track: 'Focus Missions',
    imageSrc: '/images/characters/b-4_photo_icon_game.webp',
    previewHref: `${KIDS_PORTAL_PATH}/b4`,
    metrics: [
      { label: 'Check-ins', placeholder: true },
      { label: 'Baseline Completed', metricKey: 'baselineChecksCompleted' },
      { label: 'Focus Moves', placeholder: true },
    ],
  },
];

export const PILOT_RECOMMENDED_STEPS = [
  {
    id: 'baseline',
    title: 'Start with the B-4 Baseline Check',
    copy: 'Have students complete the baseline before beginning Week 1.',
    cta: 'Open Baseline Check',
    href: B4_BASELINE_CHECK_PATH,
    internalNav: null as PilotSidebarNavId | null,
  },
  {
    id: 'caiden',
    title: "Open Caiden's Focus Flame Journey",
    copy: 'Preview the interactive story adventure for focus and courage practice.',
    cta: 'Preview Caiden Journey',
    href: CAIDEN_QUEST_HUB_PATH,
    internalNav: null,
  },
  {
    id: 'miranda',
    title: "Open Miranda's Mystery Files",
    copy: 'Practice reading clues, vocabulary, and comprehension with detective cases.',
    cta: 'Open Mystery Files',
    href: `${KIDS_PORTAL_PATH}/miranda`,
    internalNav: null,
  },
  {
    id: 'coloring',
    title: 'Download Coloring Pages',
    copy: 'Print character coloring pages for creative courage activities at home or camp.',
    cta: 'View Coloring Pages',
    href: BMC_COLORING_PATH,
    internalNav: 'activities-library' as PilotSidebarNavId,
  },
  {
    id: 'gallery',
    title: 'Review Student Gallery',
    copy: 'Approve family uploads and celebrate student artwork from the pilot.',
    cta: 'Open Student Gallery',
    href: `${FACILITATOR_PORTAL_PATH}#student-gallery`,
    internalNav: 'student-gallery' as PilotSidebarNavId,
  },
] as const;

export const PILOT_RESULTS_COPY =
  'Baseline results sync to Supabase when configured. This dashboard reads Supabase first, then falls back to local device data.';
