import { readActivePilotProgram } from '../config/activePilotProgram';
import type { ActivePilotProgram } from '../types/pilotProgram';
import { loadB4BaselineState, saveB4BaselineStudentProfile } from './b4BaselineCheckStorage';
import {
  logProgramAssignmentAudit,
  resolveCanonicalProgramCode,
} from './portalProgramAssignment';

const LEGACY_PROGRAM_CODES = new Set([
  'blueribbon2026',
  'blueribbon',
  'blueribbonfamily',
  'blueribbonkids',
]);

export function logTrackingSaveBlocked(reason: string): void {
  console.warn('[TRACKING_SAVE_BLOCKED]', reason);
}

export function logActiveProgramContext(programCode: string): void {
  console.log('[ACTIVE_PROGRAM_CONTEXT]', programCode);
}

function isLegacyProgramCode(code: string): boolean {
  return LEGACY_PROGRAM_CODES.has(code.trim().toLowerCase());
}

/** Active portal session is the only source of truth for program-scoped saves. */
export function resolveTrackingProgramCode(saveContext?: string): string | null {
  const { code, source } = resolveCanonicalProgramCode();
  if (!code || isLegacyProgramCode(code)) {
    logTrackingSaveBlocked('Missing active program context');
    if (saveContext) {
      logProgramAssignmentAudit({ saveContext });
    }
    return null;
  }

  logActiveProgramContext(code);
  if (saveContext) {
    logProgramAssignmentAudit({ saveContext });
  } else if (source !== 'active_pilot_program') {
    console.info('[PROGRAM_ASSIGNMENT_SYNC]', { resolved_code: code, source });
  }
  return code;
}

export function requireActivePilotProgram(): ActivePilotProgram | null {
  const { code, program } = resolveCanonicalProgramCode();
  if (!program || !code || isLegacyProgramCode(code)) {
    logTrackingSaveBlocked('Missing active program context');
    return null;
  }

  logActiveProgramContext(code);
  return program;
}

/** Keep B-4 baseline local profile aligned with the unlocked portal program. */
export function syncPortalProgramContext(program: ActivePilotProgram): void {
  logActiveProgramContext(program.programCode);

  const baseline = loadB4BaselineState();
  if (!baseline.profile) {
    return;
  }

  const nickname = baseline.profile.nickname;
  if (
    baseline.profile.programCode === program.programCode &&
    baseline.profile.groupName === program.groupName
  ) {
    return;
  }

  saveB4BaselineStudentProfile({
    nickname,
    programCode: program.programCode,
    groupName: program.groupName,
  });
}

export function resolveGalleryProgramCode(explicit?: string): string | null {
  const { code: canonicalCode } = resolveCanonicalProgramCode();
  const code = canonicalCode || explicit?.trim() || null;
  if (!code || isLegacyProgramCode(code)) {
    logTrackingSaveBlocked('Missing active program context for gallery save');
    return null;
  }

  logActiveProgramContext(code);
  return code;
}
