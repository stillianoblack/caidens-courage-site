import {
  FOCUS_FLAME_CHALLENGE_CONFIGS,
  FOCUS_FLAME_CHALLENGE_MISSIONS,
  resolveFocusFlameChallengeAvailability,
} from '../../data/caiden/focusFlameChallenges';
import { caidenAdaptiveQuests } from '../../data/caiden';
import {
  getIncorrectFeedbackMessage,
  isGameAnswerCorrect,
} from '../gameAssessmentValidation';
import { isChoiceQuestion, isSequenceQuestion } from '../../types/gameAssessment';

describe('Focus Flame Challenge layer', () => {
  it('preserves the nine authoritative Caiden story banks', () => {
    expect(caidenAdaptiveQuests.map((quest) => quest.id)).toEqual([
      'quest-1',
      'quest-2',
      'quest-3',
      'quest-4',
      'quest-5',
      'quest-6',
      'quest-7',
      'quest-8',
      'quest-9',
    ]);
  });

  it('defines one published eight-scenario mission for every week from 3 through 9', () => {
    expect(FOCUS_FLAME_CHALLENGE_MISSIONS.map((mission) => mission.week)).toEqual([
      3, 4, 5, 6, 7, 8, 9,
    ]);
    for (const mission of FOCUS_FLAME_CHALLENGE_MISSIONS) {
      expect(mission.status).toBe('published');
      expect(mission.gradeSupport.primary).toBe('3-6');
      expect(mission.challenges).toHaveLength(8);
      expect(FOCUS_FLAME_CHALLENGE_CONFIGS[mission.id].questions).toHaveLength(8);
      expect(FOCUS_FLAME_CHALLENGE_CONFIGS[mission.id].complete.badges).toContain(
        mission.badge,
      );
    }
  });

  it('uses globally unique stable IDs and complete challenge metadata', () => {
    const questions = Object.values(FOCUS_FLAME_CHALLENGE_CONFIGS).flatMap(
      (config) => config.questions,
    );
    expect(questions).toHaveLength(56);
    expect(new Set(questions.map((question) => question.id)).size).toBe(56);
    for (const question of questions) {
      expect(question.id).toMatch(/^ffc-w[3-9]-c[1-8]$/);
      expect(question.challengeMeta).toMatchObject({
        status: 'published',
        badgeProgressionValue: 1,
      });
      expect(question.challengeMeta?.illustrationKey).toBeTruthy();
      expect(question.skillTags?.length).toBeGreaterThan(0);
    }
  });

  it('validates one best answer, four plausible choices, and answer-specific coaching', () => {
    const questions = Object.values(FOCUS_FLAME_CHALLENGE_CONFIGS).flatMap(
      (config) => config.questions,
    );
    for (const question of questions) {
      if (!isChoiceQuestion(question)) continue;
      expect(question.options).toHaveLength(4);
      expect(question.options.filter((option) => option.id === question.correctId)).toHaveLength(1);
      for (const option of question.options) {
        if (option.id === question.correctId) continue;
        expect(option.incorrectFeedback?.trim()).toBeTruthy();
        expect(getIncorrectFeedbackMessage(question, option.id)).toBe(option.incorrectFeedback);
      }
    }
  });

  it('validates sequencing answers and includes two staged Week 9 plans', () => {
    const week9 = FOCUS_FLAME_CHALLENGE_CONFIGS['focus-flame-week-9'];
    const sequences = week9.questions.filter(isSequenceQuestion);
    expect(sequences).toHaveLength(2);
    for (const question of sequences) {
      expect(question.items).toHaveLength(4);
      expect(new Set(question.correctOrder).size).toBe(4);
      expect(isGameAnswerCorrect(question, question.correctOrder)).toBe(true);
      expect(isGameAnswerCorrect(question, [...question.correctOrder].reverse())).toBe(false);
    }
  });

  it('keeps challenge unlocks tied to the existing matching quest prerequisite', () => {
    expect(
      resolveFocusFlameChallengeAvailability({ prerequisiteStatus: 'locked', completed: false }),
    ).toBe('locked');
    expect(
      resolveFocusFlameChallengeAvailability({ prerequisiteStatus: 'active', completed: false }),
    ).toBe('available');
    expect(
      resolveFocusFlameChallengeAvailability({ prerequisiteStatus: 'locked', completed: true }),
    ).toBe('completed');
  });
});
