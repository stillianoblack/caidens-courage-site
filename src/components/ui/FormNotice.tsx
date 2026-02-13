import React, { useEffect, useState } from 'react';

export type FormNoticeVariant = 'success' | 'error' | 'info';

interface FormNoticeProps {
  variant: FormNoticeVariant;
  title: string;
  message: string;
  durationMs?: number;
  onClose?: () => void;
  showProgress?: boolean;
}

const ICONS: Record<FormNoticeVariant, string> = {
  success: '✨',
  error: '⚠️',
  info: 'ℹ️',
};

export default function FormNotice({
  variant,
  title,
  message,
  durationMs = 4000,
  onClose,
  showProgress = true,
}: FormNoticeProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (durationMs <= 0) return;
    const start = Date.now();
    const frame = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(p);
      if (p < 100) requestAnimationFrame(frame);
      else onClose?.();
    };
    const id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [durationMs, onClose]);

  const handleClose = () => onClose?.();

  const iconBgClass =
    variant === 'success'
      ? 'bg-amber-50'
      : variant === 'error'
        ? 'bg-red-50'
        : 'bg-navy-50';

  return (
    <div className="relative mt-4 rounded-2xl border border-[#E7EEF7] bg-white p-4 shadow-[0_4px_16px_rgba(31,60,99,0.08)]">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${iconBgClass} text-lg`}
          aria-hidden
        >
          {ICONS[variant]}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-display font-bold text-navy-700">{title}</h4>
          <p className="mt-0.5 text-sm text-[#4E6A86]">{message}</p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="flex-shrink-0 rounded-full p-1 text-navy-400 hover:bg-navy-50 hover:text-navy-600 transition-colors"
          aria-label="Close"
        >
          <span className="text-xl leading-none">×</span>
        </button>
      </div>
      {showProgress && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-navy-100">
          <div
            className="h-full rounded-full bg-golden-500 transition-all duration-150 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
