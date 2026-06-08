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
    moduleTitle: 'Choose Your Next Move',
    character: 'caiden',
    audience: 'student',
    role: 'student',
    skillArea: 'focus',
  },
  'quest-3': {
    moduleId: 'quest-3',
    moduleTitle: 'Reset and Return',
    character: 'caiden',
    audience: 'student',
    role: 'student',
    skillArea: 'focus',
  },
  'the-missing-student': {
    moduleId: 'the-missing-student',
    moduleTitle: 'The Missing Student',
    character: 'miranda',
    audience: 'student',
    role: 'student',
    skillArea: 'reading',
  },
  'the-missing-clue': {
    moduleId: 'the-missing-clue',
    moduleTitle: 'The Missing Clue',
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
  'turtle-trail-trouble': {
    moduleId: 'turtle-trail-trouble',
    moduleTitle: 'Turtle Trail Trouble',
    character: 'charlie',
    audience: 'student',
    role: 'student',
    skillArea: 'nature',
  },
  'camp-critter-clues': {
    moduleId: 'camp-critter-clues',
    moduleTitle: 'Camp Critter Clues',
    character: 'charlie',
    audience: 'student',
    role: 'student',
    skillArea: 'nature',
  },
  'feeling-finder': {
    moduleId: 'feeling-finder',
    moduleTitle: 'B-4 Feeling Finder',
    character: 'b4',
    audience: 'student',
    role: 'student',
    skillArea: 'feelings',
  },
  'zeke-mission-1': {
    moduleId: 'zeke-mission-1',
    moduleTitle: 'Zeke Mission',
    character: 'zeke',
    audience: 'student',
    role: 'student',
    skillArea: 'courage',
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
