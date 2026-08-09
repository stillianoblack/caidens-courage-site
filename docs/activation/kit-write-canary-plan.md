# Kit Write Canary Plan

**Status:** **PREPARED — DO NOT EXECUTE**

Execution prerequisites remain unmet: privately configured adult addresses, successful staging migration/RLS/bootstrap/UI verification, live Kit read-only verification, an approved existing Kit tag and sequence, and explicit product-owner canary approval.

Use one or at most two adult-controlled test addresses in an explicitly approved Kit test context. Documentation must show them only as `a***@example.test` and optionally `b***@example.test`.

For each canary:

1. Create an isolated adult CRM contact; record explicit purpose-specific consent, timestamp, source, and notice version.
2. Confirm `do_not_enroll=false` only for this canary and release its individual provider hold.
3. Choose one internal segment and an existing dedicated Kit test tag.
4. Verify provider mapping and expect one held `upsert_contact` followed by one `add_segment` intent.
5. Temporarily enable all required write flags only in the isolated/test runtime.
6. Expect active Kit test subscriber state, stored external ID, completed sanitized attempts, and no email/sequence/broadcast.
7. Roll back by removing the test tag through the outbox, unsubscribing the test subscriber if approved, holding the contact, and disabling flags.
8. Unsubscribe test: deliver a controlled restrictive fixture or approved test webhook and confirm local `unsubscribed`/hold; never reactivate.

Success: exactly one adult, one approved tag, idempotent replay, no child fields, no email, and matching local/remote state. Stop on any wrong account, unexpected recipient, missing consent, unverified mapping, key leakage, 401/403/422, rate limit, or unexpected provider mutation.

All write flags remain false; this plan was not executed.
