import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SlideOutDrawer from '../portal-design-system/SlideOutDrawer';
import {
  PORTAL_UPDATE_SECTION_LABELS,
  PORTAL_UPDATE_TYPE_LABELS,
  resolvePortalUpdateCtaRoute,
  type PortalUpdate,
  type PortalUpdateSection,
} from '../../data/portalUpdates';
import { usePortalUpdates, type PortalUpdatesPortal } from '../../hooks/usePortalUpdates';
import './portal-updates.css';

type PortalUpdatesPanelProps = {
  open: boolean;
  onClose: () => void;
  portal: PortalUpdatesPortal;
  sections: Array<{ section: PortalUpdateSection; items: PortalUpdate[] }>;
  isUnread: (update: PortalUpdate) => boolean;
  onOpen: () => void;
  onNavigate: (update: PortalUpdate) => void;
};

function formatUpdateDate(publishedAt: string): string {
  const date = new Date(`${publishedAt}T12:00:00`);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function PortalUpdateItem({
  update,
  portal,
  unread,
  onNavigate,
}: {
  update: PortalUpdate;
  portal: PortalUpdatesPortal;
  unread: boolean;
  onNavigate: () => void;
}) {
  const ctaRoute = resolvePortalUpdateCtaRoute(update, portal);

  return (
    <article
      className={['portalUpdateItem', unread ? 'portalUpdateItem--unread' : ''].filter(Boolean).join(' ')}
    >
      <div className="portalUpdateItemHead">
        <span className={`portalUpdateType portalUpdateType--${update.type}`}>
          {PORTAL_UPDATE_TYPE_LABELS[update.type]}
        </span>
        <time className="portalUpdateDate" dateTime={update.publishedAt}>
          {formatUpdateDate(update.publishedAt)}
        </time>
      </div>
      <h3 className="portalUpdateTitle">{update.title}</h3>
      <p className="portalUpdateDescription">{update.description}</p>
      {update.ctaLabel && ctaRoute ? (
        <Link to={ctaRoute} className="portalUpdateCta" onClick={onNavigate}>
          {update.ctaLabel}
        </Link>
      ) : null}
    </article>
  );
}

export function PortalUpdatesPanel({
  open,
  onClose,
  portal,
  sections,
  isUnread,
  onOpen,
  onNavigate,
}: PortalUpdatesPanelProps) {
  useEffect(() => {
    if (open) {
      onOpen();
    }
  }, [open, onOpen]);

  return (
    <SlideOutDrawer
      open={open}
      onClose={onClose}
      className="pilot-drawer portalUpdatesDrawer"
      titleId="portal-updates-drawer-title"
      header={
        <div className="portalUpdatesDrawerHead">
          <div className="portalUpdatesDrawerHeadText">
            <h2 id="portal-updates-drawer-title" className="portalUpdatesDrawerTitle">
              Updates
            </h2>
            <p className="portalUpdatesDrawerSubtext">
              Recent product and program announcements for your portal.
            </p>
          </div>
          <button type="button" className="portalUpdatesDrawerClose" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
      }
      body={
        <div className="portalUpdatesDrawerBody">
          {sections.length === 0 ? (
            <p className="portalUpdatesEmpty">You&apos;re all caught up — no updates right now.</p>
          ) : (
            sections.map(({ section, items }) => (
              <section key={section} className="portalUpdatesSection" aria-label={PORTAL_UPDATE_SECTION_LABELS[section]}>
                <h3 className="portalUpdatesSectionTitle">{PORTAL_UPDATE_SECTION_LABELS[section]}</h3>
                <ul className="portalUpdatesList">
                  {items.map((update) => (
                    <li key={update.id}>
                      <PortalUpdateItem
                        update={update}
                        portal={portal}
                        unread={isUnread(update)}
                        onNavigate={() => onNavigate(update)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      }
    />
  );
}

type PortalUpdatesPillProps = {
  portal: PortalUpdatesPortal;
  className?: string;
  compact?: boolean;
};

export default function PortalUpdatesPill({ portal, className = '', compact = false }: PortalUpdatesPillProps) {
  const [open, setOpen] = React.useState(false);
  const { sections, unreadCount, isUnread, markAllVisibleRead, markOneRead } = usePortalUpdates(portal);

  const label =
    unreadCount > 0
      ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}`
      : 'Open portal updates';

  return (
    <>
      <button
        type="button"
        className={[
          'portalUpdatesPill',
          compact ? 'portalUpdatesPill--compact' : '',
          unreadCount > 0 ? 'portalUpdatesPill--unread' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => setOpen(true)}
        aria-label={label}
      >
        <svg className="portalUpdatesPillIcon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417-.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
        <span className="portalUpdatesPillLabel">Updates</span>
        {unreadCount > 0 ? (
          <span className="portalUpdatesPillCount" aria-hidden="true">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      <PortalUpdatesPanel
        open={open}
        onClose={() => setOpen(false)}
        portal={portal}
        sections={sections}
        isUnread={isUnread}
        onOpen={markAllVisibleRead}
        onNavigate={(update) => {
          markOneRead(update.id);
          setOpen(false);
        }}
      />
    </>
  );
}
