import { kidPlaySessionStartPath } from '../config/courageRoutes';
import { readKidPlayFamilyResumePayload, remapKidPlayResumeRoute } from './kidPlayFamilyResume';
import { readLocalKidPlaySessionId } from './kidPlaySessionService';
import { programDashboardTabPath } from './programDashboardNav';
import { readKidPlayFamilyReturnBase } from './kidPlayShellRoutes';
import { STUDENT_PIN_INPUT_RE } from './kidPlayReturnUnlock';

export type KidPlayReturnSessionDestination =
  | 'kid_shell'
  | 'family_portal'
  | 'facilitator_portal'
  | 'role_picker'
  | 'invalid';

export type KidPlayReturnSessionRole = 'parent' | 'facilitator';

export function classifyKidPlayReturnCredential(value: string): 'student_pin' | 'email' | 'empty' {
  const trimmed = value.trim();
  if (!trimmed) return 'empty';
  if (STUDENT_PIN_INPUT_RE.test(trimmed)) return 'student_pin';
  return 'email';
}

export function resolveKidPlayReturnSessionDestination(input: {
  emailOrPin: string;
  parentEmailMatches: boolean;
  facilitatorEmailMatches: boolean;
  preferredRole?: KidPlayReturnSessionRole | null;
}): KidPlayReturnSessionDestination {
  const kind = classifyKidPlayReturnCredential(input.emailOrPin);
  if (kind === 'empty') return 'invalid';
  if (kind === 'student_pin') return 'kid_shell';

  if (input.preferredRole === 'parent') {
    return input.parentEmailMatches ? 'family_portal' : 'invalid';
  }
  if (input.preferredRole === 'facilitator') {
    return input.facilitatorEmailMatches ? 'facilitator_portal' : 'invalid';
  }

  if (input.parentEmailMatches && input.facilitatorEmailMatches) {
    return 'role_picker';
  }
  if (input.facilitatorEmailMatches) return 'facilitator_portal';
  if (input.parentEmailMatches) return 'family_portal';
  return 'invalid';
}

export function familyReturnSessionPath(): string {
  return readKidPlayFamilyReturnBase();
}

export function facilitatorReturnSessionPath(): string {
  return programDashboardTabPath('roster');
}

/** Kid Shell weekly adventures — prefers stored resume route when available. */
export function studentReturnSessionPath(sessionId?: string | null): string {
  const resume = readKidPlayFamilyResumePayload();
  const resolvedSessionId = sessionId?.trim() || readLocalKidPlaySessionId()?.trim() || '';

  if (resume?.route?.trim() && resolvedSessionId) {
    const remapped = remapKidPlayResumeRoute(resume.route, resolvedSessionId);
    if (remapped) return remapped;
  }

  if (resume?.route?.trim()) {
    return resume.route.trim();
  }

  if (resolvedSessionId) {
    return kidPlaySessionStartPath(resolvedSessionId);
  }

  return kidPlaySessionStartPath('');
}
