import { CAIDEN_QUEST_1_ID } from './caiden/questAdaptiveWhatComesFirst';
import { CAIDEN_QUEST_2_ID } from './caiden/questAdaptiveFocusOrDistraction';
import { CAIDEN_QUEST_3_ID } from './caiden/questAdaptiveTimeTracker';
import { CAIDEN_QUEST_4_ID } from './caiden/questAdaptiveResetAndReturn';
import { CAIDEN_QUEST_5_ID } from './caiden/questAdaptiveBuildThePlan';
import { CAIDEN_QUEST_6_ID } from './caiden/questAdaptiveSnackShopChallenge';
import { CAIDEN_QUEST_7_ID } from './caiden/questAdaptiveCampSupplyMission';
import { CAIDEN_QUEST_8_ID } from './caiden/questAdaptiveHomeworkRescuePlan';
import { CAIDEN_QUEST_9_ID } from './caiden/questAdaptiveCampLeaderChallenge';
import {
  MIRANDA_FILE_3_ID,
  MIRANDA_FILE_4_ID,
  MIRANDA_FILE_5_ID,
  MIRANDA_MISSING_CLUE_ID,
  MIRANDA_MISSING_SCHEDULE_ID,
  MIRANDA_MISSING_STUDENT_ID,
} from './miranda';
import { CHARLIE_MISSION_1_ID } from './charlie/missions/mission1MysteryFootprints';
import { CHARLIE_MISSION_2_ID } from './charlie/missions/mission2FloatingOrange';
import { CHARLIE_MISSION_3_ID } from './charlie/missions/mission3MysterySound';
import { CHARLIE_MISSION_4_ID } from './charlie/missions/mission4VolcanoTrouble';
import { CHARLIE_MISSION_5_ID } from './charlie/missions/mission5MissingPlant';
import { CHARLIE_MISSION_6_ID } from './charlie/missions/mission6RobotRescue';
import { CHARLIE_MISSION_7_ID } from './charlie/missions/mission7MarshmallowTower';
import { CHARLIE_MISSION_8_ID } from './charlie/missions/mission8ScienceFairMystery';
import { B4_MISSION_1_ID } from './b4/missions/mission1MoodScanner';
import { B4_MISSION_2_ID } from './b4/missions/mission2BodySignalDetective';
import { B4_MISSION_3_ID } from './b4/missions/mission3BraveChoiceButton';
import { B4_MISSION_4_ID } from './b4/missions/mission4FocusResetStation';
import { B4_MISSION_5_ID } from './b4/missions/mission5CalmDownCountdown';
import { B4_MISSION_6_ID } from './b4/missions/mission6OopsRepairLab';
import { B4_MISSION_7_ID } from './b4/missions/mission7ConfidenceCharger';
import { B4_MISSION_8_ID } from './b4/missions/mission8FocusFlameFinale';
import {
  ZEKE_MISSION_1_ID,
  ZEKE_MISSION_2_ID,
  ZEKE_MISSION_3_ID,
  ZEKE_MISSION_4_ID,
  ZEKE_MISSION_5_ID,
  ZEKE_MISSION_6_ID,
  ZEKE_MISSION_7_ID,
  ZEKE_MISSION_8_ID,
} from './zeke';
import { PORTAL_COLORING_PAGES } from './portalDownloadAssets';
import type { FamilyCharacterId } from './familyPortalContent';
import type { AdventureTrailNode, TrailNodeKind } from '../types/adventureTrail';
import { appendWeeklyAdventureGameContext } from '../lib/weeklyAdventureRouteContext';

export type WeeklyAdventureActivity = {
  id: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  characterId?: FamilyCharacterId | 'download' | 'activity';
  kind: 'game' | 'download' | 'activity';
  skillTags?: string;
  weekLabel?: string;
};

export type WeeklyAdventureWeek = {
  week: number;
  title: string;
  selFocus: string;
  previewActivities: string[];
};

type WeeklyMissionRef = {
  id: string;
  title: string;
  description: string;
  cta: string;
  skillTags?: string;
};

