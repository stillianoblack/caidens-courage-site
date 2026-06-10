import React from 'react';
import type { ToastVariant } from './ToastProvider';

export type B4ToastSource = 'b4' | 'system';

const B4_AVATAR_SRC = '/images/icons/B4_Chat_Icon.webp';

export type B4ToastNotificationProps = {
  message: string;
  variant: ToastVariant;
  source?: B4ToastSource;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
};

export default function B4ToastNotification({
  message,
  variant,
  source = 'b4',
  actionLabel,
  onAction,
  onDismiss,
}: B4ToastNotificationProps) {
  const isB4 = source !== 'system';

  return (
    <div
      className={[
        'ds-b4Toast',
        `ds-b4Toast--${variant}`,
        isB4 ? 'ds-b4Toast--branded' : 'ds-b4Toast--system',
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      {isB4 ? (
        <div className="ds-b4ToastAvatarWrap" aria-hidden="true">
          <img src={B4_AVATAR_SRC} alt="" className="ds-b4ToastAvatar" decoding="async" />
        </div>
      ) : (
        <span className="ds-b4ToastSystemIcon" aria-hidden="true" />
      )}

      <div className="ds-b4ToastBody">
        {isB4 ? <span className="ds-b4ToastLabel">B-4</span> : null}
        <p className="ds-b4ToastMessage">{message}</p>
        {actionLabel && onAction ? (
          <button type="button" className="ds-b4ToastAction" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
      </div>

      <button
        type="button"
        className="ds-b4ToastClose"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  );
}
