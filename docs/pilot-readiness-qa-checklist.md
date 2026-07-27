# Pilot Readiness QA Checklist

Record synthetic test identifiers only. Every row includes the test action, expected result, pass/fail field, and notes field.

## Admin

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Sign in, refresh, open every tab, and sign out | Session persists through refresh; protected data loads; sign-out clears access |  |  |
| Use invalid and expired credentials | Friendly message; no support code, environment name, or raw error |  |  |
| Load and retry Pilot Programs | Active and archived programs load through protected endpoint; retry works |  |  |

## Independent Family

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Create/reuse synthetic family; retry same event | Family Hub opens; one family code and one parent welcome email; duplicate suppressed |  |  |
| Refresh, sign out, and sign back in | Account, child linkage, and state persist |  |  |

## Camp/Youth Program

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Create/reuse synthetic camp program | Facilitator code, correct portal, and one staff email |  |  |
| Launch and switch synthetic participants | Progress and B-4 state remain isolated |  |  |

## Parent claim

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Claim a synthetic camp child | Correct claim/family credential, Family Hub destination, and one parent email |  |  |
| Repeat claim request | Existing link reused; no duplicate account or email |  |  |

## Teacher/Classroom

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Create/reuse synthetic classroom | Correct educator role, facilitator code, dashboard, and staff template |  |  |

## School

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Create/reuse synthetic school | Correct staff role, facilitator code, dashboard, and staff template |  |  |

## District

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Create/reuse synthetic district | Correct staff role, facilitator code, dashboard, and staff template |  |  |

## Homeschool Group

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Create/reuse synthetic group | Correct staff role, facilitator code, dashboard, and staff template |  |  |

## Child experience

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Launch, refresh, background/resume, and continue | Same participant and gameplay state resume without duplicate saves |  |  |
| Switch participant | No prior participant progress or preferences leak |  |  |

## B-4

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Open first-time picker on mobile and desktop | Five choices; centered modal; safe area; scroll locked; close outside art |  |  |
| Save, refresh, re-login, change, and cancel | Saved choice persists; cancel does not save |  |  |
| Simulate transient load/save error and retry | Friendly state recovers without reload or loop |  |  |

## Weekly Adventures

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Open published Weeks 1–8 | Configured thumbnail/hero wins; missing art uses neutral placeholder |  |  |
| Compare player identity with featured character | Player selection does not overwrite weekly character artwork |  |  |

## Missions

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Start, save, switch tabs, and resume a mission | Current state persists; no duplicate completion |  |  |

## Quests

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Open and complete an available synthetic quest | Correct participant receives one completion |  |  |

## Assessments

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Save baseline and post-assessment responses | Correct grade questions; one submission; refresh persists |  |  |
| Leave an answer blank | Missing remains missing and is not scored as zero |  |  |

## Rewards

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Complete one eligible synthetic activity | Focus coins and weekly badge update once |  |  |

## Certificates

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Meet monthly completion criteria | Eligibility and certificate details appear in correct adult portal |  |  |

## Emails

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Exercise each distinct template family with controlled addresses | Correct branding, credential label, CTA, text alternative, and support link |  |  |
| Repeat identical delivery event | Existing log reused; no second provider send |  |  |

## Mobile Safari

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Run signup, portals, B-4, Weekly Adventures, and assessment at mobile Safari dimensions | No overlap, accidental refresh, unsafe inset, or blocked action |  |  |

## Desktop Chrome

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Run admin and all primary portals at desktop dimensions | Navigation, dialogs, forms, and lists remain usable |  |  |

## Session expiry

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Expire admin/adult/child sessions | Protected action stops safely and offers friendly recovery |  |  |

## Error/retry behavior

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Simulate safe transient failures | In-place retry preserves values and idempotency key |  |  |
| Scan rendered errors | No support code, raw correlation ID, stack, provider, table, or function detail |  |  |

## Accessibility basics

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Use keyboard, visible focus, headings, labels, and screen-reader names | Primary workflows are operable and errors are announced |  |  |
| Check text and controls at 200% zoom | Content remains readable and actions remain reachable |  |  |

## Production rollback verification

| Test action | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Record current production deploy ID and verify it remains available | Exact prior production artifact can be restored |  |  |
| Compare preview commit and manifest | Preview contains only the approved release commit and files |  |  |
