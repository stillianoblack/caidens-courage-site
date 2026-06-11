import { readParentClaimContext } from '../config/parentClaimContext';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export type FamilyChildGoalsRecord = {
  id?: string;
  family_program_code: string;
  child_id?: string | null;
  child_name?: string | null;
  parent_email?: string | null;
  goals: string[];
  strengths: string[];
  completed_at?: string | null;
  updated_at?: string | null;
};

export const FAMILY_CHILD_GOALS_SAVED_EVENT = 'caidens:family-child-goals-saved';

function storageKey(programCode: string, childId?: string | null): string {
  const child = childId?.trim() || 'default';
  return `focusFlame:familyChildGoals:${programCode.trim()}:${child}`;
}

function notifySaved(record: FamilyChildGoalsRecord): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(FAMILY_CHILD_GOALS_SAVED_EVENT, { detail: record }));
}

export function readFamilyChildGoalsLocal(
  programCode: string,
  childId?: string | null,
): FamilyChildGoalsRecord | null {
  if (!programCode.trim() || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(programCode, childId));
    if (!raw) return null;
    return JSON.parse(raw) as FamilyChildGoalsRecord;
  } catch {
    return null;
  }
}

function writeFamilyChildGoalsLocal(record: FamilyChildGoalsRecord): void {
  if (!record.family_program_code.trim() || typeof window === 'undefined') return;
  localStorage.setItem(
    storageKey(record.family_program_code, record.child_id),
    JSON.stringify(record),
  );
}

export async function fetchFamilyChildGoals(
  programCode: string,
  childId?: string | null,
  childName?: string | null,
): Promise<FamilyChildGoalsRecord | null> {
  const local = readFamilyChildGoalsLocal(programCode, childId);
  if (!programCode.trim() || !isSupabaseConfigured() || !supabase) {
    return local;
  }

  try {
    let query = supabase
      .from('family_child_goals')
      .select('*')
      .eq('family_program_code', programCode.trim());

    if (childId?.trim()) {
      query = query.eq('child_id', childId.trim());
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      if (/family_child_goals|relation/i.test(error.message)) {
        return local;
      }
      console.warn('[family_child_goals] fetch failed:', error.message);
      return local;
    }

    if (!data) return local;

    const record: FamilyChildGoalsRecord = {
      id: data.id,
      family_program_code: data.family_program_code,
      child_id: data.child_id,
      child_name: data.child_name ?? childName ?? local?.child_name,
      parent_email: data.parent_email,
      goals: Array.isArray(data.goals) ? (data.goals as string[]) : [],
      strengths: Array.isArray(data.strengths) ? (data.strengths as string[]) : [],
      completed_at: data.completed_at,
      updated_at: data.updated_at,
    };
    writeFamilyChildGoalsLocal(record);
    return record;
  } catch (err) {
    console.warn('[family_child_goals] fetch error:', err);
    return local;
  }
}

export async function saveFamilyChildGoals(
  input: Omit<FamilyChildGoalsRecord, 'completed_at' | 'updated_at'> & {
    completed_at?: string | null;
  },
): Promise<{ record: FamilyChildGoalsRecord; warning?: string }> {
  const now = new Date().toISOString();
  const claim = readParentClaimContext();
  const record: FamilyChildGoalsRecord = {
    ...input,
    parent_email: input.parent_email ?? claim?.email?.trim().toLowerCase() ?? null,
    completed_at: input.completed_at ?? now,
    updated_at: now,
  };

  writeFamilyChildGoalsLocal(record);
  let warning: string | undefined;

  if (record.family_program_code.trim() && isSupabaseConfigured() && supabase) {
    try {
      const row = {
        family_program_code: record.family_program_code.trim(),
        child_id: record.child_id?.trim() || null,
        child_name: record.child_name?.trim() || null,
        parent_email: record.parent_email,
        goals: record.goals,
        strengths: record.strengths,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from('family_child_goals')
        .upsert(row, { onConflict: 'family_program_code,child_id' })
        .select('*')
        .maybeSingle();

      if (error) {
        if (/family_child_goals|relation/i.test(error.message)) {
          warning = 'Saved on this device. Cloud sync will be available soon.';
        } else {
          console.warn('[family_child_goals] save failed:', error.message);
          warning = 'Saved on this device only. You can continue.';
        }
      } else if (data) {
        record.id = data.id;
        record.completed_at = data.completed_at ?? record.completed_at;
        writeFamilyChildGoalsLocal(record);
      }
    } catch (err) {
      console.warn('[family_child_goals] save error:', err);
      warning = 'Saved on this device only. You can continue.';
    }
  } else {
    warning = 'Saved on this device. Cloud sync will be available soon.';
  }

  notifySaved(record);
  return { record, warning };
}

export function hasFamilyChildGoals(record: FamilyChildGoalsRecord | null): boolean {
  return Boolean(record?.completed_at && record.goals.length > 0 && record.strengths.length > 0);
}
