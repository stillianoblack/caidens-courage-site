import {
  CAIDEN_QUEST_HUB_PATH,
  FACILITATOR_PORTAL_PATH,
  FAMILY_HUB_PATH,
  FAMILY_PORTAL_PATH,
  KIDS_PORTAL_PATH,
  PILOT_DASHBOARD_PATH,
  BLUE_RIBBON_PILOT_PATH,
  PROGRAM_DASHBOARD_PATH,
} from '../config/courageRoutes';
import {
  activitiesLibraryTabPath,
  programGoalsPath,
  resultsNeedsAttentionPath,
  studentGalleryPendingPath,
} from './askB4DeepLinks';
import { familyPortalPath } from './familyPortalPaths';
import { programDashboardTabPath } from './programDashboardNav';

export type AskB4Mode = 'kid' | 'family' | 'facilitator';

export type AskB4StarterPrompt = {
  text: string;
  href?: string;
};

export const ASK_B4_STARTER_PROMPTS: Record<AskB4Mode, AskB4StarterPrompt[]> = {
  kid: [
    { text: 'What should I play next?' },
    { text: 'How do I calm down when I feel frustrated?' },
    { text: 'Who is Caiden?' },
    { text: 'What is the Focus Flame?' },
  ],
  family: [
    { text: 'What should we try first?', href: familyPortalPath('continue-learning') },
    { text: 'Show coloring pages', href: familyPortalPath('downloads') },
    { text: 'How can I help my child focus?', href: familyPortalPath('characters') },
    { text: 'What does the B-4 Baseline mean?', href: familyPortalPath('baseline-check') },
    { text: "Where is my child's certificate?", href: familyPortalPath('certificates') },
    { text: 'How do I submit artwork?', href: familyPortalPath('gallery') },
  ],
  facilitator: [
    { text: 'What should we do for Week 1?', href: programDashboardTabPath('weekly-modules') },
    { text: 'Where are the coloring pages?', href: activitiesLibraryTabPath('coloring-pages') },
    { text: 'Which students need attention?', href: resultsNeedsAttentionPath() },
    { text: 'Help me choose program goals', href: programGoalsPath() },
    { text: 'How do I approve gallery uploads?', href: studentGalleryPendingPath() },
  ],
};

export const ASK_B4_MODES: AskB4Mode[] = ['kid', 'family', 'facilitator'];

export const ASK_B4_MODE_LABELS: Record<AskB4Mode, string> = {
  kid: 'Kid',
  family: 'Family',
  facilitator: 'Facilitator',
};

export const ASK_B4_DISCLAIMERS: Record<AskB4Mode, string> = {
  kid: 'B-4 can help with focus tips and finding activities.',
  family:
    'B-4 gives learning support and activity guidance. For medical, mental health, or crisis concerns, contact a qualified professional.',
  facilitator:
    'B-4 gives learning support and activity guidance. For medical, mental health, or crisis concerns, contact a qualified professional.',
};

export function detectAskB4Mode(pathname: string): AskB4Mode {
  if (
    pathname.startsWith(FACILITATOR_PORTAL_PATH) ||
    pathname.startsWith(PILOT_DASHBOARD_PATH) ||
    pathname.startsWith(PROGRAM_DASHBOARD_PATH) ||
    pathname.startsWith(BLUE_RIBBON_PILOT_PATH)
  ) {
    return 'facilitator';
  }
  if (pathname.startsWith(FAMILY_PORTAL_PATH) || pathname.startsWith(FAMILY_HUB_PATH)) {
    return 'family';
  }
  if (
    pathname.startsWith(KIDS_PORTAL_PATH) ||
    pathname.startsWith(CAIDEN_QUEST_HUB_PATH)
  ) {
    return 'kid';
  }
  return 'family';
}

export function getAskB4Welcome(mode: AskB4Mode): string {
  switch (mode) {
    case 'kid':
      return "Hi! I'm B-4 — your Focus Flame guide. I can help you find games, calm-down tips, and fun activities. What do you want to explore?";
    case 'family':
      return "Hi! I'm B-4 — your Focus Flame guide for games, activities, and family support. Ask me where to go, what to try, or how the Family Portal works.";
    case 'facilitator':
      return "Hi! I'm B-4 — your Focus Flame guide for the pilot. I can help with program goals, lesson flow, Activities Library, roster filters, Results, gallery approval, and certificates. What do you need?";
  }
}
