import fs from 'fs';
import path from 'path';
import { ADULT_GUIDE_MISSIONS } from '../../src/data/adult/adultGuideRegistry';
import { B4_ADAPTIVE_MISSION_FILES } from '../../src/data/b4/b4AdaptiveMissions';
import { CHARLIE_ADAPTIVE_MISSION_FILES } from '../../src/data/charlie/charlieAdaptiveMissions';
import { ZEKE_ADAPTIVE_MISSION_FILES } from '../../src/data/zeke/zekeAdaptiveMissions';
import { caidenAdaptiveQuests } from '../../src/data/caiden';
import { mirandaFiles } from '../../src/data/miranda';
import type { GameChoiceQuestion, GameQuestion } from '../../src/types/gameAssessment';
import type { ContentDifficulty } from '../../src/types/gradeBandContentMetadata';
import { WEEKLY_CHARACTER_MISSION_LISTS } from '../../src/lib/weeklyCharacterMissionLists';
import type { DifficultyLabel, GradeBand, NormalizedChoice, NormalizedQuestion, QuestionMode, QuestionSource, QuestionType } from './types';
import { PRODUCTION_QUALITY_OVERRIDES } from '../../src/data/shared/productionQualityManifest';
import { inferDifficultyFromGradeBand } from './questionBankAudit';

const ROOT = path.resolve(__dirname, '../..');
const STAGING_MANIFEST_PATH = path.join(ROOT, 'src/data/staging/manifest.json');
const CHOICE_IDS = ['a', 'b', 'c', 'd'];

const GRADE_BANDS: GradeBand[] = ['K-1', '2-3', '4-5', '6-8'];

function buildWeekLookup(): Map<string, { character: string; week: number }> {
  const map = new Map<string, { character: string; week: number }>();
  for (const [character, missionIds] of Object.entries(WEEKLY_CHARACTER_MISSION_LISTS)) {
    missionIds.forEach((missionId, index) => {
      map.set(missionId, { character, week: index + 1 });
    });
  }
  return map;
}

const WEEK_LOOKUP = buildWeekLookup();

function resolveWeek(character: string, missionId: string): number | null {
  const row = WEEK_LOOKUP.get(missionId);
  if (row && row.character === character) return row.week;
  return row?.week ?? null;
}

function inferMode(source: QuestionSource): QuestionMode {
  if (source === 'staging_override') return 'adaptive_staging';
  if (source === 'adult_training') return 'adult_training';
  return 'adaptive';
}

function applyProductionOverrides(question: NormalizedQuestion): NormalizedQuestion {
  const override = PRODUCTION_QUALITY_OVERRIDES[question.questionId];
  if (!override) return question;

  const next = { ...question };
  if (override.scenarioText) next.scenarioText = override.scenarioText;
  if (override.choices) {
    next.choices = override.choices.map((label, index) => ({
      id: CHOICE_IDS[index] ?? `opt-${index}`,
      label,
    }));
    if (override.correctIndex != null) {
      next.correctIndex = override.correctIndex;
      next.correctAnswerId = CHOICE_IDS[override.correctIndex] ?? 'a';
      next.correctAnswerLabel = override.choices[override.correctIndex] ?? next.correctAnswerLabel;
    }
  }
  return next;
}

function applyInferredMetadata(question: NormalizedQuestion): NormalizedQuestion {
  const inferredDifficulty =
    question.difficulty === 'unknown' ? inferDifficultyFromGradeBand(question.gradeBand) : question.difficulty;
  const metadataInferred = question.difficulty === 'unknown';

  return applyProductionOverrides({
    ...question,
    difficulty: inferredDifficulty,
    mode: question.mode ?? inferMode(question.source),
    contentVersion: question.contentVersion ?? (question.source === 'staging_override' ? 'adaptive_staging_v4_difficulty' : 'adaptive_v2'),
    weekNumber: question.weekNumber ?? question.week,
    metadataInferred,
  });
}

