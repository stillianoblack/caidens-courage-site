-- ROLLBACK ONLY. Never run as part of normal deployment.
alter table public.participants drop column if exists b4_variant_key;
notify pgrst, 'reload schema';
