import React, { useEffect, useState } from 'react';
import { getProviderView, postProviderAction } from '../../../lib/crmProviderApi';

type View = 'journeys' | 'subscribers' | 'performance' | 'reconciliation' | 'sync' | 'settings';
const endpoint: Record<View, string> = { journeys: 'crm-provider-status', subscribers: 'crm-kit-reconciliation', performance: 'crm-email-performance', reconciliation: 'crm-kit-reconciliation', sync: 'crm-sync-activity', settings: 'crm-provider-status' };

export default function AdminCrmProviderTab({ view }: { view: View }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null); const [message, setMessage] = useState<string | null>(null);
  const load = () => void getProviderView(endpoint[view]).then((result) => { if (result.ok) setData(result.data); else setMessage(result.error || 'Unavailable.'); });
  useEffect(load, [view]);
  const act = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries()); const result = await postProviderAction(values); setMessage(result.ok ? 'Action recorded. Provider writes still require all server flags.' : result.error || 'Action failed.'); if (result.ok) load(); };
  return <section className="adminPortal-card">
    <h2 className="adminPortal-cardTitle">{view.replace(/(^|\s)\S/g, (value) => value.toUpperCase())}</h2>
    <p className="adminPortal-cardSub">Kit v4 provider view. Metrics are Kit-reported where available; null values are unavailable. No sequence editor or broadcast sender is provided.</p>
    {view === 'reconciliation' ? <div className="adminPortal-warning">Preview only. No contacts, provider links, tags, sequences, or subscriber states are changed.</div> : null}
    {view === 'sync' ? <form className="adminPortal-form" onSubmit={act}><label className="adminPortal-field">Action<select name="action"><option value="hold_contact">Hold contact</option><option value="release_contact">Release contact</option><option value="retry">Retry eligible operation</option></select></label><label className="adminPortal-field">Contact ID<input name="contactId" /></label><label className="adminPortal-field">Outbox ID (retry only)<input name="outboxId" /></label><button className="adminPortal-btn adminPortal-btn--primary" type="submit">Apply authorized action</button></form> : null}
    {message ? <p role="status">{message}</p> : null}
    <pre className="adminPortal-codeBlock">{JSON.stringify(data || {}, null, 2)}</pre>
  </section>;
}
