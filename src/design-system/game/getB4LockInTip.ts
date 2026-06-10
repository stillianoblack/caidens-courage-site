import type { GameAnswerValue, GameQuestion } from '../../types/gameAssessment';
import {
  isChoiceQuestion,
  isSequenceQuestion,
  isTrueFalseQuestion,
} from '../../types/gameAssessment';
import type { LearningMomentVariant } from './LearningMomentCard';

export type B4LockInPortalType = 'kid' | 'family' | 'facilitator';

export type B4SkillArea =
  | 'focus'
  | 'emotional_regulation'
  | 'reading_confidence'
  | 'communication'
  | 'self_advocacy'
  | 'nature'
  | 'courage'
  | 'adult-learning'
  | string;

export type B4LockInTipInput = {
  portalType: B4LockInPortalType;
  gameId?: string;
  moduleId?: string;
  questionId: string;
  selectedAnswer: GameAnswerValue;
  correctAnswer?: string | boolean | string[];
  isCorrect: boolean;
  skillArea?: B4SkillArea;
  characterId?: string;
  learningGoal?: string;
  question?: GameQuestion;
};

export type B4LockInTipTone = 'success' | 'try' | 'neutral';

export type B4LockInTipResult = {
  title: string;
  headline: string;
  body?: string;
  tips: string[];
  tipsLabel: string;
  tone: B4LockInTipTone;
  variant: LearningMomentVariant;
};

type AnswerLabels = {
  selectedLabel?: string;
  correctLabel?: string;
  selectedId?: string;
};

const TOO_BIG_PATTERNS = ['whole', 'everything', 'all at once', 'entire', 'at once'];
const AVOIDANCE_PATTERNS = ['give up', 'quit', 'wait until', 'wait', 'later', 'stop writing'];
const DISTRACTION_PATTERNS = ['notification', 'game', 'check every', 'snack', 'tablet', 'phone'];

const CHARACTER_NAMES: Record<string, string> = {
  caiden: 'Caiden',
  miranda: 'Miranda',
  charlie: 'Charlie',
  b4: 'your camper',
  zeke: 'Zeke',
};

export function resolveB4PortalType(pathname: string, portalRole?: string | null): B4LockInPortalType {
  if (
    portalRole === 'facilitator' ||
    pathname.includes('/facilitator') ||
    pathname.includes('/program-dashboard')
  ) {
    return 'facilitator';
  }
  if (portalRole === 'family' || pathname.includes('/family') || pathname.includes('/portal/family')) {
    return 'family';
  }
  return 'kid';
}

export function normalizeB4SkillArea(skillArea?: string): B4SkillArea {
  switch (skillArea) {
    case 'feelings':
      return 'emotional_regulation';
    case 'reading':
      return 'reading_confidence';
    case 'executive-function':
    case 'support':
    case 'understanding':
      return 'focus';
    case 'emotional-regulation':
      return 'emotional_regulation';
    case 'learning-styles':
      return 'communication';
    default:
      return skillArea ?? 'focus';
  }
}

function characterName(characterId?: string): string {
  return CHARACTER_NAMES[characterId ?? ''] ?? 'your learner';
}

function shortenLabel(label: string): string {
  const trimmed = label.trim();
  return trimmed.length > 48 ? `${trimmed.slice(0, 45)}…` : trimmed;
}

function labelMatchesPatterns(label: string | undefined, patterns: string[]): boolean {
  if (!label) return false;
  const lower = label.toLowerCase();
  return patterns.some((pattern) => lower.includes(pattern));
}

export function resolveAnswerLabels(
  question: GameQuestion,
  selectedAnswer: GameAnswerValue,
): AnswerLabels {
  if (isChoiceQuestion(question)) {
    const selectedId = typeof selectedAnswer === 'string' ? selectedAnswer : undefined;
    const selectedLabel = question.options.find((option) => option.id === selectedId)?.label;
    const correctLabel = question.options.find((option) => option.id === question.correctId)?.label;
    return { selectedLabel, correctLabel, selectedId };
  }

  if (isTrueFalseQuestion(question)) {
    const selectedLabel =
      selectedAnswer === true ? 'True' : selectedAnswer === false ? 'False' : undefined;
    const correctLabel = question.correctAnswer ? 'True' : 'False';
    return { selectedLabel, correctLabel };
  }

  if (isSequenceQuestion(question) && Array.isArray(selectedAnswer)) {
    const selectedLabel = selectedAnswer
      .map((id) => question.items.find((item) => item.id === id)?.label)
      .filter(Boolean)
      .join(' → ');
    const correctLabel = question.correctOrder
      .map((id) => question.items.find((item) => item.id === id)?.label)
      .filter(Boolean)
      .join(' → ');
    return { selectedLabel, correctLabel };
  }

  return {};
}

