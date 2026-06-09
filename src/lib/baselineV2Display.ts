import { B4_BASELINE_ASSESSMENT_NAME } from '../data/b4BaselineCheckContent';
import {
  feelingsScoreToPct,
  focusScoreToPct,
  readingScoreToPct,
} from './b4BaselineAdminStats';
import type { B4BaselineCheckRecord } from './b4BaselineCheckStorage';
import type { LocalAssessmentV2Record } from './pilotTrackingLocalStorage';
import {
  buildParticipantNameLookup,
  resolveParticipantDisplayName,
  type ParticipantNameLookup,
} from './pilotResultsDisplay';

const FEELINGS_RAW_MAX = 50;
const READING_RAW_MAX = 5;
const FOCUS_RAW_MAX = 5;

type BaselineScoreField = 'feelings' | 'reading' | 'focus';

function defaultMaxForField(field: BaselineScoreField): number {
  switch (field) {
    case 'feelings':
      return FEELINGS_RAW_MAX;
    case 'reading':
      return READING_RAW_MAX;
    default:
      return FOCUS_RAW_MAX;
  }
}

/**
 * Normalize a baseline score to 0–100 without double-scaling percent values.
 */
export function normalizeBaselineScoreToPct(
  score: number | null | undefined,
  field: BaselineScoreField,
  rowMaxScore?: number | null,
): number {
  if (score == null || !Number.isFinite(score)) return 0;

  const value = score;
  if (value >= 0 && value <= 100 && value === Math.round(value) && field !== 'feelings') {
    const rawMax = rowMaxScore ?? defaultMaxForField(field);
    if (rawMax > 0 && value <= rawMax) {
      return (value / rawMax) * 100;
    }
    if (value <= 100 && rawMax <= 5) {
      return value <= rawMax ? (value / rawMax) * 100 : value;
    }
  }

  if (value >= 0 && value <= 100 && field === 'feelings' && value > defaultMaxForField(field)) {
    return value;
  }

  const max = rowMaxScore && rowMaxScore > 0 ? rowMaxScore : defaultMaxForField(field);
  if (max === 100 && value >= 0 && value <= 100) {
    return value;
  }

  return (value / max) * 100;
}

export function baselineFeelingsPct(row: LocalAssessmentV2Record): number {
  if (row.confidence_score != null) {
    return normalizeBaselineScoreToPct(row.confidence_score, 'feelings', row.max_score);
  }
  return 0;
}

export function baselineReadingPct(row: LocalAssessmentV2Record): number {
  if (row.reading_score != null) {
    return normalizeBaselineScoreToPct(row.reading_score, 'reading', row.max_score);
  }
  return 0;
}

export function baselineFocusPct(row: LocalAssessmentV2Record): number {
  if (row.focus_score != null) {
    return normalizeBaselineScoreToPct(row.focus_score, 'focus', row.max_score);
  }
  return 0;
}

export function baselineOverallPct(row: LocalAssessmentV2Record): number {
  if (row.percent_score != null && Number.isFinite(row.percent_score)) {
    const pct = row.percent_score;
    if (pct >= 0 && pct <= 100) return pct;
  }
  if (row.total_score != null && row.max_score && row.max_score > 0) {
    return (row.total_score / row.max_score) * 100;
  }
  const feelings = baselineFeelingsPct(row);
  const reading = baselineReadingPct(row);
  const focus = baselineFocusPct(row);
  const parts = [feelings, reading, focus].filter((value) => value > 0);
  if (!parts.length) return 0;
  return parts.reduce((sum, value) => sum + value, 0) / parts.length;
}

export function baselineRawFeelingsScore(row: LocalAssessmentV2Record): number {
  return row.confidence_score ?? 0;
}

export function baselineRawReadingScore(row: LocalAssessmentV2Record): number {
  return row.reading_score ?? 0;
}

export function baselineRawFocusScore(row: LocalAssessmentV2Record): number {
  return row.focus_score ?? 0;
}

export function assessmentV2ToBaselineRecord(
  row: LocalAssessmentV2Record,
  lookup: ParticipantNameLookup,
): B4BaselineCheckRecord {
  const participant = lookup.get(row.participant_id);
  return {
    assessmentName: B4_BASELINE_ASSESSMENT_NAME,
    anonymousStudentId: row.participant_id,
    participantId: row.participant_id,
    firstName: participant?.first_name ?? undefined,
    nickname: resolveParticipantDisplayName(row.participant_id, lookup),
    programCode: row.program_code,
    groupName: row.group_name ?? '',
    completedModules: ['feelings', 'reading', 'focus-moves'],
    feelingsScore: baselineRawFeelingsScore(row),
    readingScore: baselineRawReadingScore(row),
    focusMovesScore: baselineRawFocusScore(row),
    completedAt: row.completed_at,
  };
}

export function baselineRecordsFromAssessmentV2(
  assessmentResults: LocalAssessmentV2Record[],
  lookup: ParticipantNameLookup,
): B4BaselineCheckRecord[] {
  return assessmentResults
    .filter((row) => row.assessment_type === 'baseline' && row.participant_id?.trim())
    .map((row) => assessmentV2ToBaselineRecord(row, lookup));
}

export function averageBaselinePctFromV2(
  assessmentResults: LocalAssessmentV2Record[],
): { confidence: number; reading: number; focus: number; overall: number } {
  const baselines = assessmentResults.filter(
    (row) => row.assessment_type === 'baseline' && row.participant_id?.trim(),
  );
  if (!baselines.length) {
    return { confidence: 0, reading: 0, focus: 0, overall: 0 };
  }

  const feelings = baselines.map((row) => baselineFeelingsPct(row));
  const reading = baselines.map((row) => baselineReadingPct(row));
  const focus = baselines.map((row) => baselineFocusPct(row));
  const overall = baselines.map((row) => baselineOverallPct(row));

  const avg = (values: number[]) =>
    values.reduce((sum, value) => sum + value, 0) / values.length;

  return {
    confidence: avg(feelings),
    reading: avg(reading),
    focus: avg(focus),
    overall: avg(overall),
  };
}

export function buildParticipantLookupFromParticipants(
  participants: Array<{ id: string; nickname: string | null; first_name: string | null }>,
): ParticipantNameLookup {
  return buildParticipantNameLookup(
    participants.map((row) => ({
      id: row.id,
      nickname: row.nickname,
      first_name: row.first_name,
      role: 'student',
      program_code: '',
      created_at: '',
    })),
  );
}

/** Legacy raw-score conversion for B4ResultsAdminDashboard stat grid. */
export function legacyPctFromRawScores(record: B4BaselineCheckRecord): {
  feelings: number;
  reading: number;
  focus: number;
  overall: number;
} {
  const feelings = feelingsScoreToPct(record.feelingsScore);
  const reading = readingScoreToPct(record.readingScore);
  const focus = focusScoreToPct(record.focusMovesScore);
  return {
    feelings,
    reading,
    focus,
    overall: (feelings + reading + focus) / 3,
  };
}
