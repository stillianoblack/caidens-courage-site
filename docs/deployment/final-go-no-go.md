# Final production decision

# NO-GO

> **2026-07-16 production preflight:** still NO-GO. The newer read-only audit found additional hard blockers: a 265-entry mixed working tree, two live staging migrations missing from its ledger, no production migration ledger, broad anonymous/public policies on all 38 policies across nine sensitive legacy tables, 35 frontend files still directly accessing protected tables, one placeholder production participant requiring review, an unbounded B-4 onboarding backfill, and an unverified Netlify site/deploy/backup identity. See `production-preflight-2026-07-16.md` for the authoritative release-package status.

Staging database/Auth/RLS, Kit V4 read-only access, and B-4 preference persistence pass. Production was not queried, migrated, deployed, or modified.

Blocking items:

1. The question audit now runs and every Week 3–9 grade band has at least ten canon-grounded items. However, the static learner runtime has no enforceable draft/published state: Weeks 5–9 cannot be true drafts and the Admin Question Bank cannot operate while `REACT_APP_LEARNING_CONTENT_ENABLED=false` and the deferred learning-engagement schema remains unapplied. The full audit also reports 71 production duplicate findings and 240 weak-distractor warnings requiring publication review.
2. Authenticated visual acceptance of the Admin Kit pages was not completed because the automated browser has no Admin password/session. The unauthenticated boundary renders correctly.
3. Participant-aware B-4 rendering is complete for settings, family card, Arcade, and Flight, but the remaining mission/share-mode surfaces need an explicit participant-context pass before production.
4. The adult Kit canary is preparation-only until the owner-controlled inbox, consent evidence, internal segment, exact existing tag/sequence, rollback, and unsubscribe test are explicitly approved. No canary was executed.

Production candidate order after blockers clear: backup and restore drill → read-only preflight → ownership migrations 001–005 → B-4 migration 20260715000100 → application/assets → writes-disabled smoke tests. Exclude the staging baseline, seed, cleanup, safety gate, deferred learning migration, review-only SQL, rollback SQL, and high-resolution source exports.

Required production flags initially: `AUDIENCE_PROVIDER_SYNC_ENABLED=false`, `KIT_WRITE_OPERATIONS_ENABLED=false`, `KIT_WEBHOOKS_ENABLED=false`, `KIT_MCP_ASSISTANT_ENABLED=false`, `KIT_METRICS_SYNC_ENABLED=false`. Keep the Kit key server-only. Stop on project-ref mismatch, backup failure, migration drift, Auth/RLS denial regression, any Kit non-GET request, missing asset, or failed build/test.

Rollback: stop traffic, disable relevant display flags, restore the pre-window database backup for schema/data regressions, and restore the prior application artifact. Do not use the B-4 column-drop rollback after real choices have been saved unless data loss is explicitly accepted. Estimated maintenance window after approval: 30–45 minutes plus smoke testing.
