import React from 'react';

type SoundToggleButtonProps = {
  soundEnabled: boolean;
  onToggle: () => void;
  className?: string;
};

export default function SoundToggleButton({
  soundEnabled,
  onToggle,
  className = '',
}: SoundToggleButtonProps) {
  return (
    <button
      type="button"
      className={[
        'bbc-soundBtn',
        soundEnabled ? 'bbc-soundBtn--on' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onToggle}
      aria-label={soundEnabled ? 'Turn sound effects off' : 'Turn sound effects on'}
      aria-pressed={soundEnabled}
    >
      <svg className="bbc-soundIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M11 5L6 9H3v6h3l5 4V5z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {soundEnabled ? (
          <>
            <path d="M15.5 8.5a5 5 0 010 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M18 6a8.5 8.5 0 010 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <path d="M16 9l-6 6M10 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}
