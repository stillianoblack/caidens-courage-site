import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './facilitator-drawer.css';

export type FacilitatorDrawerSize = 'compact' | 'standard' | 'wide';
export type FacilitatorDrawerAccent = 'orange' | 'blue' | 'navy';

type FacilitatorDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  eyebrow: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  characterSrc?: string;
  characterAlt?: string;
  accent?: FacilitatorDrawerAccent;
  size?: FacilitatorDrawerSize;
  footer?: React.ReactNode;
  className?: string;
  loading?: boolean;
  closeOnBackdrop?: boolean;
  titleId?: string;
  descriptionId?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
};

const ACTIVE_DRAWER_EVENT = 'facilitator-drawer:open';
let drawerSequence = 0;

function focusableElements(node: HTMLElement): HTMLElement[] {
  return Array.from(node.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter((element) => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true');
}

export default function FacilitatorDrawer({
  open,
  onClose,
  title,
  eyebrow,
  description,
  children,
  characterSrc = '/images/Choose-Your-Guide/b-4facilitator.webp',
  characterAlt = '',
  accent = 'orange',
  size = 'standard',
  footer,
  className = '',
  loading = false,
  closeOnBackdrop = true,
  titleId: suppliedTitleId,
  descriptionId: suppliedDescriptionId,
  initialFocusRef,
}: FacilitatorDrawerProps) {
  const reactId = useId();
  const titleId = suppliedTitleId ?? `facilitator-drawer-title-${reactId}`;
  const descriptionId = suppliedDescriptionId ?? `facilitator-drawer-description-${reactId}`;
  const drawerIdRef = useRef(`facilitator-drawer-${++drawerSequence}`);
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const [mounted, setMounted] = useState(open);

  onCloseRef.current = onClose;

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    const handleAnotherDrawer = (event: Event) => {
      const activeId = (event as CustomEvent<string>).detail;
      if (open && activeId !== drawerIdRef.current) onCloseRef.current();
    };
    window.addEventListener(ACTIVE_DRAWER_EVENT, handleAnotherDrawer);
    return () => window.removeEventListener(ACTIVE_DRAWER_EVENT, handleAnotherDrawer);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    window.dispatchEvent(new CustomEvent(ACTIVE_DRAWER_EVENT, { detail: drawerIdRef.current }));

    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth) document.body.style.paddingRight = `${scrollbarWidth}px`;

    const focusTimer = window.requestAnimationFrame(() => {
      (initialFocusRef?.current ?? closeRef.current)?.focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const items = focusableElements(panelRef.current);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
    };
  }, [initialFocusRef, open]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="facilitatorDrawerRoot"
      data-state={open ? 'open' : 'closed'}
      aria-hidden={!open}
      onTransitionEnd={(event) => {
        if (!open && event.target === event.currentTarget) setMounted(false);
      }}
    >
      <button
        type="button"
        className="facilitatorDrawerBackdrop"
        aria-label="Close drawer"
        tabIndex={open ? 0 : -1}
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <aside
        ref={panelRef}
        className={`facilitatorDrawer facilitatorDrawer--${size} facilitatorDrawer--${accent} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        aria-busy={loading || undefined}
        tabIndex={-1}
      >
        <header className="facilitatorDrawerHeader">
          {characterSrc ? (
            <img className="facilitatorDrawerCharacter" src={characterSrc} alt={characterAlt} />
          ) : null}
          <div className="facilitatorDrawerHeaderText">
            <span className="facilitatorDrawerEyebrow">{eyebrow}</span>
            <h2 id={titleId} className="facilitatorDrawerTitle">{title}</h2>
            {description ? <p id={descriptionId} className="facilitatorDrawerDescription">{description}</p> : null}
          </div>
          <button ref={closeRef} type="button" className="facilitatorDrawerClose" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="facilitatorDrawerBody">
          {loading ? (
            <div className="facilitatorDrawerLoading" role="status" aria-live="polite">
              <span className="facilitatorDrawerLoadingLine" />
              <span className="facilitatorDrawerLoadingLine facilitatorDrawerLoadingLine--short" />
              <span className="facilitatorDrawerLoadingBlock" />
              <span className="sr-only">Loading drawer content…</span>
            </div>
          ) : children}
        </div>
        {footer ? <footer className="facilitatorDrawerFooter">{footer}</footer> : null}
      </aside>
    </div>,
    document.body,
  );
}
