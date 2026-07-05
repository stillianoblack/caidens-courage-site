import React from 'react';
import { useLocation } from 'react-router-dom';
import CourageToolsPopupModal from './CourageToolsPopupModal';
import { useCourageToolsPopupTrigger } from '../hooks/useCourageToolsPopupTrigger';

const EXCLUDED_PATHS = new Set(['/focus-flame-lab']);
const KID_SAFE_PREFIXES = [
  '/kids',
  '/portal',
  '/play',
  '/game',
  '/games',
  '/access-code',
  '/play/session',
];

const shouldSuppressPopup = (pathname: string): boolean =>
  EXCLUDED_PATHS.has(pathname) ||
  KID_SAFE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

export default function CourageToolsPopup() {
  const { pathname } = useLocation();
  const enabled = !shouldSuppressPopup(pathname);
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
