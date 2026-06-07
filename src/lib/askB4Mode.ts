import {
  CAIDEN_QUEST_HUB_PATH,
  FACILITATOR_PORTAL_PATH,
  FAMILY_PORTAL_PATH,
  KIDS_PORTAL_PATH,
  PILOT_DASHBOARD_PATH,
  BLUE_RIBBON_PILOT_PATH,
} from '../config/courageRoutes';

export type AskB4Mode = 'kid' | 'family' | 'facilitator';

export const ASK_B4_MODES: AskB4Mode[] = ['kid', 'family', 'facilitator'];

export const ASK_B4_MODE_LABELS: Record<AskB4Mode, string> = {
  kid: 'Kid',
  family: 'Family',
  facilitator: 'Facilitator',
};

export const ASK_B4_STARTER_PROMPTS: Record<AskB4Mode, string[]> = {
  kid: [
    'What should I play next?',
    'How do I calm down when I feel frustrated?',
    'Who is Caiden?',
    'What is the Focus Flame?',
  ],
  family: [
    'What should we try first?',
    'Which activity helps with reading?',
    'Which activity helps with focus?',
    'Where are the coloring pages?',
  ],
  facilitator: [
    'How should I start Week 1?',
    'What does the B-4 Baseline Check measure?',
    'Which activity supports self-regulation?',
    'How do I approve gallery uploads?',
  ],
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
    pathname.startsWith(BLUE_RIBBON_PILOT_PATH)
  ) {
    return 'facilitator';
  }
  if (pathname.startsWith(FAMILY_PORTAL_PATH)) {
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
      return "Hi! I'm B-4 — your Focus Flame guide for the pilot. I can help with lesson flow, assessments, downloads, gallery approval, and activity suggestions. What do you need?";
  }
}