function mapContentDifficulty(difficulty?: ContentDifficulty, tier?: string | null): DifficultyLabel {
  if (tier === 'challenge') return 'hard';
  if (tier === 'medium') return 'medium';
  if (tier === 'easy') return 'easy';
  if (difficulty === 'beginner' || difficulty === 'adult_reflection') return 'easy';
  if (difficulty === 'intermediate' || difficulty === 'adult_guidance') return 'medium';
  if (difficulty === 'advanced') return 'hard';
  return 'unknown';
}

function classifyQuestionType(input: {
  character: string;
  questionText: string;
  scenarioText: string;
  skillTags: string[];
  skillArea: string;
}): QuestionType {
  const blob = `${input.questionText} ${input.scenarioText} ${input.skillTags.join(' ')} ${input.skillArea}`.toLowerCase();

  if (/\d+|minute|hour|\$|token|coin|budget|add|subtract|divide|percent|math|quantity|left over|how many|how much/.test(blob)) {
    return 'math';
  }
  if (/first|next|order|sequence|before|after|step|plan/.test(blob) && /which|what should|best order/.test(blob)) {
    return 'sequencing';
  }
  if (/infer|evidence|why|best explains|most likely|suggest|compare|stronger|better answer/.test(blob)) {
    return 'inference';
  }
  if (/compare|better|stronger|versus|rather than/.test(blob)) {
    return 'comparison';
  }
  if (/feel|calm|team|friend|brave|sel|regulation|emotion/.test(blob)) {
    return 'sel_decision';
  }
  if (/hypothesis|variable|experiment|science|float|sink|observe/.test(blob)) {
    return 'science_reasoning';
  }
  if (input.character === 'miranda' || /passage|read|clue|detail/.test(blob)) {
    return 'reading_comprehension';
  }
  if (/what was|which detail|who|where/.test(blob)) {
    return 'recall';
  }
  return 'multiple_choice';
}

function normalizeFromOptions(
  base: Omit<
    NormalizedQuestion,
    | 'choices'
    | 'correctAnswerId'
    | 'correctAnswerLabel'
    | 'correctIndex'
    | 'questionType'
    | 'source'
    | 'difficulty'
  > & {
    source?: NormalizedQuestion['source'];
    difficulty?: DifficultyLabel;
    explanation?: string;
    hint?: string;
  },
  options: { id: string; label: string }[],
  correctAnswer: string,
): NormalizedQuestion {
  const correctIndex = options.findIndex((option) => option.id === correctAnswer);
  const correct = options[correctIndex] ?? options[0];
  const questionType = classifyQuestionType({
    character: base.character,
    questionText: base.questionText,
    scenarioText: base.scenarioText,
    skillTags: base.skillTags,
    skillArea: base.skillArea,
  });

  return {
    ...base,
    source: base.source ?? 'adaptive_mission',
    difficulty: base.difficulty ?? 'unknown',
    questionType,
    choices: options,
    correctAnswerId: correct.id,
    correctAnswerLabel: correct.label,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  };
}

function extrasFromQuestion(question: {
  explanation?: string;
  hint?: string;
  metadata?: { difficulty?: ContentDifficulty };
  diagnosticMeta?: { difficultyTier?: string };
}): Pick<NormalizedQuestion, 'explanation' | 'hint' | 'difficulty'> {
  return {
    explanation: question.explanation,
    hint: question.hint,
    difficulty: mapContentDifficulty(
      question.metadata?.difficulty,
      question.diagnosticMeta?.difficultyTier ?? null,
    ),
  };
}

function isChoiceQuestion(question: GameQuestion): question is GameChoiceQuestion {
  return 'options' in question && Array.isArray(question.options);
}

function collectAdultTraining(): NormalizedQuestion[] {
  const rows: NormalizedQuestion[] = [];
  for (const [guideId, missions] of Object.entries(ADULT_GUIDE_MISSIONS)) {
    const character = guideId.includes('uncle') ? 'uncle-t' : 'victoria';
    for (const [missionId, config] of Object.entries(missions)) {
      let index = 0;
      for (const question of config.questions) {
        if (!isChoiceQuestion(question)) continue;
        index += 1;
        rows.push(
          normalizeFromOptions(
            {
              character,
              missionId,
              missionTitle: config.landing.subtitle,
              missionNumber: index,
              week: null,
              gradeBand: 'adult',
              questionId: question.id,
              scenarioText: question.story ?? config.landing.body,
              questionText: question.question ?? question.prompt,
              skillTags: question.skillTags ?? [],
              skillArea: 'Adult Training',
              source: 'adult_training',
              explanation: question.explainMore ?? question.feedbackCorrect,
              hint: question.hints?.[0],
              difficulty: mapContentDifficulty(undefined, question.diagnosticMeta?.difficultyTier ?? null),
            },
            question.options.map((option) => ({ id: option.id, label: option.label })),
            question.correctId,
          ),
        );
      }
    }
  }
  return rows;
}

