# Pilot Outcomes metric dictionary

All calculations use canonical application records and preserve incomplete records. No score is inferred when source data is absent.

| Metric | Canonical source | Formula / rule |
|---|---|---|
| Active pilots | `pilot_programs` | Count where `pilot_status = active` and `archived_at` is null. |
| Enrolled students | `participants` | Distinct student-role participant IDs associated by `program_code`. |
| Baseline complete | `assessment_results_v2` | Distinct students with a valid latest baseline record. Baseline types include `baseline`, `child_baseline`, and `adult_pre` only when the record belongs to the measured participant. |
| Post complete | `assessment_results_v2` | Distinct students with a valid latest post record. Post types include `final`, `post`, and `adult_post` only when the record belongs to the measured participant. |
| Matched students | Assessments | Students with both a valid latest baseline and valid latest post result. Incomplete students remain in the roster and data-quality totals. |
| Assessment score | Assessments | Prefer valid `percent_score`; otherwise `total_score / max_score * 100`. Scores outside 0–100 are invalid and excluded from averages but counted as quality warnings. |
| Baseline average | Matched students | Arithmetic mean of matched students’ baseline percentage scores. `n` is always shown. |
| Post average | Matched students | Arithmetic mean of matched students’ post percentage scores. `n` is always shown. |
| Absolute delta | Matched students | `post_average - baseline_average`. |
| Percentage delta | Matched students | `((post_average - baseline_average) / baseline_average) * 100`. Unavailable when baseline average is zero. |
| Student delta | Student | Student post percentage minus student baseline percentage. |
| Completion rate | Participants + module results | Students completing every published week divided by enrolled students. If published-week data is unavailable, display `Not enough data`. |
| Weekly-adventure completion | `participant_week_progress` or distinct completed `module_results.week_id` | Completed student-week pairs divided by enrolled students × published weeks. Numerator and denominator are displayed. |
| Missions completed | `module_results`, `player_mission_progress` | Distinct completed mission/module IDs per student. |
| Focus Coins | `player_wallets`, `player_reward_claims` | Sum canonical wallet balance when present; otherwise sum verified coin reward claims without double counting. |
| Certificates | Completed canonical month/week requirements and certificate reward claims | Count distinct verified certificate claim keys. No certificate is inferred from a downloadable asset alone. |
| Most recent activity | Outcome and engagement sources | Latest valid completion/update timestamp across assessments, modules, weekly progress, rewards, and sessions. |
| Category delta | Assessment category fields | Matched-student mean post category score minus matched-student mean baseline category score. Only categories present in both observations are included. |
| Outcome state | Assessments | `Not enough data`, `Baseline only`, `Post only`, or `Matched`. |
| Duplicate assessment warning | Assessments | More than one baseline or more than one post record for the same participant. Latest valid record is used; duplicates remain counted as warnings. |
| Stale program | Activity | Active program with no activity for 30 days, or no activity after creation for 30 days. |

## Category mappings

The dashboard reports a category only when a canonical numeric field exists. Current fields map as follows:

- `focus_score` → Focus/self-regulation
- `confidence_score` → Courage/confidence
- `reading_score` or `understanding_score` → Reading comprehension
- explicitly named stored category fields map to their matching category

Emotional awareness, decision making, communication, teamwork, problem solving, perseverance/resilience, and other requested categories display `Not enough data` until canonical fields are present. They are never synthesized from unrelated questions.

## Privacy

Aggregate views contain no student PII. Detail rows use deterministic display labels scoped to the response (`Student 001`, `Student 002`, …) and never return names, emails, PINs, claim codes, access codes, or raw identifiers.
