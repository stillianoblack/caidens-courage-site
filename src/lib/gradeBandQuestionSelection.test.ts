import './../data/caiden/index';
import { CAIDEN_ADAPTIVE_QUEST_REGISTRY, buildCaidenAdaptiveConfig } from '../data/caiden/caidenAdaptiveBuilder';
import { finalizeAdaptiveQuestions } from './adaptiveQuestionSelection';
import { resolveBaseGradeBand } from './getGradeBand';
import { passesReasoningDepthCheck } from './reasoningDepthFilter';
import { classifyQuestionDifficultyTier } from './questionDifficultySelection';

describe('grade band question selection', () => {
  const quest2 = CAIDEN_ADAPTIVE_QUEST_REGISTRY['quest-2'];

  test('grade 4 without stretch serves full 4-5 authored inventory', () => {
    const result = finalizeAdaptiveQuestions(quest2.gradeContent, {
      missionId: 'quest-2',
      gradeLevel: '4',
      gradeBand: '4-5',
      allowStretch: false,
    });

    expect(result.contentBand).toBe('4-5');
    expect(result.usedStretch).toBe(false);
    expect(result.questions.length).toBe(quest2.gradeContent['4-5']!.questions.length);
    expect(result.questions.every((question) => !question.id.includes('__sup'))).toBe(true);
    expect(result.questions.some((question) => question.id === 'cq2-68-q1')).toBe(false);
  });

  test('grade 4 with stretch serves full stretch-band authored inventory', () => {
    const result = finalizeAdaptiveQuestions(quest2.gradeContent, {
      missionId: 'quest-2',
      gradeLevel: '4',
      gradeBand: '4-5',
      allowStretch: true,
    });

    expect(result.usedStretch).toBe(true);
    expect(result.contentBand).toBe('6-8');
    expect(result.questions.length).toBe(quest2.gradeContent['6-8']!.questions.length);
    expect(result.questions.every((question) => !question.id.includes('__sup'))).toBe(true);
  });

  test('cq2-68-q1 fails reasoning-depth filter for grade 4', () => {
    const question = quest2.gradeContent['6-8']!.questions.find((row) => row.id === 'cq2-68-q1');
    expect(question).toBeDefined();
    expect(passesReasoningDepthCheck(question!, '4')).toBe(false);
  });

  test('base band for grade 4 is 4-5 even when stretch is enabled', () => {
    expect(
      resolveBaseGradeBand({
        gradeLevel: '4',
      }),
    ).toBe('4-5');
  });

  test('classifyQuestionDifficultyTier prefers metadata over array position', () => {
    const question = quest2.gradeContent['4-5']!.questions[2];
    expect(question.metadata?.difficulty).toBe('advanced');
    expect(classifyQuestionDifficultyTier(question, 0, 3)).toBe('challenge');
  });

  test('buildCaidenAdaptiveConfig for grade 4 uses async selection context', () => {
    const config = buildCaidenAdaptiveConfig(quest2, '4-5', {
      gradeLevel: '4',
      allowStretch: false,
      participantId: 'test-participant',
    });

    expect(config.adaptiveMeta?.contentBand).toBe('4-5');
    expect(config.questions.some((question) => question.id === 'cq2-68-q1')).toBe(false);
    expect(config.questions.length).toBe(quest2.gradeContent['4-5']!.questions.length);
    expect(config.questions.every((question) => !question.id.includes('__sup'))).toBe(true);
    expect(config.questions[0]?.diagnosticMeta?.contentBand).toBe('4-5');
  });
});

describe('grade settings resolution', () => {
  test('saved grade level maps to 4-5 base band', () => {
    expect(resolveBaseGradeBand({ gradeLevel: '4' })).toBe('4-5');
  });
});
