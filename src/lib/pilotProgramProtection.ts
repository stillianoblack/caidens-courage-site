import type { PilotProgramProtectionLevel, PilotProgramRecord } from '../types/pilotProgram';

export const PILOT_PROGRAM_PROTECTION_LEVELS: PilotProgramProtectionLevel[] = [
  'testing',
  'internal',
  'pilot',
  'production',
];

export const PROTECTION_ACTION_BLOCKED_MESSAGE =
  'This program is protected. Change protection level before making destructive changes.';

export type PilotProgramProtectionCapabilities = {
  canEditLabels: boolean;
  canArchive: boolean;
  archiveRequiresConfirmation: boolean;
  canDelete: boolean;
  deleteRequiresConfirmation: boolean;
  canRegenerateCodes: boolean;
  regenerateRequiresConfirmation: boolean;
  canChangePortalType: boolean;
  readOnly: boolean;
};

export type PilotProgramProtectionAction =
  | 'edit_labels'
  | 'archive'
  | 'delete'
  | 'regenerate_codes'
  | 'change_portal_type'
  | 'admin_action';

export type PilotProgramProtectionDecision = {
  allowed: boolean;
  requiresConfirmation: boolean;
  message?: string;
  level: PilotProgramProtectionLevel;
};

const CAPABILITIES: Record<PilotProgramProtectionLevel, PilotProgramProtectionCapabilities> = {
  testing: {
    canEditLabels: true,
    canArchive: true,
    archiveRequiresConfirmation: false,
    canDelete: true,
    deleteRequiresConfirmation: false,
    canRegenerateCodes: true,
    regenerateRequiresConfirmation: false,
    canChangePortalType: true,
    readOnly: false,
  },
  internal: {
    canEditLabels: true,
    canArchive: true,
    archiveRequiresConfirmation: false,
    canDelete: false,
    deleteRequiresConfirmation: false,
    canRegenerateCodes: true,
    regenerateRequiresConfirmation: true,
    canChangePortalType: true,
    readOnly: false,
  },
  pilot: {
    canEditLabels: true,
    canArchive: true,
    archiveRequiresConfirmation: true,
    canDelete: false,
    deleteRequiresConfirmation: false,
    canRegenerateCodes: false,
    regenerateRequiresConfirmation: false,
    canChangePortalType: true,
    readOnly: false,
  },
  production: {
    canEditLabels: true,
    canArchive: false,
    archiveRequiresConfirmation: false,
    canDelete: false,
    deleteRequiresConfirmation: false,
    canRegenerateCodes: false,
    regenerateRequiresConfirmation: false,
    canChangePortalType: false,
    readOnly: false,
  },
};

export function normalizePilotProgramProtectionLevel(
  value?: string | null,
): PilotProgramProtectionLevel {
  const normalized = value?.trim().toLowerCase();
  if (PILOT_PROGRAM_PROTECTION_LEVELS.includes(normalized as PilotProgramProtectionLevel)) {
    return normalized as PilotProgramProtectionLevel;
  }
  return 'testing';
}

export function resolvePilotProgramProtectionLevel(
  program: Pick<PilotProgramRecord, 'protection_level' | 'pilot_status'>,
): PilotProgramProtectionLevel {
  return normalizePilotProgramProtectionLevel(program.protection_level);
}

function getPilotProgramProtectionCapabilities(
  level: PilotProgramProtectionLevel,
): PilotProgramProtectionCapabilities {
  return CAPABILITIES[level];
}

export function getPilotProgramProtectionDecision(
  program: Pick<PilotProgramRecord, 'protection_level' | 'pilot_status'>,
  action: PilotProgramProtectionAction,
): PilotProgramProtectionDecision {
  const level = resolvePilotProgramProtectionLevel(program);
  const capabilities = getPilotProgramProtectionCapabilities(level);

  switch (action) {
    case 'edit_labels':
      return {
        allowed: capabilities.canEditLabels,
        requiresConfirmation: false,
        level,
        message: capabilities.canEditLabels ? undefined : PROTECTION_ACTION_BLOCKED_MESSAGE,
      };
    case 'archive':
      return {
        allowed: capabilities.canArchive,
        requiresConfirmation: capabilities.archiveRequiresConfirmation,
        level,
        message: capabilities.canArchive ? undefined : PROTECTION_ACTION_BLOCKED_MESSAGE,
      };
    case 'delete':
      return {
        allowed: capabilities.canDelete,
        requiresConfirmation: capabilities.deleteRequiresConfirmation,
        level,
        message: capabilities.canDelete ? undefined : PROTECTION_ACTION_BLOCKED_MESSAGE,
      };
    case 'regenerate_codes':
      return {
        allowed: capabilities.canRegenerateCodes,
        requiresConfirmation: capabilities.regenerateRequiresConfirmation,
        level,
        message: capabilities.canRegenerateCodes ? undefined : PROTECTION_ACTION_BLOCKED_MESSAGE,
      };
    case 'change_portal_type':
      return {
        allowed: capabilities.canChangePortalType,
        requiresConfirmation: false,
        level,
        message: capabilities.canChangePortalType ? undefined : PROTECTION_ACTION_BLOCKED_MESSAGE,
      };
    case 'admin_action':
      return {
        allowed: !capabilities.readOnly,
        requiresConfirmation: false,
        level,
        message: capabilities.readOnly ? PROTECTION_ACTION_BLOCKED_MESSAGE : undefined,
      };
    default:
      return {
        allowed: false,
        requiresConfirmation: false,
        level,
        message: PROTECTION_ACTION_BLOCKED_MESSAGE,
      };
  }
}
