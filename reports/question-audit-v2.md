# Question Quality Audit v2 — Staging Rewrites

Generated: 2026-06-15T03:22:17.824Z
Staging version: adaptive_staging_v3
Questions rewritten: 512

## Summary Comparison

| Metric | Before | After |
|--------|--------|-------|
| Total questions | 512 | 512 |
| High priority rewrites | 138 | 68 |
| Medium priority | 92 | 92 |
| Low priority | 282 | 352 |

### Average Difficulty by Character

| Character | Before | After |
|-----------|--------|-------|
| b4 | 3.59 | 3.59 |
| caiden | 2.72 | 3.30 |
| charlie | 3.02 | 3.19 |
| miranda | 2.89 | 3.25 |
| zeke | 3.14 | 3.28 |

### Flag Count Comparison

| Flag | Before | After |
|------|--------|-------|
| answer_length_imbalance | 145 | 91 |
| caiden_needs_more_math_focus | 28 | 13 |
| correct_answer_too_obvious | 83 | 33 |
| guessable_without_scenario | 17 | 2 |
| insufficient_scenario_evidence | 44 | 42 |
| joke_or_impossible_distractor | 10 | 5 |
| lacks_reasoning_skill | 25 | 8 |
| reading_level_below_band | 57 | 52 |
| too_easy_for_grade_4_plus | 51 | 12 |

### Answer Position Distribution (After)

| Character | A | B | C | D |
|-----------|---|---|---|---|
| b4 | 24 | 24 | 24 | 24 |
| caiden | 47 | 47 | 47 | 47 |
| charlie | 24 | 24 | 24 | 24 |
| miranda | 9 | 9 | 9 | 9 |
| zeke | 24 | 24 | 24 | 24 |

### Reading Level Flags by Character (After)

| Character | Below-band flags | Total |
|-----------|------------------|-------|
| b4 | 4 | 96 |
| caiden | 20 | 188 |
| charlie | 15 | 96 |
| miranda | 1 | 36 |
| zeke | 12 | 96 |

### Average Difficulty by Mission (After)

| Mission | Avg difficulty |
|---------|------------------|
| b4::b4-body-signal-detective | 3.42 |
| b4::b4-brave-choice-button | 3.75 |
| b4::b4-calm-down-countdown | 3.58 |
| b4::b4-confidence-charger | 3.67 |
| b4::b4-focus-flame-finale | 3.42 |
| b4::b4-focus-reset-station | 3.67 |
| b4::b4-mood-scanner | 3.67 |
| b4::b4-oops-repair-lab | 3.58 |
| caiden::quest-1 | 3.58 |
| caiden::quest-2 | 3.17 |
| caiden::quest-3 | 3.50 |
| caiden::quest-4 | 2.58 |
| caiden::quest-5 | 3.33 |
| caiden::quest-6 | 3.63 |
| caiden::quest-7 | 3.22 |
| caiden::quest-8 | 3.38 |
| caiden::quest-9 | 3.09 |
| charlie::charlie-floating-orange | 3.08 |
| charlie::charlie-marshmallow-tower | 3.25 |
| charlie::charlie-missing-plant | 3.33 |
| charlie::charlie-mystery-footprints | 3.17 |
| charlie::charlie-mystery-sound | 3.25 |
| charlie::charlie-robot-rescue | 2.92 |
| charlie::charlie-science-fair-mystery | 3.25 |
| charlie::charlie-volcano-trouble | 3.25 |
| miranda::miranda-mystery-file-1 | 3.25 |
| miranda::miranda-mystery-file-2 | 3.33 |
| miranda::miranda-mystery-file-3 | 3.17 |
| zeke::zeke-brave-voice | 3.42 |
| zeke::zeke-courage-challenge | 3.17 |
| zeke::zeke-final-huddle | 3.42 |
| zeke::zeke-friendship-repair | 3.33 |
| zeke::zeke-group-project-glitch | 3.42 |
| zeke::zeke-new-table | 3.00 |
| zeke::zeke-pass-the-ball | 3.08 |
| zeke::zeke-team-captain-test | 3.42 |

## Before / After Examples (Top 12 improved)

#### cq4-45-q1 (caiden / quest-4 / 4-5)

**Before (B correct):** Caiden loses a game and feels embarrassed. What is the best next step?

