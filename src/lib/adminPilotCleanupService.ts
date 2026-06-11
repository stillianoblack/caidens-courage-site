import { getConfiguredAdminEmail } from '../config/adminAccess';
import { isProtectedPilotProgramCode } from '../config/adminProtectedPrograms';
import type { PilotProgramRecord } from '../types/pilotProgram';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export type PilotCleanupTableCount = {
  table: string;
  count: number;
  note?: string;
};

export type PilotCleanupPreview = {
  programCode: string;
  programName: string;
  pilotStatus: string;
  protected: boolean;
  archiveColumnsAvailable: boolean;
  tables: PilotCleanupTableCount[];
  error?: string;
};

export type PilotArchiveResult = {
  success: boolean;
  message: string;
};

const CLEANUP_TABLES: Array<{
  table: string;
  countByProgram: (programCode: string) => Promise<number>;
}> = [
  {
    table: 'pilot_programs',
    countByProgram: async (programCode) => {
      if (!supabase) return 0;
      const { count, error } = await supabase
        .from('pilot_programs')
        .select('id', { count: 'exact', head: true })
        .eq('program_code', programCode);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },
  },
  {
    table: 'participants',
    countByProgram: async (programCode) => countEq('participants', 'program_code', programCode),
  },
  {
    table: 'assessment_results_v2',
    countByProgram: async (programCode) => countEq('assessment_results_v2', 'program_code', programCode),
  },
  {
    table: 'assessment_results',
    countByProgram: async (programCode) => countEq('assessment_results', 'program_code', programCode),
  },
  {
    table: 'module_results',
    countByProgram: async (programCode) => countEq('module_results', 'program_code', programCode),
  },
  {
    table: 'student_gallery_items',
    countByProgram: async (programCode) => countEq('student_gallery_items', 'program_code', programCode),
  },
  {
    table: 'student_family_links',
    countByProgram: async (programCode) => {
      if (!supabase) return 0;
      const { count, error } = await supabase
        .from('student_family_links')
        .select('id', { count: 'exact', head: true })
        .or(`camp_program_code.eq.${programCode},family_program_code.eq.${programCode}`);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },
  },
  {
    table: 'family_child_goals',
    countByProgram: async (programCode) => countEq('family_child_goals', 'family_program_code', programCode),
  },
  {
    table: 'program_goals',
    countByProgram: async (programCode) => countEq('program_goals', 'program_code', programCode),
  },
];

async function countEq(table: string, column: string, value: string): Promise<number> {
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq(column, value);
  if (error) {
    if (/relation|does not exist/i.test(error.message)) return 0;
    throw new Error(error.message);
  }
  return count ?? 0;
}

async function detectArchiveColumns(): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.from('pilot_programs').select('archived_at, archived_by').limit(1);
  if (error) {
    if (/archived_at|column/i.test(error.message)) return false;
    return false;
  }
  return Array.isArray(data);
}

export async function fetchPilotProgramAdminStats(programCode: string): Promise<PilotCleanupTableCount[]> {
  const preview = await previewPilotCleanup(programCode);
  return preview.tables;
}

export async function previewPilotCleanup(programCode: string): Promise<PilotCleanupPreview> {
  const code = programCode.trim().toUpperCase();
  if (!code) {
    return {
      programCode: '',
      programName: '',
      pilotStatus: '',
      protected: false,
      archiveColumnsAvailable: false,
      tables: [],
      error: 'Program code is required.',
    };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return {
      programCode: code,
      programName: '',
      pilotStatus: '',
      protected: isProtectedPilotProgramCode(code),
      archiveColumnsAvailable: false,
      tables: [],
      error: 'Supabase is not configured.',
    };
  }

  const archiveColumnsAvailable = await detectArchiveColumns();

  const { data: programRow, error: programError } = await supabase
    .from('pilot_programs')
    .select('program_name, pilot_status')
    .eq('program_code', code)
    .maybeSingle();

  if (programError) {
    return {
      programCode: code,
      programName: '',
      pilotStatus: '',
      protected: isProtectedPilotProgramCode(code),
      archiveColumnsAvailable,
      tables: [],
      error: programError.message,
    };
  }

  if (!programRow) {
    return {
      programCode: code,
      programName: '',
      pilotStatus: '',
      protected: isProtectedPilotProgramCode(code),
      archiveColumnsAvailable,
      tables: [],
      error: 'Pilot program not found.',
    };
  }

  const tables: PilotCleanupTableCount[] = [];
  for (const entry of CLEANUP_TABLES) {
    try {
      const count = await entry.countByProgram(code);
      tables.push({ table: entry.table, count });
    } catch (err) {
      tables.push({
        table: entry.table,
        count: 0,
        note: err instanceof Error ? err.message : 'Count unavailable',
      });
    }
  }

  return {
    programCode: code,
    programName: programRow.program_name ?? '',
    pilotStatus: programRow.pilot_status ?? '',
    protected: isProtectedPilotProgramCode(code),
    archiveColumnsAvailable,
    tables,
  };
}

export async function archivePilotProgram(programCode: string): Promise<PilotArchiveResult> {
  const code = programCode.trim().toUpperCase();
  if (isProtectedPilotProgramCode(code)) {
    return { success: false, message: 'This pilot program is protected and cannot be archived.' };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  const archiveColumnsAvailable = await detectArchiveColumns();
  if (!archiveColumnsAvailable) {
    return {
      success: false,
      message: 'Archive columns are missing. Run supabase/pilot_programs_archive.sql first.',
    };
  }

  const archivedBy = getConfiguredAdminEmail() ?? 'admin';
  const { error } = await supabase
    .from('pilot_programs')
    .update({
      pilot_status: 'archived',
      archived_at: new Date().toISOString(),
      archived_by: archivedBy,
    })
    .eq('program_code', code);

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message: 'Pilot archived. Active portals will no longer unlock this program.',
  };
}

export async function restorePilotProgram(programCode: string): Promise<PilotArchiveResult> {
  const code = programCode.trim().toUpperCase();
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  const { error } = await supabase
    .from('pilot_programs')
    .update({
      pilot_status: 'active',
      archived_at: null,
      archived_by: null,
    })
    .eq('program_code', code);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Pilot restored to active status.' };
}

export async function deletePilotProgramPermanently(programCode: string): Promise<PilotArchiveResult> {
  const code = programCode.trim().toUpperCase();
  if (isProtectedPilotProgramCode(code)) {
    return { success: false, message: 'This pilot program is protected and cannot be deleted.' };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  const { error } = await supabase.from('pilot_programs').delete().eq('program_code', code);

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message: 'Pilot program row deleted. Related records were not hard-deleted.',
  };
}

export function filterProgramsForSearch(
  programs: PilotProgramRecord[],
  query: string,
): PilotProgramRecord[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return programs;

  return programs.filter((program) => {
    const haystack = [
      program.program_code,
      program.program_name,
      program.admin_email,
      program.group_name,
      program.family_access_code,
      program.facilitator_access_code,
      program.program_type,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(needle);
  });
}
