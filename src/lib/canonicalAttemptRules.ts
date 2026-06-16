import type { B4BaselineCheckRecord } from './b4BaselineCheckStorage';
import {
  baselineFeelingsPct,
  baselineFocusPct,
  baselineOverallPct,
  baselineReadingPct,
} from './baselineV2Display';
import { BASELINE_WEEK, GROWTH_START_WEEK } from '../config/pilotBaselineWeeks';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from './pilotTrackingLocalStorage';
import type { QuestionAttemptInsertRow } from './questionAttemptService';

export type GrowthAttemptType =
  | 'baseline'
  | 'weekly'
  | 'replay'
  | 'challenge'
  | 'test'
  | 'initial';

export type AttemptScope = 'canonical' | 'practice' | 'excluded_from_growth';

export type ClassifiedAttemptRecord = {
  id: string;
  participant_id: string;
  source: 'assessment_v2' | 'module_result' | 'question_attempt' | 'legacy_baseline';
  attempt_type: GrowthAttemptType;
  attempt_scope: AttemptScope;
  week_number: number | null;
  module_id: string | null;
  mission_id: string | null;
  assessment_type: string | null;
  character_id: string | null;
  completed_at: string;
  first_attempt_accuracy: number | null;
  final_accuracy: number | null;
  answered_count: number | null;
  correct_count: number | null;
  counts_in_growth: boolean;
  exclusion_reason: string | null;
  is_canonical: boolean;
};

const META_ANSWER_KEYS = new Set([
  '_attempts',
  'participant_id',
  'grade_band_used',
  'grade_level_used',
  'content_version_id',
  'file_id',
  'mission_id',
  'module_id',
  'attempt_scope',
  'attempt_type',
]);

function parseTime(value: string | null | undefined): number {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function sortByCompletedAt<T extends { completed_at?: string; completedAt?: string }>(
  rows: T[],
): T[] {
  return rows.slice().sort((left, right) => {
    const leftTime = parseTime(left.completed_at ?? left.completedAt);
    const rightTime = parseTime(right.completed_at ?? right.completedAt);
    return leftTime - rightTime;
  });
}

/** Infer adventure week from module id, mission id, or answers_json metadata. */
export function inferModuleWeekNumber(input: {
  module_id?: string | null;
  mission_id?: string | null;
  answers_json?: Record<string, unknown> | null;
}): number | null {
  const answers = input.answers_json ?? {};
  const missionFromAnswers =
    typeof answers.mission_id === 'string' ? answers.mission_id.trim() : null;
  const missionId = missionFromAnswers || input.mission_id?.trim() || null;
  const moduleId = input.module_id?.trim() || null;
  const candidates = [missionId, moduleId].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const explicit = candidate.match(/week[-_]?(\d+)/i);
    if (explicit) return Number(explicit[1]);

    const trailing = candidate.match(/(?:^|[-_])(\d+)$/);
    if (trailing) {
      const week = Number(trailing[1]);
      if (week >= 1 && week <= 12) return week;
    }
  }

  return null;
}

export function isReplayAttemptType(
  attemptType: string | null | undefined,
  isReplay?: boolean | null,
): boolean {
  return attemptType === 'replay' || attemptType === 'challenge' || isReplay === true;
}

