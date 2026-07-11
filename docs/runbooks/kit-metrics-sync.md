# Kit Metrics Sync Runbook

Metrics synchronization is read-only toward Kit and requires `KIT_PROVIDER_ENABLED=true` plus `KIT_METRICS_SYNC_ENABLED=true`. It reads broadcast stats with cursor metadata and caches supported aggregates locally. Recipients, opens/rate, clicks/rate, and unsubscribes/rate are Kit-reported. Delivered, bounces, and complaints remain null unless later official capability verification supports them.

Run only against an approved test account first. A failed/partial run records sanitized status; rerun safely using provider broadcast IDs as unique keys.
