# Audience / CRM Phase 3 Runtime

```mermaid
flowchart LR
  Facts["Consent + lifecycle + eligibility"] --> Outbox["Held/idempotent outbox"]
  Worker["Secret-authenticated worker"] --> Outbox
  Worker --> Recheck["Adult, flags, hold, consent, eligibility, mapping"]
  Recheck --> Adapter["Kit v4 adapter"]
  Adapter --> Kit["Kit API v4"]
  Kit --> Webhook["Shared-secret webhook + dedupe"]
  Webhook --> Restrict["Only strengthen local restriction"]
  Kit --> Metrics["Read-only broadcast metrics sync"]
  Metrics --> Cache["Provider metric cache"]
```

Provider intents default held. The worker claims one row atomically with `FOR UPDATE SKIP LOCKED`, rechecks current local authority, and cancels stale/unsafe work. Only 429/5xx-class errors retry with exponential backoff and jitter. Provider/API secrets remain server-only.

The UI adds Email Journeys, Kit Subscribers, Email Performance, Subscriber Reconciliation, Sync Activity, and Provider Settings. It provides no broadcast sender or sequence editor.
