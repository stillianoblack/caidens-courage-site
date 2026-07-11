# Audience / CRM Phase 1 Rollback

1. Set `AUDIENCE_CRM_READ_ENABLED=false`, `AUDIENCE_ORGANIZATIONS_ENABLED=false`, `AUDIENCE_CLASSIFICATION_PREVIEW_ENABLED=false`, and `CRM_BOOTSTRAP_ENABLED=false`.
2. Set `REACT_APP_AUDIENCE_CRM_DISPLAY_ENABLED=false` in the next local/staged build.
3. Confirm CRM endpoints return the safe unavailable response and existing non-CRM Admin screens still operate.
4. Revert the Phase 1 application commit if required.
5. Do not delete CRM tables automatically. They remain default-deny and may contain role/audit history. Database removal requires separate review and a confirmed backup.
6. Never roll back by weakening RLS, exposing service credentials, changing legacy tables, or deleting Auth users.

No provider, Stripe, email, or AI rollback is required because Phase 1 contains no such integration.
