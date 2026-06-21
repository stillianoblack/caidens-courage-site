import { isSupabaseConfigured, supabase } from './supabaseClient';
import { fetchParticipantsByIds } from './studentFamilyLinkService';
import { isValidSupabaseParticipantId } from './pilotTrackingService';

function normalizeEmail(value?: string | null): string {
  return value?.trim().toLowerCase() ?? '';
}

/** Resolve parent/guardian emails linked to a student participant. Never returns student emails. */
export async function resolveParentEmailsForStudent(participantId: string): Promise<string[]> {
  const id = participantId.trim();
  if (!isValidSupabaseParticipantId(id)) return [];

  const emails = new Set<string>();

  if (isSupabaseConfigured() && supabase) {
    const { data: links } = await supabase
      .from('student_family_links')
      .select('parent_email')
      .eq('student_id', id);

    for (const link of links ?? []) {
      const email = normalizeEmail(link.parent_email);
      if (email) emails.add(email);
    }

    const { data: participant } = await supabase
      .from('participants')
      .select('guardian_email')
      .eq('id', id)
      .eq('role', 'student')
      .maybeSingle();

    const guardianEmail = normalizeEmail(participant?.guardian_email);
    if (guardianEmail) emails.add(guardianEmail);
  }

  if (!emails.size) {
    const { participants } = await fetchParticipantsByIds([id]);
    const row = participants[0] as { guardian_email?: string | null } | undefined;
    const guardianEmail = normalizeEmail(row?.guardian_email);
    if (guardianEmail) emails.add(guardianEmail);
  }

  return Array.from(emails);
}
