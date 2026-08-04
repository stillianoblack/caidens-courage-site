# Secure student session architecture review

Status: review-only design. No runtime behavior or database migration has been executed.

## Current authentication and restoration flow

1. `usePortalUnlock` resolves the submitted program/access code, then calls
   `verifyStudentPinLogin` with the program code and PIN.
2. `studentPinService.ts` posts those values to `verify-student-pin` but falls back
   to browser-side verification when the Function is unavailable or returns an
   unexpected response.
3. `verify-student-pin.js` uses the service role to resolve the active program,
   find a student by PIN fingerprint, verify the PIN hash, and return
   `participantId`, display name, and program code in JSON. It sets no cookie.
4. `studentPinLoginLaunch.ts` writes the returned identity to
   `cc-student-pin-session`, writes the scoped active-child record, then looks up
   or creates a Kid Play session using the browser-supplied participant ID.
5. `usePortalUnlock` may additionally write a 30-day
   `cc-remembered-device-session` containing student ID, access code, program
   identity, and display name.
6. `KidPlaySessionLayout` restores from the Kid Play session ID in the route or
   `cc-kid-play-session-id`. Its participant context comes from the loaded session
   row's `child_id`. Family and facilitator launched sessions can use their adult
   compatibility authorization, while the direct student path can fall through to
   browser Supabase reads/writes.
7. Weekly Adventures, Explore, Missions, Quests, games, progress, wallet, rewards,
   B-4 preference, baseline, and child-profile hooks consume the active participant
   ID or the Kid Play session participant ID. Several services query Supabase from
   the browser with that ID.
8. `clearStalePortalIdentityState` clears the PIN session, active child, facilitator
   continuity, and local Kid Play session ID. Ending a Kid Play session clears its
   route hint, but there is no server student-session token to revoke.

### Facilitator-launched students

The facilitator launch path is authorized by the facilitator HttpOnly cookie and
creates/loads a `kid_play_sessions` row. The new student session may retain an
optional audit link to the originating facilitator session. That link must never
allow a student request to inherit facilitator authority.

## Confirmed weaknesses

- Participant and program identity are persisted in browser storage and treated as
  authoritative by direct-student flows.
- PIN verification returns raw authoritative identifiers instead of issuing a
  server-verifiable session.
- The local verification fallback can bypass the intended server-only login
  boundary and must be removed from the secure login path.
- Student remembered-device state lasts 30 days and contains access code and
  participant identity, despite the intended fixed eight-hour student session.
- Refresh/session restoration validates storage shape and program text, not an
  opaque server token with expiration and revocation.
- Logout and PIN reset cannot currently revoke a student browser session.
- Browser-supplied participant IDs reach student-specific progress and reward
  services. Those services must migrate to authenticated server endpoints.

## Proposed session and cookie contract

`student_compatibility_sessions` stores only the SHA-256 hash of an opaque
256-bit random token. It binds one student participant to one program ID, program
code, runtime environment, and fixed `student` role. Sessions expire eight hours
after issuance; expiration is fixed rather than rolling. `last_seen_at` is audit
metadata only and must not extend `expires_at`.

The cookie is `__Host-cc_student_session` with `HttpOnly`, `Secure`,
`SameSite=Lax`, `Path=/`, no `Domain`, and an eight-hour `Max-Age` plus matching
`Expires`. Browser JavaScript never reads the cookie or token.

## Required runtime endpoints and helper

Runtime implementation is deliberately deferred. A later change needs:

- `verify-student-pin`: verify PIN, role, active program membership and runtime;
  rotate/revoke an earlier student session where appropriate; issue the cookie;
  return display/bootstrap data only.
- `student-session` GET: validate the cookie and return safe bootstrap data needed
  for hard refresh, including display name, grade, B-4 preference, program display
  name, expiration indicator, and route/bootstrap status.
- `student-session` DELETE: revoke the hashed session and clear the cookie.
- Shared `studentSession` server helper: parse cookie, hash token, require an
  unexpired/non-revoked same-environment `student` row, reload the participant and
  program by the stored IDs, and require exact role/program-code/program-ID
  consistency plus current access eligibility.
- Facilitator student-launch endpoint: validate the facilitator cookie and program,
  create a separately scoped student token, and record the optional originating
  facilitator session ID.
- Server-mediated student data endpoints for Kid Shell bootstrap, progress,
  rewards/wallet, B-4 preference, and quests. Browser participant IDs are ignored
  or accepted only as non-authoritative assertions that must exactly match the
  authenticated context.

Stable validation failures should distinguish missing, expired, revoked,
environment-mismatched, and forbidden sessions without exposing raw database
messages.

## Revocation contract

- Logout: set `revoked_at`, `revoke_reason = 'student_logout'`, then clear cookie.
- PIN reset/rotation: revoke every active session for that participant with
  `pin_rotated`.
- PIN disabled or participant access disabled: revoke with `student_access_disabled`.
- Program membership change: revoke with `program_membership_changed`.
- Facilitator ends a facilitator-originated session: revoke only the linked active
  student session with `facilitator_ended_session`.
- Program archived/deactivated: validation fails closed; an operational cleanup may
  revoke sessions with `program_inactive`.
- Replayed cookies fail because lookup requires `revoked_at is null` and a future
  `expires_at`.

