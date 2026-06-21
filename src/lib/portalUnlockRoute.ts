import type { ActivePilotProgram } from '../types/pilotProgram';

export type PortalUnlockDestination =
  | 'kid_shell'
  | 'family_portal'
  | 'facilitator_portal'
  | 'baseline_results'
  | 'tier_dashboard'
  | 'invalid';

const STUDENT_PIN_RE = /^\d{4,8}$/;

export function classifyPortalCredential(value: string): 'student_pin' | 'parent_email' | 'empty' {
  const trimmed = value.trim();
  if (!trimmed) return 'empty';
  if (STUDENT_PIN_RE.test(trimmed)) return 'student_pin';
  return 'parent_email';
}

export function resolvePortalUnlockDestination(input: {
  accessCode: string;
  parentEmail: string;
  programRole: 'family' | 'facilitator' | null;
  baselineResultsCode?: boolean;
  tierType?: 'pilot' | 'family' | null;
}): PortalUnlockDestination {
  if (input.baselineResultsCode) return 'baseline_results';
  if (input.tierType) return 'tier_dashboard';

  const credential = classifyPortalCredential(input.parentEmail);
  if (!input.accessCode.trim()) return 'invalid';

  if (input.programRole === 'family') {
    if (credential === 'student_pin') return 'kid_shell';
    if (credential === 'parent_email') return 'family_portal';
    return 'invalid';
  }

  if (input.programRole === 'facilitator') {
    return 'facilitator_portal';
  }

  return 'invalid';
}

export function shouldHidePortalAccessCodeField(hasRememberedProgram: boolean): boolean {
  return hasRememberedProgram;
}

export function resolvePortalSubmitAccessCode(input: {
  enteredAccessCode: string;
  rememberedAccessCode: string;
}): string {
  return (input.enteredAccessCode.trim() || input.rememberedAccessCode.trim()).trim();
}

export function shouldPersistRememberedProgramAccess(_program: ActivePilotProgram): boolean {
  return true;
}
