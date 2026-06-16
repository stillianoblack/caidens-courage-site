# Family Portal Onboarding Audit

Generated: 2026-06-16

## Symptom

First-time parents entering the camp **family access code** plus their email see:

> No children are linked to that email for this program.

…even when the facilitator added the student and shared the invite code.

## Flow map

| Step | Service / component | What happens |
|------|---------------------|--------------|
| Camp signup | `pilotProgramService.submitPilotProgramSignup` | Creates `pilot_programs` row with `family_access_code` (e.g. `CAMP-NAME-2026-FAMILY`). Email send is still TODO. |
| Facilitator adds student (primary) | `PilotAddStudentDrawer` → `createCampChildWithParentLink` | Inserts `participants` row + `student_family_links` row with `parent_email`. |
| Facilitator adds student (legacy) | `CampParentLinkCard` → `createStudentFamilyLink` | **Parent email optional** — link can be created with `parent_email = null`. |
| Admin emergency add | `createAdminEmergencyStudent` | Creates participant; link only if `parentEmail` provided. |
| Student self-onboard at camp | `B4BaselineCheckFlow` → `ensureParticipantForBaseline` | Creates/updates `participants` only — **no `student_family_links` row**. |
| Parent portal entry | `usePortalUnlock` → `lookupPilotProgramByAccessCodeDetailed` | Resolves camp program from family access code. |
| Parent claim | `claimParentFamilyPortal` → `lookupParentChildLinks` | Loads links by `camp_program_code`, matches `student_family_links.parent_email`. |

## Verification checklist

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 1 | Facilitator add-student creates participant | **Pass** (drawer path) | `insertCampChildParticipant` in `campChildOnboardingService.ts` |
| 2 | Parent email stored on participant | **N/A — wrong table** | `participants` has `email` (student/adult), not `parent_email`. Parent contact lives on **`student_family_links.parent_email`**. |
| 3 | Access code lookup returns participant | **Partial** | Access code resolves **program**, not participant. Participants are found only via `student_family_links`. |
| 4 | Parent email lookup returns participant | **Fails when link missing or email null** | `lookupParentChildLinks` filters `student_family_links` by normalized email only. |
| 5 | Family portal loads child immediately | **Blocked until claim succeeds** | `hydrateExistingFamilyChildren` requires confirmed parent claim + scoped links. |

## Root causes (ranked)

### 1. Parent email is not on `participants` (architectural)

Claim matching reads **`student_family_links.parent_email`**, not `participants.email`. A participant can exist on the facilitator roster while having **no link row** or a link row with a **null email**.

### 2. B-4 / baseline camp onboarding skips parent linking

`ensureParticipantForBaseline` and `findOrCreateParticipant` create roster participants without calling `createCampStudentFamilyLink`. Facilitators who share the family code after students complete check-in at camp will see students on the roster with parent email **"—"** and parents cannot claim.

### 3. Optional parent email on manual link UI

`CampParentLinkCard` treats parent email as optional (`createStudentFamilyLink` with `parentEmail: undefined`). Those invite/link rows exist but fail email lookup at claim time.

### 4. Supabase migration dependency

`createCampStudentFamilyLink` inserts `family_program_code: null`, which requires `student_family_links_camp_parent_claim.sql` (`alter column family_program_code drop not null`). If not applied, link insert fails; facilitator sees *"Child saved but parent link failed"* — participant exists without link.

### 5. Email mismatch (operational)

Parent types a different email than the facilitator entered. Lookup is exact (case-insensitive) with no fuzzy matching.

## What is *not* the cause

- Access code generation (`family_access_code` on `pilot_programs`) works; lookup uses `lookupPilotProgramByAccessCodeDetailed`.
- `PilotAddStudentDrawer` correctly requires parent email and creates both participant + link when Supabase is configured and migrations are applied.

## Repair strategy (implemented in code)

1. **Backfill** `student_family_links.parent_email` from the parent's claim-time email when a single unclaimed camp link exists with a missing email (invite row incomplete).
2. **Create missing camp link** when exactly one camp participant has no `student_family_links` row (common B-4-only onboarding case).
3. **Diagnostic logging** on failed lookups: access code, parent email, camp program code, link IDs, student IDs, orphan participant IDs.

No UI copy changes in this pass — failures remain user-friendly but ops logs carry full context.

## Independent family vs camp claim (2026-06-16)

| | Independent family signup | Camp parent claim |
|--|---------------------------|-------------------|
| Entry | Pilot signup, independent access code + email | Camp `family_access_code` + parent email |
| Service | `independentFamilyPortalSignup.ts` | `parentClaimService.ts` |
| Child links required | **No** — zero children allowed | **Yes** — `student_family_links` + email match |
| Session | `activateIndependentFamilyPortalSession` | `claimParentFamilyPortal` |
| Landing | Family Home → Focus Flame Journey step 1 (Add Child) | Family portal after child matched |

`claimParentFamilyPortal` and `lookupParentChildLinks` are **blocked** for independent family programs.
