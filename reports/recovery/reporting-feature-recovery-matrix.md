# Reporting Feature Recovery Matrix

Audit date: 2026-07-30 (America/Los_Angeles)

Recovery branch: `codex/production-recovery-reconciled`

Production project: `bnopaocdqkknjzmmkaen`

No production records were inserted, updated, deleted, backfilled, or normalized
during this audit.

## Beneficial-change matrix

| Feature | Originating commit | Originating branch | Primary files | Present before this reconciliation | Safe to recover | Migration method |
| --- | --- | --- | --- | --- | --- | --- |
| Protected Pilot Outcomes portfolio | `c32b58f38`, isolated by `908188813` | `codex/pilot-outcomes-dashboard-v1`, `codex/pilot-outcomes-production-release` | `AdminPilotOutcomesTab.tsx`, `admin-pilot-outcomes.js`, `_lib/pilotOutcomes.js`, `pilotOutcomesApi.ts` | Yes | Yes | Already present on recovery base |
| Outcomes and engagement | `c32b58f38`, `ce48f5575` | `codex/pilot-outcomes-dashboard-v1` | `AdminPilotOutcomesTab.tsx`, `_lib/pilotOutcomes.js` | Yes | Yes | Already present; retain canonical server payload |
| Data quality | `c32b58f38` | `codex/pilot-outcomes-dashboard-v1` | `AdminPilotOutcomesTab.tsx`, `_lib/pilotOutcomes.js` | Yes | Yes | Already present |
| Grade distribution | `c32b58f38` | `codex/pilot-outcomes-dashboard-v1` | `AdminPilotOutcomesTab.tsx`, `_lib/pilotOutcomes.js` | Yes | Yes | Already present |
| Privacy-safe roster | `c32b58f38`, `908188813` | `codex/pilot-outcomes-dashboard-v1`, `codex/pilot-outcomes-production-release` | `AdminPilotOutcomesTab.tsx`, `_lib/pilotOutcomes.js` | Yes | Yes | Already present; retain synthetic labels only |
| Pilot Impact / measured outcomes | `ce48f5575`, `51fc22a00` | `codex/pilot-outcomes-dashboard-v1` | `_lib/pilotOutcomes.js`, `AdminPilotEvidencePanels.tsx`, `pilotOutcomesPresentation.js` | Yes | Yes | Already present; relabel as Verified Outcomes |
| Growth-pending state | `2fa823444` | `codex/live-learning-signals-dashboard` | `_lib/pilotOutcomes.js`, `AdminPilotEvidencePanels.tsx`, `admin-pilot-outcomes-report.js` | Yes, but baseline detail was hidden without matched post | Yes | Minimal server-calculation correction |
| Program Health | `2eb0385c4` | `codex/program-health-pilot-impact` | `AdminProgramHealthPanel.tsx`, `buildProgramHealthModel.ts`, `admin-program-health-visual.css` | Yes | Yes | Already present plus focused source-mapping correction |
| Fixture-aligned visual hierarchy | `1fa9a4070` | `codex/program-health-fixture-ui` | `AdminProgramHealthPanel.tsx`, `AdminPilotOutcomesTab.tsx`, `admin-program-health-visual.css` | Yes | Yes | Already present |
| Seven-step pilot timeline | `2eb0385c4`, `1fa9a4070` | Program Health branches | `buildProgramHealthModel.ts`, `AdminProgramHealthPanel.tsx` | Yes | Yes | Already present |
| Current-status banner | `2eb0385c4` model, visualized in this reconciliation | Program Health branches | `buildProgramHealthModel.ts`, `AdminProgramHealthPanel.tsx` | Calculated but not rendered | Yes | Render existing canonical model field |
| Live Student Progress / Live Learning Signals | `2fa823444` | `codex/live-learning-signals-dashboard` | `_lib/pilotLiveLearningSignals.js`, `AdminPilotEvidencePanels.tsx` | Yes | Yes | Retain and correct joins/attempt schema |
| Branded PDF and print view | `c32b58f38`, `ce48f5575`, `51fc22a00`, `2fa823444` | Pilot Outcomes and Live Learning branches | `admin-pilot-outcomes-report.js`, `pilotOutcomesReport.test.ts` | Yes | Yes | Retain; remove report-log mutation and restore section parity |
| Mobile reporting layout | `95de8b3fb`, `1fa9a4070` | `codex/pilot-outcomes-dashboard-v1`, `codex/program-health-fixture-ui` | `admin-pilot-outcomes.css`, `admin-program-health-visual.css` | Yes | Yes | Already present |

Generated sample PDFs, screenshots, staging fixtures, and historical audit scripts
are not included in the runtime branch.

## Canonical evidence model

1. **Program Health** is operational: enrollment, assessment participation,
   mission activity, sessions, coins, certificates, and source-qualified weekly
   completion.
2. **Live Student Progress** is directional: mission accuracy, tagged activity,
   question-attempt evidence, completion, and skill/character classifications.
