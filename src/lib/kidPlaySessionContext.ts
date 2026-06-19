import type {
  KidPlayDeviceMode,
  KidPlaySessionRow,
  KidPlaySessionSource,
} from './kidPlaySessionTypes';

export type KidPlaySessionBehavior = {
  /** Hard idle timeout — clear portal session and return to access-code gate. */
  strictTimeout: boolean;
  /** Soft return — preserve cookies / quick-return for same child on this device. */
  softReturn: boolean;
  sessionSource: KidPlaySessionSource;
  deviceMode: KidPlayDeviceMode;
};

const STRICT_DEVICE_MODES = new Set<KidPlayDeviceMode>([
  'shared_camp_device',
  'shared_school_device',
]);

const SOFT_DEVICE_MODES = new Set<KidPlayDeviceMode>(['home_device', 'child_owned_device']);

/**
 * Timeout policy is driven by device_mode (and session_source for logging),
 * never by organization_id alone.
 */
export function resolveKidPlaySessionBehavior(
  sessionSource: KidPlaySessionSource,
  deviceMode: KidPlayDeviceMode,
): KidPlaySessionBehavior {
  const strictTimeout = STRICT_DEVICE_MODES.has(deviceMode);
  const softReturn = SOFT_DEVICE_MODES.has(deviceMode) && !strictTimeout;

  return {
    strictTimeout,
    softReturn,
    sessionSource,
    deviceMode,
  };
}

export function resolveKidPlaySessionBehaviorFromRow(
  row: Pick<KidPlaySessionRow, 'session_source' | 'device_mode'>,
): KidPlaySessionBehavior {
  return resolveKidPlaySessionBehavior(row.session_source, row.device_mode);
}

export function logKidPlaySessionContext(
  session: Pick<
    KidPlaySessionRow,
    'id' | 'child_id' | 'session_source' | 'device_mode' | 'status' | 'organization_id'
  > | null,
  behavior?: KidPlaySessionBehavior,
  extra?: Record<string, string | number | boolean | null>,
): void {
  console.info('[KID_PLAY_SESSION_CONTEXT]', {
    sessionId: session?.id ?? null,
    childId: session?.child_id ?? null,
    sessionSource: session?.session_source ?? null,
    deviceMode: session?.device_mode ?? null,
    status: session?.status ?? null,
    hasOrganizationId: Boolean(session?.organization_id),
    strictTimeout: behavior?.strictTimeout ?? null,
    softReturn: behavior?.softReturn ?? null,
    ...extra,
  });
}

/** Infer default device_mode from launch source when caller does not specify. */
export function inferDeviceModeFromSessionSource(
  sessionSource: KidPlaySessionSource,
): KidPlayDeviceMode {
  switch (sessionSource) {
    case 'family_home':
    case 'future_child_pin':
      return 'child_owned_device';
    case 'camp_roster_launch':
      return 'shared_camp_device';
    case 'facilitator_roster_launch':
      return 'shared_camp_device';
    case 'school_access_code':
      return 'shared_school_device';
    default:
      return 'home_device';
  }
}
