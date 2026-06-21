import type { NavigateFunction } from 'react-router-dom';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { kidPlaySessionStartPath } from '../config/courageRoutes';
import { setActiveChild } from './activeChildContext';
import { resolveFacilitatorKidPlayLaunch } from './facilitatorKidPlayLaunch';
import { applyKidPlaySessionResume, parseKidPlayResumePayload, type KidPlayResumePayload } from './kidPlaySessionResume';
import { kidShellAwareNavigate } from './kidShellNav';
import { programScopesMatch } from './portalProgramScope';
import { logSessionIsolationWarning } from './sessionIsolationLog';
import { fetchParticipantPinFingerprint } from './studentPinService';

const CONTINUITY_STORAGE_KEY = 'cc-facilitator-student-continuity';

export const DEFAULT_FACILITATOR_CONTINUITY_WINDOW_MS = 30 * 60 * 1000;

export type FacilitatorStudentContinuityRecord = {
  lastStudentId: string;
  /** Program-scoped PIN fingerprint used to detect student switches and PIN rotation. */
  lastStudentPinHash: string | null;
  lastSessionTimestamp: string;
  programCode: string;
  displayName?: string;
  resumePayload?: KidPlayResumePayload;
};

export type FacilitatorContinuityDecision =
  | { permitted: true; scenario: 'direct_restore' }
  | {
      permitted: false;
      reason: 'student_switch' | 'expired' | 'pin_mismatch' | 'no_prior_session';
    };

export function facilitatorContinuityWindowMs(): number {
  const raw = process.env.REACT_APP_FACILITATOR_STUDENT_CONTINUITY_MINUTES;
  if (raw) {
    const minutes = Number(raw);
    if (Number.isFinite(minutes) && minutes > 0) {
      return minutes * 60 * 1000;
    }
  }
  return DEFAULT_FACILITATOR_CONTINUITY_WINDOW_MS;
}

export function readFacilitatorStudentContinuity(): FacilitatorStudentContinuityRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(CONTINUITY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FacilitatorStudentContinuityRecord>;
    if (!parsed.lastStudentId?.trim() || !parsed.lastSessionTimestamp?.trim() || !parsed.programCode?.trim()) {
      return null;
    }
    return {
      lastStudentId: parsed.lastStudentId.trim(),
      lastStudentPinHash: parsed.lastStudentPinHash?.trim() || null,
      lastSessionTimestamp: parsed.lastSessionTimestamp.trim(),
      programCode: parsed.programCode.trim(),
      displayName: parsed.displayName?.trim() || undefined,
      resumePayload: parseKidPlayResumePayload(parsed.resumePayload as Record<string, unknown> | undefined) ?? undefined,
    };
  } catch {
    return null;
  }
}

export function writeFacilitatorStudentContinuity(record: FacilitatorStudentContinuityRecord): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(
      CONTINUITY_STORAGE_KEY,
      JSON.stringify({
        lastStudentId: record.lastStudentId.trim(),
        lastStudentPinHash: record.lastStudentPinHash?.trim() || null,
        lastSessionTimestamp: record.lastSessionTimestamp,
        programCode: record.programCode.trim(),
        displayName: record.displayName?.trim() || undefined,
        resumePayload: record.resumePayload ?? undefined,
      }),
    );
  } catch {
    /* sessionStorage unavailable */
  }
}

export function clearFacilitatorStudentContinuity(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(CONTINUITY_STORAGE_KEY);
  } catch {
    /* sessionStorage unavailable */
  }
}

export function evaluateFacilitatorStudentContinuity(input: {
  participantId: string;
  pinFingerprint: string;
  nowMs?: number;
  record?: FacilitatorStudentContinuityRecord | null;
}): FacilitatorContinuityDecision {
  const record = input.record ?? readFacilitatorStudentContinuity();
  if (!record) {
    return { permitted: false, reason: 'no_prior_session' };
  }

  const participantId = input.participantId.trim();
  const pinFingerprint = input.pinFingerprint.trim();
  const nowMs = input.nowMs ?? Date.now();
  const lastMs = Date.parse(record.lastSessionTimestamp);

  if (!Number.isFinite(lastMs)) {
    return { permitted: false, reason: 'no_prior_session' };
  }

  if (nowMs - lastMs > facilitatorContinuityWindowMs()) {
    return { permitted: false, reason: 'expired' };
  }

  const activeProgramCode = readActivePilotProgram()?.programCode?.trim();
  if (activeProgramCode && !programScopesMatch(record.programCode, activeProgramCode)) {
    logSessionIsolationWarning('facilitator_continuity_program_mismatch', {
      expected_program_code: activeProgramCode,
      stored_program_code: record.programCode,
      participant_id: participantId,
    });
    return { permitted: false, reason: 'no_prior_session' };
  }

  if (participantId !== record.lastStudentId) {
    return { permitted: false, reason: 'student_switch' };
  }

  if (record.lastStudentPinHash && pinFingerprint !== record.lastStudentPinHash) {
    return { permitted: false, reason: 'pin_mismatch' };
  }

  return { permitted: true, scenario: 'direct_restore' };
}

