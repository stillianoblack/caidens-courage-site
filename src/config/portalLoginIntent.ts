export type PortalLoginIntent = 'student' | 'parent' | 'facilitator';

export const PORTAL_LOGIN_INTENTS: Array<{
  id: PortalLoginIntent;
  label: string;
  credentialLabel: string;
  credentialPlaceholder: string;
  credentialHint: string;
}> = [
  {
    id: 'student',
    label: "I'm a Student",
    credentialLabel: 'Student PIN',
    credentialPlaceholder: 'Enter student PIN',
    credentialHint: 'Use your program access code and student PIN to continue your adventure.',
  },
  {
    id: 'parent',
    label: "I'm a Parent / Guardian",
    credentialLabel: 'Parent email or student PIN',
    credentialPlaceholder: 'Email or student PIN',
    credentialHint:
      'Use your parent email after claiming access, or enter a student PIN to connect your family account.',
  },
  {
    id: 'facilitator',
    label: "I'm a Facilitator",
    credentialLabel: 'Facilitator email',
    credentialPlaceholder: 'Enter facilitator email',
    credentialHint: 'Use your facilitator access code and email to open the program roster.',
  },
];

export function defaultPortalLoginIntent(audience?: string | null): PortalLoginIntent {
  if (audience === 'parents') return 'parent';
  if (audience === 'educators' || audience === 'schools' || audience === 'camps') {
    return 'facilitator';
  }
  return 'student';
}
