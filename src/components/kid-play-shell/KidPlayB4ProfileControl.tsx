import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { B4_VARIANTS } from '../../data/b4/variantManifest';
import { useB4Variant } from '../../hooks/useB4Variant';
import B4CircleAvatar from '../b4/B4CircleAvatar';
import B4VariantSelector from '../b4/B4VariantSelector';

type KidPlayB4ProfileControlProps = {
  participantId: string;
  displayName: string;
};

export default function KidPlayB4ProfileControl({
  participantId,
  displayName,
}: KidPlayB4ProfileControlProps) {
  const { variant, selectionRequired, loading, error } = useB4Variant(participantId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const changeButtonRef = useRef<HTMLButtonElement | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const definition = B4_VARIANTS[variant];
  const unavailable = Boolean(error) || selectionRequired;
  const triggerLabel = loading
    ? `Loading B-4 for ${displayName}`
    : error
      ? `B-4 unavailable for ${displayName}`
      : selectionRequired
        ? `Choose a B-4 for ${displayName}`
        : `Open ${displayName}'s ${definition.name} profile`;

  useEffect(() => {
    setMenuOpen(false);
    setPickerOpen(false);
  }, [participantId]);

  useEffect(() => {
    if (!menuOpen && !pickerOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const wasPickerOpen = pickerOpen;
        setPickerOpen(false);
        setMenuOpen(false);
        window.setTimeout(() => triggerRef.current?.focus(), 0);
        if (wasPickerOpen) event.stopPropagation();
        return;
      }
      if (event.key === 'Tab' && pickerOpen && pickerRef.current) {
        const focusable = Array.from(
          pickerRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen, pickerOpen]);

  useEffect(() => {
    if (!menuOpen || pickerOpen) return undefined;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [menuOpen, pickerOpen]);

  useEffect(() => {
    if (!pickerOpen) return;
    const closeButton = pickerRef.current?.querySelector<HTMLButtonElement>('.kidPlayB4PickerClose');
    closeButton?.focus();
  }, [pickerOpen]);

  const closePicker = () => {
    setPickerOpen(false);
    window.setTimeout(() => changeButtonRef.current?.focus(), 0);
  };

  return (
    <div className="kidPlayB4Profile" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className="kidPlayB4ProfileBtn"
        aria-label={triggerLabel}
        aria-expanded={menuOpen}
        aria-controls={menuId}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <B4CircleAvatar
          variant={variant}
          loading={loading || unavailable}
          size="small"
          alt=""
        />
      </button>

      {menuOpen ? (
        <div id={menuId} className="kidPlayB4ProfileMenu" role="dialog" aria-label={`${displayName}'s B-4 profile`}>
          <div className="kidPlayB4ProfileMenuHead">
            <B4CircleAvatar
              variant={variant}
              loading={loading || unavailable}
              alt=""
            />
            <div>
              <strong>{displayName}</strong>
              <span>{loading ? 'Loading B-4…' : unavailable ? 'Choose your B-4' : definition.name}</span>
              {!loading && !unavailable ? <small>{definition.descriptor}</small> : null}
            </div>
          </div>
          <button
            ref={changeButtonRef}
            type="button"
            className="kidPlayB4ProfileChangeBtn"
            disabled={loading || Boolean(error)}
            onClick={() => setPickerOpen(true)}
          >
            Change B-4
          </button>
        </div>
      ) : null}

      {pickerOpen ? createPortal(
        <div
          className="kidPlayB4PickerBackdrop"
          role="presentation"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) closePicker();
          }}
        >
          <div
            ref={pickerRef}
            className="kidPlayB4PickerModal"
            role="dialog"
            aria-modal="true"
            aria-label={`Change B-4 for ${displayName}`}
          >
            <button
              type="button"
              className="kidPlayB4PickerClose"
              aria-label="Close B-4 picker"
              onClick={closePicker}
            >
              ×
            </button>
            <B4VariantSelector
              participantId={participantId}
              theme="game"
              onSaved={() => {
                setPickerOpen(false);
                setMenuOpen(false);
              }}
            />
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
