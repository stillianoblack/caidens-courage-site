# Portal Identity Audit

Generated: 2026-06-21T17:22:47.300Z

**Status:** PASS

## Summary

- Source files scanned: 1281
- Findings: 19
- High severity findings: 0

## Guardrails

- Parent login routes to Family overview: yes
- Student PIN login clears parent claim: yes
- Facilitator login routes to roster: yes
- Parent connected requires email: yes
- Switch program clears identity: yes
- Legacy active child write retired: yes
- Remember-device gates program access: yes

## Findings

- **warning** `legacy_identity_key_reference` — src/components/b4/B4MissionGradeBriefing.tsx: References legacy identity key "activeChildNickname".
- **warning** `legacy_identity_key_reference` — src/components/courage/PortalAccessForm.tsx: References legacy identity key "rememberedProgram".
- **warning** `legacy_identity_key_reference` — src/components/kid-play-shell/KidPlayFamilySoftLockGate.tsx: References legacy identity key "rememberedProgram".
- **warning** `legacy_identity_key_reference` — src/config/activeChildNickname.ts: References legacy identity key "activeChildNickname".
- **warning** `legacy_identity_key_reference` — src/config/portalContext.ts: References legacy identity key "rememberedProgram".
- **warning** `legacy_identity_key_reference` — src/hooks/useBaselineGate.ts: References legacy identity key "activeChildParticipantId".
- **warning** `legacy_identity_key_reference` — src/hooks/usePortalUnlock.ts: References legacy identity key "rememberedProgram".
- **warning** `legacy_identity_key_reference` — src/lib/activeChildContext.ts: References legacy identity key "activeChildNickname".
- **warning** `legacy_identity_key_reference` — src/lib/activeParticipantResolver.ts: References legacy identity key "activeChildNickname".
- **warning** `legacy_identity_key_reference` — src/lib/analytics.ts: References legacy identity key "activeChildNickname".
- **warning** `legacy_identity_key_reference` — src/lib/b4BaselineCheckStorage.ts: References legacy identity key "activeChildNickname".
- **warning** `legacy_identity_key_reference` — src/lib/kidPlayReturnUnlock.ts: References legacy identity key "rememberedProgram".
- **warning** `legacy_identity_key_reference` — src/lib/participantDebug.ts: References legacy identity key "activeChildNickname".
- **warning** `legacy_identity_key_reference` — src/lib/portalProgramScope.ts: References legacy identity key "rememberedProgram".
- **warning** `legacy_identity_key_reference` — src/lib/recordInteractiveCompletion.ts: References legacy identity key "activeChildNickname".
- **warning** `legacy_identity_key_reference` — src/lib/rememberedDeviceResume.ts: References legacy identity key "rememberedProgram".
- **warning** `remembered_program_always_written` — src/lib/rememberedProgramAccess.ts: Remembered program should only persist when remember-device is checked.
- **warning** `legacy_identity_key_reference` — src/lib/resolvePlayerParticipantId.ts: References legacy identity key "activeChildNickname".
- **warning** `legacy_identity_key_reference` — src/lib/week0AssessmentStorage.ts: References legacy identity key "activeChildNickname".
