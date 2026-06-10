import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { FamilyPortalNotification } from '../../hooks/useFamilyPortalNotifications';

type FamilyNotificationBellProps = {
  items: FamilyPortalNotification[];
  className?: string;
};

export default function FamilyNotificationBell({ items, className = '' }: FamilyNotificationBellProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const count = items.length;

  return (
    <div className={`family-notificationBell${className ? ` ${className}` : ''}`} ref={rootRef}>
      <button
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

      {open ? (
        <div className="family-notificationBellMenu" role="menu">
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
      ) : null}
    </div>
  );
}
