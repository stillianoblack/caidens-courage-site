import { getConfiguredAdminEmail } from '../config/adminAccess';
import type { PilotProgramRecord } from '../types/pilotProgram';
import { updateProgramDisplayNameByCode } from './familyProgramDisplayNameService';
import {
  getPilotProgramProtectionDecision,
  normalizePilotProgramProtectionLevel,
  PROTECTION_ACTION_BLOCKED_MESSAGE,
  resolvePilotProgramProtectionLevel,
} from './pilotProgramProtection';
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
  canArchive: boolean;
  canDelete: boolean;
  canRegenerateCodes: boolean;
  canChangePortalType: boolean;
  protectionLevel: string;
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
        canArchive: false,
        canDelete: false,
        canRegenerateCodes: false,
        canChangePortalType: false,
        protectionLevel: 'testing',
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
      canArchive: false,
      canDelete: false,
      canRegenerateCodes: false,
      canChangePortalType: false,
      protectionLevel: 'testing',
      archiveColumnsAvailable: false,
      tables: [],
      error: 'Supabase is not configured.',
    };
  }

  const archiveColumnsAvailable = await detectArchiveColumns();

  const { data: programRow, error: programError } = await supabase
    .from('pilot_programs')
    .select('program_name, pilot_status, protection_level')
    .eq('program_code', code)
    .maybeSingle();

  if (programError) {
    return {
      programCode: code,
      programName: '',
      pilotStatus: '',
      canArchive: false,
      canDelete: false,
      canRegenerateCodes: false,
      canChangePortalType: false,
      protectionLevel: 'testing',
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
      canArchive: false,
      canDelete: false,
      canRegenerateCodes: false,
      canChangePortalType: false,
      protectionLevel: 'testing',
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

  const protectionProgram = programRow as Pick<PilotProgramRecord, 'protection_level' | 'pilot_status'>;
  const archiveDecision = getPilotProgramProtectionDecision(protectionProgram, 'archive');
  const deleteDecision = getPilotProgramProtectionDecision(protectionProgram, 'delete');
  const regenerateDecision = getPilotProgramProtectionDecision(protectionProgram, 'regenerate_codes');
  const portalTypeDecision = getPilotProgramProtectionDecision(protectionProgram, 'change_portal_type');

  return {
    programCode: code,
    programName: programRow.program_name ?? '',
    pilotStatus: programRow.pilot_status ?? '',
    canArchive: archiveDecision.allowed,
    canDelete: deleteDecision.allowed,
    canRegenerateCodes: regenerateDecision.allowed,
    canChangePortalType: portalTypeDecision.allowed,
    protectionLevel: resolvePilotProgramProtectionLevel(protectionProgram),
    archiveColumnsAvailable,
    tables,
  };
}

export async function archivePilotProgram(programCode: string): Promise<PilotArchiveResult> {
  const code = programCode.trim().toUpperCase();

  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  const { data: programRow, error: programError } = await supabase
    .from('pilot_programs')
    .select('pilot_status, protection_level')
    .eq('program_code', code)
    .maybeSingle();
  if (programError) return { success: false, message: programError.message };
  if (!programRow) return { success: false, message: 'Pilot program not found.' };
  const archiveDecision = getPilotProgramProtectionDecision(
    programRow as Pick<PilotProgramRecord, 'protection_level' | 'pilot_status'>,
    'archive',
  );
  if (!archiveDecision.allowed) {
    return { success: false, message: archiveDecision.message ?? PROTECTION_ACTION_BLOCKED_MESSAGE };
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

  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  const { data: programRow, error: programError } = await supabase
    .from('pilot_programs')
    .select('pilot_status, protection_level')
    .eq('program_code', code)
    .maybeSingle();
  if (programError) return { success: false, message: programError.message };
  if (!programRow) return { success: false, message: 'Pilot program not found.' };
  const deleteDecision = getPilotProgramProtectionDecision(
    programRow as Pick<PilotProgramRecord, 'protection_level' | 'pilot_status'>,
    'delete',
  );
  if (!deleteDecision.allowed) {
    return { success: false, message: deleteDecision.message ?? PROTECTION_ACTION_BLOCKED_MESSAGE };
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

export async function updatePilotProgramDisplayName(
  programCode: string,
  input: { programName: string; groupName?: string },
): Promise<PilotArchiveResult> {
  const result = await updateProgramDisplayNameByCode(programCode, {
    displayName: input.programName,
    groupName: input.groupName,
  });
  if (!result.success) {
    return { success: false, message: result.message };
  }
  return { success: true, message: 'Program name updated successfully.' };
}

export async function updatePilotProgramEstimatedRange(
  programCode: string,
  estimatedStudentCountRange: string | null,
): Promise<PilotArchiveResult> {
  const code = programCode.trim().toUpperCase();
  if (!code) {
    return { success: false, message: 'Program code is required.' };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  const range = estimatedStudentCountRange?.trim() || null;

  const { error } = await supabase
    .from('pilot_programs')
    .update({ estimated_student_count_range: range })
    .eq('program_code', code);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Estimated student range updated.' };
}

export async function updatePilotProgramProtectionLevel(
  programCode: string,
  protectionLevel: string,
): Promise<PilotArchiveResult> {
  const code = programCode.trim().toUpperCase();
  const level = normalizePilotProgramProtectionLevel(protectionLevel);
  if (!code) return { success: false, message: 'Program code is required.' };
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  const { error } = await supabase
    .from('pilot_programs')
    .update({ protection_level: level })
    .eq('program_code', code);

  if (error) return { success: false, message: error.message };
  return { success: true, message: `Protection level updated to ${level}.` };
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