export function resolveModuleAttemptClassification(input: {
  attempt_number?: number | null;
  week_number?: number | null;
  module_id?: string | null;
  mission_id?: string | null;
  answers_json?: Record<string, unknown> | null;
  attempt_type?: string | null;
  is_replay?: boolean | null;
  difficulty_tier?: string | null;
}): { attempt_type: GrowthAttemptType; attempt_scope: AttemptScope } {
  const answers = input.answers_json ?? {};
  const attemptTypeFromMeta =
    typeof answers.attempt_type === 'string' ? answers.attempt_type.trim() : null;
  const scopeFromMeta =
    typeof answers.attempt_scope === 'string' ? answers.attempt_scope.trim() : null;

  if (scopeFromMeta === 'excluded_from_growth' || scopeFromMeta === 'practice') {
    return {
      attempt_type: (attemptTypeFromMeta as GrowthAttemptType) || 'replay',
      attempt_scope: scopeFromMeta as AttemptScope,
    };
  }

  const week =
    input.week_number ??
    inferModuleWeekNumber({
      module_id: input.module_id,
      mission_id: input.mission_id,
      answers_json: input.answers_json,
    });

  const attemptNumber = input.attempt_number ?? 1;
  const explicitReplay =
    isReplayAttemptType(input.attempt_type ?? attemptTypeFromMeta, input.is_replay) ||
    attemptNumber > 1;

  if (explicitReplay) {
    const isChallenge =
      input.attempt_type === 'challenge' ||
      attemptTypeFromMeta === 'challenge' ||
      input.difficulty_tier === 'challenge' ||
      (week != null && week >= GROWTH_START_WEEK && attemptNumber > 1);

    return {
      attempt_type: isChallenge ? 'challenge' : 'replay',
      attempt_scope: 'excluded_from_growth',
    };
  }

  if (week === BASELINE_WEEK) {
    return { attempt_type: 'weekly', attempt_scope: 'canonical' };
  }

  if (week != null && week >= GROWTH_START_WEEK) {
    return { attempt_type: 'weekly', attempt_scope: 'canonical' };
  }

  return { attempt_type: 'weekly', attempt_scope: 'canonical' };
}

export function resolveAttemptScope(
  attemptType: GrowthAttemptType,
  attemptScope?: AttemptScope | null,
): AttemptScope {
  if (attemptScope) return attemptScope;
  if (
    attemptType === 'replay' ||
    attemptType === 'challenge' ||
    attemptType === 'test'
  ) {
    return 'excluded_from_growth';
  }
  return 'canonical';
}

export function countsInGrowthRollup(scope: AttemptScope): boolean {
  return scope === 'canonical';
}

export function selectEarliestCanonicalBaselineAssessments(
  rows: LocalAssessmentV2Record[],
): LocalAssessmentV2Record[] {
  const baselines = rows.filter(
    (row) => row.assessment_type === 'baseline' && row.participant_id?.trim(),
  );
  const earliestByParticipant = new Map<string, LocalAssessmentV2Record>();

  for (const row of sortByCompletedAt(baselines)) {
    const participantId = row.participant_id.trim();
    if (!earliestByParticipant.has(participantId)) {
      earliestByParticipant.set(participantId, row);
    }
  }

  return Array.from(earliestByParticipant.values());
}

export function selectEarliestCanonicalLegacyBaselines(
  rows: B4BaselineCheckRecord[],
): B4BaselineCheckRecord[] {
  const completed = rows.filter((row) => row.completedAt && row.participantId?.trim());
  const earliestByParticipant = new Map<string, B4BaselineCheckRecord>();

  for (const row of sortByCompletedAt(completed)) {
    const participantId = row.participantId!.trim();
    if (!earliestByParticipant.has(participantId)) {
      earliestByParticipant.set(participantId, row);
    }
  }

  return Array.from(earliestByParticipant.values());
}

export function selectCanonicalModuleResults(
  rows: LocalModuleResultRecord[],
): LocalModuleResultRecord[] {
  const initialByKey = new Map<string, LocalModuleResultRecord>();

  for (const row of sortByCompletedAt(rows)) {
    const classification = resolveModuleAttemptClassification({
      attempt_number: row.attempt_number,
      module_id: row.module_id,
      answers_json: row.answers_json,
    });
    if (!countsInGrowthRollup(classification.attempt_scope)) continue;

    const key = `${row.participant_id}::${row.module_id}`;
    if (!initialByKey.has(key)) {
      initialByKey.set(key, row);
    }
  }

  return Array.from(initialByKey.values());
}

export function selectCanonicalModuleResultsForWeek(
  rows: LocalModuleResultRecord[],
  weekNumber: number,
): LocalModuleResultRecord[] {
  const weekRows = rows.filter((row) => {
    const week = inferModuleWeekNumber({
      module_id: row.module_id,
      answers_json: row.answers_json,
    });
    return week === weekNumber;
  });
  return selectCanonicalModuleResults(weekRows);
}

