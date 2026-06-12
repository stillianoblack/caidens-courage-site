import React from 'react';
import PilotDrawer from '../pilot-dashboard/PilotDrawer';
import './family-mobile-nav.css';

type FamilyMobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function FamilyMobileNavDrawer({
  open,
  onClose,
  children,
}: FamilyMobileNavDrawerProps) {
  return (
    <PilotDrawer
      open={open}
      onClose={onClose}
      className="pilot-drawer family-mobileNavDrawer"
      titleId="family-mobile-nav-title"
    >
      <div className="family-mobileNavDrawerInner">
        <button
          type="button"
          className="family-mobileNavDrawerClose"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
        {children}
      </div>
    </PilotDrawer>
  );
}
