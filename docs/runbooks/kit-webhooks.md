# Kit Webhook Runbook

Keep `KIT_WEBHOOKS_ENABLED=false` until sandbox payload/event names are verified. Configure an unpredictable `KIT_WEBHOOK_SECRET`, rate limiting, and a URL not exposed in client code. The sender must include the matching server secret header. The handler accepts only normalized unsubscribe, complaint, and bounce events; it records a sanitized ledger event, strengthens local communication state, and holds the contact. Unknown/positive events are ignored. Duplicate IDs/fingerprints are safe.

Because cryptographic Kit signature verification was not confirmed, the shared secret is a compensating control, not proof of provider origin. Scheduled reconciliation remains required.
