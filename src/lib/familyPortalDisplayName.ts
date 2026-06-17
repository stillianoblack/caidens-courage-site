import { readActivePilotProgram, resolveActiveProgramContext } from '../config/activePilotProgram';
import type { ActivePilotProgram } from '../types/pilotProgram';

export const FAMILY_PORTAL_FALLBACK_DISPLAY_NAME = 'Family Portal';

const LEGACY_CAMP_BRAND_PATTERN = /blue\s*ribbon|blueribbon/i;

/** Detect stale demo/camp labels in session storage — not user-entered display names. */
export function isLegacyCampBrandLabel(name: string | null | undefined): boolean {
  if (!name?.trim()) return false;
  return LEGACY_CAMP_BRAND_PATTERN.test(name.trim());
}

function firstTrimmedName(...candidates: Array<string | null | undefined>): string | null {
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

/** Display name for family hub — uses saved names; falls back only when empty. */
export function resolveFamilyPortalDisplayName(input?: {
  program?: Pick<ActivePilotProgram, 'programType' | 'programName' | 'groupName' | 'programCode'> | null;
  campProgramName?: string | null;
  campProgramCode?: string | null;
}): string {
  const program = input?.program ?? readActivePilotProgram();
  const hasCampLink = Boolean(
    input?.campProgramName?.trim() || input?.campProgramCode?.trim(),
  );

  const familyName = firstTrimmedName(program?.groupName, program?.programName);
  if (familyName) return familyName;

  if (hasCampLink) {
    const linkedName = firstTrimmedName(input?.campProgramName, input?.campProgramCode);
    if (linkedName) return linkedName;
  }

  return FAMILY_PORTAL_FALLBACK_DISPLAY_NAME;
}

/** Baseline / onboarding group field — uses saved program group name when present. */
export function resolveFamilyBaselineGroupName(
  program: Pick<ActivePilotProgram, 'programType' | 'groupName' | 'programName'> | null,
  fallback = '',
): string {
  if (!program) return fallback;
  return firstTrimmedName(program.groupName, program.programName) ?? fallback;
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
