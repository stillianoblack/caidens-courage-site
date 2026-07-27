# Pilot Outcomes — Live Data Inventory (Phase 1)

This inventory documents production-backed signals used by **Program Health**, **Live Learning Signals**, and **Verified Growth**. Signals not stored in Supabase are not inferred.

## Summary table

| Signal | Source table | Evidence type | Used in |
| --- | --- | --- | --- |
| Students enrolled | `participants` | Operational | Program Health |
| Baseline / post completion | `assessment_results_v2` | Operational | Program Health, Verified Growth |
| Weekly completion | `participant_week_progress` | Operational | Program Health, Live (weekly card) |
| Participation (assessments) | `assessment_results_v2` | Operational | Program Health, Live (participation card) |
| Certificates | `player_reward_claims` | Operational | Program Health |
| Focus Coins | `player_wallets` | Operational | Program Health |
| Last activity | `assessment_results_v2`, `module_results` | Operational | Program Health, roster |
| Mission accuracy (domain) | `module_results` | Directional | Live Reading / SEL / Focus |
| Questions / correct | `module_results.answers_json._attempts` | Directional | Live domain detail |
| Retries / attempts | `module_results.attempt_number` | Directional | Live focus detail |
| Adventure skill tag | `module_results.skill_area`, `character` | Directional | Domain routing |
| Matched baseline/post delta | `assessment_results_v2` | Verified | Verified Growth only |

**Not loaded in current outcomes builder:** `kid_play_sessions`, standalone `question_attempts` (attempt detail uses `answers_json._attempts` when present), `adventures` catalog (tagging uses stored module rows only).

---

## Operational signals

### Students enrolled
- **Fields:** `participants.id`, `participants.program_code`, `participants.role`
- **Calculation:** Count students linked to pilot program code
- **Denominator:** N/A (count)
- **Minimum data:** ≥1 participant row
- **Missing:** Shows `0`
- **Type:** Operational

### Baseline / post assessments
- **Fields:** `assessment_type`, `participant_id`, completion timestamps
- **Calculation:** Distinct students with baseline-type vs post-type assessments
- **Denominator:** Active students
- **Minimum:** Any assessment row
- **Missing:** `0/N`
- **Type:** Operational (counts); Verified when matched pairs used

### Weekly completion
- **Fields:** `participant_week_progress.participant_id`, `week_id` / `week_number`
- **Calculation:** Completed student-week rows ÷ (students × effective published weeks). Effective weeks = `max(publishedWeeks, distinct weeks in progress rows)`.
- **Denominator:** Student-week slots
- **Minimum:** Progress row or published week config
- **Missing:** Awaiting activity (not “Not enough data” when rows exist)
- **Type:** Operational

### Participation
- **Fields:** `assessment_results_v2` by participant
- **Calculation:** Students with ≥1 baseline or post attempt ÷ enrolled students
- **Denominator:** Enrolled students
- **Minimum:** Enrolled count > 0
- **Missing:** Awaiting assessments
- **Type:** Operational

### Certificates earned
- **Fields:** `player_reward_claims` joined to program participants
- **Calculation:** Count claims
- **Type:** Operational

### Focus Coins earned
- **Fields:** `player_wallets` (balance / earned fields as implemented in `pilotOutcomes.js`)
- **Calculation:** Sum for program participants
- **Type:** Operational

### Active students this week
- **Fields:** Activity timestamps on assessments / modules
- **Calculation:** Distinct participants active in rolling 7-day window (Program Health model)
- **Type:** Operational

---

## Directional — Live Learning Signals

### Reading / SEL / Focus domain signals
- **Source:** `module_results`
- **Fields:** `participant_id`, `skill_area`, `character`, `percent_score` or `score`/`max_score`, `answers_json`, `attempt_number`, `module_id`/`mission_id`, `completed_at`
- **Domain routing:** `skill_area` substring heuristics + character map (zeke/charlie → reading, miranda → SEL, b4/caiden → focus)
- **Primary metric:** Average module accuracy (%), missions with valid percent only in numerator
- **Denominator:** Count of module rows with valid percent in that domain
- **Supporting:** Students with activity, missions completed, questions/correct from `_attempts`, skill areas observed, early-vs-late mission trend when ≥2 modules
- **Minimum:** ≥1 tagged module with valid accuracy for domain card
- **Missing domain:** Card shows “Awaiting activity”; excluded from overall live composite
- **Status labels:** Strong / Positive / Developing / Early signal / Awaiting activity (no “growth” wording)
- **Type:** Directional

### Overall live learning signal
- **Source:** Unweighted average of available Reading, SEL, Focus live cards only
- **Denominator:** Count of domains with valid data (not 3 by default)
- **Missing domains:** Excluded, not treated as zero
- **Label:** “Overall live learning signal” (not overall growth)
- **Type:** Directional

---

## Verified Growth

### Reading / SEL / Focus matched deltas
- **Source:** `assessment_results_v2`
- **Fields:** Domain score columns (`reading_score`, `confidence_score`, `focus_score`) with configured raw maximums
- **Calculation:** Unchanged matched baseline/post engine in `pilotOutcomes.js` (`buildImpactSnapshot` / `buildDomainOutcome`)
- **Denominator:** Matched students with both baseline and post mapped scores per domain
- **Minimum:** Matched pair with valid mapped scores
- **Missing post:** “Verified growth pending” when baseline exists without matched post
- **Type:** Verified

### Overall matched growth
- **Calculation:** Unweighted average of domain verified deltas with valid matched data
- **Type:** Verified

---

## Metric dictionary (API payload)

| Payload path | Description |
| --- | --- |
| `liveLearningSnapshot.cards[].centerValue` | Server-rendered primary display (e.g. `72%`) |
| `liveLearningSnapshot.cards[].statusLabel` | Directional status label |
| `liveLearningSnapshot.cards[].details.source` | Human-readable source tables/fields |
| `liveLearningSnapshot.cards[].details.numerator` / `denominator` | Calculation transparency |
| `verifiedGrowthSnapshot` | Same object as `impactSnapshot` (matched assessment math) |
| `impactSnapshot` | Backward-compatible alias for verified growth payload |

All dashboard and PDF values are produced in `buildPilotOutcomes` / `buildLiveLearningSnapshot`; React renders canonical JSON only.
