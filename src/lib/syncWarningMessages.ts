/** Map internal sync error codes to user-facing copy (dev-friendly). */
export function resolveSyncWarningMessage(warning?: string | null): string | null {
  if (!warning?.trim()) return null;
  if (warning === 'missing_env') {
    return 'Supabase is not connected on this dev server. Check .env.local has REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY, then fully restart yarn start. If the terminal shows a different port (e.g. 3001), use that URL — an older tab on port 3000 will not have env vars.';
  }
  return warning;
}
