# Student PIN Security Roadmap

This document describes the current pilot PIN model, its risks at scale, and the planned migration before district or school rollout.

## Current pilot model

- **Login verification** uses a PBKDF2-SHA256 hash stored in `participants.student_pin_hash` (120k iterations).
- **Uniqueness** is enforced per program via `student_pin_fingerprint` (SHA-256 of `PROGRAM|PIN`).
- **Authorized reveal/copy** for parents and facilitators uses `participants.student_pin_reveal_value` (plaintext stored alongside the hash).
- **Reset** generates a new random PIN, updates hash, fingerprint, reveal value, `student_pin_enabled`, and `student_pin_last_rotated_at`.
- **Weak PIN blocking** and **system-only PIN generation** remain in place — admins cannot set custom PINs.

## Risk

Permanent plaintext PIN storage is acceptable for a small pilot where adults frequently need to recover a child's login code. It should **not** remain for large school or district rollout:

- Database exposure would reveal active student PINs, not just password hashes.
- Compliance and security reviews typically expect non-recoverable credentials after initial display.

## Future model

| Concern | Future behavior |
|--------|------------------|
| Login | Hash remains permanent; verification unchanged |
| Reveal | No long-term reveal value; PIN shown once at create/reset |
| Parent copy | Parents reset PIN to receive a new one-time code (cannot recover old PIN) |
| Facilitator | Same one-time display after reset; audit `pin_reset` / `pin_revealed` |
| UI copy | Change “Reveal PIN” → “Reset PIN to show a new code” where old PIN is not recoverable |

## Migration plan

1. **During pilot** — Keep current behavior (`student_pin_reveal_value` + Reveal/Copy in Family Portal and Facilitator roster).
2. **Before district/school rollout** — Remove permanent `student_pin_reveal_value` column usage; store only hash + fingerprint.
3. **One-time display token** — After create/reset, return PIN once from the reset API response; do not persist plaintext.
4. **UI updates** — Family Portal and Facilitator panels: remove “Reveal PIN” for legacy rows; offer reset-with-confirmation only.
5. **Legacy students** — Facilitators run PIN reset once to bootstrap the new one-time model; parents see updated copy instead of “PIN needs refresh.”

## Related audit events

When analytics is enabled, these events are tracked:

- `pin_revealed`
- `pin_copied`
- `pin_reset`
- `remembered_device_created`
- `remembered_device_cleared`

## Out of scope for this roadmap

- Scoring, badges, certificates, weekly progress, and Kid Shell mission logic are unchanged by PIN security work.
