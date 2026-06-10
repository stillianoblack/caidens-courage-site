import { readParentClaimContext } from '../config/parentClaimContext';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import type { ProgramGoalsPortalType } from '../data/programGoalsOptions';

export type ProgramGoalsRecord = {
  id?: string;
  program_code: string;
  portal_type: ProgramGoalsPortalType;
  selected_goals: string[];
  custom_goal?: string | null;
  completed_at?: string | null;
  dismissed_until?: string | null;
};

export const PROGRAM_GOALS_SAVED_EVENT = 'caidens:program-goals-saved';

const REMIND_LATER_HOURS = 24;
const SKIP_DAYS = 7;

function notifyProgramGoalsSaved(record: ProgramGoalsRecord): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(PROGRAM_GOALS_SAVED_EVENT, { detail: record }),
  );
}

function legacyStorageKey(programCode: string, portalType: ProgramGoalsPortalType, suffix: string): string {
  return `${portalType}_program_goals_${suffix}_${programCode.trim()}`;
}

export function resolveGoalsDrawerUserScope(): string {
  const claim = readParentClaimContext();
  const email = claim?.email?.trim().toLowerCase();
  if (email) return email;
  const phone = claim?.phone?.replace(/\D/g, '');
  if (phone) return phone;
  return 'anonymous';
}

export function goalsDrawerDismissStorageKey(
  programCode: string,
  portalType: ProgramGoalsPortalType,
  userScope?: string,
): string {
  const scope = userScope?.trim() || resolveGoalsDrawerUserScope();
  return `focusFlame:goalsDrawer:${portalType}:${programCode.trim()}:${scope}`;
}

export function readGoalsDrawerDismissedUntilLocal(
  programCode: string,
  portalType: ProgramGoalsPortalType,
  userScope?: string,
): string | null {
  if (!programCode.trim() || typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(goalsDrawerDismissStorageKey(programCode, portalType, userScope));
  } catch {
    return null;
  }
}

export function writeGoalsDrawerDismissedUntilLocal(
  programCode: string,
  portalType: ProgramGoalsPortalType,
  dismissedUntil: string | null,
  userScope?: string,
): void {
  if (!programCode.trim() || typeof window === 'undefined') return;
  const key = goalsDrawerDismissStorageKey(programCode, portalType, userScope);
  if (!dismissedUntil) {
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, dismissedUntil);
}

export function readProgramGoalsLocal(
  programCode: string,
  portalType: ProgramGoalsPortalType,
): ProgramGoalsRecord | null {
  if (!programCode.trim() || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(legacyStorageKey(programCode, portalType, 'data'));
    if (!raw) return null;
    return JSON.parse(raw) as ProgramGoalsRecord;
  } catch {
    return null;
  }
}

function writeProgramGoalsLocal(record: ProgramGoalsRecord): void {
  if (!record.program_code.trim() || typeof window === 'undefined') return;
  localStorage.setItem(
    legacyStorageKey(record.program_code, record.portal_type, 'data'),
    JSON.stringify(record),
  );
}

export function readProgramGoalsSkippedLocal(
  programCode: string,
  portalType: ProgramGoalsPortalType,
): boolean {
  try {
    return localStorage.getItem(legacyStorageKey(programCode, portalType, 'skipped')) === 'true';
  } catch {
    return false;
  }
}

export function writeProgramGoalsSkippedLocal(
  programCode: string,
  portalType: ProgramGoalsPortalType,
  skipped: boolean,
): void {
  if (!programCode.trim() || typeof window === 'undefined') return;
  localStorage.setItem(legacyStorageKey(programCode, portalType, 'skipped'), skipped ? 'true' : 'false');
}

