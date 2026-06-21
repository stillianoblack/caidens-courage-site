import {
  KIT_TAG_FACILITATOR,
  KIT_TAG_MONTH_1_GRADUATE,
  KIT_TAG_PARENT,
  kitTagForCompletedWeek,
  type KitEventName,
} from './kitTags';
import { resolveParentEmailsForStudent } from './kitParentEmails';

export type TrackKitEventInput = {
  eventName: KitEventName | string;
  participantId?: string;
  parentEmail?: string;
  facilitatorEmail?: string;
  tags?: string[];
  metadata?: Record<string, string | number | boolean | null | undefined>;
};

function normalizeEmail(value?: string): string {
  return value?.trim().toLowerCase() ?? '';
}

async function postKitEvent(body: Record<string, unknown>): Promise<void> {
  try {
    await fetch('/.netlify/functions/sync-kit-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.warn('[KIT_INTEGRATION]', body.eventName, error);
  }
}

/**
 * Fire-and-forget Kit sync. Never throws to callers; logs warnings on failure.
 * All Kit API work happens server-side via Netlify functions.
 */
export function trackKitEvent(input: TrackKitEventInput): void {
  const parentEmail = normalizeEmail(input.parentEmail);
  const facilitatorEmail = normalizeEmail(input.facilitatorEmail);
  const tags = (input.tags ?? []).map((tag) => tag.trim()).filter(Boolean);

  void postKitEvent({
    eventName: input.eventName,
    participantId: input.participantId?.trim() || undefined,
    parentEmail: parentEmail || undefined,
    facilitatorEmail: facilitatorEmail || undefined,
    tags,
    metadata: {
      ...input.metadata,
      participant_id: input.participantId?.trim() || null,
    },
  });
}

export function trackKitParentSignup(input: {
  parentEmail: string;
  eventName?: KitEventName;
  metadata?: TrackKitEventInput['metadata'];
}): void {
  const email = normalizeEmail(input.parentEmail);
  if (!email) return;
  trackKitEvent({
    eventName: input.eventName ?? 'parent_signup',
    parentEmail: email,
    tags: [KIT_TAG_PARENT],
    metadata: input.metadata,
  });
}

export function trackKitFacilitatorSignup(input: {
  facilitatorEmail: string;
  eventName?: KitEventName;
  metadata?: TrackKitEventInput['metadata'];
}): void {
  const email = normalizeEmail(input.facilitatorEmail);
  if (!email) return;
  trackKitEvent({
    eventName: input.eventName ?? 'facilitator_signup',
    facilitatorEmail: email,
    tags: [KIT_TAG_FACILITATOR],
    metadata: input.metadata,
  });
}

export async function trackKitWeeklyCompletionForStudent(input: {
  participantId: string;
  weekNumber: number;
  metadata?: TrackKitEventInput['metadata'];
}): Promise<void> {
  const tag = kitTagForCompletedWeek(input.weekNumber);
  if (!tag) return;

  const parentEmails = await resolveParentEmailsForStudent(input.participantId);
  if (!parentEmails.length) {
    void postKitEvent({
      eventName: `completed_week_${input.weekNumber}`,
      participantId: input.participantId,
      tags: [tag],
      metadata: {
        ...input.metadata,
        participant_id: input.participantId,
        skip_reason: 'no_parent_email',
      },
    });
    return;
  }

  for (const parentEmail of parentEmails) {
    trackKitEvent({
      eventName: `completed_week_${input.weekNumber}` as KitEventName,
      participantId: input.participantId,
      parentEmail,
      tags: [tag],
      metadata: {
        ...input.metadata,
        participant_id: input.participantId,
        week_number: input.weekNumber,
      },
    });
  }
}

export async function trackKitMonth1GraduateForStudent(input: {
  participantId: string;
  metadata?: TrackKitEventInput['metadata'];
}): Promise<void> {
  const parentEmails = await resolveParentEmailsForStudent(input.participantId);
  if (!parentEmails.length) {
    void postKitEvent({
      eventName: 'month_1_graduate',
      participantId: input.participantId,
      tags: [KIT_TAG_MONTH_1_GRADUATE],
      metadata: {
        ...input.metadata,
        participant_id: input.participantId,
        skip_reason: 'no_parent_email',
      },
    });
    return;
  }

  for (const parentEmail of parentEmails) {
    trackKitEvent({
      eventName: 'month_1_graduate',
      participantId: input.participantId,
      parentEmail,
      tags: [KIT_TAG_MONTH_1_GRADUATE],
      metadata: {
        ...input.metadata,
        participant_id: input.participantId,
      },
    });
  }
}

export {
  KIT_TAG_PARENT,
  KIT_TAG_FACILITATOR,
  KIT_TAG_MONTH_1_GRADUATE,
  kitTagForCompletedWeek,
};
