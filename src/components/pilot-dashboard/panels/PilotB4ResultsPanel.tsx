import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import B4ResultsAdminDashboard from '../../b4-baseline-check/B4ResultsAdminDashboard';
import { FACILITATOR_PORTAL_PATH } from '../../../config/courageRoutes';
import { loadAssessmentResults } from '../../../lib/assessmentResultsService';
import {
  clearAllBaselineResults,
  exportBaselineResultsCsv,
  type B4BaselineCheckRecord,
} from '../../../lib/b4BaselineCheckStorage';
import '../../b4-baseline-check/b4-results-admin.css';

export default function PilotB4ResultsPanel() {
  const [results, setResults] = useState<B4BaselineCheckRecord[]>([]);
  const [source, setSource] = useState<'supabase' | 'local'>('local');
  const [warning, setWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const payload = await loadAssessmentResults();
    setResults(payload.results);
    setSource(payload.source);
    setWarning(payload.warning ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleExport = () => {
    const csv = exportBaselineResultsCsv(results);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `b4-baseline-results-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    const confirmed = window.confirm(
      'Clear all B-4 Baseline Check results stored on this device? Supabase records will not be deleted.',
    );
    if (!confirmed) return;
    clearAllBaselineResults();
    void refresh();
  };

  return (
    <div className="pilot-panel pilot-panel--b4Results">
      <div className="pilot-resultsHead">
        <div>
          <p className="pilot-panelIntro">
            {source === 'supabase'
              ? 'Showing baseline results synced from Supabase, ordered by most recent completion.'
              : 'Showing baseline results from this device. Supabase sync will be used when available.'}
          </p>
          {warning ? <p className="pilot-syncWarning">{warning}</p> : null}
          <p className="pilot-emptyNote">
            Clearing local data does not delete Supabase records.
          </p>
        </div>
        <div className="pilot-resultsActions">
          <button type="button" className="pilot-resultsBtn pilot-resultsBtn--primary" onClick={handleExport}>
            Export CSV
          </button>
          <button type="button" className="pilot-resultsBtn pilot-resultsBtn--danger" onClick={handleClear}>
            Clear local results only
          </button>
        </div>
      </div>

      {loading ? <p className="pilot-emptyNote">Loading results…</p> : null}

      {!loading ? <B4ResultsAdminDashboard results={results} /> : null}

      {!loading && results.length === 0 ? (
        <p className="pilot-emptyNote">No completed baseline results available yet.</p>
      ) : null}

      {!loading && results.length > 0 ? (
        <div className="pilot-resultsTableWrap pilot-resultsTableWrap--padded">
          <h2 className="pilot-panelBlockTitle pilot-resultsTableTitle">All Submissions</h2>
          <table className="pilot-resultsTable">
            <thead>
              <tr>
                <th scope="col">Nickname</th>
                <th scope="col">Program</th>
                <th scope="col">Group / Classroom</th>
                <th scope="col">Modules</th>
                <th scope="col">Feelings</th>
                <th scope="col">Reading</th>
                <th scope="col">Focus</th>
                <th scope="col">Completed</th>
                <th scope="col">Student ID</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={`${row.anonymousStudentId}-${row.completedAt}`}>
                  <td>{row.nickname || '—'}</td>
                  <td>{row.programCode || '—'}</td>
                  <td>{row.groupName || '—'}</td>
                  <td>{row.completedModules.join(', ')}</td>
                  <td>{row.feelingsScore}</td>
                  <td>{row.readingScore}</td>
                  <td>{row.focusMovesScore}</td>
                  <td>{row.completedAt ? new Date(row.completedAt).toLocaleString() : '—'}</td>
                  <td className="pilot-resultsMono">{row.anonymousStudentId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="pilot-resultsAdminCta">
        <Link to={FACILITATOR_PORTAL_PATH} className="pilot-dash-cta pilot-dash-cta--secondary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
