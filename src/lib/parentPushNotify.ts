import {
  markParentPushNotifySent,
  shouldSkipParentPushNotify,
} from './parentPushNotifyDedupe';
import {
  resolveFamilyPushChildId,
  resolveFamilyPushUserId,
} from './pushSubscriptionService';

export type ParentPushTrigger =
  | 'child_completed_weekly_mission'
  | 'reward_ready_to_claim'
  | 'child_session_paused'
  | 'child_session_ended';

export type ParentPushInput = {
  trigger: ParentPushTrigger;
  userId?: string;
  childId?: string;
  childName?: string;
  detail?: string;
  url?: string;
  /** Unique key per event — skips duplicate sends on replay/reload. */
  dedupeKey?: string;
};

function logPushNotifySkipped(reason: string, input: ParentPushInput): void {
  if (process.env.NODE_ENV === 'development') {
    console.info('[PUSH_NOTIFY_SKIPPED]', {
      reason,
      trigger: input.trigger,
      dedupeKey: input.dedupeKey ?? null,
      childId: input.childId ?? resolveFamilyPushChildId(),
    });
  }
}

/** Fire-and-forget parent notification — never blocks gameplay or portal UX. */
export function triggerParentPush(input: ParentPushInput): void {
  if (typeof window === 'undefined') return;

  const userId = input.userId?.trim() || resolveFamilyPushUserId() || '';
  if (!userId) {
    logPushNotifySkipped('missing_user_id', input);
    return;
  }

  const dedupeKey = input.dedupeKey?.trim() || '';
  if (dedupeKey && shouldSkipParentPushNotify(dedupeKey)) {
    logPushNotifySkipped('dedupe', input);
    return;
  }

  const childId = input.childId?.trim() || resolveFamilyPushChildId() || undefined;

  if (process.env.NODE_ENV === 'development') {
    console.info('[PUSH_NOTIFY_EVENT]', {
      trigger: input.trigger,
      userId,
      childId: childId ?? null,
      dedupeKey: dedupeKey || null,
      childName: input.childName ?? null,
      detail: input.detail ?? null,
    });
  }

  if (dedupeKey) {
    markParentPushNotifySent(dedupeKey);
  }

  void fetch('/.netlify/functions/notify-parent-push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      trigger: input.trigger,
      userId,
      childId,
      childName: input.childName?.trim() || undefined,
      detail: input.detail?.trim() || undefined,
      url: input.url,
      dedupeKey: dedupeKey || undefined,
    }),
  }).catch(() => {
    /* optional — push must not crash app */
  });
}
