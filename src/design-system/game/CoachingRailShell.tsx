import React from 'react';
import '../components/learning-moment.css';

export type CoachingRailShellVariant = 'b4' | 'facilitator' | 'placeholder';

export type CoachingRailShellProps = {
  variant?: CoachingRailShellVariant;
  children: React.ReactNode;
  className?: string;
  /** Vertical offset so chevron points at selected answer row */
  caretTop?: number;
  shellRef?: React.Ref<HTMLDivElement>;
};

export default function CoachingRailShell({
  variant = 'b4',
  children,
  className = '',
  caretTop,
  shellRef,
}: CoachingRailShellProps) {
  return (
    <div
      ref={shellRef}
      className={[
        'ds-coachingRailShell',
        `ds-coachingRailShell--${variant}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        {
          '--coaching-caret-top': caretTop !== undefined ? `${caretTop}px` : '1.25rem',
        } as React.CSSProperties
      }
    >
      <div className="ds-coachingRailCaret" aria-hidden="true" />
      <div className="ds-coachingRailBody">{children}</div>
    </div>
  );
}
