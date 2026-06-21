# Session Isolation Audit

Generated: 2026-06-21T15:33:13.652Z

**Status:** PASS

## Summary

- Source files scanned: 1273
- Storage keys found: 316
- Scoped identity keys: 10
- Legacy unsafe keys still referenced: 6
- High severity findings: 0

## Guardrails

- Program-scoped parent claim key: yes
- Program-scoped active child key: yes
- switchRememberedProgram clears identity: no
- signOutPortal clears identity: yes

## Scoped keys

- `activeAccessCode` (1 files)
- `activeFamilyContext` (1 files)
- `activePilotProgram` (1 files)
- `activePortalRole` (1 files)
- `cc-remembered-device-session` (1 files)
- `cc-remembered-program-access` (1 files)
- `cc-scoped-active-child` (1 files)
- `cc-scoped-parent-claim` (1 files)
- `lastPilotProgram:facilitator` (1 files)
- `lastPilotProgram:family` (1 files)

## Legacy unsafe keys (must not restore without program scope)

- `activeChildNickname` — src/config/activeChildNickname.ts, src/lib/portalSessionIsolation.ts
- `activeChildParticipantId` — src/config/activeChildParticipant.ts, src/lib/portalSessionIsolation.ts
- `parentClaimConfirmed` — src/config/parentClaimContext.ts
- `parentClaimEmail` — src/config/parentClaimContext.ts
- `parentClaimLastName` — src/config/parentClaimContext.ts
- `parentClaimPhone` — src/config/parentClaimContext.ts

## Findings

- **warning** `unscoped_active_child_read` — src/components/b4/B4BaselineCheckFlow.tsx: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/components/b4/B4MissionFlow.tsx: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/components/family-portal/FamilyPortalDevDiagnosticBanner.tsx: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/components/game-assessment/GameAssessmentFlow.tsx: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/components/kid-play-shell/KidPlayShellNav.tsx: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/hooks/useAdaptiveMissionGrade.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/hooks/useAdventureWeekCompletions.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/hooks/useBaselineGate.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/hooks/useCharacterModuleProgress.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/hooks/useCourageInTheDarkProgress.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/hooks/useFamilyDashboardMetrics.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/hooks/useFocusCoinWallet.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/hooks/useFocusFlameJourneyOnboarding.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/hooks/useInventoryNotificationBadge.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/hooks/useMirandaGradeBand.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/hooks/useWeeklyAdventureTrail.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/lib/activeProgramContext.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/lib/analytics.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/lib/b4BaselineCheckStorage.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/lib/b4CheckInStatus.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/lib/baselineCompletion.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/lib/familyChildProgressDebug.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `parent_claim_read_without_program_hint` — src/lib/familyNotificationPreferences.ts: Uses readParentClaimContext — verify program scope is enforced at read time.
- **warning** `parent_claim_read_without_program_hint` — src/lib/familyParentClaimState.ts: Uses readParentClaimContext — verify program scope is enforced at read time.
- **warning** `unscoped_active_child_read` — src/lib/familyPortalLinkAudit.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `parent_claim_read_without_program_hint` — src/lib/gameplayPlayerIdentity.ts: Uses readParentClaimContext — verify program scope is enforced at read time.
- **warning** `parent_claim_read_without_program_hint` — src/lib/getMobilePortalBranding.ts: Uses readParentClaimContext — verify program scope is enforced at read time.
- **warning** `unscoped_active_child_read` — src/lib/inventoryNotificationService.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/lib/mirandaGradeBandResolver.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/lib/participantUiState.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/lib/pilotTrackingService.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/lib/portalProgramAssignment.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/lib/pushSubscriptionService.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `unscoped_active_child_read` — src/lib/recordInteractiveCompletion.ts: Reads activeChildParticipantId directly — prefer readActiveChildState().
- **warning** `parent_claim_read_without_program_hint` — src/lib/studentFamilyLinkService.ts: Uses readParentClaimContext — verify program scope is enforced at read time.
