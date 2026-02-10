import React from "react";

type InlineNoticeProps = {
  open: boolean;
  title?: string;
  message: string;
  onClose?: () => void;
  /**
   * Use a changing key (e.g. Date.now()) to restart progress animation
   * whenever the notice is re-opened.
   */
  noticeKey?: number | string;
  durationMs?: number;
};

export default function InlineNotice({
  open,
  title = "Digital edition coming soon",
  message,
  onClose,
  noticeKey,
  durationMs = 4000,
}: InlineNoticeProps) {
  const durationSec = Math.max(0.5, durationMs / 1000);

  return (
    <div
      id="digital-download-notice"
      role="status"
      aria-live="polite"
      className={`
        mt-3
        transition-all duration-300 ease-out
        ${open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}
      `}
    >
      <div
        className="
          relative w-full max-w-[520px]
          overflow-hidden rounded-2xl
          border border-slate-200/70 bg-white/95
          shadow-[0_14px_40px_rgba(2,6,23,0.14)]
          backdrop-blur
        "
      >
        {/* top accent */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-300 via-amber-200 to-sky-200" />

        <div className="px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex items-start gap-3">
            {/* icon */}
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <span className="text-lg">✨</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold text-slate-900">
                    {title}
                  </div>
                  <p className="mt-1 text-[14px] leading-relaxed text-slate-600">
                    {message}
                  </p>
                </div>

                {onClose ? (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close notification"
                    className="
                      -mt-1 inline-flex h-9 w-9 items-center justify-center
                      rounded-full text-slate-500
                      hover:bg-slate-100 hover:text-slate-700
                      active:scale-[0.96]
                      transition
                    "
                  >
                    <span className="text-xl leading-none">×</span>
                  </button>
                ) : null}
              </div>

              {/* progress bar */}
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  key={noticeKey}
                  className="h-full w-full origin-left rounded-full bg-gradient-to-r from-amber-300 to-amber-400"
                  style={{
                    animation: open ? `ccNoticeProgress ${durationSec}s linear forwards` : undefined,
                  }}
                />
              </div>

              <style>{`
                @keyframes ccNoticeProgress {
                  from { transform: scaleX(1); }
                  to   { transform: scaleX(0); }
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
