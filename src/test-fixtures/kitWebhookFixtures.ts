export const kitWebhookFixtures = {
  unsubscribe: { event: { id: 'fixture-unsubscribe-1', type: 'unsubscribe', occurred_at: '2026-07-11T12:00:00Z' }, subscriber: { id: '9001' } },
  complaint: { event: { id: 'fixture-complaint-1', type: 'complaint', occurred_at: '2026-07-11T12:01:00Z' }, subscriber: { id: '9002' } },
  bounce: { event: { id: 'fixture-bounce-1', type: 'bounce', occurred_at: '2026-07-11T12:02:00Z' }, subscriber: { id: '9003' } },
  unknown: { event: { id: 'fixture-unknown-1', type: 'subscriber.updated', occurred_at: '2026-07-11T12:03:00Z' }, subscriber: { id: '9004' } },
  malformed: { event: { type: 'unsubscribe' } },
} as const;
