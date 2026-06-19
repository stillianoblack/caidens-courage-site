import { readActivePilotProgram, writeActivePilotProgram } from '../config/activePilotProgram';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { readParentClaimContext } from '../config/parentClaimContext';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export type PushReminderStatus =
  | 'unavailable'
  | 'not_configured'
  | 'enabled'
  | 'off';

export type PushReminderStatusResult = {
  status: PushReminderStatus;
  label: string;
  permission: NotificationPermission | 'unsupported';
  subscribed: boolean;
};

export type PushSubscriptionState = {
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
  enabled: boolean;
  loading: boolean;
  error: string | null;
};

export type PushReminderActionResult = {
  ok: boolean;
  message?: string;
  cloudSyncFailed?: boolean;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CLOUD_SYNC_FAILED_MESSAGE =
  'Reminders enabled on this browser, but cloud sync failed. Try again.';

function isUuid(value: string | null | undefined): boolean {
  return Boolean(value?.trim() && UUID_RE.test(value.trim()));
}

/** Family/parent account id for push_subscriptions.user_id (pilot_programs.id). */
export function resolveFamilyPushUserId(): string | null {
  const id = readActivePilotProgram()?.id?.trim();
  return isUuid(id) ? id! : null;
}

/** Optional child scope for push notification triggers (not saved on subscription row). */
export function resolveFamilyPushChildId(): string | null {
  const childId = readActiveChildParticipantId()?.trim();
  return isUuid(childId) ? childId : null;
}

/** Backfill pilot_programs.id into session when legacy localStorage entries omit it. */
export async function ensureFamilyPushUserId(): Promise<string | null> {
  const cached = resolveFamilyPushUserId();
  if (cached) return cached;

  const program = readActivePilotProgram();
  const programCode = program?.programCode?.trim();
  if (!programCode || !isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('pilot_programs')
      .select('id')
      .eq('program_code', programCode)
      .maybeSingle();

    if (error || !data?.id || !isUuid(String(data.id))) {
      return null;
    }

    const userId = String(data.id).trim();
    if (!program) return userId;
    writeActivePilotProgram({ ...program, id: userId });
    return userId;
  } catch {
    return null;
  }
}

export function getWebPushPublicKey(): string | null {
  const key = process.env.REACT_APP_WEB_PUSH_PUBLIC_KEY?.trim();
  return key || null;
}

export function isPushSupportedInBrowser(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

export async function readPushSubscriptionActive(): Promise<boolean> {
  try {
    const registration = await getServiceWorkerRegistration();
    if (!registration) return false;
    const subscription = await registration.pushManager.getSubscription();
    return Boolean(subscription);
  } catch {
    return false;
  }
}

/** Resolve UI status label for Family Portal → Settings → Notifications. */
export async function resolvePushReminderStatus(): Promise<PushReminderStatusResult> {
  const permission: NotificationPermission | 'unsupported' = isPushSupportedInBrowser()
    ? Notification.permission
    : 'unsupported';

  if (!isPushSupportedInBrowser()) {
    const result: PushReminderStatusResult = {
      status: 'unavailable',
      label: 'Reminders unavailable on this browser',
      permission,
      subscribed: false,
    };
    logPushSubscriptionStatus(result);
    return result;
  }

  if (!getWebPushPublicKey()) {
    const result: PushReminderStatusResult = {
      status: 'not_configured',
      label: 'Push service not configured',
      permission,
      subscribed: false,
    };
    logPushSubscriptionStatus(result);
    return result;
  }

  const subscribed = await readPushSubscriptionActive();
  if (subscribed && permission === 'granted') {
    const result: PushReminderStatusResult = {
      status: 'enabled',
      label: 'Reminders enabled',
      permission,
      subscribed: true,
    };
    logPushSubscriptionStatus(result);
    return result;
  }

  const result: PushReminderStatusResult = {
    status: 'off',
    label: 'Reminders off',
    permission,
    subscribed,
  };
  logPushSubscriptionStatus(result);
  return result;
}

function logPushSubscriptionStatus(result: PushReminderStatusResult): void {
  console.info('[PUSH_SUBSCRIPTION_STATUS]', {
    status: result.status,
    label: result.label,
    permission: result.permission,
    subscribed: result.subscribed,
    userId: resolveFamilyPushUserId(),
  });
}

function logPushSaveRequest(detail: Record<string, unknown>): void {
  console.info('[PUSH_SAVE_REQUEST]', detail);
}

function logPushSaveResult(ok: boolean, detail: Record<string, unknown>): void {
  console.info('[PUSH_SAVE_RESULT]', { ok, ...detail });
}

function logPushSaveError(detail: Record<string, unknown>): void {
  console.info('[PUSH_SAVE_ERROR]', detail);
}

/** @deprecated use readPushSubscriptionActive */
export async function readPushEnabledForCurrentParent(): Promise<boolean> {
  return readPushSubscriptionActive();
}

async function savePushSubscriptionToCloud(input: {
  userId: string;
  programCode: string;
  subscription: PushSubscriptionJSON;
  enabled: boolean;
}): Promise<PushReminderActionResult> {
  const payload = {
    userId: input.userId,
    programCode: input.programCode,
    subscription: input.subscription,
    enabled: input.enabled,
    childId: null,
  };

  logPushSaveRequest({
    userId: input.userId,
    programCode: input.programCode,
    enabled: input.enabled,
    endpoint: input.subscription.endpoint,
  });

  let response: Response;
  try {
    response = await fetch('/.netlify/functions/save-push-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    logPushSaveError({
      reason: 'network_error',
      message: error instanceof Error ? error.message : String(error),
    });
    return {
      ok: false,
      cloudSyncFailed: true,
      message: CLOUD_SYNC_FAILED_MESSAGE,
    };
  }

  const responseBody = (await response.json().catch(() => ({}))) as {
    error?: string;
    detail?: string;
  };

  logPushSaveResult(response.ok, {
    userId: input.userId,
    programCode: input.programCode,
    enabled: input.enabled,
    status: response.status,
    body: responseBody,
  });

  if (!response.ok) {
    logPushSaveError({
      reason: 'server_rejected',
      status: response.status,
      error: responseBody.error || null,
      detail: responseBody.detail || null,
    });
    return {
      ok: false,
      cloudSyncFailed: true,
      message: CLOUD_SYNC_FAILED_MESSAGE,
    };
  }

  return { ok: true };
}

export async function enablePushReminders(): Promise<PushReminderActionResult> {
  const publicKey = getWebPushPublicKey();
  const program = readActivePilotProgram();
  const programCode = program?.programCode?.trim() || '';
  const userId = await ensureFamilyPushUserId();
  const hasParentContact = Boolean(readParentClaimContext()?.email?.trim());

  if (!isPushSupportedInBrowser()) {
    return { ok: false, message: 'Reminders unavailable on this browser.' };
  }
  if (!publicKey) {
    return { ok: false, message: 'Push service not configured.' };
  }
  if (!hasParentContact) {
    return { ok: false, message: 'Add your parent email in settings before enabling reminders.' };
  }
  if (!userId || !programCode) {
    return {
      ok: false,
      message: 'Family account is not fully loaded. Refresh the portal and try again.',
    };
  }

  const registration = await getServiceWorkerRegistration();
  if (!registration) {
    return { ok: false, message: 'Service worker is not ready yet. Try again in a moment.' };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { ok: false, message: 'Notification permission was not granted.' };
  }

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const subscriptionJson = subscription.toJSON();
  if (!subscriptionJson.endpoint) {
    logPushSaveError({ reason: 'missing_browser_subscription_endpoint' });
    return { ok: false, message: 'Could not create a browser push subscription.' };
  }

  return savePushSubscriptionToCloud({
    userId,
    programCode,
    subscription: subscriptionJson,
    enabled: true,
  });
}

export async function disablePushReminders(): Promise<PushReminderActionResult> {
  const program = readActivePilotProgram();
  const programCode = program?.programCode?.trim() || '';
  const userId = await ensureFamilyPushUserId();
  if (!userId || !programCode) {
    return { ok: false, message: 'Family account is not loaded.' };
  }

  try {
    const registration = await getServiceWorkerRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (subscription) {
      const subscriptionJson = subscription.toJSON();
      if (subscriptionJson.endpoint) {
        await savePushSubscriptionToCloud({
          userId,
          programCode,
          subscription: subscriptionJson,
          enabled: false,
        });
      }
      await subscription.unsubscribe();
    }
    return { ok: true };
  } catch (error) {
    logPushSaveError({
      reason: 'disable_failed',
      message: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, message: 'Could not disable push reminders.' };
  }
}
