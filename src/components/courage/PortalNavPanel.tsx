import React from 'react';
import { Link } from 'react-router-dom';
import { PORTAL_QUICK_LINKS } from '../../config/courageNav';
import PortalAccessForm from './PortalAccessForm';

type PortalNavPanelProps = {
  accessCode: string;
  error: string | null;
  onAccessCodeChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onLinkClick?: () => void;
  /** Slightly tighter spacing for mobile menu */
  compact?: boolean;
};

export default function PortalNavPanel({
  accessCode,
  error,
  onAccessCodeChange,
  onSubmit,
  onLinkClick,
  compact = false,
}: PortalNavPanelProps) {
  return (
    <div className={`cc-portal-nav-panel ${compact ? 'cc-portal-nav-panel--compact' : ''}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-500 sm:text-[11px]">
        Have a Courage Code?
      </p>

      <div className="mt-3">
        <PortalAccessForm
          variant="nav"
          accessCode={accessCode}
          error={error}
          onAccessCodeChange={onAccessCodeChange}
          onSubmit={onSubmit}
        />
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-navy-500/75 sm:text-xs">
        Pilot access codes are used during early testing.
      </p>

      <div className="my-4 border-t border-navy-100" role="separator" />

      <ul className="space-y-0.5">
        {PORTAL_QUICK_LINKS.map((item) => (
          <li key={item.href}>
            <Link
              to={item.href}
              onClick={onLinkClick}
              className="block rounded-lg px-2 py-2 text-sm font-semibold text-navy-600 transition-colors hover:bg-navy-50 hover:text-navy-800"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
