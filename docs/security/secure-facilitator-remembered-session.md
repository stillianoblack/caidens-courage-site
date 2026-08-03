# Secure Facilitator Remembered-Device Session

Status: migration required; no production or staging database change has been applied.

## Decision

The compatibility facilitator flow has no existing revocable server session store. The
admin cookie cannot be reused because it is a stateless signed token and cannot revoke a
single session. Supabase Auth cannot be reused without converting compatibility
facilitators into Auth users, which would materially change the login model.

Use `facilitator_compatibility_sessions` as a minimal server-only session store.

## Token and cookie

- Generate 32 random bytes with `crypto.randomBytes(32)` and encode with base64url.
- Store only `sha256(rawToken)` in the database.
- Cookie name: `__Host-cc_facilitator_session`.
- Cookie properties: `HttpOnly; Secure; SameSite=Lax; Path=/`.
- Do not set `Domain`; this is required by the `__Host-` prefix and prevents sibling
  subdomains from receiving the cookie.
- Use `SameSite=Lax` because normal same-site navigation, refresh, and direct links must
  carry the session. State-changing endpoints additionally validate `Origin`.
- Remembered session lifetime: 30 days, fixed from issuance (no rolling extension).
- Non-remembered session lifetime: 8 hours. The cookie is still explicit because an
  HttpOnly cookie cannot reliably model “tab only”; the short server expiration is the
  security boundary.

The opaque cookie value contains no program code, identity, access code, or other claims.

## Server endpoints

Implement these Netlify Functions only after the migration is approved and applied to
both environment-appropriate projects:

1. `facilitator-session` `POST`: validate access code and facilitator email server-side,
   create the hashed session row, set the cookie, and return safe program metadata.
2. `facilitator-session` `GET`: hash the cookie, load a non-revoked and unexpired row,
   validate runtime environment/role/program, and return safe bootstrap metadata.
3. `facilitator-session` `DELETE`: validate `Origin`, revoke the matching row, and expire
   the cookie. The operation is idempotent.
4. A program switch uses a new server-mediated authorization and rotates the session;
   it never reads a saved access code from the browser.

Every response uses `Cache-Control: no-store, private`. No endpoint returns the original
access code or raw session token in JSON.

## CSRF and environment isolation

- Login accepts credentials intentionally and validates the supported site origin.
- Logout and every cookie-authenticated state-changing request reject an absent or
  mismatched `Origin`.
- Do not enable wildcard credentialed CORS.
- Bind each row to the normalized Netlify context. Production accepts only `production`;
  preview accepts only its supported non-production context.
- Continue using the existing Supabase project/context guard in both frontend and
  Functions.

## Browser-storage migration

After the server endpoints exist, an idempotent startup cleanup removes only these
obsolete facilitator authentication values:

- `activeAccessCode`
- facilitator data from `cc-remembered-program-access`
- facilitator data from `cc-remembered-device-session`
- `lastPilotProgram:facilitator`

`activePilotProgram` must be replaced with safe bootstrap metadata that omits facilitator
and family access codes. `activePortalRole` and the tab-scoped `cc-portal-unlock` marker
may remain non-authoritative UI state. Family and student storage is outside this
migration and must not be removed.

## Expiration, revocation, and cleanup

- A session is invalid when missing, expired, revoked, wrong-role, wrong-program, or
  issued for another environment.
- Invalid sessions render the existing branded recovery state and do not retry in a loop.
- Logout sets `revoked_at`, records a bounded reason, and expires the cookie.
- Run `purge_expired_facilitator_compatibility_sessions()` from a server-only scheduled
  job. The default retention keeps expired/revoked audit rows for seven days.

## Release acceptance update

- Same-tab Headquarters to Explorers succeeds.
- Hard refresh and production-only Back/Forward succeed.
- A remembered cookie can restore after restart and in a clean tab.
- A missing, expired, revoked, tampered, cross-environment, wrong-role, or wrong-program
  session renders the branded recovery state.
- Browser storage contains no raw compatibility credential.
- No blank shell or redirect loop is permitted.
