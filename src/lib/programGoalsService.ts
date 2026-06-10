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

const REMIND_LATER_DAYS = 3;

function storageKey(programCode: string, portalType: ProgramGoalsPortalType, suffix: string): string {
  return `${portalType}_program_goals_${suffix}_${programCode.trim()}`;
}

export function readProgramGoalsLocal(
  programCode: string,
  portalType: ProgramGoalsPortalType,
): ProgramGoalsRecord | null {
  if (!programCode.trim() || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(programCode, portalType, 'data'));
    if (!raw) return null;
    return JSON.parse(raw) as ProgramGoalsRecord;
  } catch {
    return null;
  }
}

function writeProgramGoalsLocal(record: ProgramGoalsRecord): void {
  if (!record.program_code.trim() || typeof window === 'undefined') return;
  localStorage.setItem(
    storageKey(record.program_code, record.portal_type, 'data'),
    JSON.stringify(record),
  );
}

export function readProgramGoalsSkippedLocal(
  programCode: string,
  portalType: ProgramGoalsPortalType,
): boolean {
  try {
    return localStorage.getItem(storageKey(programCode, portalType, 'skipped')) === 'true';
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
  localStorage.setItem(storageKey(programCode, portalType, 'skipped'), skipped ? 'true' : 'false');
}

export async function fetchProgramGoals(
  programCode: string,
  portalType: ProgramGoalsPortalType,
): Promise<ProgramGoalsRecord | null> {
  const local = readProgramGoalsLocal(programCode, portalType);
  if (!programCode.trim() || !isSupabaseConfigured() || !supabase) {
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

    if (!data) return local;

    const record: ProgramGoalsRecord = {
      id: data.id,
      program_code: data.program_code,
      portal_type: data.portal_type as ProgramGoalsPortalType,
      selected_goals: Array.isArray(data.selected_goals) ? (data.selected_goals as string[]) : [],
      custom_goal: data.custom_goal,
      completed_at: data.completed_at,
      dismissed_until: data.dismissed_until,
    };
    writeProgramGoalsLocal(record);
    return record;
  } catch (err) {
    console.warn('[program_goals] fetch error:', err);
    return local;
  }
}

export async function saveProgramGoals(record: ProgramGoalsRecord): Promise<ProgramGoalsRecord> {
  const now = new Date().toISOString();

  writeProgramGoalsLocal(record);

  if (!record.program_code.trim() || !isSupabaseConfigured() || !supabase) {
    return record;
  }

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
      return {
        id: data.id,
        program_code: data.program_code,
        portal_type: data.portal_type,
        selected_goals: data.selected_goals ?? [],
        custom_goal: data.custom_goal,
        completed_at: data.completed_at,
        dismissed_until: data.dismissed_until,
      };
    }
  } catch (err) {
    console.warn('[program_goals] save error:', err);
  }

  return record;
}

export function shouldShowGoalsOnboarding(record: ProgramGoalsRecord | null, skipped: boolean): boolean {
  if (skipped) return false;
  if (record?.completed_at) return false;
  if (record?.dismissed_until) {
    return new Date(record.dismissed_until).getTime() <= Date.now();
  }
  return true;
}

export function remindLaterDismissedUntil(): string {
  const date = new Date();
  date.setDate(date.getDate() + REMIND_LATER_DAYS);
  return date.toISOString();
}
