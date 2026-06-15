import React from 'react';
import { Link } from 'react-router-dom';
import './mobile-bottom-navigation.css';

export interface MobileBottomNavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badgeCount?: number;
}

export interface MobileBottomNavigationProps {
  items: MobileBottomNavigationItem[];
  activeItem: string;
  variant?: 'family' | 'facilitator';
  ariaLabel?: string;
}

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  const label = count > 99 ? '99+' : String(count);
  return (
    <span className="mobileBottomNavBadge" aria-label={`${count} notifications`}>
      {label}
    </span>
  );
}

function NavItemContent({
  item,
  active,
  variant,
}: {
  item: MobileBottomNavigationItem;
  active: boolean;
  variant: 'family' | 'facilitator';
}) {
  const showLabel = variant === 'facilitator';

  return (
    <>
      {variant === 'facilitator' && active ? (
        <span className="mobileBottomNavActiveDot" aria-hidden="true" />
      ) : null}
      <span className="mobileBottomNavIconWrap">
        {item.icon}
        <NavBadge count={item.badgeCount ?? 0} />
      </span>
      {showLabel ? <span className="mobileBottomNavLabel">{item.label}</span> : null}
    </>
  );
}

export default function MobileBottomNavigation({
  items,
  activeItem,
  variant = 'family',
  ariaLabel = 'Portal navigation',
}: MobileBottomNavigationProps) {
  return (
    <nav
      className={['mobileBottomNav', `mobileBottomNav--${variant}`].join(' ')}
      aria-label={ariaLabel}
    >
      <ul className="mobileBottomNavList">
        {items.map((item) => {
          const active = item.id === activeItem;
          const className = [
            'mobileBottomNavLink',
            active ? 'mobileBottomNavLink--active' : '',
          ]
            .filter(Boolean)
            .join(' ');

          if (item.href) {
            return (
              <li key={item.id} className="mobileBottomNavItem">
                <Link
                  to={item.href}
                  className={className}
                  aria-current={active ? 'page' : undefined}
                  aria-label={
                    variant === 'family'
                      ? item.label
                      : item.badgeCount
                        ? `${item.label} (${item.badgeCount})`
                        : item.label
                  }
                  title={item.label}
                >
                  <NavItemContent item={item} active={active} variant={variant} />
                </Link>
              </li>
            );
          }

          return (
            <li key={item.id} className="mobileBottomNavItem">
              <button
                type="button"
                className={className}
                onClick={item.onClick}
                aria-current={active ? 'page' : undefined}
                aria-label={
                  item.badgeCount ? `${item.label} (${item.badgeCount})` : item.label
                }
              >
                <NavItemContent item={item} active={active} variant={variant} />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
