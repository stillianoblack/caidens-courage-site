import type { PilotWaitlistSubmission } from '../types/pilotWaitlist';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export type PilotWaitlistResult = {
  ok: boolean;
  error?: string;
};

const SUBMIT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function submitPilotWaitlist(
  submission: PilotWaitlistSubmission,
): Promise<PilotWaitlistResult> {
  const parentEmail = submission.parent_email.trim();
  if (!parentEmail) {
    return { ok: false, error: 'Please enter your email.' };
  }
  if (!isValidEmail(parentEmail)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, error: SUBMIT_ERROR_MESSAGE };
  }

  const { error } = await supabase.from('pilot_waitlist').insert({
    parent_name: submission.parent_name.trim(),
    parent_email: parentEmail,
    child_age: submission.child_age?.trim() || null,
    source: submission.source,
    interest_type: submission.interest_type,
    page_path: submission.page_path,
  });

  if (error) {
    console.error('[pilot_waitlist] insert failed:', error.message);
    return { ok: false, error: SUBMIT_ERROR_MESSAGE };
  }

  return { ok: true };
}
