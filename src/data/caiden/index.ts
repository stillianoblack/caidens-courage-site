import type { GameAssessmentConfig } from '../../types/gameAssessment';
import { CAIDEN_QUEST_1_CONFIG, CAIDEN_QUEST_1_ID } from './quest1WhatComesFirst';
import { CAIDEN_QUEST_2_CONFIG, CAIDEN_QUEST_2_ID } from './quest2ChooseYourNextMove';
import { CAIDEN_QUEST_3_CONFIG, CAIDEN_QUEST_3_ID } from './quest3ResetAndReturn';

export type CaidenQuestMeta = {
  id: string;
  questNumber: number;
  title: string;
  subtitle: string;
  description: string;
  skills: string[];
  reward: string;
  config: GameAssessmentConfig;
};

export const CAIDEN_QUESTS: CaidenQuestMeta[] = [
  {
    id: CAIDEN_QUEST_1_ID,
    questNumber: 1,
    title: "Caiden's Focus Quest: What Comes First?",
    subtitle: 'What Comes First?',
    description:
      'Help Caiden choose what to do first, break down big tasks, spot distractions, and bring his attention back.',
    skills: ['Executive Function', 'Planning', 'Prioritization', 'Organization'],
    reward: 'Focus Starter Badge',
    config: CAIDEN_QUEST_1_CONFIG,
  },
  {
    id: CAIDEN_QUEST_2_ID,
    questNumber: 2,
    title: "Caiden's Focus Quest: Choose Your Next Move",
    subtitle: 'Choose Your Next Move',
    description: 'Help Caiden make strong choices, recover from mistakes, and keep growing.',
    skills: [
      'Self-Regulation',
      'Emotional Awareness',
      'Flexible Thinking',
      'Decision Making',
      'Recovering from Mistakes',
      'Growth Mindset',
    ],
    reward: 'Focus Navigator Badge',
    config: CAIDEN_QUEST_2_CONFIG,
  },
  {
    id: CAIDEN_QUEST_3_ID,
    questNumber: 3,
    title: "Caiden's Focus Quest: Reset and Return",
    subtitle: 'Reset and Return',
    description: 'Practice focus recovery, self-regulation, and flexible thinking when attention slips.',
    skills: ['Focus Recovery', 'Self-regulation', 'Flexible thinking'],
    reward: 'Focus Recovery Badge',
    config: CAIDEN_QUEST_3_CONFIG,
  },
];

export function getCaidenQuestById(id: string | undefined): CaidenQuestMeta | undefined {
  if (!id) return undefined;
  return CAIDEN_QUESTS.find((quest) => quest.id === id);
}

export { CAIDEN_QUEST_1_ID, CAIDEN_QUEST_2_ID, CAIDEN_QUEST_3_ID };