export function selectCanonicalQuestionAttempts<T extends QuestionAttemptInsertRow & { id?: string }>(
  rows: T[],
): T[] {
  const initialByKey = new Map<string, T>();

  for (const row of sortByCompletedAt(rows)) {
    if (isReplayAttemptType(row.attempt_type, row.is_replay)) continue;
    const key = `${row.participant_id}::${row.module_id ?? row.mission_id}::${row.question_id}`;
    if (!initialByKey.has(key)) {
      initialByKey.set(key, row);
    }
  }

  return Array.from(initialByKey.values());
}

function countQuestionsInAnswersJson(answersJson: unknown): number {
  if (!answersJson || typeof answersJson !== 'object') return 0;
  const obj = answersJson as Record<string, unknown>;
  if (obj._attempts && typeof obj._attempts === 'object' && obj._attempts !== null) {
    return Object.keys(obj._attempts as Record<string, unknown>).length;
  }
  return Object.keys(obj).filter((key) => !META_ANSWER_KEYS.has(key) && !key.startsWith('_')).length;
}

function moduleAccuracy(row: LocalModuleResultRecord): {
  first_attempt_accuracy: number | null;
  final_accuracy: number | null;
  answered_count: number | null;
  correct_count: number | null;
} {
  const answers = row.answers_json;
  if (answers?._attempts && typeof answers._attempts === 'object') {
    const attempts = Object.values(answers._attempts as Record<string, {
      is_correct_first_try?: boolean;
      is_correct_final?: boolean;
    }>);
    if (attempts.length > 0) {
      const firstTry = attempts.filter((item) => item.is_correct_first_try).length;
      const finalCorrect = attempts.filter((item) => item.is_correct_final).length;
      return {
        answered_count: attempts.length,
        correct_count: finalCorrect,
        first_attempt_accuracy: Math.round((firstTry / attempts.length) * 100),
        final_accuracy: Math.round((finalCorrect / attempts.length) * 100),
      };
    }
  }

  const answered = countQuestionsInAnswersJson(answers);
  const pct = row.percent_score ?? (row.max_score > 0 ? Math.round((row.score / row.max_score) * 100) : null);
  return {
    answered_count: answered > 0 ? answered : null,
    correct_count: null,
    first_attempt_accuracy: pct,
    final_accuracy: pct,
  };
}

export function classifyAssessmentV2Attempts(
  rows: LocalAssessmentV2Record[],
  legacyBaselines: B4BaselineCheckRecord[] = [],
): ClassifiedAttemptRecord[] {
  const canonicalBaselineIds = new Set(
    selectEarliestCanonicalBaselineAssessments(rows).map((row) => row.id),
  );
  const canonicalLegacyIds = new Set(
    selectEarliestCanonicalLegacyBaselines(legacyBaselines).map(
      (row) => `${row.participantId}-${row.completedAt}`,
    ),
  );

  const classified: ClassifiedAttemptRecord[] = [];

  for (const row of rows) {
    if (!row.participant_id?.trim() || !row.completed_at) continue;
    const isBaseline = row.assessment_type === 'baseline';
    const isCanonical = isBaseline ? canonicalBaselineIds.has(row.id) : false;
    const accuracy = isBaseline
      ? {
          first_attempt_accuracy: Math.round(baselineOverallPct(row)),
          final_accuracy: Math.round(baselineOverallPct(row)),
          answered_count: 3,
          correct_count: null,
        }
      : {
          first_attempt_accuracy:
            row.percent_score != null ? Math.round(row.percent_score) : null,
          final_accuracy:
            row.percent_score != null ? Math.round(row.percent_score) : null,
          answered_count: null,
          correct_count: null,
        };

    classified.push({
      id: row.id,
      participant_id: row.participant_id,
      source: 'assessment_v2',
      attempt_type: isBaseline ? 'baseline' : row.assessment_type === 'final' ? 'weekly' : 'test',
      attempt_scope: isCanonical ? 'canonical' : 'excluded_from_growth',
      week_number: null,
      module_id: null,
      mission_id: null,
      assessment_type: row.assessment_type,
      character_id: null,
      completed_at: row.completed_at,
      first_attempt_accuracy: accuracy.first_attempt_accuracy,
      final_accuracy: accuracy.final_accuracy,
      answered_count: accuracy.answered_count,
      correct_count: accuracy.correct_count,
      counts_in_growth: isCanonical,
      exclusion_reason: isCanonical
        ? null
        : isBaseline
          ? 'duplicate_baseline_attempt'
          : 'non_canonical_assessment',
      is_canonical: isCanonical,
    });
  }

  for (const row of legacyBaselines) {
    if (!row.participantId?.trim() || !row.completedAt) continue;
    const id = `${row.participantId}-${row.completedAt}`;
    const isCanonical = canonicalLegacyIds.has(id);
    classified.push({
      id,
      participant_id: row.participantId,
      source: 'legacy_baseline',
      attempt_type: 'baseline',
      attempt_scope: isCanonical ? 'canonical' : 'excluded_from_growth',
      week_number: null,
      module_id: null,
      mission_id: null,
      assessment_type: 'baseline',
      character_id: null,
      completed_at: row.completedAt,
      first_attempt_accuracy: Math.round(
        baselineSkillScoresFromLegacy(row).overall,
      ),
      final_accuracy: null,
      answered_count: row.completedModules.length,
      correct_count: null,
      counts_in_growth: isCanonical,
      exclusion_reason: isCanonical ? null : 'duplicate_baseline_attempt',
      is_canonical: isCanonical,
    });
  }

  return classified.sort(
    (left, right) => parseTime(left.completed_at) - parseTime(right.completed_at),
  );
}

