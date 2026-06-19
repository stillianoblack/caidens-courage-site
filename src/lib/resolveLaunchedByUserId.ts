import { isSupabaseConfigured, supabase } from './supabaseClient';

/** Best-effort Supabase auth user id for kid_play_sessions.launched_by_user_id. */
export async function resolveLaunchedByUserId(): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id?.trim() || null;
  } catch {
    return null;
  }
}
