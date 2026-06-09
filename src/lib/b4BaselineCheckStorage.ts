import { writeActiveChildNickname } from '../config/activeChildNickname';
import {
  B4_BASELINE_ASSESSMENT_NAME,
  type BaselineModuleId,
} from '../data/b4BaselineCheckContent';
import {
  saveStudentBaselineToSupabase,
  type BaselineSubmitResult,
} from './assessmentResultsService';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { resolveTrackingProgramCode } from './activeProgramContext';

const STORAGE_KEY = 'caidens-courage-b4-baseline-check';
const RESULTS_ARCHIVE_KEY = 'caidens-courage-b4-baseline-results-archive';

export type B4BaselineCheckRecord = {
  assessmentName: typeof B4_BASELINE_ASSESSMENT_NAME;
  anonymousStudentId: string;
  nickname: string;
  programCode: string;
  groupName: string;
  completedModules: BaselineModuleId[];
  feelingsScore: number;
  readingScore: number;
  focusMovesScore: number;
  completedAt: string;
};

export type B4BaselineStudentProfile = {
  anonymousStudentId: string;
  nickname: string;
  programCode: string;
  groupName: string;
};

export type B4BaselinePersistedState = {
  profile: B4BaselineStudentProfile | null;
  completedModules: BaselineModuleId[];
  record: B4BaselineCheckRecord | null;
};

const EMPTY: B4BaselinePersistedState = {
  profile: null,
  completedModules: [],
  record: null,
};

