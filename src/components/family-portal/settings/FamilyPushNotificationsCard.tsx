import React, { useCallback, useState } from 'react';
import {
  FAMILY_NOTIFICATION_PREFERENCES,
  readFamilyNotificationPreferences,
  writeFamilyNotificationPreferences,
  type FamilyNotificationPreferenceId,
  type FamilyNotificationPreferencesState,
} from '../../../lib/familyNotificationPreferences';

function emailNotificationsConfigured(): boolean {
  return (
    process.env.REACT_APP_EMAIL_NOTIFICATIONS_ACTIVE === 'true' ||
    process.env.REACT_APP_RESEND_CONFIGURED === 'true'
  );
}

export default function FamilyPushNotificationsCard() {
  const [saved, setSaved] = useState(false);
  const [preferences, setPreferences] = useState<FamilyNotificationPreferencesState>(() =>
    readFamilyNotificationPreferences(),
  );
  const showEmailStatus = emailNotificationsConfigured();

  const handleToggle = useCallback((id: FamilyNotificationPreferenceId) => {
    setSaved(false);
    setPreferences((current) => ({ ...current, [id]: !current[id] }));
  }, []);

  const handleSavePreferences = useCallback(() => {
    writeFamilyNotificationPreferences(preferences);
    setSaved(true);
  }, [preferences]);

  return (
    <div className="family-settingsPushCard">
      <p className="family-settingsPushLead">
        Choose which updates you want to receive. We never send parent reminders directly to kids.
      </p>
      <p className="family-settingsPushCopy">
        These preferences are for parent/guardian notifications only.
      </p>
      <div className="family-settingsNotifications">
        {FAMILY_NOTIFICATION_PREFERENCES.map((preference) => (
          <label key={preference.id} className="family-settingsToggleRow">
            <input
              type="checkbox"
              checked={preferences[preference.id]}
              onChange={() => handleToggle(preference.id)}
            />
            <span>{preference.label}</span>
          </label>
        ))}
      </div>
      {showEmailStatus ? (
        <dl className="family-settingsGrid">
          <div className="family-settingsRow">
            <dt>Status</dt>
            <dd>
              <span className="family-settingsPushStatus family-settingsPushStatus--on">
                Email notifications active
              </span>
            </dd>
          </div>
        </dl>
      ) : null}
      <div className="family-settingsActions">
        <button
          type="button"
          className="family-settingsPrimaryBtn"
          onClick={handleSavePreferences}
        >
          Save Preferences
        </button>
      </div>
      {saved ? <p className="family-settingsPushMessage">Preferences saved.</p> : null}
    </div>
  );
}