## Browser storage cleanup plan

| Storage | Key/data | Classification | Future treatment |
| --- | --- | --- | --- |
| localStorage | `cc-student-pin-session` | Authoritative identity | Remove after cookie/bootstrap cutover. Do not migrate its participant ID. |
| localStorage | `cc-scoped-active-child` | Authoritative for direct-student flow; valid selector cache for adult portals | Replace student hydration with server bootstrap. Preserve only as non-authoritative adult child-selection UI state. |
| localStorage | `cc-remembered-device-session` student records | Contains student ID and access code; incompatible with fixed session | Delete student records at cutover. Preserve parent/facilitator records pending their separate contracts. |
| localStorage | `cc-remembered-program-access` / active program metadata | Program/access bootstrap | Student access code must be removed or ignored for authority; retain display metadata only if scrubbed. |
| localStorage | `cc-kid-play-session-id` | Route/session hint | Preserve as non-authoritative cache; server bootstrap must confirm it belongs to the authenticated student. |
| sessionStorage | Kid Shell return route, soft-lock, roster-lock, resume payload | Navigation/UI state | Preserve; never use for identity or authorization. |
| sessionStorage/localStorage | participant-keyed visual acknowledgements, local game preferences, viewed flags | Presentation cache | Preserve only after keying from server bootstrap; never authorize data access. |
| IndexedDB | No student identity store found | None | No migration required; retain audit coverage. |

During transition, old keys may be read only to clear or show a sign-in recovery
message. They must never be exchanged for a session without fresh PIN or authorized
facilitator verification.

## Compatibility impact

- Direct PIN login gains the secure cookie and then bootstraps Kid Shell from the
  server; the browser no longer launches by participant ID alone.
- Hard refresh calls the session bootstrap endpoint. Expired sessions return to the
  existing student sign-in recovery experience.
- Weekly Adventures, Explore, Missions, Quests, games, progress, and rewards retain
  their routes and UI, but protected data must be fetched through student-session
  aware Functions.
- Same-tab navigation relies on the cookie automatically and may keep route hints.
- Family and facilitator flows retain their adult cookies. When launching a child,
  the server issues a distinct student cookie with reduced authority.
- Logout and idle/session end must revoke the student token when ending identity,
  while a soft UI pause may leave it active until its fixed expiration.

## Security and compatibility test plan

1. Valid PIN issues a 256-bit-token-backed cookie with the exact required flags.
2. Invalid or disabled PIN issues no cookie.
3. Missing, malformed, tampered, expired, revoked, wrong-environment, wrong-role,
   wrong-participant, and wrong-program sessions fail closed.
4. Participant deletion, access disablement, program change, and program archival
   invalidate subsequent requests.
5. Logout and PIN reset revoke tokens; replay is rejected.
6. Browser-supplied participant/program IDs are ignored or must exactly match the
   authenticated context.
7. Responses exclude token/hash, PIN data, access codes, family claim codes, and
   service-role or raw database details.
8. Direct student login, facilitator launch, Kid Shell, Weekly Adventures, Explore,
   Missions, Quests, games, progress, rewards, hard refresh, same-tab navigation,
   logout, and expiration recovery retain expected product behavior.
9. `localStorage` contains no authoritative student identity or student access code
   after login, refresh, navigation, logout, and expiry.
10. Migration tests confirm foreign keys, fixed role/environment/expiry constraints,
    indexes, forced RLS, browser-role revocation, service-role-only CRUD, cleanup
    scope, and fixed empty `search_path`.

## Migration verification SQL (do not execute from this review)

```sql
select to_regclass('public.student_compatibility_sessions') as table_name;

select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'student_compatibility_sessions'
order by ordinal_position;

select conname, contype, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.student_compatibility_sessions'::regclass
order by conname;

select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'student_compatibility_sessions'
order by indexname;

select relrowsecurity as rls_enabled, relforcerowsecurity as rls_forced
from pg_class
where oid = 'public.student_compatibility_sessions'::regclass;

select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'student_compatibility_sessions';

select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'student_compatibility_sessions'
order by grantee, privilege_type;

select
  has_table_privilege('anon', 'public.student_compatibility_sessions', 'select') as anon_select,
  has_table_privilege('authenticated', 'public.student_compatibility_sessions', 'select') as authenticated_select,
  has_table_privilege('service_role', 'public.student_compatibility_sessions', 'select') as service_select,
  has_table_privilege('service_role', 'public.student_compatibility_sessions', 'insert') as service_insert,
  has_table_privilege('service_role', 'public.student_compatibility_sessions', 'update') as service_update,
  has_table_privilege('service_role', 'public.student_compatibility_sessions', 'delete') as service_delete;

select count(*) as student_session_count
from public.student_compatibility_sessions;

select routine_name, security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'purge_expired_student_compatibility_sessions';

select
  has_function_privilege('anon', 'public.purge_expired_student_compatibility_sessions(interval)', 'execute') as anon_execute,
  has_function_privilege('authenticated', 'public.purge_expired_student_compatibility_sessions(interval)', 'execute') as authenticated_execute,
  has_function_privilege('service_role', 'public.purge_expired_student_compatibility_sessions(interval)', 'execute') as service_execute;
```