3. **Verified Outcomes** uses matched baseline and post scores only. Baseline
   values remain visible when post data is absent, but no delta is calculated.

Missing post data is never converted to zero growth. Mission activity is never
called verified growth.

## Read-only production mapping audit

Program identifier: `…73bf44ba` (redacted)

Program code: `CAMP-BLUERIBBONRESULTSACADEMY-2026`

| Dashboard metric | Canonical source and fields | Join and calculation | Included / excluded | Freshness | Current value | Existing UI accurate? |
| --- | --- | --- | --- | --- | --- | --- |
| Enrolled students | `participants.id`, `program_code`, `role` | `participants.program_code = pilot_programs.program_code`; student roles only | 17 / 0 | Participant records previously verified intact | 17 | Yes |
| Baseline completed | `assessment_results_v2.participant_id`, `assessment_type` | Distinct enrolled participants with baseline types | 13 / 4 | 2026-07-15T18:00:02.474Z | 13 of 17 | Yes |
| Post completed | Same table; post assessment types | Distinct enrolled participants with post types | 0 / 17 | No post row | 0 of 17 | Yes |
| Participation | Assessment participant IDs | Students with baseline or post / enrolled students | 13 / 4 | 2026-07-15T18:00:02.474Z | 76.5% | Yes |
| At least one adventure | `module_results.participant_id`, `module_id` | Participant join; students with at least one completed module/mission | 10 / 7 | 2026-07-15T18:40:08.511Z | 10 | **No. Existing 0 used a nonexistent weekly-progress table.** |
| Mission completions | `module_results.participant_id`, `module_id` | Distinct participant/module pairs, summed by participant | 10 students / 7 without module results | 2026-07-15T18:40:08.511Z | 58 | Previously hidden or incorrectly disconnected from adventure state |
| Module results | `module_results.*` | Enrolled participant ID join | 170 rows | 2026-07-15T18:40:08.511Z | 170 | Source exists |
| Question attempts | `module_results.answers_json._attempts` | Canonical attempt objects only | 248 canonical attempts; legacy answer maps excluded from correctness totals | 2026-07-15T18:40:08.511Z | 248 answered, 244 final-correct | **No. Parser did not recognize `is_correct_final`.** |
| Reading signal | `module_results.percent_score`, `character`, `skill_area` | Mean valid module percentage for reading-tagged rows | 9 students | 2026-07-15T18:40:08.511Z | 25.7%; 83 canonical attempts, 82 final-correct | Join was defective when `program_code` was absent |
| SEL signal | Same source | Mean valid SEL-tagged module percentage | 7 students | 2026-07-15T18:40:08.511Z | 61.9%; 101 canonical attempts, 99 final-correct | Join was defective |
| Focus signal | Same source | Mean valid focus-tagged module percentage | 7 students | 2026-07-15T18:40:08.511Z | 28.1%; 64 canonical attempts, 63 final-correct | Join was defective |
| Overall live signal | Available Reading, SEL, and Focus cards | Unweighted mean; missing domains excluded | 3 / 3 domains | 2026-07-15T18:40:08.511Z | 38.6% directional signal | Previously suppressed by join defect |
| Weekly completion | Intended `participant_week_progress` fields | Completed participant-week rows / proven participant-week denominator | Source table absent; no defensible denominator | Source unavailable | Unavailable | **“Not enough data” concealed a source-mapping defect.** |
| Active students this week | `kid_play_sessions.last_activity_at`, plus assessment/module activity | Distinct enrolled participants active in rolling seven days | 1 / 16 | 2026-07-30T20:27:03.809Z | 1 | **No. Existing 0 ignored Kid Shell sessions.** |
| Kid play sessions | `kid_play_sessions.participant_id`, timestamps | Enrolled participant ID join | 135 sessions across 16 students | 2026-07-30T20:27:03.809Z | 135 | Previously loaded but unused |
| Coins earned | `player_wallets.total_coins` | Sum wallets joined by participant ID | 12 wallet rows | 2026-07-15T18:37:04.262Z | 1,180 | Yes |
| Certificates earned | `player_reward_claims.reward_key`, `reward_name` | Count certificate-type claims joined by participant ID | 2 certificates among 141 reward claims | 2026-07-22T17:48:54.813Z | 2 | Yes |
| Verified outcome delta | `assessment_results_v2` mapped domain scores | Matched baseline/post pairs only | 0 matched / 17 unmatched | No post row | Verified outcomes pending | Yes after reconciliation; no zero-growth inference |

## Corrected Blue Ribbon current-to-date summary

- Students: **17**
- Baseline: **13**
- Post: **0**
- Participation: **76.5%**
- Students with at least one adventure: **10**
- Participant-mission completions: **58**
- Active students this week: **1**
- Kid Shell sessions: **135**
- Coins: **1,180**
- Certificates: **2**
- Weekly completion: **Unavailable because the canonical weekly-progress source
  is not deployed; mission activity is reported separately**
- Verified outcomes: **Pending**

