import React, { useEffect, useState } from 'react';
import { fetchCrmView } from '../../../lib/crmApi';
import type { AdminPortalTabId } from '../../../data/adminPortalContent';

type Props = { pilotProgramCount: number; onNavigate: (tab: AdminPortalTabId) => void };
type Overview = { contacts?: number; organizations?: number };

export default function AdminDashboardTab({ pilotProgramCount, onNavigate }: Props) {
  const [overview, setOverview] = useState<Overview | null>(null); const [crmAvailable, setCrmAvailable] = useState(true);
  useEffect(() => { void fetchCrmView('overview').then((result) => { if (result.ok) setOverview(result.data as Overview); else setCrmAvailable(false); }); }, []);
  const cards = [
    ['CRM Contacts', crmAvailable ? String(overview?.contacts ?? 0) : 'Unavailable'],
    ['Organizations', crmAvailable ? String(overview?.organizations ?? 0) : 'Unavailable'],
    ['Open Tasks', 'No data yet'], ['Segment Review', 'Ready'], ['Kit Connection', 'Connection disabled'],
    ['Email Metrics', 'Not configured'], ['Commerce', 'Review configuration'], ['Pilot Programs', String(pilotProgramCount)],
  ];
  return <div className="adminPortal-stack">
    <section className="adminPortal-card"><h2 className="adminPortal-cardTitle">Dashboard</h2><p className="adminPortal-cardSub">A calm overview of the current Admin environment.</p>
      <div className="adminDashboard-grid">{cards.map(([label, value]) => <div className="adminDashboard-stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    </section>
    <section className="adminPortal-card"><h2 className="adminPortal-cardTitle">Quick Actions</h2><div className="adminDashboard-actions">
      {[['Add Contact','crm-add-contact'],['View People','crm-contacts'],['Pilot Outcomes','pilot-outcomes'],['View Tasks','crm-tasks'],['Email Analytics','crm-email-performance'],['Commerce','commerce']].map(([label,id]) => <button key={id} type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => onNavigate(id as AdminPortalTabId)}>{label}</button>)}
    </div></section>
  </div>;
}
