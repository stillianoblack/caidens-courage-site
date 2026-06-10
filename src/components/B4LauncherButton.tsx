import React from 'react';

type B4LauncherButtonProps = {
  onClick: () => void;
  className?: string;
};

/** Shared floating B-4 launcher — compact on mobile, labeled on desktop. */
export default function B4LauncherButton({ onClick, className = '' }: B4LauncherButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'fixed flex items-center justify-center gap-2.5',
        'rounded-full border border-golden-500/60 bg-[#050B18]/95 text-white font-bold',
        'shadow-[0_0_0_1px_rgba(240,206,110,0.14),0_12px_28px_-14px_rgba(240,206,110,0.5)]',
        'transition-all duration-200',
        'hover:border-golden-500/80 hover:shadow-[0_0_0_1px_rgba(240,206,110,0.18),0_16px_36px_-14px_rgba(240,206,110,0.65)]',
        'bottom-4 right-4 h-12 w-12 p-0',
        'sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:px-4 sm:py-2.5',
        className,
      ].join(' ')}
      aria-label="Ask B-4"
    >
      <img
        src="/images/icons/B4_Chat_Icon.webp"
        alt=""
        aria-hidden="true"
        className="h-9 w-9 flex-shrink-0 object-contain sm:h-10 sm:w-10"
        decoding="async"
      />
      <span className="hidden leading-none sm:inline">Ask B-4</span>
    </button>
  );
}