function tipsLabelForPortal(portalType: B4LockInPortalType): string {
  switch (portalType) {
    case 'family':
      return 'Try this together';
    case 'facilitator':
      return 'Camp & classroom moves';
    default:
      return 'Try this next';
  }
}

function resolveQuestionHeadline(question: GameQuestion, isCorrect: boolean): string | undefined {
  return isCorrect ? question.feedbackCorrect : question.feedbackIncorrect;
}

function resolveQuestionBody(question: GameQuestion, isCorrect: boolean): string | undefined {
  const detail = isCorrect
    ? question.feedbackDetailCorrect ?? question.feedbackDetail
    : question.feedbackDetailIncorrect ?? question.feedbackDetail;
  return detail?.whyItMatters;
}

function resolveQuestionTips(question: GameQuestion, isCorrect: boolean): string[] | undefined {
  const tips = isCorrect
    ? question.lockInTipsCorrect ?? question.lockInTips
    : question.lockInTipsIncorrect ?? question.lockInTips;
  return tips?.length ? [...tips] : undefined;
}

function answerAwareIncorrectHeadline(
  selectedLabel: string | undefined,
  fallback: string,
  skill: B4SkillArea,
): string {
  if (labelMatchesPatterns(selectedLabel, TOO_BIG_PATTERNS)) {
    return 'That feels helpful, but it may be too big to start with.';
  }
  if (labelMatchesPatterns(selectedLabel, AVOIDANCE_PATTERNS)) {
    return 'That can feel easier in the moment — let us find one small move instead.';
  }
  if (labelMatchesPatterns(selectedLabel, DISTRACTION_PATTERNS)) {
    return 'That may pull attention away from what matters right now.';
  }
  if (skill === 'reading_confidence' && selectedLabel) {
    return `Slow down and look again — "${shortenLabel(selectedLabel)}" may miss the clue.`;
  }
  return fallback;
}

function enhanceFacilitatorFocusCopy(
  portalType: B4LockInPortalType,
  skill: B4SkillArea,
  isCorrect: boolean,
  labels: AnswerLabels,
  headline: string,
  body: string,
): { headline: string; body: string } {
  if (portalType !== 'facilitator' || skill !== 'focus') {
    return { headline, body };
  }

  if (isCorrect) {
    const correctLower = labels.correctLabel?.toLowerCase() ?? '';
    const usesPackStep = correctLower.includes('pack') || correctLower.includes('pick up');
    return {
      headline: usesPackStep
        ? 'Yes. Packing what he needs first helps Caiden start calm and prepared.'
        : headline,
      body: 'This choice focuses on the first real step. When students know what comes next, the bigger task feels easier.',
    };
  }

  return {
    headline:
      labels.selectedLabel != null
        ? 'That choice might feel tempting, but it does not help Caiden get ready.'
        : headline,
    body: 'B-4 is looking for the smallest useful first step. Starting with the right item helps the brain lock in.',
  };
}

function buildFocusBody(
  isCorrect: boolean,
  labels: AnswerLabels,
  character: string,
  portalType: B4LockInPortalType,
): string {
  const { selectedLabel, correctLabel } = labels;

  if (isCorrect) {
    if (correctLabel) {
      if (portalType === 'facilitator') {
        return `${character} locked in on a clear first move. Small starts build momentum in camp circles and classrooms alike.`;
      }
      if (portalType === 'family') {
        return `Starting with "${shortenLabel(correctLabel)}" gives ${character} a manageable entry point you can cheer on together.`;
      }
      return `${character} does not have to do everything at once. Starting with one clear action helps the brain lock in.`;
    }
    return `${character} picked a smart first move. One clear step beats a pile of tasks.`;
  }

  if (labelMatchesPatterns(selectedLabel, TOO_BIG_PATTERNS)) {
    return `Big tasks can make focus harder. ${character} needs one small first step so the brain knows where to begin.`;
  }
  if (labelMatchesPatterns(selectedLabel, DISTRACTION_PATTERNS)) {
    return `That choice may pull attention away from the main task. ${character} can protect focus by clearing the distraction first.`;
  }
  if (selectedLabel && correctLabel) {
    return `"${shortenLabel(selectedLabel)}" may not get ${character} closer right now. Look for a smaller move like "${shortenLabel(correctLabel)}."`;
  }
  return `That path may not help ${character} lock in yet. Look for the smallest next step.`;
}

