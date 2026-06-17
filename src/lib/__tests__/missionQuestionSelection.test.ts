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

  test('weekly missions serve up to five unique authored questions', () => {
    const config = buildCaidenAdaptiveConfig(quest2, '4-5', {
      gradeLevel: '4',
      allowStretch: false,
    });

    expect(config.questions.length).toBeGreaterThan(0);
    expect(config.questions.length).toBeLessThanOrEqual(MISSION_QUESTIONS_PER_ATTEMPT);
    expect(assertUniqueQuestionIds(config.questions)).toBe(true);
  });

  test('grade 4 without stretch serves all authored unique questions', () => {
    const result = finalizeAdaptiveQuestions(quest2.gradeContent, {
      missionId: 'quest-2',
      gradeLevel: '4',
      gradeBand: '4-5',
      allowStretch: false,
    });

    expect(result.questions.length).toBe(quest2.gradeContent['4-5']!.questions.length);
    expect(result.questions.every((question) => !question.id.includes('__sup'))).toBe(true);
    expect(new Set(result.questions.map((question) => question.id)).size).toBe(
      result.questions.length,
    );
  });

  test('2-3 band uses 2 easy + 2 medium + 1 challenge mix', () => {
    const counts = resolveGradeBandDifficultyCounts('2-3');
    expect(counts.easy + counts.medium + counts.challenge).toBe(5);
    expect(counts).toEqual({ easy: 2, medium: 2, challenge: 1 });
  });

  test('selectQuestionsByGradeDifficultyMix returns unique IDs without padding duplicates', () => {
    const pool = quest2.gradeContent['2-3']!.questions;
    const selected = selectQuestionsByGradeDifficultyMix(pool, '3', {
      count: 5,
      gradeBand: '2-3',
    });
    expect(selected.length).toBe(pool.length);
    expect(new Set(selected.map((question) => question.id)).size).toBe(selected.length);
    expect(selected.every((question) => !question.id.includes('__sup'))).toBe(true);
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
