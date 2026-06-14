import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './mobile-full-screen-sheet.css';

export type MobileFullScreenSheetProps = {
  open: boolean;
  onClose: () => void;
  titleId?: string;
  closeLabel?: string;
  className?: string;
  children: React.ReactNode;
};

/** Full-viewport mobile sheet — shadcn Sheet/Dialog structure (overlay + content + close). */
export default function MobileFullScreenSheet({
  open,
  onClose,
  titleId,
  closeLabel = 'Close panel',
  className = '',
  children,
}: MobileFullScreenSheetProps) {
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const contentClass = ['ds-sheetContent', className].filter(Boolean).join(' ');

  return createPortal(
    <div className="ds-sheetRoot" data-state="open">
      <button
        type="button"
        className="ds-sheetOverlay"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <aside
        className={contentClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="ds-sheetClose"
          aria-label={closeLabel}
          onClick={onClose}
        >
          ×
        </button>
        {children}
      </aside>
    </div>,
    document.body,
  );
}