function buildSkillBody(
  skill: B4SkillArea,
  isCorrect: boolean,
  labels: AnswerLabels,
  character: string,
  portalType: B4LockInPortalType,
  learningGoal?: string,
): string {
  const goal = learningGoal ? ` for ${learningGoal.toLowerCase()}` : '';

  switch (skill) {
    case 'emotional_regulation':
      return isCorrect
        ? `${character} noticed the feeling and chose a reset move${goal}. Naming emotions opens the door to calmer choices.`
        : `${character} may need a pause before the next move${goal}. A breath and a named feeling can unlock a better choice.`;
    case 'reading_confidence':
      return isCorrect
        ? `${character} used the clues in the text${goal}. Slow, careful reading builds detective confidence.`
        : `Reread the passage${goal}. One clue at a time is stronger than guessing from a hunch.`;
    case 'communication':
      return isCorrect
        ? `${character} chose words that help others understand${goal}. Clear communication keeps the group moving.`
        : `Think about what ${character} needs to say${goal}. A clear ask or listen-first move often works better.`;
    case 'self_advocacy':
    case 'courage':
      return isCorrect
        ? `${character} named what they need${goal}. Asking for support is a brave focus skill.`
        : `${character} can name the obstacle and ask for one specific kind of help${goal}.`;
    case 'nature':
      return isCorrect
        ? `${character} noticed how nature works${goal}. Curiosity plus one observation builds understanding.`
        : `Look at what the animal or plant is really doing${goal}. The answer is usually in the behavior, not the joke option.`;
    default:
      return buildFocusBody(isCorrect, labels, character, portalType);
  }
}

type SkillTipSet = { correct: string[]; incorrect: string[] };

const SKILL_TIP_TEMPLATES: Record<string, SkillTipSet> = {
  focus: {
    correct: [
      'Name the first step out loud.',
      'Pick one small focus burst.',
      'Celebrate effort, not perfection.',
    ],
    incorrect: [
      'Look for the smallest action.',
      'Start with one item or one area.',
      'Build momentum before doing the whole task.',
    ],
  },
  emotional_regulation: {
    correct: [
      'Pause and take one calm breath.',
      'Name the feeling in one word.',
      'Choose the next move after shoulders drop.',
    ],
    incorrect: [
      'Breathe together for three counts.',
      'Ask what felt hardest before fixing it.',
      'Return to the task after the body calms.',
    ],
  },
  reading_confidence: {
    correct: [
      'Reread one sentence that holds the clue.',
      'Point to the exact words that helped.',
      'Say your evidence out loud before answering.',
    ],
    incorrect: [
      'Slow down and scan the passage again.',
      'Look for clue words around the blank.',
      'Eliminate answers that contradict the text.',
    ],
  },
  communication: {
    correct: [
      'Say what you need in one clear sentence.',
      'Make eye contact or face your partner.',
      'Check that the other person understood.',
    ],
    incorrect: [
      'Ask a specific question instead of guessing.',
      'Listen first, then respond.',
      'Use a calm voice when asking for help.',
    ],
  },
  self_advocacy: {
    correct: [
      'Name the obstacle out loud.',
      'Ask for one kind of support.',
      'Thank the person who helped you try again.',
    ],
    incorrect: [
      'Say what feels hard before giving up.',
      'Pick one adult or friend to ask.',
      'Describe the stuck point, not just "I cannot."',
    ],
  },
  nature: {
    correct: [
      'Describe what you see the creature doing.',
      'Connect the behavior to its habitat.',
      'Share one new fact with a camp buddy.',
    ],
    incorrect: [
      'Picture the real animal, not the silly option.',
      'Ask what survival need the behavior serves.',
      'Look back at the scene card for a hint.',
    ],
  },
};

function characterTipFlavor(tips: string[], characterId?: string, portalType?: B4LockInPortalType): string[] {
  if (!characterId) return tips;

  const flavored = [...tips];
  if (characterId === 'caiden' && portalType === 'kid') {
    flavored[0] = flavored[0].replace(/^Name/, 'Tell Caiden: name');
  }
  if (characterId === 'miranda' && portalType !== 'facilitator') {
    flavored[0] = 'Point to the clue in the story before deciding.';
  }
  if (characterId === 'b4') {
    flavored[0] = 'Use a B-4 reset breath before the next try.';
  }

  return flavored;
}

function portalAdaptTips(tips: string[], portalType: B4LockInPortalType): string[] {
  if (portalType === 'family') {
    return tips.map((tip, index) => {
      if (index === 0 && !tip.toLowerCase().includes('together')) {
        return `Together: ${tip.charAt(0).toLowerCase()}${tip.slice(1)}`;
      }
      return tip;
    });
  }

  if (portalType === 'facilitator') {
    const adapted = [...tips];
    const hasClassroom = adapted.some((tip) => /classroom|camp circle|group/i.test(tip));
    if (!hasClassroom && adapted.length >= 2) {
      adapted[adapted.length - 1] = `${adapted[adapted.length - 1]} Model it in a camp circle or morning meeting.`;
    }
    return adapted;
  }

  return tips;
}