type StagingManifest = {
  overrides: Record<
    string,
    {
      questionId: string;
      character: string;
      missionId: string;
      gradeBand: GradeBand;
      scenarioText: string;
      questionText: string;
      choices: string[];
      correctIndex: number;
      skillTags?: string[];
      hint?: string;
      explanation?: string;
      source_type?: string;
      excluded_from_health_score?: boolean;
      mode?: string;
      week_number?: number;
      content_version?: string;
      contentVersion?: string;
    }
  >;
};

function collectStagingOverrides(): NormalizedQuestion[] {
  if (!fs.existsSync(STAGING_MANIFEST_PATH)) return [];
  const manifest = JSON.parse(fs.readFileSync(STAGING_MANIFEST_PATH, 'utf8')) as StagingManifest;
  return Object.values(manifest.overrides).map((override) =>
    normalizeFromOptions(
      {
        character: override.character,
        missionId: override.missionId,
        missionTitle: override.missionId,
        missionNumber: 0,
        week: resolveWeek(override.character, override.missionId),
        gradeBand: override.gradeBand,
        questionId: override.questionId,
        scenarioText: override.scenarioText,
        questionText: override.questionText,
        skillTags: override.skillTags ?? [],
        skillArea: override.skillTags?.[0] ?? 'General',
        source: 'staging_override',
        hint: override.hint,
        explanation: override.explanation,
        difficulty: 'unknown',
        mode: 'adaptive_staging',
        contentVersion: override.content_version ?? override.contentVersion,
        weekNumber: override.week_number ?? resolveWeek(override.character, override.missionId),
        excludedFromHealthScore: override.excluded_from_health_score,
      },
      override.choices.map((label, index) => ({ id: CHOICE_IDS[index] ?? `opt-${index}`, label })),
      CHOICE_IDS[override.correctIndex] ?? 'a',
    ),
  );
}

function collectB4(): NormalizedQuestion[] {
  const rows: NormalizedQuestion[] = [];
  for (const mission of B4_ADAPTIVE_MISSION_FILES) {
    for (const band of GRADE_BANDS) {
      const content = mission.gradeContent[band];
      if (!content) continue;
      for (const question of content.questions) {
        rows.push(
          normalizeFromOptions(
            {
              character: 'b4',
              missionId: mission.id,
              missionTitle: mission.subtitle,
              missionNumber: mission.missionNumber,
              week: resolveWeek('b4', mission.id),
              gradeBand: band,
              questionId: question.id,
              scenarioText: question.scenarioText ?? mission.storySetup,
              questionText: question.question,
              skillTags: question.skillTags ?? content.skillTags,
              skillArea: mission.skillArea,
              ...extrasFromQuestion(question),
            },
            question.options,
            question.correctAnswer,
          ),
        );
      }
    }
  }
  return rows;
}

function collectCharlie(): NormalizedQuestion[] {
  const rows: NormalizedQuestion[] = [];
  for (const mission of CHARLIE_ADAPTIVE_MISSION_FILES) {
    for (const band of GRADE_BANDS) {
      const content = mission.gradeContent[band];
      if (!content) continue;
      for (const question of content.questions) {
        rows.push(
          normalizeFromOptions(
            {
              character: 'charlie',
              missionId: mission.id,
              missionTitle: mission.subtitle,
              missionNumber: mission.missionNumber,
              week: resolveWeek('charlie', mission.id),
              gradeBand: band,
              questionId: question.id,
              scenarioText: question.scenarioText ?? mission.storySetup,
              questionText: question.question,
              skillTags: question.skillTags ?? content.skillTags,
              skillArea: mission.skillArea,
              ...extrasFromQuestion(question),
            },
            question.options,
            question.correctAnswer,
          ),
        );
      }
    }
  }
  return rows;
}

