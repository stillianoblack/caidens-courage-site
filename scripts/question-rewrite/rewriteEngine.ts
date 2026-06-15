import type { GradeBand, NormalizedQuestion } from '../question-audit/types';
import { buildDistractorSet } from './distractorEngine';
import { applyPositionToChoices } from './positionBalancer';
import type { RewriteSnapshot, StagingQuestionOverride } from './types';

const MATH_KEYWORDS =
  /\b(\d+|minute|minutes|hour|\$|token|coin|budget|add|subtract|left|total|how many|how much|percent|estimate)\b/i;

const CAIDEN_MATH_MISSIONS = new Set(['quest-3', 'quest-5', 'quest-6', 'quest-7', 'quest-8']);

function shouldEnhanceCaidenMath(question: NormalizedQuestion, mathTargetIds: Set<string>): boolean {
  if (question.character !== 'caiden') return false;
  if (CAIDEN_MATH_MISSIONS.has(question.missionId)) return false;
  if (MATH_KEYWORDS.test(`${question.questionText} ${question.scenarioText}`)) return false;
  return mathTargetIds.has(question.questionId);
}

function enhanceCaidenMath(
  question: NormalizedQuestion,
): Pick<StagingQuestionOverride, 'scenarioText' | 'questionText' | 'skillTags'> {
  const band = question.gradeBand;
  const scenarios: Record<string, string[]> = {
    '2-3': [
      'Caiden has 12 minutes before the bus. Packing takes 4 minutes and finding his lunch takes 3 minutes.',
      'Caiden earned 10 tokens. A pencil costs 4 tokens and an eraser costs 3 tokens.',
      'Caiden needs to do 3 steps: shoes (2 min), backpack (3 min), water bottle (1 min). He has 8 minutes.',
    ],
    '4-5': [
      'Caiden has $12. A notebook costs $5 and colored pencils cost $8. He needs both for tomorrow.',
      'Homework will take 35 minutes. Dinner starts in 50 minutes. He also wants 10 minutes to rest.',
      'Caiden must finish reading (20 min), math (15 min), and packing (10 min) before 7:00. It is 6:10 now.',
    ],
    '6-8': [
      'Caiden has 90 minutes after school. Soccer practice is 45 minutes, homework needs 40 minutes, and dinner prep takes 15 minutes.',
      'A camp supply list costs $18 total. Caiden has $14 and can earn $3 per chore. He has time for one chore before the store closes in 25 minutes.',
      'Three tasks compete: quiz study (25 min, due tomorrow), project (60 min, due in 4 days), and chores (20 min, due tonight). He has 35 free minutes.',
    ],
    'K-1': [
      'Caiden has 3 things to put in his bag: lunch, book, and coat.',
      'Caiden sees 2 short tasks and 1 long task before recess.',
    ],
  };

  const questions: Record<string, string[]> = {
    '2-3': [
      'What should Caiden do first to use his time wisely?',
      'Can he afford both items with his tokens?',
      'Does he have enough minutes for all three steps?',
    ],
    '4-5': [
      'Can he afford both items today? What is the smartest first step?',
      'After homework and rest, will he be late for dinner?',
      'Which task should he prioritize in the time he has left?',
    ],
    '6-8': [
      'Which plan fits his 90 minutes without overbooking?',
      'What is the best use of his time and money before the store closes?',
      'Given deadlines and 35 minutes, what should he tackle first?',
    ],
    'K-1': [
      'What should Caiden pack first?',
      'Which task should come before recess?',
    ],
  };

  const pool = scenarios[band] ?? scenarios['4-5'];
  const qPool = questions[band] ?? questions['4-5'];
  const idx = question.questionId.charCodeAt(question.questionId.length - 1) % pool.length;

  return {
    scenarioText: question.scenarioText?.trim()
      ? `${question.scenarioText.trim()} ${pool[idx]}`
      : pool[idx],
    questionText: qPool[idx % qPool.length],
    skillTags: [...new Set([...question.skillTags, 'Math', 'Time Management', 'Planning'])],
  };
}

function enhanceScenarioForBand(question: NormalizedQuestion): string {
  const base = question.scenarioText.trim();
  if (base.length >= 60) return base;

  const band = question.gradeBand;
  const characterEvidence: Record<string, Record<GradeBand, string>> = {
    b4: {
      'K-1': 'B-4 scans face and body clues before naming the feeling.',
      '2-3': 'B-4 checks what happened right before the feeling got bigger.',
      '4-5': 'B-4 notices when two feelings show up at the same time and what triggered them.',
      '6-8': 'B-4 tracks intensity, triggers, and what coping step fits the moment.',
    },
    charlie: {
      'K-1': 'Charlie watches what changed between the two tests.',
      '2-3': 'Charlie predicts first, then tests one change at a time.',
      '4-5': 'Charlie connects the variable he changed to the new outcome.',
      '6-8': 'Charlie compares evidence from repeated trials before drawing a conclusion.',
    },
    zeke: {
      'K-1': 'Zeke listens first, then chooses words that help the group.',
      '2-3': 'Zeke checks how each teammate feels before deciding the next step.',
      '4-5': 'Zeke weighs two plans and how they affect the whole team.',
      '6-8': 'Zeke compares tradeoffs, speaks clearly, and invites quieter voices in.',
    },
    caiden: {
      'K-1': 'Caiden picks what to do first when several tasks compete.',
      '2-3': 'Caiden uses order and simple numbers to plan his next step.',
      '4-5': 'Caiden compares time, cost, and urgency before acting.',
      '6-8': 'Caiden plans multi-step work, estimates time, and prioritizes under pressure.',
    },
    miranda: {
      'K-1': 'Miranda rereads the sentence with the missing clue.',
      '2-3': 'Miranda gathers two details from the passage before deciding.',
      '4-5': 'Miranda compares evidence from different sentences.',
      '6-8': 'Miranda evaluates which detail best supports the inference.',
    },
  };

  const evidence = characterEvidence[question.character]?.[band] ?? '';
  if (!base) return evidence;
  if (base.includes(evidence.slice(0, 20))) return base;
  return `${base} ${evidence}`.trim();
}

