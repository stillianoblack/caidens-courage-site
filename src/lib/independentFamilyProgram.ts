import type { ActivePilotProgram, PilotProgramType } from '../types/pilotProgram';

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