Choices: A. Blame someone else | B. Notice the feeling and try again calmly | C. Stop talking all day | D. Break the rules

**After (D correct, difficulty 4/5):** After homework and rest, will he be late for dinner?

Choices: A. Blame someone else | B. Stop talking all day | C. Break the rules | D. Notice the feeling a… ✓

Flags remaining: none


#### cq9-68-q2 (caiden / quest-9 / 6-8)

**Before (A correct):** What should Caiden do?

Choices: A. Hold the line on safety and explain why | B. Allow shortcut to win | C. Mock safety rules | D. Leave team

**After (B correct, difficulty 4/5):** Given the deadlines and minutes available, what should Caiden do?

Choices: A. Mock safety rules | B. Hold the line on saf… ✓ | C. Allow shortcut to win | D. Leave team

Flags remaining: none


#### cq5-68-q3 (caiden / quest-5 / 6-8)

**Before (A correct):** What is the purpose of organizing a project into steps?

Choices: A. To reduce confusion and track progress | B. To make it harder | C. To avoid finishing | D. To skip planning

**After (A correct, difficulty 4/5):** Given the deadlines and minutes available, what is the purpose of organizing a project into steps?

Choices: A. To reduce confusion… ✓ | B. To make it harder | C. To avoid finishing | D. To skip planning

Flags remaining: none


#### cq9-68-q3 (caiden / quest-9 / 6-8)

**Before (A correct):** Best leadership judgment?

Choices: A. Split phases: one plans route, one plans gear | B. Let them argue | C. Remove both | D. Cancel mission

**After (C correct, difficulty 4/5):** Given the deadlines and minutes available, best leadership judgment?

Choices: A. Let them argue | B. Cancel mission | C. Split phases: one pl… ✓ | D. Remove both

Flags remaining: none


#### cq9-68-q4 (caiden / quest-9 / 6-8)

**Before (A correct):** What should Caiden do?

Choices: A. Ask staff to repeat and confirm with team | B. Guess and rush | C. Blame teammates | D. Ignore instructions

**After (D correct, difficulty 4/5):** Given the deadlines and minutes available, what should Caiden do?

Choices: A. Blame teammates | B. Ignore instructions | C. Guess and rush | D. Ask staff to repeat… ✓

Flags remaining: none


#### cq9-68-q5 (caiden / quest-9 / 6-8)

**Before (A correct):** How should Caiden respond?

Choices: A. Private check-in, then facilitate calm talk | B. Ignore feelings | C. Take sides publicly | D. Kick someone off team

**After (A correct, difficulty 4/5):** Given the deadlines and minutes available, how should Caiden respond?

Choices: A. Private check-in, then… ✓ | B. Take sides publicly | C. Kick someone off team | D. Ignore feelings

Flags remaining: none


#### cq9-68-q7 (caiden / quest-9 / 6-8)

**Before (A correct):** What shows leadership?

Choices: A. Offer one helper if staff approves | B. Taunt other team | C. Pack up silently | D. Take their supplies

**After (C correct, difficulty 4/5):** Given the deadlines and minutes available, what shows leadership?

Choices: A. Pack up silently | B. Take their supplies | C. Offer one helper if… ✓ | D. Taunt other team

Flags remaining: none


#### cm4-68-q1 (charlie / charlie-volcano-trouble / 6-8)

**Before (A correct):** Charlie wants a stronger eruption. What should he keep the same?

Choices: A. All variables except the one he is testing | B. Nothing at all | C. Only the volcano name | D. The funniest guess

**After (C correct, difficulty 3/5):** Using the evidence provided, charlie wants a stronger eruption. What should he keep the same?

Choices: A. Record the result without noting which variable changed | B. Focus on color or size instead of the tested variable | C. All variables except the one he is testing ✓ | D. Change two variables at the same time

Flags remaining: reading_level_below_band, insufficient_scenario_evidence


#### zkm8-45-q1 (zeke / zeke-final-huddle / 4-5)

**Before (A correct):** One teammate says they felt ignored. What should the team do?

Choices: A. Listen and plan how to include them next time | B. Tell them they are wrong | C. Change the subject | D. Say winning matters more

**After (D correct, difficulty 4/5):** Based on the scenario, one teammate says they felt ignored. What should the team do?

Choices: A. Tell them they are wrong | B. Say winning matters more | C. Change the subject | D. Listen and plan how to… ✓

