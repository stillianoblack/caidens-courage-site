# Full Expansion Readiness

**Status:** **PARTIAL — REQUIRES CONFIGURATION**

| Module | Readiness | Existing foundation | Exact next action |
|---|---|---|---|
| Stripe conversion automation | Blocked | Commerce products and Payment Links exist; CRM lifecycle, customer relationships, and entitlements exist | Design and implement a signed, idempotent Stripe webhook ledger; verified customer matching; refund/cancellation handling; transition tests; and an explicit rule that purchase evidence never implies marketing consent |
| Kit MCP | Blocked | Provider-neutral Kit adapter, read-only endpoints, reconciliation, and protected outbox exist | Connect an approved Kit MCP server, inventory its tools, document read/write boundaries and revocation, and enforce that MCP cannot bypass CRM consent/holds or send automatically |
| AI assistant | Blocked | Blueprint defines provider neutrality, adult-only data, redaction, and approval boundaries | Select an approved server-side provider and data terms; implement a redacted structured-proposal interface, draft-only output, task suggestions, audit logging, and tests proving no autonomous state change |
| Kit read-only | Partially ready | v4 adapter, account/subscriber/tag/sequence/broadcast/statistics reads, pagination, normalized errors, and mocked tests exist | Configure `KIT_API_KEY` server-side and run the authorized live read-only checklist |
| Kit controlled writes | Partially ready | Held outbox, retry records, provider contacts, mappings, worker, and kill switches exist | Complete live read-only verification, approve one mapping/sequence and adult canary addresses, then run the separately approved staging canary |
| Webhooks | Partially ready | Idempotent ledger and restrictive-only handler/fixtures exist | Confirm Kit's live signature contract or documented limitation, configure a staging secret, and test controlled delivery before enabling any live webhook |

All unimplemented modules remain disabled. Production rollout requires successful staging migrations, real RLS/authorization verification, exact-admin bootstrap, authenticated UI verification, Kit read-only verification, and product-owner approval of the write canary.
