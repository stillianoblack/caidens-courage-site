import {
  feelingsScoreToPct,
  focusScoreToPct,
  readingScoreToPct,
  recordOverallPct,
} from './b4BaselineAdminStats';
import type { B4BaselineCheckRecord } from './b4BaselineCheckStorage';
import { listTrackedStudentModules } from '../data/moduleTrackingRegistry';
import type { FamilyChildSummary } from './familyChildrenMetrics';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from './pilotTrackingLocalStorage';

export const ADULT_ASSESSMENT_SLOT_COUNT = 2;
export const ADULT_MISSION_SLOT_COUNT = 5;

export type ProgressCounts = {
  completed: number;
  total: number;
  percent: number;
  label: string;
};

export type SkillAreaKey = 'executive' | 'selfRegulation' | 'focusRecovery' | 'overall';

export type SkillAreaProgress = {
  key: SkillAreaKey;
  label: string;
  value: number;
  sampleCount: number;
};

const CATEGORY_CHARACTERS = {
  story: ['caiden'],
  reading: ['miranda'],
  focus: ['b4'],
  creative: ['charlie'],
} as const;

function normalizeProgramCode(programCode?: string): string {
  return programCode?.trim().toUpperCase() ?? '';
}

function filterByProgram<T extends { program_code?: string; programCode?: string }>(
  rows: T[],
  programCode?: string,
): T[] {
  const code = normalizeProgramCode(programCode);
  if (!code) return [];
  return rows.filter((row) => {
    const rowCode = 'program_code' in row ? row.program_code : row.programCode;
    return normalizeProgramCode(rowCode) === code;
  });
}

export function getCompletedCount(values: boolean[]): number {
  return values.filter(Boolean).length;
}

export function getTotalCount(values: unknown[]): number {
  return values.length;
}

export function getProgressPercent(completed: number, total: number): number {
  if (total <= 0 || completed <= 0) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
}

export function formatProgressLabel(completed: number, total: number): string {
  if (total <= 0) return '0 of 0 completed';
  return `${completed} of ${total} completed`;
}

export function buildProgressCounts(completed: number, total: number): ProgressCounts {
  const safeTotal = Math.max(total, 0);
  const safeCompleted = Math.min(Math.max(completed, 0), safeTotal);
  return {
    completed: safeCompleted,
    total: safeTotal,
    percent: getProgressPercent(safeCompleted, safeTotal),
    label: formatProgressLabel(safeCompleted, safeTotal),
  };
}

function isAdultModule(row: LocalModuleResultRecord): boolean {
  return row.role === 'adult' || row.role === 'parent' || row.role === 'facilitator';
}

function isStudentModule(row: LocalModuleResultRecord): boolean {
  return row.role === 'student';
}

function uniqueStudentModules(rows: LocalModuleResultRecord[]): Set<string> {
  return new Set(
    rows
      .filter(isStudentModule)
      .map((row) => `${row.participant_id}::${row.module_id}`),
  );
}

function uniqueAdultModules(rows: LocalModuleResultRecord[]): Set<string> {
  return new Set(rows.filter(isAdultModule).map((row) => row.module_id));
}

function studentModuleSlots(childCount: number): number {
  const perChild = listTrackedStudentModules().length;
  if (childCount <= 0) return 0;
  return perChild * childCount;
}

export function getAssessmentProgress(input: {
  adultBaselineComplete: boolean;
  adultGrowthComplete: boolean;
  children: FamilyChildSummary[];
}): ProgressCounts {
  const childBaselineSlots = input.children.length;
  const total =
    childBaselineSlots > 0
      ? ADULT_ASSESSMENT_SLOT_COUNT + childBaselineSlots
      : ADULT_ASSESSMENT_SLOT_COUNT;

  const completed =
    (input.adultBaselineComplete ? 1 : 0) +
    (input.adultGrowthComplete ? 1 : 0) +
    input.children.filter((child) => child.baselineStatus === 'Complete').length;

  return buildProgressCounts(completed, total);
}

export function getChildActivityProgress(input: {
  participantId: string | null;
  baselineComplete: boolean;
  modules: LocalModuleResultRecord[];
}): ProgressCounts {
  const moduleTotal = listTrackedStudentModules().length;
  const total = moduleTotal + 1;

  const moduleCompleted = input.participantId
    ? new Set(
        input.modules
          .filter((row) => row.participant_id === input.participantId)
          .map((row) => row.module_id),
      ).size
    : 0;

  const completed = moduleCompleted + (input.baselineComplete ? 1 : 0);
  return buildProgressCounts(completed, total);
}

