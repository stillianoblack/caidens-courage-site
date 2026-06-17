import { isSupabaseConfigured, supabase } from './supabaseClient';

/** Counts student-role participants for a pilot program code. */
export async function fetchPilotProgramStudentCount(programCode: string): Promise<number> {
  const code = programCode.trim();
  if (!code || !isSupabaseConfigured() || !supabase) return 0;

  try {
    const { count, error } = await supabase
      .from('participants')
      .select('id', { count: 'exact', head: true })
      .eq('program_code', code)
      .eq('role', 'student');

    if (error) {
      if (/relation|does not exist/i.test(error.message)) return 0;
      console.warn('[pilot_programs] student count failed:', error.message);
      return 0;
    }

    return count ?? 0;
  } catch (err) {
    console.warn('[pilot_programs] student count error:', err);
    return 0;
  }
}