export function classifyModuleResultAttempts(
  rows: LocalModuleResultRecord[],
): ClassifiedAttemptRecord[] {
  const canonicalByKey = new Map<string, string>();
  for (const row of selectCanonicalModuleResults(rows)) {
    canonicalByKey.set(`${row.participant_id}::${row.module_id}`, row.id);
  }

  return rows
    .filter((row) => row.role === 'student' && row.participant_id?.trim())
    .map((row) => {
      const answers = row.answers_json ?? {};
      const missionId = typeof answers.mission_id === 'string' ? answers.mission_id : null;
      const week = inferModuleWeekNumber({
        module_id: row.module_id,
        mission_id: missionId,
        answers_json: row.answers_json,
      });
      const classification = resolveModuleAttemptClassification({
        attempt_number: row.attempt_number,
        week_number: week,
        module_id: row.module_id,
        mission_id: missionId,
        answers_json: row.answers_json,
      });
      const accuracy = moduleAccuracy(row);
      const recordKey = `${row.participant_id}::${row.module_id}`;
      const canonicalId = canonicalByKey.get(recordKey);
      const isCanonical =
        countsInGrowthRollup(classification.attempt_scope) && canonicalId === row.id;

      return {
        id: row.id,
        participant_id: row.participant_id,
        source: 'module_result' as const,
        attempt_type: classification.attempt_type,
        attempt_scope: isCanonical ? 'canonical' : classification.attempt_scope,
        week_number: week,
        module_id: row.module_id,
        mission_id: missionId,
        assessment_type: null,
        character_id: row.character ?? null,
        completed_at: row.completed_at,
        first_attempt_accuracy: accuracy.first_attempt_accuracy,
        final_accuracy: accuracy.final_accuracy,
        answered_count: accuracy.answered_count,
        correct_count: accuracy.correct_count,
        counts_in_growth: isCanonical,
        exclusion_reason: isCanonical
          ? null
          : classification.attempt_scope === 'excluded_from_growth'
            ? `${classification.attempt_type}_attempt`
            : 'duplicate_weekly_attempt',
        is_canonical: isCanonical,
      };
    })
    .sort((left, right) => parseTime(left.completed_at) - parseTime(right.completed_at));
}

export function classifyQuestionAttemptRows<
  T extends QuestionAttemptInsertRow & { id?: string },
