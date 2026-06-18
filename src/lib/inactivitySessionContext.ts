import { readActivePilotProgram } from '../config/activePilotProgram';
import { readFamilyPortalSession } from '../config/familyPortalAccess';
import {
  readActiveAccessCode,
  readActiveFamilyContext,
  readActivePortalRole,
  type PortalRole,
} from '../config/portalContext';
import { readPortalSessionUnlock } from '../config/portalAccess';
import { isIndependentFamilyProgram } from './independentFamilyProgram';

export type InactivitySessionMode =
  | 'independent_family'
  | 'camp_family'
  | 'school_family'
  | 'facilitator'
  | 'access_code'
  | 'unknown';

export type InactivitySessionContext = {
  mode: InactivitySessionMode;
  /** Shared-device programs must return to the access-code gate after idle timeout. */
  requiresAccessCodeReset: boolean;
  portalRole: PortalRole | null;
  programType: string | null;
};

const SCHOOL_PROGRAM_TYPES = new Set([
  'School',
  'District',
  'Teacher / Classroom',
]);

function resolveProgramType(): string | null {
  const program = readActivePilotProgram();
  if (program?.programType) return program.programType;
  return readActiveFamilyContext()?.programType ?? null;
}

function isSchoolProgramType(programType: string | null): boolean {
  return Boolean(programType && SCHOOL_PROGRAM_TYPES.has(programType));
}

/**
 * Resolve how idle timeout should end the session.
 * Uses active program + portal role — not localhost flags.
 */
export function resolveInactivitySessionContext(): InactivitySessionContext {
  const program = readActivePilotProgram();
  const role = readActivePortalRole();
  const programType = resolveProgramType();

  if (isIndependentFamilyProgram(program)) {
    return {
      mode: 'independent_family',
      requiresAccessCodeReset: false,
      portalRole: 'family',
      programType,
    };
  }

  if (role === 'facilitator' || Boolean(readPortalSessionUnlock())) {
    return {
      mode: 'facilitator',
      requiresAccessCodeReset: true,
      portalRole: 'facilitator',
      programType,
    };
  }

  if (isSchoolProgramType(programType)) {
    return {
      mode: 'school_family',
      requiresAccessCodeReset: true,
      portalRole: role ?? 'family',
      programType,
    };
  }

  if (role === 'family' || readFamilyPortalSession() || program) {
    return {
      mode: 'camp_family',
      requiresAccessCodeReset: true,
      portalRole: role ?? 'family',
      programType,
    };
  }

  if (readActiveAccessCode() || readPortalSessionUnlock()) {
    return {
      mode: 'access_code',
      requiresAccessCodeReset: true,
      portalRole: role,
      programType,
    };
  }

  return {
    mode: 'unknown',
    requiresAccessCodeReset: true,
    portalRole: role,
    programType,
  };
}

export function logInactivityContext(
  event: 'INACTIVITY_CONTEXT' | 'INACTIVITY_WARNING_SHOWN' | 'INACTIVITY_CONTINUE' | 'INACTIVITY_END_SESSION',
  context: InactivitySessionContext,
  extra?: Record<string, string | number | boolean | null>,
): void {
  console.info(`[${event}]`, {
    mode: context.mode,
    requiresAccessCodeReset: context.requiresAccessCodeReset,
    portalRole: context.portalRole,
    programType: context.programType,
    ...extra,
  });
}
