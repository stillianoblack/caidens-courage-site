import React from 'react';
import SlideOutDrawer from '../../components/portal-design-system/SlideOutDrawer';
import { useMobileViewport } from '../../hooks/useMobileViewport';
import MobileFullScreenSheet from './MobileFullScreenSheet';
import './character-sheet-panel.css';
import './weekly-review-sheet.css';
import './mobile-full-screen-sheet.css';

export type WeeklyReviewSheetProps = {
  open: boolean;
  onClose: () => void;
  titleId?: string;
  closeLabel?: string;
  children: React.ReactNode;
};

/** Week review sheet — same narrow rail as CharacterProfileSheet (360–420px), full-screen mobile. */
export default function WeeklyReviewSheet({
  open,
  onClose,
  titleId,
  closeLabel = 'Close week review',
  children,
}: WeeklyReviewSheetProps) {
  const isMobile = useMobileViewport();

  if (!open) return null;

  if (isMobile) {
    return (
      <MobileFullScreenSheet
        open={open}
        onClose={onClose}
        titleId={titleId}
        closeLabel={closeLabel}
        className="weeklyReviewSheet weeklyReviewSheet--mobile weekReviewPanel"
      >
        {children}
      </MobileFullScreenSheet>
    );
  }

  return (
    <SlideOutDrawer
      open={open}
      onClose={onClose}
      titleId={titleId}
      size="standard"
      className="pilot-drawer weeklyReviewSheet weekReviewPanel ds-slidePanel--weeklyReview"
    >
      <div className="weeklyReviewSheetShell">
        <button
          type="button"
          className="characterSheetPanelClose weeklyReviewSheetClose"
          onClick={onClose}
          aria-label={closeLabel}
        >
          ×
        </button>
        {children}
      </div>
    </SlideOutDrawer>
  );
}
