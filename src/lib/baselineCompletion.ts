import { readActiveChildNickname } from '../config/activeChildNickname';
import {
  isBaselineFullyComplete,
  loadAllBaselineResults,
  loadB4BaselineState,
} from './b4BaselineCheckStorage';
import { isSupabaseConfigured, supabase } from './supabaseClient';

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function normalizeNickname(name: string): string {
  return name.trim().toLowerCase();
}

function matchesChild(
  rowNickname: string | undefined | null,
  childNickname: string | undefined | null,
  target: string,
): boolean {
  const normalized = normalizeNickname(target);
  if (!normalized) return false;
  const nick = rowNickname ? normalizeNickname(rowNickname) : '';
  const child = childNickname ? normalizeNickname(childNickname) : '';
  return nick === normalized || child === normalized;
}

export function isBaselineCompleteLocal(
  programCode?: string,
  nickname?: string,
): boolean {
  const code = programCode?.trim();
  const child = (nickname ?? readActiveChildNickname()).trim();

  const session = loadB4BaselineState();
  if (isBaselineFullyComplete(session)) {
    const sessionCode = session.profile?.programCode ?? session.record?.programCode ?? '';
    const sessionNick = session.profile?.nickname ?? session.record?.nickname ?? '';
    const codeMatches = !code || normalizeCode(sessionCode) === normalizeCode(code);
    const nickMatches = !child || normalizeNickname(sessionNick) === normalizeNickname(child);
    if (codeMatches && nickMatches) {
      return true;
    }
  }

  const archive = loadAllBaselineResults();
  return archive.some((row) => {
    if (!row.completedAt) return false;
    if (code && normalizeCode(row.programCode) !== normalizeCode(code)) return false;
    if (child && normalizeNickname(row.nickname) !== normalizeNickname(child)) return false;
    return true;
  });
}

export async function isBaselineCompleteRemote(
  programCode?: string,
  nickname?: string,
): Promise<boolean> {
  const code = programCode?.trim();
  const child = (nickname ?? readActiveChildNickname()).trim();

  if (!isSupabaseConfigured() || !supabase || !code) {
    return false;
  }

  try {
    let query = supabase
      .from('assessment_results')
      .select('nickname, child_nickname, program_code, assessment_type, completed_at')
      .eq('assessment_type', 'baseline')
      .eq('program_code', code);

    const { data, error } = await query;

    if (error || !data?.length) {
      return false;
    }

    const rows = data as Array<{
      nickname?: string | null;
      child_nickname?: string | null;
      program_code?: string | null;
      assessment_type?: string | null;
      completed_at?: string | null;
    }>;

    return rows.some((row) => {
      if (!row.completed_at) return false;
      if (child) {
        return matchesChild(row.nickname, row.child_nickname, child);
      }
      return true;
    });
  } catch {
    return false;
  }
}

export async function checkBaselineCompletion(
  programCode?: string,
  nickname?: string,
): Promise<boolean> {
  if (isBaselineCompleteLocal(programCode, nickname)) {
    return true;
  }
  return isBaselineCompleteRemote(programCode, nickname);
}