export function getFamilyOverallProgress(input: {
  childCount: number;
  adultBaselineComplete: boolean;
  adultGrowthComplete: boolean;
  childBaselinesComplete: number;
  studentModules: LocalModuleResultRecord[];
  adultModules: LocalModuleResultRecord[];
}): ProgressCounts {
  const childCount = input.childCount;
  const studentSlots = studentModuleSlots(childCount);
  const childBaselineSlots = childCount;
  const adultMissionSlots = ADULT_MISSION_SLOT_COUNT;
  const adultAssessmentSlots = ADULT_ASSESSMENT_SLOT_COUNT;

  const total =
    childCount > 0
      ? studentSlots + childBaselineSlots + adultAssessmentSlots + adultMissionSlots
      : adultAssessmentSlots + adultMissionSlots;

  const studentModuleCompleted = childCount > 0 ? uniqueStudentModules(input.studentModules).size : 0;
  const adultModuleCompleted = uniqueAdultModules(input.adultModules).size;

  const completed =
    studentModuleCompleted +
    input.childBaselinesComplete +
    (input.adultBaselineComplete ? 1 : 0) +
    (input.adultGrowthComplete ? 1 : 0) +
    adultModuleCompleted;

  return buildProgressCounts(completed, total);
}

export function groupProgressBySkillArea(input: {
  programCode?: string;
  studentAssessments: LocalAssessmentV2Record[];
  adultAssessments: LocalAssessmentV2Record[];
  studentModules: LocalModuleResultRecord[];
  adultModules: LocalModuleResultRecord[];
  legacyBaselines: B4BaselineCheckRecord[];
}): SkillAreaProgress[] {
  const studentAssessments = filterByProgram(input.studentAssessments, input.programCode);
  const adultAssessments = filterByProgram(input.adultAssessments, input.programCode);
  const studentModules = filterByProgram(input.studentModules, input.programCode).filter(isStudentModule);
  const adultModules = filterByProgram(input.adultModules, input.programCode).filter(isAdultModule);
  const legacyBaselines = (input.legacyBaselines ?? []).filter(
    (row) => normalizeProgramCode(row.programCode) === normalizeProgramCode(input.programCode),
  );

  const buckets: Record<SkillAreaKey, number[]> = {
    executive: [],
    selfRegulation: [],
    focusRecovery: [],
    overall: [],
  };

  const push = (key: SkillAreaKey, value: number) => {
    if (!Number.isFinite(value) || value < 0) return;
    buckets[key].push(Math.min(100, Math.round(value)));
  };

  for (const row of studentAssessments) {
    if (row.focus_score != null) push('executive', focusScoreToPct(row.focus_score));
    if (row.confidence_score != null) push('selfRegulation', feelingsScoreToPct(row.confidence_score));
    if (row.reading_score != null) push('focusRecovery', readingScoreToPct(row.reading_score));
    if (row.percent_score != null) push('overall', Number(row.percent_score));
  }

  for (const row of adultAssessments) {
    const max = row.max_score && row.max_score > 0 ? row.max_score : 12;
    if (row.understanding_score != null) {
      push('executive', (row.understanding_score / (max / 2)) * 100);
    }
    if (row.support_score != null) {
      push('selfRegulation', (row.support_score / (max / 2)) * 100);
    }
    if (row.percent_score != null) push('overall', Number(row.percent_score));
    else if (row.total_score != null) push('overall', (row.total_score / max) * 100);
  }

  for (const row of legacyBaselines) {
    push('executive', focusScoreToPct(row.focusMovesScore));
    push('selfRegulation', feelingsScoreToPct(row.feelingsScore));
    push('focusRecovery', readingScoreToPct(row.readingScore));
    push('overall', recordOverallPct(row));
  }

  for (const row of studentModules) {
    const score = row.percent_score ?? (row.max_score > 0 ? (row.score / row.max_score) * 100 : 0);
    const area = row.skill_area?.toLowerCase() ?? '';
    if (area.includes('focus')) push('executive', score);
    else if (area.includes('feel')) push('selfRegulation', score);
    else if (area.includes('read')) push('focusRecovery', score);
    push('overall', score);
  }

  for (const row of adultModules) {
    const score = row.percent_score ?? (row.max_score > 0 ? (row.score / row.max_score) * 100 : 0);
    const area = row.skill_area?.toLowerCase() ?? '';
    if (area.includes('executive') || area.includes('understanding')) push('executive', score);
    if (area.includes('support') || area.includes('regulation')) push('selfRegulation', score);
    if (area.includes('focus') || area.includes('learning')) push('focusRecovery', score);
    push('overall', score);
  }

  const average = (values: number[]) =>
    values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

  return [
    { key: 'executive', label: 'Executive Function', value: average(buckets.executive), sampleCount: buckets.executive.length },
    { key: 'selfRegulation', label: 'Self-Regulation', value: average(buckets.selfRegulation), sampleCount: buckets.selfRegulation.length },
    { key: 'focusRecovery', label: 'Focus Recovery', value: average(buckets.focusRecovery), sampleCount: buckets.focusRecovery.length },
    { key: 'overall', label: 'Overall', value: average(buckets.overall), sampleCount: buckets.overall.length },
  ];
}

