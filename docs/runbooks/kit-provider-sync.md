# Kit Provider Sync Runbook

1. Verify an isolated Kit test account and server-only v4 key.
2. Apply Phase 1–3 migrations only to isolated Supabase.
3. Configure a disabled/sandbox `provider_accounts` row and unverified mappings.
4. Import no contacts. Use allowlisted adult fixtures with explicit consent and `do_not_enroll=false`.
5. Verify tags manually, record external IDs, then mark mappings verified.
6. Release only the test contact hold. Enable flags in order: provider, global sync, Kit writes.
7. Queue one idempotent intent; invoke the secret-authenticated worker; inspect sanitized attempt/provider state.
8. Disable writes after the test. Never run against production subscribers without approval.

Kill switches: global sync flag, Kit provider flag, Kit writes flag, provider-account status/writes setting, and individual contact hold.
