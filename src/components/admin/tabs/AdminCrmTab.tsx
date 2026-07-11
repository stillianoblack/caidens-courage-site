import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCrmRecord, fetchCrmView, type CrmView } from '../../../lib/crmApi';

type Props = { view: CrmView };
type Row = Record<string, unknown>;

const titleFor: Record<CrmView, string> = {
  overview: 'CRM Overview', contacts: 'Contacts', organizations: 'Organizations', classification: 'Classification Preview',
};

function text(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ') || '—';
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

export default function AdminCrmTab({ view }: Props) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const query = view === 'overview' ? '' : `?page=${page}&limit=25${search ? `&search=${encodeURIComponent(search)}` : ''}`;
    const result = await fetchCrmView(view, query);
    setData(result.data || null);
    setError(result.error || null);
    setLoading(false);
  }, [page, search, view]);

  useEffect(() => { void load(); }, [load]);
  const rows = useMemo<Row[]>(() => {
    if (!data) return [];
    return ((view === 'classification' ? data.candidates : data.items) as Row[] | undefined) || [];
  }, [data, view]);

  const columns = view === 'contacts'
    ? ['first_name', 'last_name', 'masked_email', 'contact_kind', 'status', 'source_count', 'organization_count', 'account_relationship', 'created_at']
    : view === 'organizations'
      ? ['name', 'organization_type', 'status', 'unit_count', 'membership_count', 'mapped_legacy_program_count', 'created_at']
      : ['masked_email', 'source_types', 'proposed_audience_type', 'confidence', 'consent_status', 'recommended_action'];

  const openDetail = async (row: Row) => {
    if ((view !== 'contacts' && view !== 'organizations') || !row.id) return;
    const result = await fetchCrmRecord(view === 'contacts' ? 'contact' : 'organization', String(row.id));
    if (result.ok) setDetail(result.data || null);
    else setError(result.error || 'CRM detail is unavailable.');
  };

  return (
    <section className="adminPortal-card" aria-labelledby={`crm-${view}-title`}>
      <h2 id={`crm-${view}-title`} className="adminPortal-cardTitle">{titleFor[view]}</h2>
      <p className="adminPortal-cardSub">Secure read-only CRM data. Supabase authentication and a server-verified CRM role are required.</p>
      {view === 'classification' ? (
        <div className="adminPortal-warning" role="note">Preview only. No contacts, users, organizations, memberships, or email subscribers are being created or changed.</div>
      ) : null}
      {view !== 'overview' ? (
        <div className="adminPortal-formRow">
          <label className="adminPortal-field">Search
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search adult CRM records" />
          </label>
        </div>
      ) : null}
      {loading ? <p>Loading CRM data…</p> : null}
      {error ? <div className="adminPortal-error" role="alert">{error}</div> : null}
      {!loading && !error && view === 'overview' ? (
        <div className="adminPortal-detailGrid">
          <div><span className="adminPortal-detailLabel">CRM contacts</span><strong>{text(data?.contacts)}</strong></div>
          <div><span className="adminPortal-detailLabel">Organizations</span><strong>{text(data?.organizations)}</strong></div>
          <div><span className="adminPortal-detailLabel">Mode</span><strong>Read only</strong></div>
        </div>
      ) : null}
      {!loading && !error && view === 'classification' && data?.summary ? (
        <pre className="adminPortal-codeBlock">{JSON.stringify(data.summary, null, 2)}</pre>
      ) : null}
      {!loading && !error && view !== 'overview' ? (
        rows.length ? (
          <div className="adminPortal-tableWrap">
            <table className="adminPortal-table">
              <thead><tr>{columns.map((column) => <th key={column}>{column.replace(/_/g, ' ')}</th>)}{view === 'contacts' || view === 'organizations' ? <th>Detail</th> : null}</tr></thead>
              <tbody>{rows.map((row, index) => <tr key={String(row.id || row.pseudonymous_candidate_id || index)}>{columns.map((column) => <td key={column}>{text(row[column])}</td>)}{view === 'contacts' || view === 'organizations' ? <td><button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => void openDetail(row)}>View</button></td> : null}</tr>)}</tbody>
            </table>
          </div>
        ) : <p className="adminPortal-cardSub">No records found. Phase 1 does not import legacy records.</p>
      ) : null}
      {detail ? (
        <div className="adminPortal-card" aria-label="CRM record detail">
          <div className="adminPortal-actions"><h3>Read-only detail</h3><button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => setDetail(null)}>Close</button></div>
          <pre className="adminPortal-codeBlock">{JSON.stringify(detail, null, 2)}</pre>
        </div>
      ) : null}
      {!loading && !error && view !== 'overview' ? (
        <div className="adminPortal-actions">
          <button type="button" className="adminPortal-btn adminPortal-btn--ghost" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
          <span>Page {page}</span>
          <button type="button" className="adminPortal-btn adminPortal-btn--ghost" disabled={rows.length < 25} onClick={() => setPage((value) => value + 1)}>Next</button>
        </div>
      ) : null}
    </section>
  );
}