function missionIndex(week: number, maxMissions: number): number {
  return Math.min(Math.max(week, 1), maxMissions) - 1;
}

const CAIDEN_WEEKLY: WeeklyMissionRef[] = [
  {
    id: CAIDEN_QUEST_1_ID,
    title: 'What Comes First?',
    description: 'Help Caiden choose what to do first and bring his attention back.',
    cta: 'Start Game',
    skillTags: 'Focus • Courage • Executive Function',
  },
  {
    id: CAIDEN_QUEST_2_ID,
    title: 'Focus or Distraction?',
    description: 'Spot distractions and protect focus with Caiden.',
    cta: 'Start Game',
    skillTags: 'Focus • Courage • Executive Function',
  },
  {
    id: CAIDEN_QUEST_3_ID,
    title: 'Time Tracker',
    description: 'Practice pacing and time awareness with Caiden.',
    cta: 'Start Game',
    skillTags: 'Focus • Courage • Executive Function',
  },
  {
    id: CAIDEN_QUEST_4_ID,
    title: 'Reset and Return',
    description: 'Learn how to reset and bring focus back after a distraction.',
    cta: 'Start Game',
    skillTags: 'Focus • Courage • Executive Function',
  },
  {
    id: CAIDEN_QUEST_5_ID,
    title: 'Build the Plan',
    description: 'Break a big task into steps and build a focus plan with Caiden.',
    cta: 'Start Game',
    skillTags: 'Focus • Courage • Executive Function',
  },
  {
    id: CAIDEN_QUEST_6_ID,
    title: 'The Snack Shop Challenge',
    description: 'Help Caiden plan token spending, resist impulse buys, and save for camp rewards.',
    cta: 'Start Game',
    skillTags: 'Planning • Decision Making • Self-Control',
  },
  {
    id: CAIDEN_QUEST_7_ID,
    title: 'The Camp Supply Mission',
    description: 'Gather supplies, follow checklists, and get ready before camp activities begin.',
    cta: 'Start Game',
    skillTags: 'Organization • Preparation • Responsibility',
  },
  {
    id: CAIDEN_QUEST_8_ID,
    title: 'The Homework Rescue Plan',
    description: 'Prioritize homework, estimate time, and build a realistic focus plan with Caiden.',
    cta: 'Start Game',
    skillTags: 'Time Management • Focus • Prioritization',
  },
  {
    id: CAIDEN_QUEST_9_ID,
    title: 'The Camp Leader Challenge',
    description: 'Lead a camp team, help teammates, and solve problems with courage.',
    cta: 'Start Game',
    skillTags: 'Leadership • Teamwork • Communication',
  },
];

const MIRANDA_WEEKLY: WeeklyMissionRef[] = [
  {
    id: MIRANDA_MISSING_SCHEDULE_ID,
    title: 'The Missing Schedule',
    description: 'Miranda notices the morning schedule is missing. Read the clues and solve the mystery.',
    cta: 'Open Case',
    skillTags: 'Reading • Vocabulary • Problem Solving',
  },
  {
    id: MIRANDA_MISSING_STUDENT_ID,
    title: 'The Missing Student',
    description: 'Caiden is missing after the ceremony. Follow Miranda\'s clues and make safe choices.',
    cta: 'Open Case',
    skillTags: 'Reading • Vocabulary • Problem Solving',
  },
  {
    id: MIRANDA_MISSING_CLUE_ID,
    title: 'The Missing Clue',
    description: 'A clue note has a missing word. Use pictures and context to solve it with Miranda.',
    cta: 'Open Case',
    skillTags: 'Reading • Vocabulary • Problem Solving',
  },
  {
    id: MIRANDA_FILE_3_ID,
    title: 'The Missing Letters',
    description: 'Decode letter clues and build vocabulary with Miranda.',
    cta: 'Open Case',
    skillTags: 'Reading • Vocabulary • Problem Solving',
  },
  {
    id: MIRANDA_FILE_4_ID,
    title: 'The Context Clue Challenge',
    description: 'Use context clues to solve Miranda\'s next reading mystery.',
    cta: 'Open Case',
    skillTags: 'Reading • Vocabulary • Problem Solving',
  },
  {
    id: MIRANDA_FILE_5_ID,
    title: "Miranda's Detective Notebook",
    description: 'Pull together inference and comprehension skills in the final case.',
    cta: 'Open Case',
    skillTags: 'Reading • Vocabulary • Problem Solving',
  },
];