function collectZeke(): NormalizedQuestion[] {
  const rows: NormalizedQuestion[] = [];
  for (const mission of ZEKE_ADAPTIVE_MISSION_FILES) {
    for (const band of GRADE_BANDS) {
      const content = mission.gradeContent[band];
      if (!content) continue;
      for (const question of content.questions) {
        rows.push(
          normalizeFromOptions(
            {
              character: 'zeke',
              missionId: mission.id,
              missionTitle: mission.subtitle,
              missionNumber: mission.missionNumber,
              week: resolveWeek('zeke', mission.id),
              gradeBand: band,
              questionId: question.id,
              scenarioText: question.scenarioText ?? mission.storySetup,
              questionText: question.question,
              skillTags: question.skillTags ?? content.skillTags,
              skillArea: mission.skillArea,
              ...extrasFromQuestion(question),
            },
            question.options,
            question.correctAnswer,
          ),
        );
      }
    }
  }
  return rows;
}

function collectCaiden(): NormalizedQuestion[] {
  const rows: NormalizedQuestion[] = [];
  for (const quest of caidenAdaptiveQuests) {
    for (const band of GRADE_BANDS) {
      const content = quest.gradeContent[band];
      if (!content) continue;
      for (const question of content.questions) {
        rows.push(
          normalizeFromOptions(
            {
              character: 'caiden',
              missionId: quest.id,
              missionTitle: quest.subtitle,
              missionNumber: quest.questNumber,
              week: resolveWeek('caiden', quest.id),
              gradeBand: band,
              questionId: question.id,
              scenarioText: question.scenarioText ?? '',
              questionText: question.question,
              skillTags: question.skillTags ?? content.skillTags,
              skillArea: quest.skillFocus[0] ?? 'Focus',
              ...extrasFromQuestion(question),
            },
            question.options,
            question.correctAnswer,
          ),
        );
      }
    }
  }
  return rows;
}

function collectMiranda(): NormalizedQuestion[] {
  const rows: NormalizedQuestion[] = [];
  for (const file of mirandaFiles) {
    for (const band of GRADE_BANDS) {
      const content = file.gradeContent[band];
      if (!content) continue;
      for (const question of content.questions) {
        rows.push(
          normalizeFromOptions(
            {
              character: 'miranda',
              missionId: file.id,
              missionTitle: file.title,
              missionNumber: file.fileNumber,
              week: resolveWeek('miranda', file.id),
              gradeBand: band,
              questionId: question.id,
              scenarioText: content.passage,
              questionText: question.question,
              skillTags: question.skillTags ?? content.skillTags,
              skillArea: file.skillFocus.join(', '),
              ...extrasFromQuestion(question),
            },
            question.options,
            question.correctAnswer,
          ),
        );
      }
    }
  }
  return rows;
}

export function collectProductionQuestions(): NormalizedQuestion[] {
  const production = [
    ...collectB4(),
    ...collectCharlie(),
    ...collectZeke(),
    ...collectCaiden(),
    ...collectMiranda(),
    ...collectAdultTraining(),
  ];
  return production.map(applyInferredMetadata);
}

export function collectAllQuestions(): NormalizedQuestion[] {
  const production = [
    ...collectB4(),
    ...collectCharlie(),
    ...collectZeke(),
    ...collectCaiden(),
    ...collectMiranda(),
  ];
  const staging = collectStagingOverrides();
  const adult = collectAdultTraining();

  const byId = new Map<string, NormalizedQuestion>();
  for (const question of production) {
    byId.set(`${question.source}:${question.questionId}:${question.gradeBand}`, question);
  }
  for (const question of staging) {
    byId.set(`${question.source}:${question.questionId}:${question.gradeBand}`, question);
  }
  for (const question of adult) {
    byId.set(`${question.source}:${question.questionId}:${question.gradeBand}`, question);
  }

  return Array.from(byId.values()).map(applyInferredMetadata);
}

export function indexToLetter(index: number): string {
  return ['A', 'B', 'C', 'D'][index] ?? '?';
}