function generateAnonymousStudentId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `bbc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeProfile(raw: unknown): B4BaselineStudentProfile | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;
  const legacyName = typeof p.studentName === 'string' ? p.studentName : '';
  const nickname =
    typeof p.nickname === 'string' && p.nickname.trim()
      ? p.nickname.trim()
      : legacyName.trim();
  if (!nickname) return null;

  const anonymousStudentId =
    typeof p.anonymousStudentId === 'string' && p.anonymousStudentId
      ? p.anonymousStudentId
      : generateAnonymousStudentId();

  return {
    anonymousStudentId,
    nickname,
    programCode: typeof p.programCode === 'string' ? p.programCode.trim() : '',
    groupName: typeof p.groupName === 'string' ? p.groupName.trim() : '',
  };
}

function normalizeRecord(raw: unknown, profile: B4BaselineStudentProfile | null): B4BaselineCheckRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const completedModules = Array.isArray(r.completedModules) ? (r.completedModules as BaselineModuleId[]) : [];

  const nickname =
    typeof r.nickname === 'string' && r.nickname.trim()
      ? r.nickname.trim()
      : profile?.nickname ??
        (typeof r.studentName === 'string' ? r.studentName.trim() : '');

  if (!nickname && completedModules.length === 0) return null;

  return {
    assessmentName: B4_BASELINE_ASSESSMENT_NAME,
    anonymousStudentId:
      typeof r.anonymousStudentId === 'string' && r.anonymousStudentId
        ? r.anonymousStudentId
        : profile?.anonymousStudentId ?? generateAnonymousStudentId(),
    nickname,
    programCode:
      typeof r.programCode === 'string'
        ? r.programCode.trim()
        : profile?.programCode ?? '',
    groupName:
      typeof r.groupName === 'string' ? r.groupName.trim() : profile?.groupName ?? '',
    completedModules,
    feelingsScore: typeof r.feelingsScore === 'number' ? r.feelingsScore : 0,
    readingScore: typeof r.readingScore === 'number' ? r.readingScore : 0,
    focusMovesScore: typeof r.focusMovesScore === 'number' ? r.focusMovesScore : 0,
    completedAt: typeof r.completedAt === 'string' ? r.completedAt : '',
  };
}

export function loadB4BaselineState(): B4BaselinePersistedState {
  if (typeof window === 'undefined') return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    const profile =
      normalizeProfile(parsed.profile) ??
      normalizeProfile({
        nickname: parsed.studentName,
        anonymousStudentId: parsed.anonymousStudentId,
        programCode: parsed.programCode,
        groupName: parsed.groupName,
      });

    const record = normalizeRecord(parsed.record, profile);

    return {
      profile,
      completedModules: Array.isArray(parsed.completedModules)
        ? (parsed.completedModules as BaselineModuleId[])
        : record?.completedModules ?? [],
      record,
    };
  } catch {
    return { ...EMPTY };
  }
}

export function saveB4BaselineState(state: B4BaselinePersistedState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function saveB4BaselineStudentProfile(
  input: Pick<B4BaselineStudentProfile, 'nickname' | 'programCode' | 'groupName'>,
): B4BaselinePersistedState {
  const current = loadB4BaselineState();
  const profile: B4BaselineStudentProfile = {
    anonymousStudentId: current.profile?.anonymousStudentId ?? generateAnonymousStudentId(),
    nickname: input.nickname.trim(),
    programCode: input.programCode.trim(),
    groupName: input.groupName.trim(),
  };
  const next: B4BaselinePersistedState = { ...current, profile };
  saveB4BaselineState(next);
  writeActiveChildNickname(profile.nickname);
  return next;
}

export function markBaselineModuleComplete(
  moduleId: BaselineModuleId,
  scores: Pick<B4BaselineCheckRecord, 'feelingsScore' | 'readingScore' | 'focusMovesScore'>,
): B4BaselinePersistedState {
  const current = loadB4BaselineState();
  const profile = current.profile;
  const completedModules = current.completedModules.includes(moduleId)
    ? current.completedModules
    : [...current.completedModules, moduleId];

  const allDone = completedModules.length >= 3;
  const prev = current.record;

  const activeProgramCode = resolveTrackingProgramCode('baseline_module_complete');
  const activeProgram = readActivePilotProgram();

  const record: B4BaselineCheckRecord = {
    assessmentName: B4_BASELINE_ASSESSMENT_NAME,
    anonymousStudentId: profile?.anonymousStudentId ?? prev?.anonymousStudentId ?? generateAnonymousStudentId(),
    nickname: profile?.nickname ?? prev?.nickname ?? '',
    programCode: activeProgramCode || profile?.programCode || prev?.programCode || '',
    groupName: activeProgram?.groupName || profile?.groupName || prev?.groupName || '',
    completedModules,
    feelingsScore: scores.feelingsScore ?? prev?.feelingsScore ?? 0,
    readingScore: scores.readingScore ?? prev?.readingScore ?? 0,
    focusMovesScore: scores.focusMovesScore ?? prev?.focusMovesScore ?? 0,
    completedAt: allDone ? new Date().toISOString() : prev?.completedAt ?? '',
  };

  const next: B4BaselinePersistedState = { ...current, completedModules, record };
  saveB4BaselineState(next);

  if (allDone && record.completedAt) {
    appendBaselineResultToArchive(record);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cc-baseline-complete'));
    }
  }

  return next;
}

export function isBaselineFullyComplete(state = loadB4BaselineState()): boolean {
  return state.completedModules.length >= 3;
}

export function loadAllBaselineResults(): B4BaselineCheckRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RESULTS_ARCHIVE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => normalizeRecord(item, null))
      .filter((r): r is B4BaselineCheckRecord => r !== null && Boolean(r.completedAt));
  } catch {
    return [];
  }
}

export function appendBaselineResultToArchive(record: B4BaselineCheckRecord): void {
  if (typeof window === 'undefined') return;
  const existing = loadAllBaselineResults();
  const key = `${record.anonymousStudentId}:${record.completedAt}`;
  const withoutDup = existing.filter(
    (r) => `${r.anonymousStudentId}:${r.completedAt}` !== key,
  );
  window.localStorage.setItem(RESULTS_ARCHIVE_KEY, JSON.stringify([...withoutDup, record]));
}

export function clearAllBaselineResults(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(RESULTS_ARCHIVE_KEY);
}

/** Clears module progress for retake; keeps student profile. */
export function resetB4BaselineSession(): void {
  const current = loadB4BaselineState();
  saveB4BaselineState({
    profile: current.profile,
    completedModules: [],
    record: null,
  });
}

export function resetB4BaselineState(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * Persists baseline results to Supabase when configured; local archive is saved separately.
 */
export async function submitBaselineResults(
  result: B4BaselineCheckRecord,
): Promise<BaselineSubmitResult> {
  const programCode = resolveTrackingProgramCode();
  if (!programCode) {
    return {
      success: false,
      message: 'Missing active program context.',
    };
  }

  const activeProgram = readActivePilotProgram();
  const normalizedResult: B4BaselineCheckRecord = {
    ...result,
    programCode,
    groupName: activeProgram?.groupName || result.groupName,
  };

  return saveStudentBaselineToSupabase(normalizedResult);
}

export async function persistB4BaselineToDatabase(
  record: B4BaselineCheckRecord,
): Promise<BaselineSubmitResult> {
  return submitBaselineResults(record);
}

export function exportBaselineResultsCsv(results: B4BaselineCheckRecord[]): string {
  const headers = [
    'assessmentName',
    'anonymousStudentId',
    'nickname',
    'programCode',
    'groupName',
    'completedModules',
    'feelingsScore',
    'readingScore',
    'focusMovesScore',
    'completedAt',
  ];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = results.map((r) =>
    [
      r.assessmentName,
      r.anonymousStudentId,
      r.nickname,
      r.programCode,
      r.groupName,
      r.completedModules.join(';'),
      String(r.feelingsScore),
      String(r.readingScore),
      String(r.focusMovesScore),
      r.completedAt,
    ]
      .map(escape)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}
