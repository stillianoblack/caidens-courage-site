# Pilot Outcomes canonical data-source inventory

Read-only live schema audit: 2026-07-26.

| Purpose | Canonical table | Key fields used | Production rows | Staging rows |
|---|---|---|---:|---:|
| Programs | `pilot_programs` | `id`, `program_code`, `program_name`, `program_type`, `admin_first_name`, `pilot_status`, `created_at`, archived metadata | 22 | 15 |
| Students | `participants` | `id`, `program_code`, `role`, `grade_level`, `grade_band`, timestamps | 31 | 13 |
| Pre/post outcomes | `assessment_results_v2` | `participant_id`, `assessment_type`, category scores, `total_score`, `max_score`, `percent_score`, `completed_at` | 20 | 2 |
| Missions/modules | `module_results` | `participant_id`, `module_id`, `character`, score fields, `completed_at` | 214 | 1 |
| Weekly progress | `participant_week_progress` | participant/week identifiers and completion timestamps | Present | Present |
| Coins | `player_wallets` | `participant_id`, `total_coins`, `updated_at` | Present | Present |
| Reward/certificate claims | `player_reward_claims` | `participant_id`, `reward_key`, `reward_name`, `claimed_at` | Present | Present |
| Activity recency | `kid_play_sessions` | `participant_id`, `status`, `started_at`, `last_activity_at`, `ended_at` | Present | Present |
| Email readiness | `email_delivery_logs` | delivery metadata and program relationship; recipient content is never returned | 20-column schema present | 20-column schema present |
| Weekly content | `adventures` | week/month, status, thumbnails, map art, hotspot character metadata | Weeks 1–8 active | No published rows |

## Important schema constraints

- `assessment_results_v2` currently supports reading, focus, confidence, understanding, and support category fields. Requested categories without canonical numeric fields must remain `Not enough data`.
- `player_wallets` stores `total_coins`; analytics must not look for a generic `balance` without falling back to this canonical field.
- `player_reward_claims.participant_id` is text while participant IDs are UUIDs. Server aggregation normalizes identifiers as strings.
- The audited program schema has no canonical `start_date`; v1 uses an existing pilot start field when available and otherwise labels `created_at` as the available start proxy.
- No canonical rollout checklist/notes/report metadata table existed before this release. The proposed additive migration is isolated and has not been executed.

## Privacy exclusions

The server may read necessary canonical rows with the service role after Admin authorization, but response mapping excludes names, participant IDs, emails, guardian details, PINs, claim codes, program access codes, and raw assessment answers.
