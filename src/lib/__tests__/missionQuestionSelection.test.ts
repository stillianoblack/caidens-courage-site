import '../../data/caiden/index';
import { CAIDEN_ADAPTIVE_QUEST_REGISTRY, buildCaidenAdaptiveConfig } from '../../data/caiden/caidenAdaptiveBuilder';
import { MISSION_QUESTIONS_PER_ATTEMPT } from '../../config/missionQuestions';
import { finalizeAdaptiveQuestions } from '../adaptiveQuestionSelection';
import { assertUniqueQuestionIds } from '../missionQuestionPool';
import {
  resolveGradeBandDifficultyCounts,
  selectQuestionsByGradeDifficultyMix,
} from '../questionDifficultySelection';
import { buildAttemptsMap, scoreFromFinalAttempts, scoreFromFirstAttempts } from '../questionAttemptTracking';
import type { QuestionAttemptRecord } from '../../types/questionInteraction';

describe('mission question selection', () => {
  const quest2 = CAIDEN_ADAPTIVE_QUEST_REGISTRY['quest-2'];

  test('weekly missions serve five questions', () => {
    const config = buildCaidenAdaptiveConfig(quest2, '4-5', {
      gradeLevel: '4',
      allowStretch: false,
    });

    expect(config.questions).toHaveLength(MISSION_QUESTIONS_PER_ATTEMPT);
    expect(assertUniqueQuestionIds(config.questions)).toBe(true);
  });

  test('grade 4 without stretch still serves five 4-5 questions', () => {
    const result = finalizeAdaptiveQuestions(quest2.gradeContent, {
      missionId: 'quest-2',
      gradeLevel: '4',
      gradeBand: '4-5',
      allowStretch: false,
    });

    expect(result.questions).toHaveLength(5);
    expect(result.questions.every((question) => question.id.includes('45') || question.id.includes('__sup'))).toBe(
      true,
    );
  });

  test('2-3 band uses 2 easy + 2 medium + 1 challenge mix', () => {
    const counts = resolveGradeBandDifficultyCounts('2-3');
    expect(counts.easy + counts.medium + counts.challenge).toBe(5);
    expect(counts).toEqual({ easy: 2, medium: 2, challenge: 1 });
  });

  test('selectQuestionsByGradeDifficultyMix returns five unique IDs', () => {
    const pool = quest2.gradeContent['2-3']!.questions;
    const selected = selectQuestionsByGradeDifficultyMix(pool, '3', {
      count: 5,
      gradeBand: '2-3',
    });
    expect(selected).toHaveLength(5);
    expect(new Set(selected.map((question) => question.id)).size).toBe(5);
  });
});

describe('question attempt scoring', () => {
  test('first try and final scores can differ', () => {
    const attempts = buildAttemptsMap([
      {
        questionId: 'q1',
        first_selected_answer: 'b',
        final_selected_answer: 'a',
        is_correct_first_try: false,
        is_correct_final: true,
        attempts_count: 2,
        hints_used_count: 0,
        completed_at: new Date().toISOString(),
      },
      {
        questionId: 'q2',
        first_selected_answer: 'a',
        final_selected_answer: 'a',
        is_correct_first_try: true,
        is_correct_final: true,
        attempts_count: 1,
        hints_used_count: 0,
        completed_at: new Date().toISOString(),
      },
    ] satisfies QuestionAttemptRecord[]);

    expect(scoreFromFirstAttempts(attempts)).toBe(1);
    expect(scoreFromFinalAttempts(attempts)).toBe(2);
  });
});
