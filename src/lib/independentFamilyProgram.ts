import type { ActivePilotProgram, PilotProgramRecord, PilotProgramType } from '../types/pilotProgram';
import { readActivePilotProgram } from '../config/activePilotProgram';

/** UI / app-layer program type label. */
export const INDEPENDENT_FAMILY_PROGRAM_TYPE = 'Independent Family' as const satisfies PilotProgramType;

/** Canonical value stored in `pilot_programs.program_type`. */
export const INDEPENDENT_FAMILY_DB_TYPE = 'independent_family' as const;

export const INDEPENDENT_FAMILY_PRICING_TIER = 'independent_family' as const;

/** @deprecated Legacy sentinel rows — migrate to null in Supabase. */
export const INDEPENDENT_FAMILY_FACILITATOR_SENTINEL_SUFFIX = '-INTERNAL-NO-FACILITATOR';

export function isIndependentFamilyType(programType: string | undefined | null): boolean {
  return programType === INDEPENDENT_FAMILY_PROGRAM_TYPE || programType === INDEPENDENT_FAMILY_DB_TYPE;
}

export function isIndependentFamilyProgram(
  program: Pick<ActivePilotProgram, 'programType'> | null | undefined,
): boolean {
  return Boolean(program && isIndependentFamilyType(program.programType));
}

/** True when the active independent family program matches the hydrated program code. */
export function isIndependentFamilyProgramCode(
  familyProgramCode: string,
  program: Pick<ActivePilotProgram, 'programType' | 'programCode'> | null = readActivePilotProgram(),
): boolean {
  if (!isIndependentFamilyProgram(program)) return false;
  const activeCode = program?.programCode?.trim();
  const targetCode = familyProgramCode.trim();
  if (!activeCode || !targetCode) return false;
  return activeCode.toUpperCase() === targetCode.toUpperCase();
}

export function isLegacyIndependentFamilyFacilitatorCode(code: string | null | undefined): boolean {
  if (!code?.trim()) return false;
  return code.trim().toUpperCase().includes(INDEPENDENT_FAMILY_FACILITATOR_SENTINEL_SUFFIX);
}

export function hasFacilitatorAccessCode(code: string | null | undefined): boolean {
  if (!code?.trim()) return false;
  return !isLegacyIndependentFamilyFacilitatorCode(code);
}

export function toDbProgramType(type: PilotProgramType): string {
  return type === INDEPENDENT_FAMILY_PROGRAM_TYPE ? INDEPENDENT_FAMILY_DB_TYPE : type;
}

export function fromDbProgramType(dbType: string): PilotProgramType {
  if (dbType === INDEPENDENT_FAMILY_DB_TYPE) return INDEPENDENT_FAMILY_PROGRAM_TYPE;
  return dbType as PilotProgramType;
}

export function resolveIndependentFamilyProgramName(
  familyName: string,
  parentFirstName: string,
): string {
  const trimmedFamily = familyName.trim();
  if (trimmedFamily) return trimmedFamily;
  const trimmedParent = parentFirstName.trim();
  if (trimmedParent) return `${trimmedParent}'s Family`;
  return 'Family Home';
}

export type AdminProgramCategory =
  | 'Independent Family'
  | 'Camp / Youth Program'
  | 'School'
  | 'Testing';

/** Admin-facing program category — compact labels for pilot list cards. */
export function formatAdminProgramCategory(
  program: Pick<PilotProgramRecord, 'program_type' | 'pilot_status'>,
): AdminProgramCategory {
  if (program.pilot_status === 'testing') return 'Testing';

  const type = fromDbProgramType(program.program_type);
  if (isIndependentFamilyType(program.program_type) || type === 'Homeschool Group') {
    return 'Independent Family';
  }
  if (type === 'Camp / Youth Program' || type === 'After-School Program') {
    return 'Camp / Youth Program';
  }
  if (type === 'School' || type === 'District' || type === 'Teacher / Classroom') {
    return 'School';
  }
  return 'Camp / Youth Program';
}

export function inferProgramTypeFromCode(programCode: string): PilotProgramType {
  if (programCode.trim().toUpperCase().startsWith('FAMILY-')) {
    return INDEPENDENT_FAMILY_PROGRAM_TYPE;
  }
  return 'Homeschool Group';
}
