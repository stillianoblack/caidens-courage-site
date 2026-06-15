import { BASELINE_WEEK, GROWTH_START_WEEK } from '../config/pilotBaselineWeeks';
import {
  computeQuestionAttemptMetrics,
  type QuestionAttemptMetricRow,
} from './questionAttemptMetrics';
import { filterInitialAttemptRows } from './missionAttemptType';

export { BASELINE_WEEK, GROWTH_START_WEEK };

export type BaselineGrowthSkillSlice = {
  key: string;
  baselineFirstAttemptAccuracy: number;
  currentFirstAttemptAccuracy: number;
  growthDelta: number;
  baselineQuestions: number;
  currentQuestions: number;
};

export type BaselineGrowthReport = {
  baselineWeek: number;
  growthStartWeek: number;
  baseline: ReturnType<typeof computeQuestionAttemptMetrics>;
  current: ReturnType<typeof computeQuestionAttemptMetrics>;
  growthDelta: {
    first_attempt_accuracy: number;
    final_accuracy: number;
    questions_attempted: number;
  };
  byCharacter: BaselineGrowthSkillSlice[];
  bySkill: BaselineGrowthSkillSlice[];
};

function sliceMetrics(rows: QuestionAttemptMetricRow[]): ReturnType<typeof computeQuestionAttemptMetrics> {
  return computeQuestionAttemptMetrics(rows);
}

function groupGrowthSlices(
  rows: QuestionAttemptMetricRow[],
  keyForRow: (row: QuestionAttemptMetricRow) => string,
): BaselineGrowthSkillSlice[] {
  const keys = new Set(rows.map(keyForRow));
  const slices: BaselineGrowthSkillSlice[] = [];

  for (const key of Array.from(keys)) {
    const baselineRows = rows.filter(
      (row) => keyForRow(row) === key && row.week_number === BASELINE_WEEK,
    );
    const currentRows = rows.filter(
      (row) => keyForRow(row) === key && (row.week_number ?? 0) >= GROWTH_START_WEEK,
    );
    const baseline = sliceMetrics(baselineRows);
    const current = sliceMetrics(currentRows);
    slices.push({
      key,
      baselineFirstAttemptAccuracy: baseline.first_attempt_accuracy,
      currentFirstAttemptAccuracy: current.first_attempt_accuracy,
      growthDelta: current.first_attempt_accuracy - baseline.first_attempt_accuracy,
      baselineQuestions: baseline.questions_attempted,
      currentQuestions: current.questions_attempted,
    });
  }

  return slices.sort((left, right) => left.key.localeCompare(right.key));
}

export function computeBaselineGrowthReport(
  rows: QuestionAttemptMetricRow[],
  options?: { includeReplay?: boolean },
): BaselineGrowthReport {
  const scoped = options?.includeReplay ? rows : filterInitialAttemptRows(rows);
  const baselineRows = scoped.filter((row) => row.week_number === BASELINE_WEEK);
  const currentRows = scoped.filter((row) => (row.week_number ?? 0) >= GROWTH_START_WEEK);

  const baseline = sliceMetrics(baselineRows);
  const current = sliceMetrics(currentRows);

  return {
    baselineWeek: BASELINE_WEEK,
    growthStartWeek: GROWTH_START_WEEK,
    baseline,
    current,
    growthDelta: {
      first_attempt_accuracy: current.first_attempt_accuracy - baseline.first_attempt_accuracy,
      final_accuracy: current.final_accuracy - baseline.final_accuracy,
      questions_attempted: current.questions_attempted - baseline.questions_attempted,
    },
    byCharacter: groupGrowthSlices(scoped, (row) => row.character?.trim() || 'unknown'),
    bySkill: groupGrowthSlices(
      scoped,
      (row) => row.skill_tags?.[0]?.trim() || row.character?.trim() || 'general',
    ),
  };
}