function moduleCatalogCount(characters: readonly string[]): number {
  return characters.reduce(
    (sum, character) =>
      sum + listTrackedStudentModules().filter((row) => row.character === character).length,
    0,
  );
}

function moduleCompletedCount(
  completedByCharacter: Record<string, Set<string>>,
  characters: readonly string[],
): number {
  return characters.reduce((sum, character) => sum + (completedByCharacter[character]?.size ?? 0), 0);
}

export function getCategoryProgressRows(input: {
  programCode?: string;
  studentModules: LocalModuleResultRecord[];
  adultModules: LocalModuleResultRecord[];
  childCount: number;
  childBaselinesComplete: number;
  adultBaselineComplete: boolean;
  adultGrowthComplete: boolean;
  overall: ProgressCounts;
}): Array<{
  key: string;
  label: string;
  tone: 'story' | 'reading' | 'focus' | 'creative' | 'overall';
  completed: number;
  total: number;
  pct: number;
  labelDetail: string;
}> {
  const modules = filterByProgram(input.studentModules, input.programCode).filter(isStudentModule);
  const completedByCharacter: Record<string, Set<string>> = {};

  modules.forEach((row) => {
    const character = row.character?.trim().toLowerCase();
    if (!character) return;
    if (!completedByCharacter[character]) completedByCharacter[character] = new Set();
    completedByCharacter[character].add(row.module_id);
  });

  const childSlots = Math.max(input.childCount, 0);
  const perChild = (catalogCount: number) => catalogCount * childSlots;

  const buildChildCategory = (
    key: string,
    label: string,
    tone: 'story' | 'reading' | 'focus' | 'creative',
    characters: readonly string[],
    options?: { baselineSlots?: number; baselineCompleted?: number },
  ) => {
    const catalog = moduleCatalogCount(characters);
    const baselineSlots = options?.baselineSlots ?? 0;
    const baselineCompleted = options?.baselineCompleted ?? 0;
    const total = perChild(catalog) + baselineSlots;
    const completed =
      moduleCompletedCount(completedByCharacter, characters) + baselineCompleted;
    return {
      key,
      label,
      tone,
      completed,
      total,
      pct: getProgressPercent(completed, total),
      labelDetail: formatProgressLabel(completed, total),
    };
  };

  const rows = [
    buildChildCategory('story', 'Story Activities', 'story', CATEGORY_CHARACTERS.story),
    buildChildCategory('reading', 'Reading Games', 'reading', CATEGORY_CHARACTERS.reading),
    buildChildCategory('focus', 'Focus Moves', 'focus', CATEGORY_CHARACTERS.focus, {
      baselineSlots: childSlots,
      baselineCompleted: input.childBaselinesComplete,
    }),
    buildChildCategory('creative', 'Creative Activities', 'creative', CATEGORY_CHARACTERS.creative),
    {
      key: 'overall',
      label: 'Overall',
      tone: 'overall' as const,
      completed: input.overall.completed,
      total: input.overall.total,
      pct: input.overall.percent,
      labelDetail: input.overall.label,
    },
  ];

  return rows;
}

export function logFamilyProgressMetrics(payload: {
  activeProgramCode: string;
  children: FamilyChildSummary[];
  adultAssessments: LocalAssessmentV2Record[];
  childAssessments: LocalAssessmentV2Record[];
  moduleResults: LocalModuleResultRecord[];
  completedCount: number;
  totalCount: number;
  overallPercent: number;
}): void {
  console.log('[FAMILY_PROGRESS_METRICS]', payload);
}

export function partitionAdultAssessments(rows: LocalAssessmentV2Record[]): LocalAssessmentV2Record[] {
  return rows.filter((row) => row.role === 'adult');
}

export function partitionChildAssessments(rows: LocalAssessmentV2Record[]): LocalAssessmentV2Record[] {
  return rows.filter((row) => row.role === 'student');
}
