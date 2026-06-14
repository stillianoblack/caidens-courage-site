import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import type { FamilyPortalNotification } from '../../hooks/useFamilyPortalNotifications';

type FamilyNotificationBellProps = {
  items: FamilyPortalNotification[];
  className?: string;
};

const MENU_GAP_PX = 6;
const MENU_Z_INDEX = 12000;

export default function FamilyNotificationBell({ items, className = '' }: FamilyNotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + MENU_GAP_PX,
      right: Math.max(8, window.innerWidth - rect.right),
      zIndex: MENU_Z_INDEX,
      visibility: 'visible',
      maxHeight: `min(70vh, calc(100vh - ${rect.bottom + MENU_GAP_PX + 12}px))`,
      overflowY: 'auto',
    });
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    updateMenuPosition();
    const handleReposition = () => updateMenuPosition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const count = items.length;

  const menu = open ? (
    <div
      ref={menuRef}
      className="family-notificationBellMenu family-notificationBellMenu--portal"
      role="menu"
      style={menuStyle}
    >
      <p className="family-notificationBellMenuTitle">Updates for your family</p>
      {items.length === 0 ? (
        <p className="family-notificationBellEmpty">You&apos;re all caught up.</p>
      ) : (
        <ul className="family-notificationBellList">
          {items.map((item) => (
            <li key={item.id}>
              {item.href ? (
                <Link
                  to={item.href}
                  className="family-notificationBellItem"
                  onClick={() => setOpen(false)}
                >
                  <span className="family-notificationBellItemLabel">{item.label}</span>
                  {item.detail ? (
                    <span className="family-notificationBellItemDetail">{item.detail}</span>
                  ) : null}
                </Link>
              ) : (
                <button
                  type="button"
                  className="family-notificationBellItem"
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                >
                  <span className="family-notificationBellItemLabel">{item.label}</span>
                  {item.detail ? (
                    <span className="family-notificationBellItemDetail">{item.detail}</span>
                  ) : null}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  ) : null;

  return (
    <div className={`family-notificationBell${className ? ` ${className}` : ''}`}>
      <button
        ref={triggerRef}
        type="button"
        className="family-notificationBellBtn"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={count ? `${count} family updates` : 'Family updates'}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M9.5 3.5A2.5 2.5 0 0112 1a2.5 2.5 0 012.5 2.5V4h2.11c.48 0 .89.35.97.82l.43 2.58A6.5 6.5 0 0119.5 13v3.5h1a1 1 0 110 2h-15a1 1 0 110-2h1V13a6.5 6.5 0 013.49-5.6l.43-2.58A1 1 0 0110.89 4H13v-.5zM12 22a2.5 2.5 0 01-2.45-2h4.9A2.5 2.5 0 0112 22z" />
        </svg>
        {count > 0 ? <span className="family-notificationBellCount">{count}</span> : null}
      </button>

      {typeof document !== 'undefined' ? createPortal(menu, document.body) : null}
    </div>
  );
}