export function continuityDecisionMessage(decision: FacilitatorContinuityDecision): string {
  if (decision.permitted) return '';

  switch (decision.reason) {
    case 'student_switch':
      return 'This device was used by another student. A facilitator must unlock it first.';
    case 'expired':
      return 'Your break was longer than allowed. A facilitator must unlock the device.';
    case 'pin_mismatch':
      return 'Your PIN was recently changed. A facilitator must unlock the device.';
    default:
      return 'A facilitator must unlock this device before you can continue.';
  }
}

export async function persistFacilitatorStudentContinuityFromSessionEnd(input: {
  childId?: string;
  childDisplayName?: string;
  resumePayload?: Record<string, unknown> | null;
}): Promise<void> {
  const childId = input.childId?.trim();
  if (!childId) return;

  const programCode = readActivePilotProgram()?.programCode?.trim() ?? '';
  if (!programCode) return;

  const lastStudentPinHash = await fetchParticipantPinFingerprint(childId);
  const resumePayload = parseKidPlayResumePayload(input.resumePayload ?? undefined) ?? undefined;

  writeFacilitatorStudentContinuity({
    lastStudentId: childId,
    lastStudentPinHash,
    lastSessionTimestamp: new Date().toISOString(),
    programCode,
    displayName: input.childDisplayName?.trim() || undefined,
    resumePayload,
  });
}

export function touchFacilitatorStudentContinuity(input: {
  participantId: string;
  pinFingerprint: string;
  displayName?: string;
}): void {
  const existing = readFacilitatorStudentContinuity();
  if (!existing || existing.lastStudentId !== input.participantId.trim()) {
    return;
  }

  writeFacilitatorStudentContinuity({
    ...existing,
    lastStudentPinHash: input.pinFingerprint.trim() || existing.lastStudentPinHash,
    lastSessionTimestamp: new Date().toISOString(),
    displayName: input.displayName?.trim() || existing.displayName,
  });
}

export async function writeFacilitatorStudentContinuityForLaunch(input: {
  childId: string;
  childDisplayName?: string;
  programCode?: string;
}): Promise<void> {
  const childId = input.childId.trim();
  if (!childId) return;

  const programCode = input.programCode?.trim() || readActivePilotProgram()?.programCode?.trim() || '';
  if (!programCode) return;

  const lastStudentPinHash = await fetchParticipantPinFingerprint(childId);

  writeFacilitatorStudentContinuity({
    lastStudentId: childId,
    lastStudentPinHash,
    lastSessionTimestamp: new Date().toISOString(),
    programCode,
    displayName: input.childDisplayName?.trim() || undefined,
  });
}

export async function restoreFacilitatorStudentViaPin(input: {
  navigate: NavigateFunction;
  participantId: string;
  displayName: string;
  pinFingerprint: string;
  organizationId?: string | null;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const launch = await resolveFacilitatorKidPlayLaunch({
    childId: input.participantId,
    childName: input.displayName,
    organizationId: input.organizationId ?? null,
  });

  if (launch.kind === 'error') {
    return { ok: false, message: launch.message };
  }

  if (launch.kind === 'conflict') {
    return {
      ok: false,
      message: `${launch.conflict.childName} is already playing on another device.`,
    };
  }

  setActiveChild({
    participantId: input.participantId,
    displayName: input.displayName,
    firstName: input.displayName,
  });

  touchFacilitatorStudentContinuity({
    participantId: input.participantId,
    pinFingerprint: input.pinFingerprint,
    displayName: input.displayName,
  });

  const resume = readFacilitatorStudentContinuity()?.resumePayload ?? null;
  const resumed = applyKidPlaySessionResume(input.navigate, launch.session, resume);
  if (!resumed) {
    kidShellAwareNavigate(input.navigate, kidPlaySessionStartPath(launch.session.id), { replace: true });
  }

  return { ok: true };
}
