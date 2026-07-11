# CRM Consent and Provider Security

- Local and remote communication states use the more restrictive result.
- Suppressed and unsubscribed states cannot be weakened by signup, purchase, login, membership, eligibility, or webhook replay.
- Provider upsert requires explicit confirmed consent, `do_not_enroll=false`, contact hold released, current eligible segment, verified mapping, enabled provider account, and three server write flags.
- Only adult email/name and approved non-sensitive fields may leave the platform. Child data, notes, grades, assessments, progress, medical/disability data, and access codes are rejected/omitted.
- Webhook cryptographic signature support was not verified. The endpoint therefore fails closed behind a shared secret, server flag, payload validation, deterministic dedupe, restrictive-only processing, rate-limit prerequisite, and reconciliation.
- Logs and errors mask email and never include keys.
- API key limits require controlled pagination and 429 backoff.
- Provider and worker endpoints remain disabled by default; production enablement requires sandbox evidence and MFA-protected Admin roles.
