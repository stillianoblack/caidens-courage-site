-- Adventure month release schedule — safe to re-run (IF NOT EXISTS).
-- Default: all weeks in a published month are available immediately.

ALTER TABLE public.adventure_months
  ADD COLUMN IF NOT EXISTS release_mode text NOT NULL DEFAULT 'all_available',
  ADD COLUMN IF NOT EXISTS release_interval_days integer,
  ADD COLUMN IF NOT EXISTS release_start_at timestamptz;

COMMENT ON COLUMN public.adventure_months.release_mode IS
  'all_available | sequential_after_completion | timed_interval';

COMMENT ON COLUMN public.adventure_months.release_interval_days IS
  'Days between week unlocks when release_mode = timed_interval.';

COMMENT ON COLUMN public.adventure_months.release_start_at IS
  'Optional anchor for timed_interval unlocks; falls back to pilot start.';

NOTIFY pgrst, 'reload schema';
