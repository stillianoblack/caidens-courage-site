import type { PilotProgramFeatureFlags, PilotProgramType } from '../types/pilotProgram';
import type { PilotPortalType } from './pilotProgramPortalPrep';

export const PILOT_PROGRAM_FEATURE_FLAG_KEYS = [
  'can_manage_students',
  'can_invite_families',
  'can_view_group_progress',
  'can_print_modules',
  'can_upload_homework',
  'can_manage_certificates',
  'can_send_notifications',
  'can_access_facilitator_portal',
] as const satisfies ReadonlyArray<keyof PilotProgramFeatureFlags>;

export const DEFAULT_PILOT_FEATURE_FLAGS: PilotProgramFeatureFlags = {
  can_manage_students: false,
  can_invite_families: true,
  can_view_group_progress: false,
  can_print_modules: true,
  can_upload_homework: false,
  can_manage_certificates: false,
  can_send_notifications: false,
  can_access_facilitator_portal: false,
};

/** Prep defaults only — not enforced in portals yet. */
export function resolveDefaultPilotFeatureFlags(input: {
  portalType: PilotPortalType;
  programType: PilotProgramType;
}): PilotProgramFeatureFlags {
  const isFacilitatorPortal = input.portalType === 'facilitator';
  return {
    can_manage_students: isFacilitatorPortal,
    can_invite_families: true,
    can_view_group_progress: isFacilitatorPortal,
    can_print_modules: true,
    can_upload_homework: isFacilitatorPortal,
    can_manage_certificates: isFacilitatorPortal,
    can_send_notifications: isFacilitatorPortal,
    can_access_facilitator_portal: isFacilitatorPortal,
  };
}

export function normalizePilotFeatureFlags(
  raw: Partial<PilotProgramFeatureFlags> | null | undefined,
): PilotProgramFeatureFlags {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_PILOT_FEATURE_FLAGS };
  }
  return {
    can_manage_students: Boolean(raw.can_manage_students),
    can_invite_families: raw.can_invite_families !== false,
    can_view_group_progress: Boolean(raw.can_view_group_progress),
    can_print_modules: raw.can_print_modules !== false,
    can_upload_homework: Boolean(raw.can_upload_homework),
    can_manage_certificates: Boolean(raw.can_manage_certificates),
    can_send_notifications: Boolean(raw.can_send_notifications),
    can_access_facilitator_portal: Boolean(raw.can_access_facilitator_portal),
  };
}
