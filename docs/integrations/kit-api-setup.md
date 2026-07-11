# Kit API v4 Setup

Use a dedicated v4 API key for the owner's own Kit account and store it only in the server runtime. The adapter sends `X-Kit-Api-Key`; React never receives the key.

All flags default false. For sandbox/read-only verification, enable `KIT_PROVIDER_ENABLED` and the specific read flag only after confirming the account is not production. Writes require all of `AUDIENCE_PROVIDER_SYNC_ENABLED`, `KIT_PROVIDER_ENABLED`, and `KIT_WRITE_OPERATIONS_ENABLED`, plus a verified provider account, contact hold release, confirmed consent, `do_not_enroll=false`, current eligibility, and verified mapping.

Do not enable production writes, create broadcasts, or activate sequences during setup. Rotate the key if it appears in logs or client bundles. Respect the documented API-key rate limit and backoff on 429.