const B4_WEEKLY: WeeklyMissionRef[] = [
  {
    id: B4_MISSION_1_ID,
    title: 'Mood Scanner',
    description: 'Name feelings and read body clues with B-4 before choosing your next move.',
    cta: 'Start Mission',
    skillTags: 'Feelings • SEL • Self-Regulation',
  },
  {
    id: B4_MISSION_2_ID,
    title: 'Body Signal Detective',
    description: 'Notice body signals and connect them to feelings with B-4.',
    cta: 'Start Mission',
    skillTags: 'Feelings • SEL • Self-Regulation',
  },
  {
    id: B4_MISSION_3_ID,
    title: 'The Brave Choice Button',
    description: 'Practice brave choices when feelings get big with B-4.',
    cta: 'Start Mission',
    skillTags: 'Feelings • SEL • Self-Regulation',
  },
  {
    id: B4_MISSION_4_ID,
    title: 'Focus Reset Station',
    description: 'Use focus reset moves when attention drifts with B-4.',
    cta: 'Start Mission',
    skillTags: 'Feelings • SEL • Self-Regulation',
  },
  {
    id: B4_MISSION_5_ID,
    title: 'Calm-Down Countdown',
    description: 'Slow down and calm your body before the next move with B-4.',
    cta: 'Start Mission',
    skillTags: 'Feelings • SEL • Self-Regulation',
  },
  {
    id: B4_MISSION_6_ID,
    title: 'Oops Repair Lab',
    description: 'Repair mistakes and rebuild trust after an oops moment with B-4.',
    cta: 'Start Mission',
    skillTags: 'Feelings • SEL • Self-Regulation',
  },
  {
    id: B4_MISSION_7_ID,
    title: 'Confidence Charger',
    description: 'Charge up confidence before trying something new with B-4.',
    cta: 'Start Mission',
    skillTags: 'Feelings • SEL • Self-Regulation',
  },
  {
    id: B4_MISSION_8_ID,
    title: 'The Focus Flame Finale',
    description: 'Bring together SEL skills in B-4\'s final focus mission.',
    cta: 'Start Mission',
    skillTags: 'Feelings • SEL • Self-Regulation',
  },
];

const CHARLIE_WEEKLY: WeeklyMissionRef[] = [
  {
    id: CHARLIE_MISSION_1_ID,
    title: 'The Mystery Footprints',
    description: 'Observe clues and solve a garden mystery with Charlie.',
    cta: 'Start Mission',
    skillTags: 'Nature • Safety • Curiosity',
  },
  {
    id: CHARLIE_MISSION_2_ID,
    title: 'The Floating Orange',
    description: 'Explore science clues and camp curiosity with Charlie.',
    cta: 'Start Mission',
    skillTags: 'Nature • Safety • Curiosity',
  },
  {
    id: CHARLIE_MISSION_3_ID,
    title: 'The Mystery Sound',
    description: 'Listen, observe, and solve an outdoor sound mystery with Charlie.',
    cta: 'Start Mission',
    skillTags: 'Nature • Safety • Curiosity',
  },
  {
    id: CHARLIE_MISSION_4_ID,
    title: 'Volcano Trouble',
    description: 'Think like a scientist and stay safe during camp experiments.',
    cta: 'Start Mission',
    skillTags: 'Nature • Safety • Curiosity',
  },
  {
    id: CHARLIE_MISSION_5_ID,
    title: 'The Missing Plant',
    description: 'Track clues and protect nature with Charlie.',
    cta: 'Start Mission',
    skillTags: 'Nature • Safety • Curiosity',
  },
  {
    id: CHARLIE_MISSION_6_ID,
    title: 'Robot Rescue',
    description: 'Problem-solve and teamwork through a camp robotics challenge.',
    cta: 'Start Mission',
    skillTags: 'Nature • Safety • Curiosity',
  },
  {
    id: CHARLIE_MISSION_7_ID,
    title: 'The Marshmallow Tower',
    description: 'Build, test, and learn from trial and error with Charlie.',
    cta: 'Start Mission',
    skillTags: 'Nature • Safety • Curiosity',
  },
  {
    id: CHARLIE_MISSION_8_ID,
    title: 'The Great Science Fair Mystery',
    description: 'Solve the final camp science mystery with Charlie.',
    cta: 'Start Mission',
    skillTags: 'Nature • Safety • Curiosity',
  },
];

