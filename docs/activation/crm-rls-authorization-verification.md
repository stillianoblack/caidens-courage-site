# CRM RLS and Authorization Verification

**Status:** **PARTIAL — REQUIRES LOCAL SUPABASE**

Real RLS/Auth tests were not run because no demonstrably isolated database exists. The ignored environment points remotely and was not queried.

| Control | Result |
|---|---|
| Anonymous CRM read/write denied | Static migration verification passed; real RLS pending |
| Ordinary authenticated user denied | Mocked endpoint test passed; real Auth/RLS pending |
| Internal/audience/read-only roles | Authorization primitive tests passed; real role rows pending |
| Organization scope/cross-scope denial | Unit tests passed; real RLS/API test pending |
| Role/audit browser writes denied | No policies exist; real RLS pending |
| Consent/lifecycle append-only | Static/default-deny tests passed; real DB pending |
| Suppression precedence | Unit tests passed |
| Outbox/provider direct browser writes denied | No policies exist; real RLS pending |
| Child contact kind rejected | Static constraint/unit tests passed |
| Client-supplied role/scope ignored | Authorization test passed |
| Disabled flags deny access | Endpoint gate tests passed |

Bootstrap was not executed. No Auth user was created or queried. After local setup, create one isolated adult test Auth user, run bootstrap twice for idempotency, attempt a different second admin, confirm one assignment/audit event, then immediately disable bootstrap.
