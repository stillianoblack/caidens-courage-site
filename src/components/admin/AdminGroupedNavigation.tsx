import React, { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ADMIN_NAV_GROUPS, type AdminPortalTabId } from '../../data/adminPortalContent';
import { adminPortalTabPath } from '../../lib/adminPortalPaths';

type Props = { activeTab: AdminPortalTabId };
const STORAGE_KEY = 'cc-admin-nav-open-group';

export default function AdminGroupedNavigation({ activeTab }: Props) {
  const activeGroup = useMemo(() => ADMIN_NAV_GROUPS.find((group) => group.items.some((item) => item.id === activeTab))?.id || null, [activeTab]);
  const [openGroupId, setOpenGroupId] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEY) || activeGroup || 'crm');
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    if (activeTab === 'dashboard') { setOpenGroupId(null); sessionStorage.removeItem(STORAGE_KEY); return; }
    if (activeGroup) { setOpenGroupId(activeGroup); sessionStorage.setItem(STORAGE_KEY, activeGroup); }
  }, [activeGroup, activeTab]);
  const closeMobileMenu = () => setMobileOpen(false);
  return <nav className="adminNav" aria-label="Admin sections">
    <button type="button" className="adminNav-mobileToggle" aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)}>Menu <span aria-hidden>⌄</span></button>
    <div className={`adminNav-panel ${mobileOpen ? 'adminNav-panel--open' : ''}`}>
      <NavLink to={adminPortalTabPath('dashboard')} className={`adminNav-dashboard ${activeTab === 'dashboard' ? 'is-active' : ''}`} aria-current={activeTab === 'dashboard' ? 'page' : undefined} onClick={closeMobileMenu}><span className="adminNav-itemIndicator" aria-hidden="true" /><span>Dashboard</span></NavLink>
      {ADMIN_NAV_GROUPS.map((group) => { const expanded = openGroupId === group.id; return <div className="adminNav-group" key={group.id}>
        <button type="button" className="adminNav-groupButton" aria-expanded={expanded} aria-controls={`admin-nav-${group.id}`} onClick={() => { const next = expanded ? null : group.id; setOpenGroupId(next); if (next) sessionStorage.setItem(STORAGE_KEY, next); else sessionStorage.removeItem(STORAGE_KEY); }}><span>{group.label}</span><span className="adminNav-chevron" aria-hidden>{expanded ? '⌄' : '›'}</span></button>
        <div id={`admin-nav-${group.id}`} className={`adminNav-items ${expanded ? 'adminNav-items--open' : ''}`} hidden={!expanded}>
          {group.items.map((item) => <NavLink key={item.id} to={adminPortalTabPath(item.id)} className={`adminNav-item ${activeTab === item.id ? 'is-active' : ''}`} aria-current={activeTab === item.id ? 'page' : undefined} onClick={closeMobileMenu}><span className="adminNav-itemIndicator" aria-hidden="true" /><span className="adminNav-itemLabel">{item.label}</span>{item.advanced ? <small className="adminNav-itemMeta">Advanced</small> : null}</NavLink>)}
        </div>
      </div>; })}
    </div>
  </nav>;
}
