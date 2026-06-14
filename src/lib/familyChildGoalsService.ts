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

function normalizeGoalsRow(
  data: Record<string, unknown>,
  childName?: string | null,
  local?: FamilyChildGoalsRecord | null,
): FamilyChildGoalsRecord {
  const goals = Array.isArray(data.goals) ? (data.goals as string[]) : [];
  const strengths = Array.isArray(data.strengths) ? (data.strengths as string[]) : [];
  const updatedAt = data.updated_at ? String(data.updated_at) : null;
  let completedAt = data.completed_at ? String(data.completed_at) : null;
  if (!completedAt && goals.length > 0 && strengths.length > 0) {
    completedAt = updatedAt ?? local?.completed_at ?? null;
  }

  return {
    id: data.id ? String(data.id) : undefined,
    family_program_code: String(data.family_program_code ?? ''),
    child_id: data.child_id ? String(data.child_id) : null,
    child_name: data.child_name ? String(data.child_name) : childName ?? local?.child_name,
    parent_email: data.parent_email ? String(data.parent_email) : null,
    goals,
    strengths,
    completed_at: completedAt,
    updated_at: updatedAt,
  };
}

function resolveLocalFamilyChildGoals(
  programCode: string,
  childId?: string | null,
): FamilyChildGoalsRecord | null {
  const childSpecific = readFamilyChildGoalsLocal(programCode, childId);
  if (childSpecific) return childSpecific;
  if (childId?.trim()) {
    return readFamilyChildGoalsLocal(programCode, null);
  }
  return null;
}

export async function fetchFamilyChildGoals(
  programCode: string,
  childId?: string | null,
  childName?: string | null,
): Promise<FamilyChildGoalsRecord | null> {
  const local = resolveLocalFamilyChildGoals(programCode, childId);
  if (!programCode.trim() || !isSupabaseConfigured() || !supabase) {
    return local;
  }

  try {
    const code = programCode.trim();
    const participantId = childId?.trim() || '';

    if (participantId) {
      const { data: childData, error: childError } = await supabase
        .from('family_child_goals')
        .select('*')
        .eq('family_program_code', code)
        .eq('child_id', participantId)
        .maybeSingle();

      if (childError) {
        if (!/family_child_goals|relation/i.test(childError.message)) {
          console.warn('[family_child_goals] child fetch failed:', childError.message);
        }
      } else if (childData) {
        const record = normalizeGoalsRow(childData as Record<string, unknown>, childName, local);
        writeFamilyChildGoalsLocal(record);
        return record;
      }

      const { data: familyData, error: familyError } = await supabase
        .from('family_child_goals')
        .select('*')
        .eq('family_program_code', code)
        .is('child_id', null)
        .maybeSingle();

      if (familyError) {
        if (!/family_child_goals|relation/i.test(familyError.message)) {
          console.warn('[family_child_goals] family fetch failed:', familyError.message);
        }
        return local;
      }

      if (familyData) {
        const record = normalizeGoalsRow(familyData as Record<string, unknown>, childName, local);
        writeFamilyChildGoalsLocal(record);
        return record;
      }

      return local;
    }

    const { data, error } = await supabase
      .from('family_child_goals')
      .select('*')
      .eq('family_program_code', code)
      .is('child_id', null)
      .maybeSingle();

    if (error) {
      if (/family_child_goals|relation/i.test(error.message)) {
        return local;
      }
      console.warn('[family_child_goals] fetch failed:', error.message);
      return local;
    }

    if (!data) return local;

    const record = normalizeGoalsRow(data as Record<string, unknown>, childName, local);
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
        completed_at: record.completed_at,
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
  return Boolean(record && record.goals.length > 0 && record.strengths.length > 0);
}