function enhanceQuestionText(question: NormalizedQuestion): string {
  const text = question.questionText.trim();
  const band = question.gradeBand;

  if (question.character === 'caiden' && band === '6-8' && !/which|compare|evaluate|estimate|calculate|prioritize/i.test(text)) {
    const stem = text.replace(/\?$/, '');
    return `Given the deadlines and minutes available, ${stem.charAt(0).toLowerCase()}${stem.slice(1)}?`;
  }

  if (band === 'K-1' || band === '2-3') {
    if (/^what should/i.test(text)) return text;
    return text.endsWith('?') ? text : `${text}?`;
  }

  if (band === '4-5') {
    if (/which|what is the best|compare|why|how/i.test(text)) return text;
    const lower = text.charAt(0).toLowerCase() + text.slice(1).replace(/\?$/, '');
    return `Based on the scenario, ${lower}?`;
  }

  if (/evaluate|compare|tradeoff|evidence|best supports|most likely/i.test(text)) return text;
  const lowerStem = text.charAt(0).toLowerCase() + text.slice(1).replace(/\?$/, '');
  return `Using the evidence provided, ${lowerStem}?`;
}

function enhanceHint(question: NormalizedQuestion, best: string): string {
  const band = question.gradeBand;
  if (band === '6-8') {
    return `Compare all four options against the scenario. Which choice best matches the evidence and ${question.skillArea.toLowerCase()}?`;
  }
  if (band === '4-5') {
    return `Reread the scenario. Which answer uses the clues — not just what sounds nice?`;
  }
  return question.questionText.includes('?')
    ? `Think about ${question.skillTags[0] ?? 'the clue'} before you choose.`
    : `What strategy best fits: ${best.slice(0, 40)}…?`;
}

export function selectCaidenMathTargetIds(questions: NormalizedQuestion[]): Set<string> {
  const caiden = questions.filter((q) => q.character === 'caiden');
  const targetCount = Math.ceil(caiden.length * 0.3);
  const withoutMath = caiden.filter(
    (q) => !MATH_KEYWORDS.test(`${q.questionText} ${q.scenarioText}`),
  );
  const sorted = [...withoutMath].sort((a, b) => a.questionId.localeCompare(b.questionId));
  const picks = sorted.slice(0, targetCount);
  if (picks.length < targetCount) {
    const remaining = caiden
      .filter((q) => !picks.some((p) => p.questionId === q.questionId))
      .slice(0, targetCount - picks.length);
    picks.push(...remaining);
  }
  return new Set(picks.map((q) => q.questionId));
}

export function rewriteQuestion(
  question: NormalizedQuestion,
  correctIndex: 0 | 1 | 2 | 3,
  mathTargetIds: Set<string>,
): { override: StagingQuestionOverride; before: RewriteSnapshot } {
  const distractors = buildDistractorSet(question);
  const choices = applyPositionToChoices(
    distractors.best,
    distractors.plausibleIncomplete,
    distractors.plausibleFlawed,
    distractors.obviousWrong,
    correctIndex,
  );

  const mathEnhancement = shouldEnhanceCaidenMath(question, mathTargetIds)
    ? enhanceCaidenMath(question)
    : null;

  const scenarioText = mathEnhancement?.scenarioText ?? enhanceScenarioForBand(question);
  const questionText = mathEnhancement?.questionText ?? enhanceQuestionText(question);
  const skillTags = mathEnhancement?.skillTags ?? question.skillTags;

  const notes: string[] = ['Applied 4-choice distractor model', `Position → ${['A', 'B', 'C', 'D'][correctIndex]}`];
  if (mathEnhancement) notes.push('Added Caiden math/time/planning focus');
  if (scenarioText !== question.scenarioText) notes.push('Expanded scenario evidence');
  if (questionText !== question.questionText) notes.push('Increased grade-band rigor');

  const before: RewriteSnapshot = {
    questionId: question.questionId,
    character: question.character,
    missionId: question.missionId,
    gradeBand: question.gradeBand,
    scenarioText: question.scenarioText,
    questionText: question.questionText,
    choices: question.choices.map((c) => c.label),
    correctAnswerLabel: question.correctAnswerLabel,
    correctIndex: question.correctIndex,
  };

  const override: StagingQuestionOverride = {
    questionId: question.questionId,
    character: question.character,
    missionId: question.missionId,
    gradeBand: question.gradeBand,
    scenarioText,
    questionText,
    choices,
    correctIndex,
    skillTags,
    contentVersion: 'adaptive_staging_v3',
    rewriteNotes: notes.join('; '),
  };

  return { override, before };
}