const ZEKE_WEEKLY: WeeklyMissionRef[] = [
  {
    id: ZEKE_MISSION_1_ID,
    title: 'The New Table',
    description: 'Practice courage, teamwork, and speaking up with Zeke.',
    cta: 'Start Mission',
    skillTags: 'Social Skills • Teamwork • Courage',
  },
  {
    id: ZEKE_MISSION_2_ID,
    title: 'Pass the Ball',
    description: 'Practice courage, teamwork, and speaking up with Zeke.',
    cta: 'Start Mission',
    skillTags: 'Social Skills • Teamwork • Courage',
  },
  {
    id: ZEKE_MISSION_3_ID,
    title: 'The Group Project Glitch',
    description: 'Practice courage, teamwork, and speaking up with Zeke.',
    cta: 'Start Mission',
    skillTags: 'Social Skills • Teamwork • Courage',
  },
  {
    id: ZEKE_MISSION_4_ID,
    title: 'The Brave Voice',
    description: 'Practice courage, teamwork, and speaking up with Zeke.',
    cta: 'Start Mission',
    skillTags: 'Social Skills • Teamwork • Courage',
  },
  {
    id: ZEKE_MISSION_5_ID,
    title: 'Friendship Repair',
    description: 'Practice courage, teamwork, and speaking up with Zeke.',
    cta: 'Start Mission',
    skillTags: 'Social Skills • Teamwork • Courage',
  },
  {
    id: ZEKE_MISSION_6_ID,
    title: 'The Courage Challenge',
    description: 'Practice courage, teamwork, and speaking up with Zeke.',
    cta: 'Start Mission',
    skillTags: 'Social Skills • Teamwork • Courage',
  },
  {
    id: ZEKE_MISSION_7_ID,
    title: 'The Team Captain Test',
    description: 'Practice courage, teamwork, and speaking up with Zeke.',
    cta: 'Start Mission',
    skillTags: 'Social Skills • Teamwork • Courage',
  },
  {
    id: ZEKE_MISSION_8_ID,
    title: 'The Final Huddle',
    description: 'Practice courage, teamwork, and speaking up with Zeke.',
    cta: 'Start Mission',
    skillTags: 'Social Skills • Teamwork • Courage',
  },
];

