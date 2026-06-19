import React from 'react';
import SlideOutDrawer from '../../components/portal-design-system/SlideOutDrawer';
import { useMobileViewport } from '../../hooks/useMobileViewport';
import MobileFullScreenSheet from './MobileFullScreenSheet';
import './character-sheet-panel.css';
import './character-profile-sheet.css';

export type CharacterProfileSheetProps = {
  open: boolean;
  onClose: () => void;
  titleId?: string;
  panelClassName?: string;
  closeLabel?: string;
  children: React.ReactNode;
  variant?: 'portal' | 'kidShell';
};

function CharacterProfileSheetClose({
  onClose,
  closeLabel = 'Close panel',
}: {
  onClose: () => void;
  closeLabel?: string;
}) {
  const closeFromPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    event.preventDefault();
    event.stopPropagation();
    onClose();
  };

  const closeFromClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClose();
  };

  return (
    <button
      type="button"
      className="characterSheetPanelClose"
      onClick={closeFromClick}
      onPointerDown={closeFromPointer}
      aria-label={closeLabel}
    >
      ×
    </button>
  );
}

/** Narrow character bio sheet — desktop right rail (360–420px), mobile full-screen. */
export default function CharacterProfileSheet({
  open,
  onClose,
  titleId,
  panelClassName = '',
  closeLabel,
  children,
  variant = 'portal',
}: CharacterProfileSheetProps) {
  const isMobile = useMobileViewport();

  if (!open) return null;

  const shellClass = ['characterSheetPanelShell', panelClassName].filter(Boolean).join(' ');
  const kidShellClass = variant === 'kidShell' ? 'characterProfileSheet--kidShell' : '';

  if (isMobile) {
    return (
      <MobileFullScreenSheet
        open={open}
        onClose={onClose}
        titleId={titleId}
        closeLabel={closeLabel}
        className={[
          'characterProfileSheet',
          'characterProfileSheet--mobile',
          kidShellClass,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={shellClass}>{children}</div>
      </MobileFullScreenSheet>
    );
  }

  return (
    <SlideOutDrawer
      open={open}
      onClose={onClose}
      titleId={titleId}
      size="standard"
      className={[
        'pilot-drawer',
        'characterProfileSheet',
        'ds-slidePanel--characterProfile',
        kidShellClass,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={shellClass}>
        <CharacterProfileSheetClose onClose={onClose} closeLabel={closeLabel} />
        {children}
      </div>
    </SlideOutDrawer>
  );
}