Flags remaining: none


#### cq7-45-q2 (caiden / quest-7 / 4-5)

**Before (A correct):** What should Caiden do?

Choices: A. Offer spare poncho if he has one and tell counselor | B. Laugh and leave | C. Take teammate’s bag | D. Ignore weather

**After (B correct, difficulty 4/5):** Based on the scenario, what should Caiden do?

Choices: A. Laugh and leave | B. Offer spare poncho if… ✓ | C. Take teammate’s bag | D. Ignore weather

Flags remaining: none


#### cq7-68-q1 (caiden / quest-7 / 6-8)

**Before (A correct):** What should Caiden load first?

Choices: A. Critical items: water and first-aid | B. Decor and games first | C. Random order | D. Leave wagon empty

**After (A correct, difficulty 4/5):** Given the deadlines and minutes available, what should Caiden load first?

Choices: A. Critical items: wate… ✓ | B. Leave wagon empty | C. Decor and games first | D. Random order

Flags remaining: none


#### cq7-68-q6 (caiden / quest-7 / 6-8)

**Before (A correct):** What belongs in the report?

Choices: A. Packed items, missing items, who owns fixes | B. Only jokes | C. Only complaints | D. Nothing — wing it

**After (B correct, difficulty 4/5):** Given the deadlines and minutes available, what belongs in the report?

Choices: A. Only complaints | B. Packed items, missin… ✓ | C. Nothing — wing it | D. Only jokes

Flags remaining: none


## Remaining Issues (After)

Questions with flags: 187

- `b4m1-23-q2` (b4) — correct_answer_too_obvious, answer_length_imbalance
- `b4m1-23-q3` (b4) — answer_length_imbalance
- `b4m1-k1-q1` (b4) — answer_length_imbalance
- `b4m2-23-q1` (b4) — answer_length_imbalance
- `b4m2-23-q2` (b4) — correct_answer_too_obvious, answer_length_imbalance
- `b4m2-23-q3` (b4) — answer_length_imbalance
- `b4m2-45-q1` (b4) — correct_answer_too_obvious, answer_length_imbalance, too_easy_for_grade_4_plus
- `b4m2-68-q1` (b4) — insufficient_scenario_evidence
- `b4m3-23-q1` (b4) — answer_length_imbalance
- `b4m4-23-q3` (b4) — answer_length_imbalance
- `b4m4-68-q1` (b4) — answer_length_imbalance, insufficient_scenario_evidence
- `b4m5-45-q1` (b4) — insufficient_scenario_evidence
- `b4m5-68-q3` (b4) — insufficient_scenario_evidence
- `b4m5-k1-q3` (b4) — insufficient_scenario_evidence
- `b4m6-45-q1` (b4) — insufficient_scenario_evidence
- `b4m6-45-q2` (b4) — reading_level_below_band
- `b4m6-68-q1` (b4) — insufficient_scenario_evidence
- `b4m7-23-q1` (b4) — answer_length_imbalance
- `b4m7-68-q1` (b4) — reading_level_below_band, insufficient_scenario_evidence
- `b4m7-68-q2` (b4) — reading_level_below_band
- `b4m8-23-q1` (b4) — answer_length_imbalance
- `b4m8-23-q2` (b4) — correct_answer_too_obvious, answer_length_imbalance
- `b4m8-23-q3` (b4) — answer_length_imbalance
- `b4m8-45-q1` (b4) — reading_level_below_band, answer_length_imbalance
- `b4m8-68-q1` (b4) — correct_answer_too_obvious, too_easy_for_grade_4_plus
- `b4m8-68-q3` (b4) — insufficient_scenario_evidence
- `cm1-23-q1` (charlie) — insufficient_scenario_evidence
- `cm1-23-q2` (charlie) — insufficient_scenario_evidence
- `cm1-45-q1` (charlie) — insufficient_scenario_evidence
- `cm1-45-q2` (charlie) — insufficient_scenario_evidence
- _…and 157 more_

## Recommendations

1. Review staging in app: `REACT_APP_STAGING_QUESTIONS=true yarn start`
2. Spot-check Caiden math-enhanced questions for scenario fit
3. Promote approved overrides to production mission files when ready
4. Re-run `npm run audit:questions:v2` after any manual edits to manifest

_Production mission files were not modified. Staging manifest only._