# Admin Authentication

## Active model

Supabase Auth proves identity; an active row in `crm_admin_role_assignments` proves Admin authorization. Browser Auth alone never grants Admin access, browser-supplied roles are ignored, and the service-role key remains server-only.

The active-role priority is `internal_admin`, `audience_admin`, `organization_admin`, then `read_only_admin`. The server returns only minimized identity and scope information. CRM tables remain inaccessible directly from browser roles under default-deny RLS.

## Previous model

The legacy flow compared `REACT_APP_ADMIN_EMAIL` and `REACT_APP_ADMIN_PASSCODE` in the browser and stored `cc-admin-portal-session` plus `cc-admin-portal-session-email` in local/session storage. Those values no longer authorize Admin routes or CRM endpoints.

The helper remains temporarily in source for rollback review. `REACT_APP_ADMIN_LEGACY_EMERGENCY_ENABLED` defaults false and is not wired as an independent authorization path.

## Environment

Browser: `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`, and the expected project reference. Server: `SUPABASE_SERVICE_ROLE_KEY`. Never add the service-role key to a `REACT_APP_` variable.
