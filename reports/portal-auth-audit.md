# Portal Auth Audit

Generated: 2026-06-21T16:55:10.196Z

**Status:** PASS

## Guardrails

- Facilitator email verification module: yes
- DEV bypass flag module: yes
- switchRememberedProgram clears full auth: yes
- usePortalUnlock verifies facilitator email: yes
- Legacy demo unlock gated: yes
- Blue Ribbon cross-grant gated: yes

## Findings

- **warning** `facilitator_apply_unlock_without_local_verify` — src/components/admin/AdminPilotProgramCard.tsx: applyProgramPortalUnlock(facilitator) — confirm email was verified upstream.
- **warning** `facilitator_apply_unlock_without_local_verify` — src/components/admin/AdminPilotProgramRow.tsx: applyProgramPortalUnlock(facilitator) — confirm email was verified upstream.
- **warning** `facilitator_apply_unlock_without_local_verify` — src/components/courage/PortalCodeRecovery.tsx: applyProgramPortalUnlock(facilitator) — confirm email was verified upstream.
- **warning** `facilitator_apply_unlock_without_local_verify` — src/pages/PilotProgramSignupPage.tsx: applyProgramPortalUnlock(facilitator) — confirm email was verified upstream.
