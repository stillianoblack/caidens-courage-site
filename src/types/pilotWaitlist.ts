export type PilotInterestType = 'focus_flame_lab' | 'b4_tools' | 'general_pilot';

export type PilotWaitlistSource =
  | 'School'
  | 'Camp'
  | 'Friend'
  | 'Social Media'
  | 'Other';

export type PilotWaitlistSubmission = {
  parent_name: string;
  parent_email: string;
  child_age?: string | null;
  source: PilotWaitlistSource;
  interest_type: PilotInterestType;
  page_path: string;
};

export const PILOT_WAITLIST_SOURCE_OPTIONS: readonly PilotWaitlistSource[] = [
  'School',
  'Camp',
  'Friend',
  'Social Media',
  'Other',
] as const;
