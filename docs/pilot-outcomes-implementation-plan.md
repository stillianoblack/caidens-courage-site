# Pilot Outcomes v1 implementation plan

Base: `e8829c2693731bd10f946ade4d2a3c10800ba942`

## Release boundaries

- Add one Admin Portal tab backed only by authenticated Netlify Functions.
- Reuse canonical pilot, participant, assessment, progress, reward, and delivery-log records.
- Calculate metrics at request time; do not create a parallel analytics warehouse.
- Add only additive rollout/report metadata tables. Do not execute the migration as part of this release.
- Generate reports in memory through an authenticated function. Do not publish PDFs or student data.
- Keep student identifiers privacy-safe and omit emails, PINs, access codes, and raw names from outcome payloads.
- Preserve RLS and all existing Admin Portal behavior.

## Implementation sequence

1. Add a pure outcome-calculation module with matched-student, missing-data, duplicate, score-range, category, engagement, and readiness calculations.
2. Add authenticated summary/detail and rollout endpoints using the existing `requireAdmin` session boundary.
3. Add the Pilot Outcomes dashboard, filters, accessible charts, detail view, data-quality panel, and rollout workspace.
4. Add an authenticated PDF/HTML report function using PDFKit, with stable page breaks and no public storage.
5. Add the smallest additive migration for rollout state, notes, and report-generation metadata.
6. Audit weekly character data and fallback behavior. Change application logic only if the fallback assigns Caiden when no character is configured.
7. Validate calculations, authorization, privacy, responsive rendering, PDF pagination, and build/security gates.

## Rollback

The release is additive. Rollback consists of reverting the release commit. The optional database tables are not required by existing application flows and may remain unused if the UI/function release is reverted.