>(rows: T[]): Array<ClassifiedAttemptRecord & { question_id: string }> {
  const canonical = new Set(
    selectCanonicalQuestionAttempts(rows).map(
      (row) => `${row.participant_id}::${row.module_id ?? row.mission_id}::${row.question_id}`,
    ),
  );

  return rows.map((row) => {
    const key = `${row.participant_id}::${row.module_id ?? row.mission_id}::${row.question_id}`;
    const replay = isReplayAttemptType(row.attempt_type, row.is_replay);
    const isCanonical = !replay && canonical.has(key);
    const attemptType: GrowthAttemptType = replay
      ? row.attempt_type === 'challenge'
        ? 'challenge'
        : 'replay'
      : 'weekly';

    return {
      id: row.id ?? key,
      participant_id: row.participant_id,
      source: 'question_attempt' as const,
      attempt_type: attemptType,
      attempt_scope: isCanonical ? 'canonical' : 'excluded_from_growth',
      week_number: row.week_number ?? null,
      module_id: row.module_id ?? null,
      mission_id: row.mission_id,
      assessment_type: null,
      character_id: row.character ?? null,
      completed_at: row.completed_at,
      first_attempt_accuracy: row.is_correct_first_try ? 100 : 0,
      final_accuracy: row.is_correct_final ? 100 : 0,
      answered_count: 1,
      correct_count: row.is_correct_final ? 1 : 0,
      counts_in_growth: isCanonical,
      exclusion_reason: isCanonical ? null : `${attemptType}_attempt`,
      is_canonical: isCanonical,
      question_id: row.question_id,
    };
  });
}

export function baselineSkillScoresFromAssessment(row: LocalAssessmentV2Record): {
  executive: number;
  selfRegulation: number;
  focusRecovery: number;
  overall: number;
} {
  return {
    executive: Math.round(baselineFocusPct(row)),
    selfRegulation: Math.round(baselineFeelingsPct(row)),
    focusRecovery: Math.round(baselineReadingPct(row)),
    overall: Math.round(baselineOverallPct(row)),
  };
}

export function baselineSkillScoresFromLegacy(row: B4BaselineCheckRecord): {
  executive: number;
  selfRegulation: number;
  focusRecovery: number;
  overall: number;
} {
  const mapped = {
    assessment_type: 'baseline' as const,
    role: 'student' as const,
    program_code: row.programCode,
    confidence_score: row.feelingsScore,
    reading_score: row.readingScore,
    focus_score: row.focusMovesScore,
    participant_id: row.participantId ?? '',
    id: row.participantId ?? 'legacy',
    completed_at: row.completedAt ?? '',
  };
  return baselineSkillScoresFromAssessment(mapped as LocalAssessmentV2Record);
}

export function weeklySkillScoresFromModules(rows: LocalModuleResultRecord[]): {
  executive: number;
  selfRegulation: number;
  focusRecovery: number;
  overall: number;
} | null {
  if (!rows.length) return null;

  const buckets = {
    executive: [] as number[],
    selfRegulation: [] as number[],
    focusRecovery: [] as number[],
    overall: [] as number[],
  };

  for (const row of rows) {
    const pct =
      row.percent_score ??
      (row.max_score > 0 ? Math.round((row.score / row.max_score) * 100) : 0);
    const area = row.skill_area?.toLowerCase() ?? '';
    const character = row.character?.toLowerCase() ?? '';

    if (area.includes('focus') || character === 'b4' || character === 'caiden') {
      buckets.executive.push(pct);
    }
    if (area.includes('feel') || character === 'miranda') {
      buckets.selfRegulation.push(pct);
    }
    if (area.includes('read')) {
      buckets.focusRecovery.push(pct);
    }
    buckets.overall.push(pct);
  }

  const average = (values: number[]) =>
    values.length
      ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
      : 0;

  const executive = average(buckets.executive);
  const selfRegulation = average(buckets.selfRegulation);
  const focusRecovery = average(buckets.focusRecovery);
  const overall = average(buckets.overall);

  if (executive + selfRegulation + focusRecovery + overall === 0) return null;

  return { executive, selfRegulation, focusRecovery, overall };
}
