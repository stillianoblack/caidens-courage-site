# Kit Provider Rollback

Disable `KIT_WRITE_OPERATIONS_ENABLED`, then `AUDIENCE_PROVIDER_SYNC_ENABLED`, then `KIT_PROVIDER_ENABLED`. Disable the provider account and hold affected contacts. Preserve outbox, attempts, consent, webhooks, and audit history. Reconcile remote state before any future resume. Never roll back by reactivating a restricted subscriber or deleting suppression evidence.
