import React, { useCallback, useState } from 'react';

type CollapsibleCardProps = {
  title: string;
  storageKey?: string;
  defaultCollapsed?: boolean;
  helperText?: string;
  className?: string;
  children: React.ReactNode;
};

function readCollapsed(storageKey: string | undefined, defaultCollapsed: boolean): boolean {
  if (!storageKey) return defaultCollapsed;
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
  } catch {
    /* localStorage unavailable */
  }
  return defaultCollapsed;
}

function writeCollapsed(storageKey: string | undefined, collapsed: boolean): void {
  if (!storageKey) return;
  try {
    localStorage.setItem(storageKey, collapsed ? 'true' : 'false');
  } catch {
    /* localStorage unavailable */
  }
}

export default function CollapsibleCard({
  title,
  storageKey,
  defaultCollapsed = false,
  helperText,
  className = '',
  children,
}: CollapsibleCardProps) {
  const [collapsed, setCollapsed] = useState(() => readCollapsed(storageKey, defaultCollapsed));

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      writeCollapsed(storageKey, next);
      return next;
    });
  }, [storageKey]);

  return (
    <section className={`ds-collapsibleCard${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className="ds-collapsibleCardToggle"
        onClick={toggle}
        aria-expanded={!collapsed}
      >
        <span className="ds-collapsibleCardTitle">{title}</span>
        <span className="ds-collapsibleCardAction">
          {collapsed ? 'Expand' : 'Collapse'}
          <svg
            className={`ds-collapsibleCardChevron${collapsed ? '' : ' ds-collapsibleCardChevron--open'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>
      {helperText && !collapsed ? <p className="ds-collapsibleCardHelper">{helperText}</p> : null}
      {!collapsed ? <div className="ds-collapsibleCardBody">{children}</div> : null}
    </section>
  );
}
