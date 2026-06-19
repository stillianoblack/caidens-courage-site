import { readActivePilotProgram } from '../config/activePilotProgram';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { readParentClaimContext } from '../config/parentClaimContext';

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

/** Family/parent account id for push_subscriptions.user_id (pilot_programs.id). */
export function resolveFamilyPushUserId(): string | null {
  return readActivePilotProgram()?.id?.trim() || null;
}

/** Optional child scope for push_subscriptions.child_id. */
export function resolveFamilyPushChildId(): string | null {
  return readActiveChildParticipantId()?.trim() || null;
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
  if (process.env.NODE_ENV === 'development') {
    console.info('[PUSH_SUBSCRIPTION_STATUS]', {
      status: result.status,
      label: result.label,
      permission: result.permission,
      subscribed: result.subscribed,
      userId: resolveFamilyPushUserId(),
    });
  }
}

function logPushSaveResult(ok: boolean, detail: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.info('[PUSH_SAVE_RESULT]', { ok, ...detail });
  }
}

/** @deprecated use readPushSubscriptionActive */
export async function readPushEnabledForCurrentParent(): Promise<boolean> {
  return readPushSubscriptionActive();
}

export async function enablePushReminders(): Promise<{ ok: boolean; message?: string }> {
  const publicKey = getWebPushPublicKey();
  const userId = resolveFamilyPushUserId();
  const childId = resolveFamilyPushChildId();
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
  if (!userId) {
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

  const response = await fetch('/.netlify/functions/save-push-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      childId,
      subscription: subscription.toJSON(),
      enabled: true,
    }),
  });

  const responseBody = await response.json().catch(() => ({}));
  logPushSaveResult(response.ok, {
    userId,
    childId,
    enabled: true,
    status: response.status,
    body: responseBody,
  });

  if (!response.ok) {
    return { ok: false, message: 'Could not save your notification subscription.' };
  }

  return { ok: true };
}

export async function disablePushReminders(): Promise<{ ok: boolean; message?: string }> {
  const userId = resolveFamilyPushUserId();
  if (!userId) {
    return { ok: false, message: 'Family account is not loaded.' };
  }

  try {
    const registration = await getServiceWorkerRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (subscription) {
      const response = await fetch('/.netlify/functions/save-push-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          childId: resolveFamilyPushChildId(),
          subscription: subscription.toJSON(),
          enabled: false,
        }),
      });
      const responseBody = await response.json().catch(() => ({}));
      logPushSaveResult(response.ok, {
        userId,
        enabled: false,
        status: response.status,
        body: responseBody,
      });
      await subscription.unsubscribe();
    }
    return { ok: true };
  } catch {
    return { ok: false, message: 'Could not disable push reminders.' };
  }
}
