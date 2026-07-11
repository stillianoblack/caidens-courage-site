# Audience / CRM Phase 1 Security

## Trust boundary

The browser passcode is not accepted by CRM endpoints. Each request must carry a Supabase access token, which the server validates with Supabase Auth. The server then loads active CRM role assignments and applies permission and organization scope. Client-provided role/scope headers or query values are ignored.

## Permission matrix

| Role | Contacts | Organizations | Classification |
|---|---:|---:|---:|
| `internal_admin` | Global read | Global read | Global read |
| `audience_admin` | Global read | Global read | Global read |
| `organization_admin` | Assigned organization members only | Assigned organization only | Denied |
| `read_only_admin` | Read within assigned/global scope | Read within assigned/global scope | Allowed when globally scoped |

All Phase 1 roles are read-only. No role-management API exists.

## RLS

Every new table has RLS enabled and no anonymous/authenticated policies. Therefore browser clients receive no direct access. Trusted server functions use the service role only after request authorization. Role assignments and audit events are never browser-writable.

## Feature flags

All server flags require the exact value `true`; absence means disabled. The React display flag only hides or shows navigation and never authorizes data.

## Bootstrap

The bootstrap endpoint requires `CRM_BOOTSTRAP_ENABLED=true`, a server-only bootstrap email, and a server-only bootstrap secret. It finds an existing Auth user, never creates one, refuses a second internal administrator, is idempotent for the same user, creates one role assignment, and records an audit event. Disable the endpoint immediately after local/test bootstrap.

## Production prerequisites

- Deployed-schema review and isolated migration rehearsal.
- Supabase Auth configuration and verified initial user.
- MFA enforcement for privileged CRM roles.
- Secret rotation and restricted Netlify environment access.
- Rate limiting/WAF policy for CRM endpoints and bootstrap.
- RLS integration tests against an isolated Supabase project.
- Logging/retention review; no full email or child data in ordinary logs.
