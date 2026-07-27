# Pilot Data Collection Plan

## Purpose and boundaries

Collect only information needed to improve pilot reliability and learning usability. Prefer existing completion, assessment, delivery-log, and support structures. Do not add broad analytics infrastructure in Pilot Readiness v1.0.

## Observation categories

| Category | Privacy-conscious observation |
|---|---|
| Parent hesitation | Step and reason category; no free-form child details |
| Facilitator confusion | Workflow step, device, and clarification needed |
| Child stopping point | Module/week and stage; no behavioral diagnosis |
| Technical failure | Sanitized route, timestamp, browser/device, internal correlation ID |
| Content confusion | Module/question reference and de-identified note |
| Positive reaction | De-identified theme or approved quote |
| Educator quote | Written permission status and approved attribution level |
| Parent feedback | De-identified theme and permission status |
| Student-created work | Consent status, storage location, and approved use only |
| Completion blocker | Category, severity, owner, and resolution |

## Collection method

- Use existing server logs for technical diagnostics and existing product records for completion.
- Use an approved private support/operations system for notes; do not commit participant data to Git.
- Store the minimum necessary identifiers and restrict access to pilot owners.
- Separate missing assessment answers from zero scores.
- Do not copy full email addresses into general diagnostic logs.

## Weekly review

Review aggregate counts, repeated blockers, support themes, data-quality exceptions, and consent status. Escalate security or participant-isolation concerns immediately.

## Optional additive event proposal

If existing structures cannot capture a required operational event, prepare a separate proposal containing the exact event name, allowed properties, retention period, access policy, migration, rollback, and tests. Do not execute production SQL without explicit approval.