export function dismissGoalsForHours(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

export function dismissGoalsForDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function remindLaterDismissedUntil(): string {
  return dismissGoalsForHours(REMIND_LATER_HOURS);
}

export function skipGoalsDismissedUntil(): string {
  return dismissGoalsForDays(SKIP_DAYS);
}

function isDismissedUntilActive(value?: string | null): boolean {
  if (!value?.trim()) return false;
  return new Date(value).getTime() > Date.now();
}

export async function fetchProgramGoals(
  programCode: string,
  portalType: ProgramGoalsPortalType,
): Promise<ProgramGoalsRecord | null> {
  const local = readProgramGoalsLocal(programCode, portalType);
  const localDismissedUntil = readGoalsDrawerDismissedUntilLocal(programCode, portalType);
  if (!programCode.trim() || !isSupabaseConfigured() || !supabase) {
    if (local) return local;
    if (localDismissedUntil) {
      return {
        program_code: programCode,
        portal_type: portalType,
        selected_goals: [],
        dismissed_until: localDismissedUntil,
      };
    }
    return local;
  }

  try {
    const { data, error } = await supabase
      .from('program_goals')
      .select('*')
      .eq('program_code', programCode.trim())
      .eq('portal_type', portalType)
      .maybeSingle();

    if (error) {
      if (/program_goals|relation/i.test(error.message)) {
        return local;
      }
      console.warn('[program_goals] fetch failed:', error.message);
      return local;
    }

    if (!data) {
      if (localDismissedUntil) {
        return {
          program_code: programCode,
          portal_type: portalType,
          selected_goals: local?.selected_goals ?? [],
          custom_goal: local?.custom_goal,
          completed_at: local?.completed_at ?? null,
          dismissed_until: localDismissedUntil,
        };
      }
      return local;
    }

    const record: ProgramGoalsRecord = {
      id: data.id,
      program_code: data.program_code,
      portal_type: data.portal_type as ProgramGoalsPortalType,
      selected_goals: Array.isArray(data.selected_goals) ? (data.selected_goals as string[]) : [],
      custom_goal: data.custom_goal,
      completed_at: data.completed_at,
      dismissed_until: data.dismissed_until ?? localDismissedUntil,
    };
    writeProgramGoalsLocal(record);
    if (record.dismissed_until) {
      writeGoalsDrawerDismissedUntilLocal(programCode, portalType, record.dismissed_until);
    }
    return record;
  } catch (err) {
    console.warn('[program_goals] fetch error:', err);
    return local;
  }
}

export async function saveProgramGoals(record: ProgramGoalsRecord): Promise<ProgramGoalsRecord> {
  const now = new Date().toISOString();

  writeProgramGoalsLocal(record);
  if (record.dismissed_until) {
    writeGoalsDrawerDismissedUntilLocal(
      record.program_code,
      record.portal_type,
      record.dismissed_until,
    );
  } else if (record.completed_at) {
    writeGoalsDrawerDismissedUntilLocal(record.program_code, record.portal_type, null);
    writeProgramGoalsSkippedLocal(record.program_code, record.portal_type, false);
  }

  let saved = record;

  if (record.program_code.trim() && isSupabaseConfigured() && supabase) {
    try {
      const row = {
        program_code: record.program_code.trim(),
        portal_type: record.portal_type,
        selected_goals: record.selected_goals,
        custom_goal: record.custom_goal?.trim() || null,
        completed_at: record.completed_at ?? null,
        dismissed_until: record.dismissed_until ?? null,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from('program_goals')
        .upsert(row, { onConflict: 'program_code,portal_type' })
        .select('*')
        .maybeSingle();

      if (error && !/program_goals|relation/i.test(error.message)) {
        console.warn('[program_goals] save failed:', error.message);
      } else if (data) {
        saved = {
          id: data.id,
          program_code: data.program_code,
          portal_type: data.portal_type,
          selected_goals: data.selected_goals ?? [],
          custom_goal: data.custom_goal,
          completed_at: data.completed_at,
          dismissed_until: data.dismissed_until,
        };
        writeProgramGoalsLocal(saved);
        if (saved.dismissed_until) {
          writeGoalsDrawerDismissedUntilLocal(
            saved.program_code,
            saved.portal_type,
            saved.dismissed_until,
          );
        }
      }
    } catch (err) {
      console.warn('[program_goals] save error:', err);
    }
  }

  notifyProgramGoalsSaved(saved);
  return saved;
}

export function shouldShowGoalsOnboarding(
  record: ProgramGoalsRecord | null,
  skipped: boolean,
  localDismissedUntil?: string | null,
): boolean {
  if (record?.completed_at) return false;
  if (isDismissedUntilActive(record?.dismissed_until)) return false;
  if (isDismissedUntilActive(localDismissedUntil)) return false;
  if (skipped && !record?.dismissed_until && !localDismissedUntil) return false;
  return true;
}
