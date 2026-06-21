import {
  FAMILY_HUB_PATH,
  PROGRAM_DASHBOARD_PATH,
} from '../config/courageRoutes';
import { applyProgramPortalUnlock } from '../config/portalContext';
import { writeLastPilotProgram } from '../config/lastPilotProgram';
import { writeParentClaimContext } from '../config/parentClaimContext';
import type { ActivePilotProgram } from '../types/pilotProgram';
import { activateIndependentFamilyPortalSession } from './independentFamilyPortalSignup';
import { isIndependentFamilyProgram } from './independentFamilyProgram';
import { resolveFamilyKidDefaultLandingPath } from './familyKidLanding';
import { replaceWithPortalRoute } from './portalHardNavigation';
import { launchStudentPinKidPlay } from './studentPinLoginLaunch';
import { switchRememberedProgram } from './rememberedProgramAccess';
import {
  clearRememberedDeviceSession,
  readRememberedDeviceSession,
  touchRememberedDeviceSession,
  type RememberedDeviceSession,
} from './rememberedDeviceSession';

export type RememberedDeviceResumeResult =
  | { kind: 'routed'; destination: string }
  | { kind: 'needs_unlock'; session: RememberedDeviceSession }
  | { kind: 'none' };

function restoreParentSession(session: RememberedDeviceSession, program: ActivePilotProgram): void {
  const accessCode = session.access_code;
  const parentEmail = session.parent_id?.trim() || '';

  if (isIndependentFamilyProgram(program)) {
    activateIndependentFamilyPortalSession({
      program,
      parentEmail,
      accessCode,
    });
    return;
  }

  applyProgramPortalUnlock(program, 'family', accessCode);
  writeLastPilotProgram(program, 'family', parentEmail, accessCode);
  if (parentEmail) {
    writeParentClaimContext({ email: parentEmail, confirmed: true });
  }
}

export async function resumeRememberedDeviceSession(): Promise<RememberedDeviceResumeResult> {
  const session = readRememberedDeviceSession();
  if (!session?.program) return { kind: 'none' };

  const program = session.program;
  touchRememberedDeviceSession();

  if (session.user_type === 'student' && session.student_id) {
    const launch = await launchStudentPinKidPlay({
      participantId: session.student_id,
      programCode: session.program_code,
      displayName: session.display_name?.trim() || 'Player',
      organizationId: program.id ?? null,
    });
    if (launch.kind === 'error') {
      return { kind: 'needs_unlock', session };
    }
    return { kind: 'routed', destination: launch.path };
  }

  if (session.user_type === 'parent') {
    restoreParentSession(session, program);
    return { kind: 'routed', destination: resolveFamilyKidDefaultLandingPath() };
  }

  if (session.user_type === 'facilitator') {
    applyProgramPortalUnlock(program, 'facilitator', session.access_code);
    writeLastPilotProgram(
      program,
      'facilitator',
      session.facilitator_id || program.adminEmail,
      session.access_code,
    );
    return { kind: 'routed', destination: PROGRAM_DASHBOARD_PATH };
  }

  return { kind: 'needs_unlock', session };
}

export function navigateRememberedDeviceResume(result: RememberedDeviceResumeResult): void {
  if (result.kind === 'routed') {
    replaceWithPortalRoute(result.destination);
    return;
  }
  if (result.kind === 'needs_unlock') {
    clearRememberedDeviceSession('resume_failed');
    replaceWithPortalRoute('/portal');
  }
}

export function rememberedDeviceDisplayName(session: RememberedDeviceSession): string {
  if (session.display_name?.trim()) return session.display_name.trim();
  if (session.user_type === 'parent') return 'Parent/Guardian';
  if (session.user_type === 'facilitator') return 'Facilitator';
  return 'Student';
}

export function rememberedDevicePortalLabel(session: RememberedDeviceSession): string {
  if (session.user_type === 'student') return 'Kid Shell';
  if (session.user_type === 'parent') return 'Family Portal';
  return 'Facilitator Portal';
}

export function switchRememberedDeviceAccount(): void {
  switchRememberedProgram(true);
}

/** Family hub path constant for resume card copy. */
export { FAMILY_HUB_PATH, PROGRAM_DASHBOARD_PATH };
