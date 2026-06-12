import type { GameAssessmentConfig } from '../types/gameAssessment';
import type { ModuleTrackingDefinition } from '../types/moduleTracking';

const MODULE_TRACKING_BY_ID: Record<string, ModuleTrackingDefinition> = {
  'quest-1': {
    moduleId: 'quest-1',
    moduleTitle: 'What Comes First',
    character: 'caiden',
    audience: 'student',
    role: 'student',
    skillArea: 'focus',
  },
  'quest-2': {
    moduleId: 'quest-2',
    moduleTitle: 'Focus or Distraction?',
    character: 'caiden',
    audience: 'student',
    role: 'student',
    skillArea: 'focus',
  },
  'quest-3': {
    moduleId: 'quest-3',
    moduleTitle: 'Time Tracker',
    character: 'caiden',
    audience: 'student',
    role: 'student',
    skillArea: 'focus',
  },
  'quest-4': {
    moduleId: 'quest-4',
    moduleTitle: 'Reset and Return',
    character: 'caiden',
    audience: 'student',
    role: 'student',
    skillArea: 'focus',
  },
  'quest-5': {
    moduleId: 'quest-5',
    moduleTitle: 'Build the Plan',
    character: 'caiden',
    audience: 'student',
    role: 'student',
    skillArea: 'focus',
  },
  'quest-6': {
    moduleId: 'quest-6',
    moduleTitle: 'The Snack Shop Challenge',
    character: 'caiden',
    audience: 'student',
    role: 'student',
    skillArea: 'focus',
  },
  'quest-7': {
    moduleId: 'quest-7',
    moduleTitle: 'The Camp Supply Mission',
    character: 'caiden',
    audience: 'student',
    role: 'student',
    skillArea: 'focus',
  },
  'quest-8': {
    moduleId: 'quest-8',
    moduleTitle: 'The Homework Rescue Plan',
    character: 'caiden',
    audience: 'student',
    role: 'student',
    skillArea: 'focus',
  },
  'quest-9': {
    moduleId: 'quest-9',
    moduleTitle: 'The Camp Leader Challenge',
    character: 'caiden',
    audience: 'student',
    role: 'student',
    skillArea: 'focus',
  },
  'miranda-mystery-file-1': {
    moduleId: 'miranda-mystery-file-1',
    moduleTitle: 'The Missing Schedule',
    character: 'miranda',
    audience: 'student',
    role: 'student',
    skillArea: 'reading',
  },
  'miranda-mystery-file-2': {
    moduleId: 'miranda-mystery-file-2',
    moduleTitle: 'The Missing Student',
    character: 'miranda',
    audience: 'student',
    role: 'student',
    skillArea: 'reading',
  },
  'miranda-mystery-file-3': {
    moduleId: 'miranda-mystery-file-3',
    moduleTitle: 'The Missing Clue',
    character: 'miranda',
    audience: 'student',
    role: 'student',
    skillArea: 'reading',
  },
  'the-missing-student': {
    moduleId: 'the-missing-student',
    moduleTitle: 'The Missing Student (legacy)',
    character: 'miranda',
    audience: 'student',
    role: 'student',
    skillArea: 'reading',
  },
  'the-missing-clue': {
    moduleId: 'the-missing-clue',
    moduleTitle: 'The Missing Clue (legacy)',
    character: 'miranda',
    audience: 'student',
    role: 'student',
    skillArea: 'reading',
  },
  'the-missing-letters': {
    moduleId: 'the-missing-letters',
    moduleTitle: 'The Missing Letters',
    character: 'miranda',
    audience: 'student',
    role: 'student',
    skillArea: 'reading',
  },
  'the-context-clue-challenge': {
    moduleId: 'the-context-clue-challenge',
    moduleTitle: 'The Context Clue Challenge',
    character: 'miranda',
    audience: 'student',
    role: 'student',
    skillArea: 'reading',
  },
  'mirandas-detective-notebook': {
    moduleId: 'mirandas-detective-notebook',
    moduleTitle: "Miranda's Detective Notebook",
    character: 'miranda',
    audience: 'student',
    role: 'student',
    skillArea: 'reading',
  },
  'charlie-mystery-footprints': {
    moduleId: 'charlie-mystery-footprints',
    moduleTitle: 'The Mystery Footprints',
    character: 'charlie',
    audience: 'student',
    role: 'student',
    skillArea: 'observation',
  },
  'charlie-floating-orange': {
    moduleId: 'charlie-floating-orange',
    moduleTitle: 'The Floating Orange',
    character: 'charlie',
    audience: 'student',
    role: 'student',
    skillArea: 'prediction-hypothesis',
  },
  'charlie-mystery-sound': {
    moduleId: 'charlie-mystery-sound',
    moduleTitle: 'The Mystery Sound',
    character: 'charlie',
    audience: 'student',
    role: 'student',
    skillArea: 'active-listening-attention',
  },
  'charlie-volcano-trouble': {
    moduleId: 'charlie-volcano-trouble',
    moduleTitle: 'Volcano Trouble',
    character: 'charlie',
    audience: 'student',
    role: 'student',
    skillArea: 'problem-solving-iteration',
  },
  'charlie-missing-plant': {
    moduleId: 'charlie-missing-plant',
    moduleTitle: 'The Missing Plant',
    character: 'charlie',
    audience: 'student',
    role: 'student',
    skillArea: 'cause-and-effect',
  },
  'charlie-robot-rescue': {
    moduleId: 'charlie-robot-rescue',
    moduleTitle: 'Robot Rescue',
    character: 'charlie',
    audience: 'student',
    role: 'student',
    skillArea: 'debugging',
  },
  'charlie-marshmallow-tower': {
    moduleId: 'charlie-marshmallow-tower',
    moduleTitle: 'The Marshmallow Tower',
    character: 'charlie',
    audience: 'student',
    role: 'student',
    skillArea: 'teamwork-iteration',
  },
  'charlie-science-fair-mystery': {
    moduleId: 'charlie-science-fair-mystery',
    moduleTitle: 'The Great Science Fair Mystery',
    character: 'charlie',
    audience: 'student',
    role: 'student',
    skillArea: 'critical-thinking-evidence',
  },
  'b4-mood-scanner': {
    moduleId: 'b4-mood-scanner',
    moduleTitle: 'Mood Scanner',
    character: 'b4',
    audience: 'student',
    role: 'student',
    skillArea: 'emotional-awareness',
  },
  'b4-body-signal-detective': {
    moduleId: 'b4-body-signal-detective',
    moduleTitle: 'Body Signal Detective',
    character: 'b4',
    audience: 'student',
    role: 'student',
    skillArea: 'body-awareness-self-regulation',
  },
  'b4-brave-choice-button': {
    moduleId: 'b4-brave-choice-button',
    moduleTitle: 'The Brave Choice Button',
    character: 'b4',
    audience: 'student',
    role: 'student',
    skillArea: 'brave-choices-decision-making',
  },
  'b4-focus-reset-station': {
    moduleId: 'b4-focus-reset-station',
    moduleTitle: 'Focus Reset Station',
    character: 'b4',
    audience: 'student',
    role: 'student',
    skillArea: 'focus-attention-reset',
  },
  'b4-calm-down-countdown': {
    moduleId: 'b4-calm-down-countdown',
    moduleTitle: 'Calm-Down Countdown',
    character: 'b4',
    audience: 'student',
    role: 'student',
    skillArea: 'self-regulation-calming-strategies',
  },
  'b4-oops-repair-lab': {
    moduleId: 'b4-oops-repair-lab',
    moduleTitle: 'Oops Repair Lab',
    character: 'b4',
    audience: 'student',
    role: 'student',
    skillArea: 'repair-accountability',
  },
  'b4-confidence-charger': {
    moduleId: 'b4-confidence-charger',
    moduleTitle: 'Confidence Charger',
    character: 'b4',
    audience: 'student',
    role: 'student',
    skillArea: 'confidence-growth-mindset',
  },
  'b4-focus-flame-finale': {
    moduleId: 'b4-focus-flame-finale',
    moduleTitle: 'The Focus Flame Finale',
    character: 'b4',
    audience: 'student',
    role: 'student',
    skillArea: 'reflection-integrated-sel',
  },
  'feeling-finder': {
    moduleId: 'feeling-finder',
    moduleTitle: 'B-4 Feeling Finder',
    character: 'b4',
    audience: 'student',
    role: 'student',
    skillArea: 'feelings',
  },
  'zeke-new-table': {
    moduleId: 'zeke-new-table',
    moduleTitle: 'The New Table',
    character: 'zeke',
    audience: 'student',
    role: 'student',
    skillArea: 'joining-in-social-confidence',
  },
  'zeke-pass-the-ball': {
    moduleId: 'zeke-pass-the-ball',
    moduleTitle: 'Pass the Ball',
    character: 'zeke',
    audience: 'student',
    role: 'student',
    skillArea: 'teamwork-sharing',
  },
  'zeke-group-project-glitch': {
    moduleId: 'zeke-group-project-glitch',
    moduleTitle: 'The Group Project Glitch',
    character: 'zeke',
    audience: 'student',
    role: 'student',
    skillArea: 'communication-team-roles',
  },
  'zeke-brave-voice': {
    moduleId: 'zeke-brave-voice',
    moduleTitle: 'The Brave Voice',
    character: 'zeke',
    audience: 'student',
    role: 'student',
    skillArea: 'speaking-up-respectfully',
  },
  'zeke-friendship-repair': {
    moduleId: 'zeke-friendship-repair',
    moduleTitle: 'Friendship Repair',
    character: 'zeke',
    audience: 'student',
    role: 'student',
    skillArea: 'conflict-repair-apology',
  },
  'zeke-courage-challenge': {
    moduleId: 'zeke-courage-challenge',
    moduleTitle: 'The Courage Challenge',
    character: 'zeke',
    audience: 'student',
    role: 'student',
    skillArea: 'trying-something-new-confidence',
  },
  'zeke-team-captain-test': {
    moduleId: 'zeke-team-captain-test',
    moduleTitle: 'The Team Captain Test',
    character: 'zeke',
    audience: 'student',
    role: 'student',
    skillArea: 'leadership-inclusion',
  },
  'zeke-final-huddle': {
    moduleId: 'zeke-final-huddle',
    moduleTitle: 'The Final Huddle',
    character: 'zeke',
    audience: 'student',
    role: 'student',
    skillArea: 'group-reflection-team-growth',
  },
};

