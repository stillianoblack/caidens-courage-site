import type { FormalAssessmentType } from '../types/moduleTracking';

const PARTICIPANTS_KEY = 'caidens-courage-tracking-participants';
const MODULE_RESULTS_KEY = 'caidens-courage-tracking-module-results';
const ASSESSMENT_V2_KEY = 'caidens-courage-tracking-assessment-v2';

export type LocalParticipantRecord = {
  id: string;
  nickname?: string;
  first_name?: string;
  email?: string;
  role: string;
  adult_role?: string;
  program_code: string;
  program_name?: string;
  group_name?: string;
  organization?: string;
  child_age_range?: string;
  email_opt_in?: boolean;
  created_at: string;
  updated_at: string;
};

export type LocalModuleResultRecord = {
  id: string;
  participant_id: string;
  role: string;
  program_code: string;
  group_name?: string;
  module_id: string;
  module_title: string;
  character: string;
  skill_area?: string;
  score: number;
  max_score: number;
  percent_score: number;
  time_spent_seconds?: number;
  attempt_number: number;
  answers_json?: Record<string, unknown>;
  completed_at: string;
};

export type LocalAssessmentV2Record = {
  id: string;
  participant_id: string;
  role: string;
  program_code: string;
  group_name?: string;
  assessment_type: FormalAssessmentType;
  reading_score?: number;
  focus_score?: number;
  confidence_score?: number;
  understanding_score?: number;
  support_score?: number;
  total_score?: number;
  max_score?: number;
  percent_score?: number;
  answers_json?: Record<string, unknown>;
  completed_at: string;
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function createLocalId(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadLocalParticipants(): LocalParticipantRecord[] {
  return readJson<LocalParticipantRecord[]>(PARTICIPANTS_KEY, []);
}

export function saveLocalParticipant(record: LocalParticipantRecord): LocalParticipantRecord {
  const rows = loadLocalParticipants();
  const index = rows.findIndex((row) => row.id === record.id);
  if (index >= 0) {
    rows[index] = record;
  } else {
    rows.unshift(record);
  }
  writeJson(PARTICIPANTS_KEY, rows);
  return record;
}

export function findLocalStudentParticipant(input: {
  nickname: string;
  role: string;
  programCode: string;
  groupName?: string;
}): LocalParticipantRecord | null {
  const nickname = input.nickname.trim().toLowerCase();
  const programCode = input.programCode.trim().toUpperCase();
  const groupName = (input.groupName ?? '').trim().toLowerCase();

  return (
    loadLocalParticipants().find(
      (row) =>
        row.role === input.role &&
        row.program_code.trim().toUpperCase() === programCode &&
        (row.nickname ?? '').trim().toLowerCase() === nickname &&
        (row.group_name ?? '').trim().toLowerCase() === groupName,
    ) ?? null
  );
}

export function findLocalAdultParticipant(input: {
  email: string;
  programCode: string;
}): LocalParticipantRecord | null {
  const email = input.email.trim().toLowerCase();
  const programCode = input.programCode.trim().toUpperCase();

  return (
    loadLocalParticipants().find(
      (row) =>
        (row.role === 'adult' || row.role === 'facilitator' || row.role === 'parent') &&
        row.program_code.trim().toUpperCase() === programCode &&
        (row.email ?? '').trim().toLowerCase() === email,
    ) ?? null
  );
}

export function createLocalParticipant(
  payload: Omit<LocalParticipantRecord, 'id' | 'created_at' | 'updated_at'>,
): LocalParticipantRecord {
  const now = new Date().toISOString();
  return saveLocalParticipant({
    id: createLocalId('local-participant'),
    ...payload,
    created_at: now,
    updated_at: now,
  });
}

export function loadLocalModuleResults(): LocalModuleResultRecord[] {
  return readJson<LocalModuleResultRecord[]>(MODULE_RESULTS_KEY, []);
}

export function appendLocalModuleResult(
  payload: Omit<LocalModuleResultRecord, 'id'>,
): LocalModuleResultRecord {
  const record: LocalModuleResultRecord = {
    id: createLocalId('local-module'),
    ...payload,
  };
  const rows = loadLocalModuleResults();
  rows.unshift(record);
  writeJson(MODULE_RESULTS_KEY, rows);
  return record;
}

export function countLocalModuleAttempts(participantId: string, moduleId: string): number {
  return loadLocalModuleResults().filter(
    (row) => row.participant_id === participantId && row.module_id === moduleId,
  ).length;
}

export function loadLocalAssessmentV2Results(): LocalAssessmentV2Record[] {
  return readJson<LocalAssessmentV2Record[]>(ASSESSMENT_V2_KEY, []);
}

export function appendLocalAssessmentV2Result(
  payload: Omit<LocalAssessmentV2Record, 'id'>,
): LocalAssessmentV2Record {
  const record: LocalAssessmentV2Record = {
    id: createLocalId('local-assessment'),
    ...payload,
  };
  const rows = loadLocalAssessmentV2Results();
  rows.unshift(record);
  writeJson(ASSESSMENT_V2_KEY, rows);
  return record;
}
