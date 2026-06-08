import { CAIDEN_QUEST_1_ID } from './caiden/quest1WhatComesFirst';
import { MIRANDA_FILE_1_ID } from './miranda/file1MissingStudent';
import { CHARLIE_MISSION_1_ID } from './charlie/charlieMission1';
import { PORTAL_COLORING_PAGES } from './portalDownloadAssets';
import type { FamilyCharacterId } from './familyPortalContent';

export type WeeklyAdventureActivity = {
  id: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  characterId?: FamilyCharacterId;
  kind: 'game' | 'download' | 'activity';
};

export type WeeklyAdventureWeek = {
  week: number;
  title: string;
  selFocus: string;
  previewActivities: string[];
};

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
      'Coloring page',
      'Week 1 family activity',
    ],
  },
  {
    week: 2,
    title: 'Finding Your Voice',
    selFocus: 'Communication',
    previewActivities: ['Caiden Game 2', 'Miranda Game 2', 'B-4 Feeling Finder', 'Charlie Game 2'],
  },
  {
    week: 3,
    title: 'Better Together',
    selFocus: 'Teamwork',
    previewActivities: ['Character missions', 'Group activity', 'Reflection journal'],
  },
  {
    week: 4,
    title: 'Staying Present',
    selFocus: 'Focus',
    previewActivities: ['Focus Flame Lab', 'B-4 missions', 'Camp activity'],
  },
  {
    week: 5,
    title: 'Big Feelings',
    selFocus: 'Emotional Awareness',
    previewActivities: ['Feelings check-in', 'Miranda cases', 'Family discussion'],
  },
  {
    week: 6,
    title: 'Brave Choices',
    selFocus: 'Decision Making',
    previewActivities: ['Caiden quests', 'B-4 missions', 'Brave choice activity'],
  },
  {
    week: 7,
    title: 'Solving Problems Together',
    selFocus: 'Problem Solving',
    previewActivities: ['Miranda mysteries', 'Team puzzles', 'Camp challenge'],
  },
  {
    week: 8,
    title: 'Keep Going',
    selFocus: 'Perseverance',
    previewActivities: ['Focus recovery games', 'Reflection journal', 'Family check-in'],
  },
  {
    week: 9,
    title: 'Focus Flame Celebration',
    selFocus: 'Confidence + Reflection',
    previewActivities: ['Celebration activity', 'Certificates', 'Final reflection'],
  },
];

export function buildWeek1Activities(kidsBasePath: string, downloadsPath: string): WeeklyAdventureActivity[] {
  const caidenColoring = PORTAL_COLORING_PAGES.find((p) => p.id === 'caiden') ?? PORTAL_COLORING_PAGES[0];

  return [
    {
      id: 'w1-caiden',
      title: "Caiden Game 1: What Comes First?",
      description: 'Help Caiden choose what to do first and bring his attention back.',
      cta: 'Start Game',
      href: `${kidsBasePath}/caiden/${CAIDEN_QUEST_1_ID}`,
      characterId: 'caiden',
      kind: 'game',
    },
    {
      id: 'w1-miranda',
      title: 'Miranda Game 1: The Missing Student',
      description: 'Read clues, notice details, and solve Miranda\'s first mystery file.',
      cta: 'Open Case',
      href: `${kidsBasePath}/miranda/${MIRANDA_FILE_1_ID}`,
      characterId: 'miranda',
      kind: 'game',
    },
    {
      id: 'w1-b4',
      title: 'B-4 Focus Mission 1: Find Your Focus Flame',
      description: 'Practice focus, emotion, and brave choice skills with B-4.',
      cta: 'Start Mission',
      href: `${kidsBasePath}/b4/week-1`,
      characterId: 'b4',
      kind: 'game',
    },
    {
      id: 'w1-charlie',
      title: 'Charlie Perk Game 1: Turtle Trail Trouble',
      description: 'Make safe, curious choices on the camp trail with Charlie.',
      cta: 'Start Mission',
      href: `${kidsBasePath}/charlie/${CHARLIE_MISSION_1_ID}`,
      characterId: 'charlie',
      kind: 'game',
    },
    {
      id: 'w1-coloring',
      title: 'Download: Caiden Coloring Page',
      description: 'Print and color Caiden\'s Focus Flame adventure.',
      cta: 'Download',
      href: caidenColoring.href,
      kind: 'download',
    },
    {
      id: 'w1-activity',
      title: 'Complete Week 1 Camp / Family Activity',
      description: 'Use the Week 1 discussion guide and family reflection from your downloads.',
      cta: 'View Downloads',
      href: downloadsPath,
      kind: 'activity',
    },
  ];
}