export const FAMILY_WEEKLY_ADVENTURE_WEEKS: WeeklyAdventureWeek[] = [
  {
    week: 1,
    title: 'Courage in the Dark',
    selFocus: 'Facing Uncertainty',
    previewActivities: [
      'Caiden Game 1',
      'Miranda Game 1',
      'B-4 Focus Mission 1',
      'Charlie Perk Game 1',
      'Zeke Mission 1',
      'Coloring page',
      'Week 1 family activity',
    ],
  },
  {
    week: 2,
    title: 'Finding Your Voice',
    selFocus: 'Communication',
    previewActivities: [
      'Caiden Game 2',
      'Miranda Game 2',
      'B-4 Mission 2',
      'Charlie Game 2',
      'Zeke Mission 2',
    ],
  },
  {
    week: 3,
    title: 'Better Together',
    selFocus: 'Teamwork',
    previewActivities: [
      'Caiden Game 3',
      'Miranda Game 3',
      'B-4 Mission 3',
      'Charlie Game 3',
      'Zeke Mission 3',
    ],
  },
  {
    week: 4,
    title: 'Staying Present',
    selFocus: 'Focus',
    previewActivities: [
      'Caiden Game 4',
      'Miranda Game 4',
      'B-4 Mission 4',
      'Charlie Game 4',
      'Zeke Mission 4',
    ],
  },
  {
    week: 5,
    title: 'Big Feelings',
    selFocus: 'Emotional Awareness',
    previewActivities: [
      'Caiden Game 5',
      'Miranda Game 5',
      'B-4 Mission 5',
      'Charlie Game 5',
      'Zeke Mission 5',
    ],
  },
  {
    week: 6,
    title: 'Brave Choices',
    selFocus: 'Decision Making',
    previewActivities: [
      'Caiden Game 6',
      'Miranda Game 6',
      'B-4 Mission 6',
      'Charlie Game 6',
      'Zeke Mission 6',
    ],
  },
  {
    week: 7,
    title: 'Solving Problems Together',
    selFocus: 'Problem Solving',
    previewActivities: [
      'Caiden Game 7',
      'Miranda Game 7',
      'B-4 Mission 7',
      'Charlie Game 7',
      'Zeke Mission 7',
    ],
  },
  {
    week: 8,
    title: 'Keep Going',
    selFocus: 'Perseverance',
    previewActivities: [
      'Caiden Game 8',
      'Miranda Game 8',
      'B-4 Mission 8',
      'Charlie Game 8',
      'Zeke Mission 8',
      'Family check-in',
    ],
  },
  {
    week: 9,
    title: 'Focus Flame Celebration',
    selFocus: 'Confidence + Reflection',
    previewActivities: ['Celebration activity', 'Certificates', 'Final reflection'],
  },
];

function resolveWeeklyMission(week: number, missions: WeeklyMissionRef[]): WeeklyMissionRef | null {
  const index = week - 1;
  if (index < 0 || index >= missions.length) return null;
  return missions[index];
}

function buildTrailCharacterNode(
  week: number,
  kind: TrailNodeKind,
  characterId: FamilyCharacterId,
  missions: WeeklyMissionRef[],
  kidsBasePath: string,
  labelPrefix: string,
  weekTitle: string,
): AdventureTrailNode {
  const mission = resolveWeeklyMission(week, missions);

  if (!mission) {
    return {
      id: `trail-w${week}-${characterId}-coming-soon`,
      kind,
      characterId,
      title: `${labelPrefix} ${week}`,
      description: 'More adventures are on the way for this week.',
      cta: 'Coming soon',
      href: '#',
      comingSoon: true,
    };
  }

  const baseHref = `${kidsBasePath}/${characterId}/${mission.id}`;

  return {
    id: `trail-w${week}-${characterId}`,
    kind,
    characterId,
    title: `${labelPrefix} ${week}: ${mission.title}`,
    description: mission.description,
    cta: mission.cta,
    href: appendWeeklyAdventureGameContext(baseHref, { week, weekTitle }),
    moduleId: mission.id,
  };
}

export function buildWeeklyTrailNodes(
  week: number,
  paths: { kidsBasePath: string; downloadsPath: string; certificatesPath: string },
  weekTitle: string,
): AdventureTrailNode[] {
  const { kidsBasePath, downloadsPath, certificatesPath } = paths;

  return [
    buildTrailCharacterNode(week, 'caiden', 'caiden', CAIDEN_WEEKLY, kidsBasePath, 'Caiden Game', weekTitle),
    buildTrailCharacterNode(week, 'miranda', 'miranda', MIRANDA_WEEKLY, kidsBasePath, 'Miranda Game', weekTitle),
    buildTrailCharacterNode(week, 'b4', 'b4', B4_WEEKLY, kidsBasePath, 'B-4 Mission', weekTitle),
    buildTrailCharacterNode(week, 'charlie', 'charlie', CHARLIE_WEEKLY, kidsBasePath, 'Charlie Perk Game', weekTitle),
    buildTrailCharacterNode(week, 'zeke', 'zeke', ZEKE_WEEKLY, kidsBasePath, 'Zeke Mission', weekTitle),
    {
      id: `trail-w${week}-family-activity`,
      kind: 'family_activity',
      title:
        week === 1
          ? 'Complete Week 1 Camp / Family Activity'
          : `Complete Week ${week} Family Activity`,
      description:
        week === 1
          ? 'Use the Week 1 discussion guide and family reflection from your downloads.'
          : 'Open your downloads and activity library for this week\'s family reflection.',
      cta: 'View Downloads',
      href: appendWeeklyAdventureGameContext(downloadsPath, { week, weekTitle }),
    },
    {
      id: `trail-w${week}-certificate`,
      kind: 'certificate',
      title: `Week ${week} Certificate`,
      description: 'Celebrate progress with a printable Focus Flame certificate.',
      cta: 'View Certificate',
      href: appendWeeklyAdventureGameContext(certificatesPath, { week, weekTitle }),
    },
  ];
}

