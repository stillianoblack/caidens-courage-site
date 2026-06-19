import { readParentClaimContext } from '../config/parentClaimContext';

export type FamilyNotificationPreferenceId =
  | 'weekly_mission_completed'
  | 'new_certificate_earned'
  | 'reward_unlocked'
  | 'child_inactive_7_days'
  | 'new_family_activity_available'
  | 'camp_facilitator_message'
  | 'shared_device_session_ended';

export type FamilyNotificationPreference = {
  id: FamilyNotificationPreferenceId;
  label: string;
};

export const FAMILY_NOTIFICATION_PREFERENCES: FamilyNotificationPreference[] = [
  { id: 'weekly_mission_completed', label: 'Weekly mission completed' },
  { id: 'new_certificate_earned', label: 'New certificate earned' },
  { id: 'reward_unlocked', label: 'Reward unlocked' },
  { id: 'child_inactive_7_days', label: 'Child inactive for 7+ days' },
  { id: 'new_family_activity_available', label: 'New family activity available' },
  { id: 'camp_facilitator_message', label: 'Camp/facilitator message' },
  { id: 'shared_device_session_ended', label: 'Shared device session ended' },
];

export type FamilyNotificationPreferencesState = Record<FamilyNotificationPreferenceId, boolean>;

const STORAGE_PREFIX = 'cc-family-notification-preferences';

function defaultPreferences(): FamilyNotificationPreferencesState {
  return FAMILY_NOTIFICATION_PREFERENCES.reduce((next, preference) => {
    next[preference.id] = true;
    return next;
  }, {} as FamilyNotificationPreferencesState);
}

function storageKey(): string {
  const claim = readParentClaimContext();
  const owner = claim?.email?.trim().toLowerCase() || claim?.phone?.replace(/\D/g, '') || 'local';
  return `${STORAGE_PREFIX}:${owner}`;
}

export function readFamilyNotificationPreferences(): FamilyNotificationPreferencesState {
  const defaults = defaultPreferences();
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = window.localStorage.getItem(storageKey());
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<FamilyNotificationPreferencesState>;
    return FAMILY_NOTIFICATION_PREFERENCES.reduce((next, preference) => {
      next[preference.id] = parsed[preference.id] ?? defaults[preference.id];
      return next;
    }, {} as FamilyNotificationPreferencesState);
  } catch {
    return defaults;
  }
}

export function writeFamilyNotificationPreferences(
  preferences: FamilyNotificationPreferencesState,
): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(preferences));
  } catch {
    /* localStorage unavailable */
  }
}
