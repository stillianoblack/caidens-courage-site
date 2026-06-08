import type {
  AdultAssessmentPhase,
  AdultAssessmentType,
  AdultRoleOption,
} from '../data/adultGrowthCheckContent';
import { ADULT_GROWTH_CHECK_NAME, ADULT_ASSESSMENT_TOTAL_QUESTIONS } from '../data/adultGrowthCheckContent';
import { readActivePilotProgram } from '../config/activePilotProgram';

export const ADULT_BASELINE_COMPLETE_KEY = 'adultBaselineComplete';
export const ADULT_GROWTH_COMPLETE_KEY = 'adultGrowthComplete';
export const DR_VICTORIA_TRAINING_COMPLETE_KEY = 'drVictoriaTrainingComplete';
export const UNCLE_T_TRAINING_COMPLETE_KEY = 'uncleTTrainingComplete';

export const ADULT_ASSESSMENT_PROGRESS_EVENT = 'cc-adult-assessment-progress';

const SESSION_KEY = 'caidens-courage-adult-assessment-session';
const ARCHIVE_KEY = 'caidens-courage-adult-assessment-archive';

export type AdultAssessmentProfile = {
  firstName: string;
  email: string;
  role: AdultRoleOption;
  childAgeRange?: string;
  organization?: string;
  emailOptIn: boolean;
  programCode: string;
};

export type AdultAssessmentRecord = {
  assessmentName: string;
  phase: AdultAssessmentPhase;
  assessmentType: AdultAssessmentType;
  firstName: string;
  email: string;
  role: AdultRoleOption;
  childAgeRange?: string;
  organization?: string;
  emailOptIn: boolean;
  programCode: string;
  programName?: string;
  understandingScore: number;
  supportScore: number;
  totalScore: number;
  totalQuestions: number;
  completedAt: string;
  baselineTotalScore?: number;
  baselineUnderstandingScore?: number;
  baselineSupportScore?: number;
};

type AdultAssessmentSession = {
  profile?: AdultAssessmentProfile;
};

function dispatchProgressEvent(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ADULT_ASSESSMENT_PROGRESS_EVENT));
}

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

function setBooleanFlag(key: string, value: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, value ? 'true' : 'false');
}

function readBooleanFlag(key: string): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(key) === 'true';
}

export function loadAdultAssessmentSession(): AdultAssessmentSession {
  return readJson<AdultAssessmentSession>(SESSION_KEY, {});
}

export function saveAdultAssessmentProfile(profile: AdultAssessmentProfile): AdultAssessmentSession {
  const session: AdultAssessmentSession = { profile };
  writeJson(SESSION_KEY, session);
  return session;
}

export function loadAdultAssessmentArchive(): AdultAssessmentRecord[] {
  return readJson<AdultAssessmentRecord[]>(ARCHIVE_KEY, []);
}

export function appendAdultAssessmentRecord(record: AdultAssessmentRecord): void {
  const archive = loadAdultAssessmentArchive();
  archive.unshift(record);
  writeJson(ARCHIVE_KEY, archive);
}

export function findLatestAdultBaselineRecord(): AdultAssessmentRecord | null {
  return loadAdultAssessmentArchive().find((row) => row.phase === 'baseline') ?? null;
}

export function findLatestAdultGrowthRecord(): AdultAssessmentRecord | null {
  return loadAdultAssessmentArchive().find((row) => row.phase === 'growth') ?? null;
}

export function findLatestAdultBaseline(
  email: string,
  programCode: string,
): AdultAssessmentRecord | null {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCode = programCode.trim().toUpperCase();
  if (!normalizedEmail || !normalizedCode) return null;

  const match = loadAdultAssessmentArchive().find(
    (row) =>
      row.phase === 'baseline' &&
      row.email.trim().toLowerCase() === normalizedEmail &&
      row.programCode.trim().toUpperCase() === normalizedCode,
  );

  return match ?? null;
}

export function isAdultBaselineComplete(): boolean {
  return readBooleanFlag(ADULT_BASELINE_COMPLETE_KEY);
}

export function isDrVictoriaTrainingComplete(): boolean {
  return readBooleanFlag(DR_VICTORIA_TRAINING_COMPLETE_KEY);
}

export function isUncleTTrainingComplete(): boolean {
  return readBooleanFlag(UNCLE_T_TRAINING_COMPLETE_KEY);
}

export function isAdultGrowthComplete(): boolean {
  return readBooleanFlag(ADULT_GROWTH_COMPLETE_KEY);
}

export function markAdultBaselineComplete(): void {
  setBooleanFlag(ADULT_BASELINE_COMPLETE_KEY, true);
  dispatchProgressEvent();
}

export function markAdultGrowthComplete(): void {
  setBooleanFlag(ADULT_GROWTH_COMPLETE_KEY, true);
  dispatchProgressEvent();
}

export function markDrVictoriaTrainingComplete(): void {
  setBooleanFlag(DR_VICTORIA_TRAINING_COMPLETE_KEY, true);
  dispatchProgressEvent();
}

export function markUncleTTrainingComplete(): void {
  setBooleanFlag(UNCLE_T_TRAINING_COMPLETE_KEY, true);
  dispatchProgressEvent();
}

export function buildAdultAssessmentRecord(input: {
  phase: AdultAssessmentPhase;
  profile: AdultAssessmentProfile;
  understandingScore: number;
  supportScore: number;
  totalScore: number;
  baseline?: AdultAssessmentRecord | null;
}): AdultAssessmentRecord {
  const program = readActivePilotProgram();
  const assessmentType: AdultAssessmentType =
    input.phase === 'baseline' ? 'adult_baseline' : 'adult_growth';

  return {
    assessmentName: ADULT_GROWTH_CHECK_NAME,
    phase: input.phase,
    assessmentType,
    firstName: input.profile.firstName,
    email: input.profile.email,
    role: input.profile.role,
    childAgeRange: input.profile.childAgeRange,
    organization: input.profile.organization,
    emailOptIn: input.profile.emailOptIn,
    programCode: input.profile.programCode,
    programName: program?.programName,
    understandingScore: input.understandingScore,
    supportScore: input.supportScore,
    totalScore: input.totalScore,
    totalQuestions: ADULT_ASSESSMENT_TOTAL_QUESTIONS,
    completedAt: new Date().toISOString(),
    baselineTotalScore: input.baseline?.totalScore,
    baselineUnderstandingScore: input.baseline?.understandingScore,
    baselineSupportScore: input.baseline?.supportScore,
  };
}

export function saveAdultAssessmentResult(record: AdultAssessmentRecord): void {
  appendAdultAssessmentRecord(record);

  if (record.phase === 'baseline') {
    markAdultBaselineComplete();
  } else {
    markAdultGrowthComplete();
  }
}
