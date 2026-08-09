# Kit Automation Setup

## Safety state

Kit delivery is disabled by default. The legacy unauthenticated browser event endpoint now returns `410` unless `LEGACY_KIT_EVENT_ENDPOINT_ENABLED=true`; it should remain disabled. New work uses verified server events, CRM consent, contact holds, provider mappings, and the durable outbox. No child assessment answers, grades, access codes, notes, or secrets may be sent to Kit.

## Required server environment

- `KIT_API_KEY` — server only; never use a `REACT_APP_` prefix.
- `AUDIENCE_CRM_READ_ENABLED=true` for protected diagnostics.
- `LEARNING_CONTENT_ADMIN_ENABLED=true` for Admin question management.
- `KIT_PROVIDER_ENABLED`, `AUDIENCE_PROVIDER_SYNC_ENABLED`, and `KIT_WRITE_OPERATIONS_ENABLED` — all must stay `false` until a separately approved adult canary.
- `WEEKLY_SUMMARY_PREPARATION_ENABLED` — prepares deduplicated records only.
- `WEEKLY_SUMMARY_KIT_DELIVERY_ENABLED` — remains `false`; the current job does not enqueue provider writes.
- `PUBLIC_SITE_URL` — canonical dashboard URL used in prepared summaries.

## Current server endpoints

- `crm-kit-diagnostics`: protected configuration, recent event, and delivery-log view; its test action is no-write.
- `crm-provider-worker`: existing consent-aware outbox worker.
- `weekly-learning-summary-scheduled`: Monday 14:00 UTC preparation job.
- `learning-achievement-event`: proof-backed achievement event intake.
- `sync-kit-event`: deprecated browser endpoint; disabled by default.

## Lifecycle event map

| Event | Existing Kit tag | State |
|---|---|---|
| `facilitator_registered` | `Facilitator` | Existing name reused |
| `family_registered` | `Parent` | Existing name reused |
| `first_module_completed` | `Completed Week 1` | Existing name reused |
| `weekly_module_completed` | `Completed Week 1`–`Completed Week 4` | Resolve by verified week; Weeks 5–12 need review |
| `certificate_earned` | `Month 1 Graduate` | Existing name reused |
| `account_created`, `pilot_enrolled`, `purchase_completed`, `baseline_completed`, `badge_earned`, `inactive_user_followup`, `weekly_summary_ready` | None approved | Manual Kit decision required |

The authoritative code map is `netlify/functions/_lib/kitLifecycleConfig.js`. Null mappings must not be silently invented.

## Custom fields

`first_name` is the only confirmed existing name. Before enabling summary delivery, create/verify exact Kit field keys for `student_first_name`, `program_name`, `weekly_skill`, `modules_completed`, `badge_earned`, `weekly_discussion_prompt`, and `dashboard_url`. Confirm that sending a student first name is approved; otherwise replace it with an adult-safe generic label.

## Recommended automations

1. Adult welcome: explicit confirmed consent → adult role tag → welcome sequence.
2. Pilot enrollment: verified adult enrollment → approved pilot tag.
3. Weekly summary: confirmed `weekly_progress` preference → summary-ready tag → one email per reporting period.
4. Inactive follow-up: confirmed preference plus approved inactivity definition → follow-up tag.
5. Purchase: verified Stripe webhook → product-specific tag; never infer from browser success pages.

## Testing

Use an owner-controlled Gmail alias and a staging-only CRM contact with confirmed consent and contact hold enabled. Run Admin → Marketing → Kit Diagnostics first. The current “Run Test Sync” is deliberately a no-network dry run. A real canary requires separate approval, a verified external mapping, releasing only the canary hold, then enabling flags in order.

## Logs and retry

- Admin → Marketing → Kit Diagnostics shows masked recent activity and weekly delivery records.
- Provider attempts are in `email_sync_attempts`; intents are in `email_sync_outbox`.
- Weekly summaries are in `learning_communication_deliveries` and deduplicate by period, recipient, and student.
- Retry only `retryable_failure` records after the cause is corrected. Contact hold, unclear consent, `do_not_enroll`, and missing mappings are not transient errors.

## Disable and rollback

Set provider, write, weekly-delivery, webhook, and legacy endpoint flags to `false`. Stop the worker/scheduled preparation if needed. Existing held intents and audit history remain for investigation; do not delete consent history. Reverting the frontend does not authorize direct Kit calls.

## Manual Kit checklist

- Verify exact tag and sequence IDs for every non-null mapping.
- Create/verify summary custom fields and data-retention expectations.
- Approve the weekly-summary template and unsubscribe behavior.
- Confirm an isolated staging/test audience and canary recipient.
- Document webhook verification supported by the live Kit account.
