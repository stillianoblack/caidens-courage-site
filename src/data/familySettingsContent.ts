export type FamilySettingsTabId =
  | 'overview'
  | 'family-goals'
  | 'children'
  | 'parent-guardian'
  | 'family-access'
  | 'notifications'
  | 'plan'
  | 'privacy';

export const FAMILY_SETTINGS_TABS: Array<{ id: FamilySettingsTabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'family-goals', label: 'Family Goals' },
  { id: 'children', label: 'Children' },
  { id: 'parent-guardian', label: 'Parent/Guardian Info' },
  { id: 'family-access', label: 'Family Access' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'plan', label: 'Plan' },
  { id: 'privacy', label: 'Privacy' },
];

export const FAMILY_SETTINGS_PAGE = {
  title: 'Settings',
  subtitle:
    'Manage your family goals, child profiles, access, reminders, and plan.',
} as const;

export const DEFAULT_FAMILY_SETTINGS_TAB: FamilySettingsTabId = 'overview';
