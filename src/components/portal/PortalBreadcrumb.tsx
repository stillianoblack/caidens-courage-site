import React from 'react';
import { assignPortalRoute } from '../../lib/portalHardNavigation';
import { resolveCharacterThemeColor } from '../game-assessment/shared/characterThemeColors';
import type { PortalBreadcrumbPortalType } from '../../lib/portalBreadcrumbNav';
import './portal-breadcrumb.css';

export type PortalBreadcrumbVariant = 'default' | 'game' | 'dashboard';

export type PortalBreadcrumbProps = {
  /** Full accessible label, e.g. “Back to Focus Flame Journey”. */
  label: string;
  href?: string;
  onClick?: () => void;
  portalType?: PortalBreadcrumbPortalType;
  variant?: PortalBreadcrumbVariant;
  /** Character theme token for chevron accent color */
  theme?: string;
  className?: string;
};

function isPlainLeftClick(event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function isSameSiteRoute(to: string) {
  try {
    const url = new URL(to, window.location.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

function ChevronIcon({ color }: { color: string }) {
  return (
    <span className="portal-breadcrumb-icon" style={{ color }} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M14 6 L8 12 L14 18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/**
 * Standard portal breadcrumb — chevron-left + navy label, top-left aligned.
 * Returns one logical level up in the current portal context.
 */
export default function PortalBreadcrumb({
  label,
  href,
  onClick,
  variant = 'default',
  theme,
  className = '',
}: PortalBreadcrumbProps) {
  const chevronColor = resolveCharacterThemeColor(theme);
  const rootClass = [
    'portal-breadcrumb',
    `portal-breadcrumb--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <a
        href={href}
        onClick={(event) => {
          onClick?.();

          if (!isPlainLeftClick(event) || !isSameSiteRoute(href)) {
            return;
          }

          event.preventDefault();
          assignPortalRoute(href);
        }}
        className={rootClass}
        aria-label={label}
      >
        <ChevronIcon color={chevronColor} />
        <span className="portal-breadcrumb-label">{label}</span>
      </a>
    );
  }

  return (
    <button
      type="button"
      className={rootClass}
      onClick={onClick}
      aria-label={label}
    >
      <ChevronIcon color={chevronColor} />
      <span className="portal-breadcrumb-label">{label}</span>
    </button>
  );
}
