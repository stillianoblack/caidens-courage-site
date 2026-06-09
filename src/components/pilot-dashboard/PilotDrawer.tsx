import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';

type PilotDrawerProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  titleId?: string;
};

export default function PilotDrawer({
  open,
  onClose,
  children,
  className = 'pilot-drawer',
  titleId,
}: PilotDrawerProps) {
  useModalScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return createPortal(
    <div className="pilot-drawerBackdrop" role="presentation" onClick={onClose}>
      <aside
        className={className}
        role="dialog"
        aria-labelledby={titleId}
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </aside>
    </div>,
    document.body,
  );
}
