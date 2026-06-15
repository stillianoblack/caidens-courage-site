import { B4_ADAPTIVE_MISSION_FILES } from '../../src/data/b4/b4AdaptiveMissions';
import { CHARLIE_ADAPTIVE_MISSION_FILES } from '../../src/data/charlie/charlieAdaptiveMissions';
import { ZEKE_ADAPTIVE_MISSION_FILES } from '../../src/data/zeke/zekeAdaptiveMissions';
import { caidenAdaptiveQuests } from '../../src/data/caiden';
import { mirandaFiles } from '../../src/data/miranda';
import { WEEKLY_CHARACTER_MISSION_LISTS } from '../../src/lib/weeklyCharacterMissionLists';
import type { GradeBand, NormalizedChoice, NormalizedQuestion, QuestionType } from './types';

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
  base: Omit<NormalizedQuestion, 'choices' | 'correctAnswerId' | 'correctAnswerLabel' | 'correctIndex' | 'questionType'>,
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
    questionType,
    choices: options,
    correctAnswerId: correct.id,
    correctAnswerLabel: correct.label,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  };
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

export function collectAllQuestions(): NormalizedQuestion[] {
  return [...collectB4(), ...collectCharlie(), ...collectZeke(), ...collectCaiden(), ...collectMiranda()];
}

export function indexToLetter(index: number): string {
  return ['A', 'B', 'C', 'D'][index] ?? '?';
}
