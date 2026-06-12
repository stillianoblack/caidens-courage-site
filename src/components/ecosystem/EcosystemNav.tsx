import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ECOSYSTEM_NAV_ITEMS } from '../../config/ecosystemNav';
import PilotAccessNavLink from '../courage/PilotAccessNavLink';

type EcosystemNavProps = {
  variant?: 'default' | 'kids';
};

export default function EcosystemNav({ variant = 'default' }: EcosystemNavProps) {
  const { pathname } = useLocation();
  const isKids = variant === 'kids';

  const itemClass = (pathActive: boolean) =>
    [
      'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm',
      pathActive
        ? isKids
          ? 'bg-golden-500 text-navy-600 shadow-sm'
          : 'bg-navy-500 text-white'
        : isKids
          ? 'text-navy-600 hover:bg-golden-500/20'
          : 'text-navy-500 hover:bg-navy-50',
    ].join(' ');

  return (
    <nav
      className={`border-b ${
        isKids
          ? 'border-golden-500/25 bg-gradient-to-r from-[#FFF8E8] via-[#FFFBF2] to-[#EEF6FF]'
          : 'border-navy-100 bg-white/95'
      }`}
      aria-label="Caiden's Courage ecosystem"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-1 px-4 py-2.5 sm:justify-start sm:gap-2 sm:px-6 lg:px-8">
        {ECOSYSTEM_NAV_ITEMS.map((item) => {
          const pathActive =
            pathname === item.href ||
            item.activePaths.some((path) => path !== '/' && pathname === path);

          if ('pilotInterest' in item && item.pilotInterest) {
            return (
              <PilotAccessNavLink
                key={item.href}
                label={item.label}
                className={itemClass(pathActive)}
                interestType={item.pilotInterest}
                clickSource="ecosystem_nav"
              />
            );
          }

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={() => itemClass(pathActive)}
              end={item.href === '/'}
            >
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
