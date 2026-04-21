import React from 'react';
import { useCountdownBar } from '../hooks/useCountdownBar';

export type GlobalNotificationTone = 'info' | 'success' | 'warning' | 'error';

interface GlobalNotificationProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  tone?: GlobalNotificationTone;
  show: boolean;
  durationMs?: number;
  autoClose?: boolean;
  onClose: () => void;
}

const DEFAULT_ICONS: Record<GlobalNotificationTone, React.ReactNode> = {
  info: '✨',
  success: '✓',
  warning: '⚠️',
  error: '⚠️',
};

const ICON_BG: Record<GlobalNotificationTone, string> = {
  info: 'bg-amber-100',
  success: 'bg-amber-100',
  warning: 'bg-amber-100',
  error: 'bg-red-50',
};

export default function GlobalNotification({
  title,
  message,
  icon,
  tone = 'info',
  show,
  durationMs = 4000,
  autoClose = true,
  onClose,
}: GlobalNotificationProps) {
  const progress = useCountdownBar(show && autoClose, durationMs, onClose);

  const displayIcon = icon ?? DEFAULT_ICONS[tone];
  const iconBgClass = ICON_BG[tone];

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-4 overflow-hidden rounded-2xl border border-[#E7EEF7] bg-white shadow-[0_4px_16px_rgba(31,60,99,0.08)]"
    >
      <div className="px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${iconBgClass} text-lg`}
            aria-hidden
          >
            {displayIcon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-display font-bold text-navy-700">{title}</h4>
                <p className="mt-0.5 text-sm text-[#4E6A86] leading-relaxed">
                  {message}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close notification"
                className="flex-shrink-0 rounded-full p-1 text-navy-400 hover:bg-navy-50 hover:text-navy-600 transition-colors"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            {/* Countdown bar: width decreases from 100% to 0 */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-navy-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-400 transition-transform duration-75 ease-linear"
                style={{
                  width: `${progress * 100}%`,
                  transformOrigin: 'left',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
