import React, { useCallback, useEffect, useState } from 'react';
import {
  disablePushReminders,
  enablePushReminders,
  isPushSupportedInBrowser,
  resolvePushReminderStatus,
  type PushReminderStatusResult,
} from '../../../lib/pushSubscriptionService';

const INITIAL_STATUS: PushReminderStatusResult = {
  status: 'off',
  label: 'Checking…',
  permission: 'unsupported',
  subscribed: false,
};

export default function FamilyPushNotificationsCard() {
  const supported = isPushSupportedInBrowser();
  const [status, setStatus] = useState<PushReminderStatusResult>(INITIAL_STATUS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const next = await resolvePushReminderStatus();
    setStatus(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleEnable = useCallback(async () => {
    setSubmitting(true);
    setMessage(null);
    const result = await enablePushReminders();
    setSubmitting(false);
    if (!result.ok) {
      setMessage(result.message ?? 'Could not enable reminders.');
      await refresh();
      return;
    }
    setMessage('Reminders enabled — we will notify you about mission progress and session updates.');
    await refresh();
  }, [refresh]);

  const handleDisable = useCallback(async () => {
    setSubmitting(true);
    setMessage(null);
    const result = await disablePushReminders();
    setSubmitting(false);
    if (!result.ok) {
      setMessage(result.message ?? 'Could not disable reminders.');
      return;
    }
    setMessage('Reminders off.');
    await refresh();
  }, [refresh]);

  const statusLabel = loading ? 'Checking…' : status.label;
  const remindersEnabled = status.status === 'enabled';
  const canEnable =
    supported &&
    status.status !== 'unavailable' &&
    status.status !== 'not_configured' &&
    status.permission !== 'denied';

  return (
    <div className="family-settingsPushCard">
      <p className="family-settingsPushLead">
        Get notified when your child completes a weekly mission, earns a reward, or when a shared
        device session pauses or ends. We never send reminders directly to kids.
      </p>
      <dl className="family-settingsGrid">
        <div className="family-settingsRow">
          <dt>Status</dt>
          <dd>
            <span
              className={
                remindersEnabled
                  ? 'family-settingsPushStatus family-settingsPushStatus--on'
                  : 'family-settingsPushStatus'
              }
            >
              {statusLabel}
            </span>
          </dd>
        </div>
      </dl>
      {message ? <p className="family-settingsPushMessage">{message}</p> : null}
      <div className="family-settingsActions">
        {!remindersEnabled ? (
          <button
            type="button"
            className="family-settingsPrimaryBtn"
            disabled={!canEnable || submitting || loading}
            onClick={() => void handleEnable()}
          >
            Enable reminders
          </button>
        ) : (
          <button
            type="button"
            className="family-settingsGhostBtn"
            disabled={submitting}
            onClick={() => void handleDisable()}
          >
            Disable reminders
          </button>
        )}
      </div>
    </div>
  );
}
