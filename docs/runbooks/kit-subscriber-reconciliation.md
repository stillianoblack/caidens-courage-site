# Kit Subscriber Reconciliation

The reconciliation endpoint is preview-only. It reads a limited remote subscriber page and local adult contacts, masks email, and proposes `link_existing`, `manual_review`, `create_contact_later`, `hold`, or `suppress_locally`. It creates no contact/provider link and changes no status/tag/sequence.

Ambiguous normalized emails require manual review. A remote restrictive state overrides local confirmed status; a local restrictive state blocks remote-active synchronization. Never include or resolve child identities.