function fallbackTips(
  skill: B4SkillArea,
  isCorrect: boolean,
  characterId: string | undefined,
  portalType: B4LockInPortalType,
  labels: AnswerLabels,
): string[] {
  const template = SKILL_TIP_TEMPLATES[skill] ?? SKILL_TIP_TEMPLATES.focus;
  let tips = isCorrect ? [...template.correct] : [...template.incorrect];

  if (!isCorrect && labels.correctLabel) {
    tips[0] = `Look for a move like "${shortenLabel(labels.correctLabel)}."`;
  }

  tips = characterTipFlavor(tips, characterId, portalType);
  return portalAdaptTips(tips.slice(0, 3), portalType);
}

function detailTryThisTips(question: GameQuestion, isCorrect: boolean): string[] | undefined {
  const detail = isCorrect
    ? question.feedbackDetailCorrect ?? question.feedbackDetail
    : question.feedbackDetailIncorrect ?? question.feedbackDetail;
  if (detail?.tryThis?.length) {
    return [...detail.tryThis];
  }
  return undefined;
}

/**
 * Focus Flame — contextual B-4 Lock-In Tip generator.
 * Prefers authored question data, then answer-aware + skill-aware fallbacks.
 */
export function getB4LockInTip(input: B4LockInTipInput): B4LockInTipResult {
  const {
    portalType,
    selectedAnswer,
    isCorrect,
    skillArea,
    characterId,
    learningGoal,
    question,
  } = input;

  const skill = normalizeB4SkillArea(skillArea);
  const character = characterName(characterId);
  const labels = question ? resolveAnswerLabels(question, selectedAnswer) : {};
  const tone: B4LockInTipTone = isCorrect ? 'success' : 'try';

  let headline = question ? resolveQuestionHeadline(question, isCorrect) : undefined;
  let body = question ? resolveQuestionBody(question, isCorrect) : undefined;
  let tips = question ? resolveQuestionTips(question, isCorrect) : undefined;

  if (!isCorrect && headline && labels.selectedLabel) {
    headline = answerAwareIncorrectHeadline(labels.selectedLabel, headline, skill);
  }

  if (!headline) {
    if (isCorrect) {
      headline = labels.correctLabel
        ? `Yes. "${shortenLabel(labels.correctLabel)}" is a strong move.`
        : 'Nice lock-in. That choice supports the focus skill.';
    } else {
      headline = labels.selectedLabel
        ? answerAwareIncorrectHeadline(
            labels.selectedLabel,
            `Let us rethink "${shortenLabel(labels.selectedLabel)}."`,
            skill,
          )
        : 'Let us find a move that helps more.';
    }
  }

  if (!body) {
    body = buildSkillBody(skill, isCorrect, labels, character, portalType, learningGoal);
  }

  if (!tips?.length) {
    tips = detailTryThisTips(question!, isCorrect);
  }

  if (!tips?.length) {
    tips = fallbackTips(skill, isCorrect, characterId, portalType, labels);
  } else {
    tips = portalAdaptTips(tips.slice(0, 3), portalType);
  }

  const hadAuthoredTips = Boolean(question && resolveQuestionTips(question, isCorrect)?.length);
  if (portalType === 'facilitator' && skill === 'focus' && !isCorrect && !hadAuthoredTips) {
    tips = [
      'Look for what helps the mission begin.',
      'Choose one small action.',
      'Avoid starting with distractions.',
    ];
  }

  const enhanced = enhanceFacilitatorFocusCopy(
    portalType,
    skill,
    isCorrect,
    labels,
    headline,
    body ?? '',
  );
  headline = enhanced.headline;
  body = enhanced.body;

  return {
    title: 'B-4 Lock-In Tips',
    headline,
    body,
    tips,
    tipsLabel: tipsLabelForPortal(portalType),
    tone,
    variant: 'B4_LOCK_IN',
  };
}

export type BuildB4LockInFromGameParams = {
  portalType: B4LockInPortalType;
  config: { id: string };
  question: GameQuestion;
  answer: GameAnswerValue;
  isCorrect: boolean;
  tracking?: {
    moduleId?: string;
    character?: string;
    skillArea?: string;
  } | null;
};

/** Convenience wrapper for GameAssessmentFlow / MissionQuizLayout. */
export function buildB4LockInTipFromGame(params: BuildB4LockInFromGameParams): B4LockInTipResult {
  const { portalType, config, question, answer, isCorrect, tracking } = params;
  return getB4LockInTip({
    portalType,
    gameId: config.id,
    moduleId: tracking?.moduleId,
    questionId: question.id,
    selectedAnswer: answer,
    isCorrect,
    skillArea: tracking?.skillArea,
    characterId: tracking?.character,
    learningGoal: question.clueCard?.tag ?? question.clueCard?.label,
    question,
  });
}
