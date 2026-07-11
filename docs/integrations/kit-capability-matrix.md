# Kit API v4 Capability Matrix

**Verified:** 2026-07-11 against current official Kit developer documentation. No account API or MCP call was made.

| Capability | Status | Official v4 behavior / implementation boundary |
|---|---|---|
| Authentication | Supported | API key in server-only `X-Kit-Api-Key`; OAuth required for some app/bulk capabilities. |
| Rate limit | Supported/documented | API key: 120 requests per rolling 60 seconds; OAuth: 600. Handle 429 with backoff. |
| Subscribers list/get | Supported | Cursor pagination; status includes active, inactive, bounced, complained, cancelled. |
| Subscriber create/upsert | Supported with restriction | `POST /v4/subscribers` behaves as email upsert. Existing state is not updated by this endpoint. CRM requires confirmed consent before a create/upsert. |
| Subscriber fields | Supported | Allowlisted adult first name, email, and existing approved custom fields only. Unknown fields return 422. |
| Unsubscribe | Supported | `POST /v4/subscribers/{id}/unsubscribe`; used only for restrictive suppression. No resubscribe operation is implemented. |
| Tags list/add/remove | Supported | v4 tag endpoints; removal returns 204 and is treated idempotently. |
| Sequences list/add | Supported | Existing subscriber may be added; already-added response is successful. |
| Sequence removal | **Unclear/unsupported in adapter** | No verified removal endpoint was established in this review. |
| Forms list | Supported | Read-only adapter capability. |
| Broadcast list | Supported | Cursor pagination; includes draft/scheduled/sent. CRM never creates/sends broadcasts. |
| Broadcast statistics | Supported | Recipients, emails opened/open rate, total clicks/click rate, unsubscribes/unsubscribe rate. |
| Delivered/bounce/complaint aggregate broadcast metrics | **Unavailable/unverified** | Stored as null; UI labels unavailable. |
| Cursor pagination | Supported | `after=<end_cursor>`, up to endpoint-specific max (commonly 1000; broadcasts stats default 500/max 1000). |
| Error format | Supported | 401, 413, 422, 429, and 5xx documented. 429/5xx are retryable; validation/auth errors are permanent. |
| Provider idempotency header | **Unverified** | Local unique outbox key is authoritative. |
| Webhooks | Partially supported | v4 webhook resources exist, but cryptographic request-signature verification was not verified. Implementation requires an unpredictable shared endpoint secret, event dedupe, validation, rate limiting, and reconciliation. |
| Unsubscribe/complaint/bounce events | **Event names require account verification** | Handler supports only normalized restrictive event types and never processes a positive/reactivation event. Keep webhook flag off until event payloads are verified in sandbox. |
| MCP tools | **Not configured/unverified** | No Kit MCP connector/tool was available in this environment. MCP is not production transport. |

Official references: [authentication](https://developers.kit.com/api-reference/authentication), [response codes](https://developers.kit.com/api-reference/response-codes), [subscriber upsert](https://developers.kit.com/api-reference/subscribers/create-a-subscriber), [unsubscribe](https://developers.kit.com/api-reference/subscribers/unsubscribe-subscriber), [subscriber tags](https://developers.kit.com/api-reference/subscribers/list-tags-for-a-subscriber), [tag removal](https://developers.kit.com/api-reference/tags/remove-tag-from-subscriber), [sequence add](https://developers.kit.com/api-reference/sequences/add-subscriber-to-sequence), [broadcasts](https://developers.kit.com/api-reference/broadcasts/list-broadcasts), and [broadcast statistics](https://developers.kit.com/api-reference/broadcasts/get-stats-for-a-list-of-broadcasts).
