import { readActivePilotProgram, resolveActiveProgramContext } from '../config/activePilotProgram';
import type { ActivePilotProgram } from '../types/pilotProgram';
import { isIndependentFamilyProgram } from './independentFamilyProgram';

export const FAMILY_PORTAL_FALLBACK_DISPLAY_NAME = 'Family Portal';

const LEGACY_CAMP_BRAND_PATTERN = /blue\s*ribbon|blueribbon/i;

export function isLegacyCampBrandLabel(name: string | null | undefined): boolean {
  if (!name?.trim()) return false;
  return LEGACY_CAMP_BRAND_PATTERN.test(name.trim());
}

function firstNonLegacyName(...candidates: Array<string | null | undefined>): string | null {
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed && !isLegacyCampBrandLabel(trimmed)) {
      return trimmed;
    }
  }
  return null;
}

/** Display name for independent / family hub — never defaults to Blue Ribbon. */
export function resolveFamilyPortalDisplayName(input?: {
  program?: Pick<ActivePilotProgram, 'programType' | 'programName' | 'groupName' | 'programCode'> | null;
  campProgramName?: string | null;
  campProgramCode?: string | null;
}): string {
  const program = input?.program ?? readActivePilotProgram();
  const hasCampLink = Boolean(
    input?.campProgramName?.trim() || input?.campProgramCode?.trim(),
  );

  const familyName = firstNonLegacyName(program?.groupName, program?.programName);
  if (familyName) return familyName;

  if (hasCampLink) {
    const linkedName = firstNonLegacyName(input?.campProgramName, input?.campProgramCode);
    if (linkedName) return linkedName;
  }

  if (isIndependentFamilyProgram(program) || !program) {
    return FAMILY_PORTAL_FALLBACK_DISPLAY_NAME;
  }

  return FAMILY_PORTAL_FALLBACK_DISPLAY_NAME;
}

/** Baseline / onboarding group field — omit stale camp names for independent families. */
export function resolveFamilyBaselineGroupName(
  program: Pick<ActivePilotProgram, 'programType' | 'groupName' | 'programName'> | null,
  fallback = '',
): string {
  if (!program) return fallback;
  if (isIndependentFamilyProgram(program)) {
    return firstNonLegacyName(program.groupName, program.programName) ?? '';
  }
  return firstNonLegacyName(program.groupName, program.programName) ?? fallback;
}

export function resolveFamilyProgramContextForForms(): {
  programCode: string;
  programName: string;
  groupName: string;
} | null {
  const context = resolveActiveProgramContext();
  if (!context) return null;

  const program = readActivePilotProgram();
  const groupName = resolveFamilyBaselineGroupName(program, context.groupName);

  return {
    programCode: context.programCode,
    programName: resolveFamilyPortalDisplayName({ program }),
    groupName,
  };
}
