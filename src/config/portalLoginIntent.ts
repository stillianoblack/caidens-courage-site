export type PortalLoginIntent = 'student' | 'parent' | 'facilitator';

export const PORTAL_LOGIN_INTENTS: Array<{
  id: PortalLoginIntent;
  label: string;
  helperText: string;
  credentialLabel: string;
  credentialPlaceholder: string;
  credentialHint: string;
}> = [
  {
    id: 'student',
    label: 'Student',
    helperText: 'Use your student PIN to continue the adventure.',
    credentialLabel: 'Student PIN',
    credentialPlaceholder: 'Enter student PIN',
    credentialHint: 'Enter your program access code and student PIN to open Weekly Adventures.',
  },
  {
    id: 'parent',
    label: 'Parent / Guardian',
    helperText:
      "Use your email if already connected, or your child's PIN to claim family access.",
    credentialLabel: 'Parent email or student PIN',
    credentialPlaceholder: 'Email or student PIN',
    credentialHint:
      'Connected parents use email. New parents can enter their child’s PIN to claim access.',
  },
  {
    id: 'facilitator',
    label: 'Facilitator',
    helperText: 'Use your facilitator email or access credentials to manage students.',
    credentialLabel: 'Facilitator email',
    credentialPlaceholder: 'Enter facilitator email',
    credentialHint: 'Enter your facilitator access code and email to open the program roster.',
  },
];

export function defaultPortalLoginIntent(audience?: string | null): PortalLoginIntent {
  if (audience === 'parents') return 'parent';
  if (audience === 'educators' || audience === 'schools' || audience === 'camps') {
    return 'facilitator';
  }
  return 'student';
}