const ADULT_MISSION_SKILL: Record<string, string> = {
  'mission-1': 'understanding',
  'mission-2': 'support',
  'mission-3': 'executive-function',
  'mission-4': 'emotional-regulation',
  'mission-5': 'learning-styles',
};

function resolveAdultRole(pathname: string): 'parent' | 'facilitator' {
  if (
    pathname.startsWith('/portal/facilitator') ||
    pathname.startsWith('/program-dashboard')
  ) {
    return 'facilitator';
  }
  return 'parent';
}

export function buildAdultMissionTracking(
  guideId: string,
  missionId: string,
  config: GameAssessmentConfig,
  pathname: string,
): ModuleTrackingDefinition {
  const role = resolveAdultRole(pathname);
  const character = guideId === 'uncle-t' ? 'uncle-t' : 'dr-victoria';

  return {
    moduleId: `${guideId}/${missionId}`,
    moduleTitle: config.landing.title,
    character,
    audience: role,
    role,
    skillArea: ADULT_MISSION_SKILL[missionId] ?? 'adult-learning',
  };
}

export function resolveModuleTracking(
  config: GameAssessmentConfig,
  options?: {
    tracking?: ModuleTrackingDefinition;
    guideId?: string;
    missionId?: string;
    pathname?: string;
  },
): ModuleTrackingDefinition | null {
  if (options?.tracking) {
    return options.tracking;
  }

  if (config.tracking) {
    return config.tracking;
  }

  const known = MODULE_TRACKING_BY_ID[config.id];
  if (known) {
    return known;
  }

  if (options?.guideId && options?.missionId) {
    return buildAdultMissionTracking(
      options.guideId,
      options.missionId,
      config,
      options.pathname ?? (typeof window !== 'undefined' ? window.location.pathname : ''),
    );
  }

  return null;
}

export function registerModuleTracking(definition: ModuleTrackingDefinition): void {
  MODULE_TRACKING_BY_ID[definition.moduleId] = definition;
}

export function listTrackedStudentModules(): ModuleTrackingDefinition[] {
  return Object.values(MODULE_TRACKING_BY_ID).filter((row) => row.role === 'student');
}
