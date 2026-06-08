import React from 'react';
import { assignPortalRoute } from '../../lib/portalHardNavigation';

type MirandaNavButtonProps = {
  to: string;
  label: string;
  variant?: 'hub-return' | 'hub-return-outline' | 'next-case';
  onClick?: () => void;
  className?: string;
};

function isPlainLeftClick(event: React.MouseEvent<HTMLAnchorElement>) {
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

export default function MirandaNavButton({
  to,
  label,
  variant = 'hub-return',
  onClick,
  className = '',
}: MirandaNavButtonProps) {
  return (
    <a
      href={to}
      onClick={(event) => {
        onClick?.();

        if (!isPlainLeftClick(event) || !isSameSiteRoute(to)) {
          return;
        }

        event.preventDefault();
        assignPortalRoute(to);
      }}
      className={['miranda-navBtn', `miranda-navBtn--${variant}`, className].filter(Boolean).join(' ')}
    >
      <span className="miranda-navBtnLabel">{label}</span>
    </a>
  );
}