function buildCharacterActivity(
  week: number,
  weekTitle: string,
  prefix: string,
  characterId: FamilyCharacterId,
  missions: WeeklyMissionRef[],
  kidsBasePath: string,
  labelPrefix: string,
): WeeklyAdventureActivity {
  const mission = missions[missionIndex(week, missions.length)];
  const baseHref = `${kidsBasePath}/${characterId}/${mission.id}`;

  return {
    id: `${prefix}-w${week}-${characterId}`,
    title: `${labelPrefix} ${week}: ${mission.title}`,
    description: mission.description,
    cta: mission.cta,
    href: appendWeeklyAdventureGameContext(baseHref, { week, weekTitle }),
    characterId,
    kind: 'game',
    skillTags: mission.skillTags,
    weekLabel: `Week ${week}`,
  };
}

export function buildWeeklyActivities(
  week: number,
  kidsBasePath: string,
  downloadsPath: string,
  weekTitle?: string,
): WeeklyAdventureActivity[] {
  const resolvedWeekTitle =
    weekTitle ?? FAMILY_WEEKLY_ADVENTURE_WEEKS.find((entry) => entry.week === week)?.title ?? `Week ${week}`;

  const activities: WeeklyAdventureActivity[] = [
    buildCharacterActivity(week, resolvedWeekTitle, 'wa', 'caiden', CAIDEN_WEEKLY, kidsBasePath, 'Caiden Game'),
    buildCharacterActivity(week, resolvedWeekTitle, 'wa', 'miranda', MIRANDA_WEEKLY, kidsBasePath, 'Miranda Game'),
    buildCharacterActivity(week, resolvedWeekTitle, 'wa', 'b4', B4_WEEKLY, kidsBasePath, 'B-4 Mission'),
    buildCharacterActivity(week, resolvedWeekTitle, 'wa', 'charlie', CHARLIE_WEEKLY, kidsBasePath, 'Charlie Perk Game'),
    buildCharacterActivity(week, resolvedWeekTitle, 'wa', 'zeke', ZEKE_WEEKLY, kidsBasePath, 'Zeke Mission'),
  ];

  if (week === 1) {
    const caidenColoring = PORTAL_COLORING_PAGES.find((p) => p.id === 'caiden') ?? PORTAL_COLORING_PAGES[0];

    activities.push(
      {
        id: 'w1-coloring',
        title: 'Download: Caiden Coloring Page',
        description: 'Print and color Caiden\'s Focus Flame adventure.',
        cta: 'Download',
        href: appendWeeklyAdventureGameContext(caidenColoring.href, {
          week,
          weekTitle: resolvedWeekTitle,
        }),
        characterId: 'download',
        kind: 'download',
        weekLabel: 'Week 1',
      },
      {
        id: 'w1-activity',
        title: 'Complete Week 1 Camp / Family Activity',
        description: 'Use the Week 1 discussion guide and family reflection from your downloads.',
        cta: 'View Downloads',
        href: appendWeeklyAdventureGameContext(downloadsPath, { week, weekTitle: resolvedWeekTitle }),
        characterId: 'activity',
        kind: 'activity',
        weekLabel: 'Week 1',
      },
    );
  }

  return activities;
}

/** @deprecated Use buildWeeklyActivities(1, ...) */
export function buildWeek1Activities(kidsBasePath: string, downloadsPath: string): WeeklyAdventureActivity[] {
  return buildWeeklyActivities(1, kidsBasePath, downloadsPath);
}
