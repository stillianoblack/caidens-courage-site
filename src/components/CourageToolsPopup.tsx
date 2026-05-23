import React from 'react';
import { useLocation } from 'react-router-dom';
import CourageToolsPopupModal from './CourageToolsPopupModal';
import { useCourageToolsPopupTrigger } from '../hooks/useCourageToolsPopupTrigger';

const EXCLUDED_PATHS = new Set(['/focus-flame-lab']);

export default function CourageToolsPopup() {
  const { pathname } = useLocation();
  const enabled = !EXCLUDED_PATHS.has(pathname);
  const { armed, isOpen, closePopup, dismiss, markSubmitted } = useCourageToolsPopupTrigger(enabled);

  if (!armed && !isOpen) return null;

  return (
    <CourageToolsPopupModal
      isOpen={isOpen}
      onClose={dismiss}
      onCloseAfterSuccess={closePopup}
      onSuccess={markSubmitted}
    />
  );
}
