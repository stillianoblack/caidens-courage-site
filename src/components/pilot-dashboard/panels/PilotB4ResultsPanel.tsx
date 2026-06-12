import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import B4ResultsAdminDashboard from '../../b4-baseline-check/B4ResultsAdminDashboard';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import { FACILITATOR_PORTAL_PATH } from '../../../config/courageRoutes';
import {
  PILOT_RESULTS_HEADLINE,
} from '../../../data/pilotDashboardContent';
import { baselineRecordsFromAssessmentV2 } from '../../../lib/baselineV2Display';
import { exportBaselineResultsCsv } from '../../../lib/b4BaselineCheckStorage';
import {
  buildParticipantNameLookup,
  resolveParticipantDisplayName,
} from '../../../lib/pilotResultsDisplay';
import {
  fetchStudentParticipantsFromSupabase,
  loadPilotTrackingData,
} from '../../../lib/pilotTrackingService';
import { PortalPageIntro } from '../../portal-design-system';
import '../../b4-baseline-check/b4-results-admin.css';

export default function PilotB4ResultsPanel() {
  const activeProgram = readActivePilotProgram();
  const programCode = activeProgram?.programCode;
  const [participantLookup, setParticipantLookup] = useState(
    buildParticipantNameLookup([]),
  );
  const [assessmentResults, setAssessmentResults] = useState<
    Awaited<ReturnType<typeof loadPilotTrackingData>>['assessmentResults']
  >([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const code = programCode?.trim();
    if (!code) {
      setAssessmentResults([]);
      setParticipantLookup(buildParticipantNameLookup([]));
      setWarning('No active program context found.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [trackingPayload, participantsPayload] = await Promise.all([
        loadPilotTrackingData(code),
        fetchStudentParticipantsFromSupabase(code),
      ]);

      const lookup = buildParticipantNameLookup(participantsPayload.participants);
      setAssessmentResults(trackingPayload.assessmentResults);
      setParticipantLookup(lookup);
      setWarning(participantsPayload.error || trackingPayload.warning || null);
    } finally {
      setLoading(false);
    }
  }, [programCode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const displayRows = useMemo(
    () => baselineRecordsFromAssessmentV2(assessmentResults, participantLookup),
    [assessmentResults, participantLookup],
  );

  const handleExport = () => {
    const csv = exportBaselineResultsCsv(displayRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `b4-baseline-results-${programCode ?? 'program'}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pilot-panel pilot-panel--b4Results">
      <div className="pilot-resultsHead">
        <div>
          <PortalPageIntro>{PILOT_RESULTS_HEADLINE}</PortalPageIntro>
          {programCode ? (
            <p className="pilot-panelIntroSubtitle">Program: {programCode}</p>
          ) : null}
          {warning ? <p className="pilot-syncWarning">{warning}</p> : null}
        </div>
        <div className="pilot-resultsActions">
          <button type="button" className="pilot-resultsBtn pilot-resultsBtn--primary" onClick={handleExport}>
            Export CSV
          </button>
        </div>
      </div>

      {loading ? <p className="pilot-emptyNote">Loading results…</p> : null}

      {!loading ? (
        <B4ResultsAdminDashboard
          results={displayRows}
          feelingsLabel="Feelings / Confidence"
        />
      ) : null}

      {!loading && displayRows.length === 0 ? (
        <p className="pilot-emptyNote">No completed baseline results available yet for this program.</p>
      ) : null}

      {!loading && displayRows.length > 0 ? (
        <div className="pilot-resultsTableWrap pilot-resultsTableWrap--padded">
          <h2 className="pilot-panelBlockTitle pilot-resultsTableTitle">All Submissions</h2>
          <table className="pilot-resultsTable">
            <thead>
              <tr>
                <th scope="col">Child</th>
                <th scope="col">Program</th>
                <th scope="col">Group / Classroom</th>
                <th scope="col">Modules / Completed Sections</th>
                <th scope="col">Feelings / Confidence</th>
                <th scope="col">Reading</th>
                <th scope="col">Focus</th>
                <th scope="col">Completed Date</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row) => (
                <tr key={`${row.participantId ?? row.anonymousStudentId}-${row.completedAt}`}>
                  <td>
                    {resolveParticipantDisplayName(
                      row.participantId ?? row.anonymousStudentId,
                      participantLookup,
                    )}
                  </td>
                  <td>{row.programCode || '—'}</td>
                  <td>{row.groupName || '—'}</td>
                  <td>{row.completedModules.join(', ')}</td>
                  <td>{row.feelingsScore}</td>
                  <td>{row.readingScore}</td>
                  <td>{row.focusMovesScore}</td>
                  <td>{row.completedAt ? new Date(row.completedAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <details className="pilot-drawerDebug pilot-drawerDebug--inline">
            <summary>Debug participant IDs</summary>
            <ul className="pilot-debugIdList">
              {displayRows.map((row) => (
                <li key={`debug-${row.participantId ?? row.anonymousStudentId}-${row.completedAt}`}>
                  {resolveParticipantDisplayName(
                    row.participantId ?? row.anonymousStudentId,
                    participantLookup,
                  )}
                  :{' '}
                  <span className="pilot-resultsMono">{row.participantId ?? row.anonymousStudentId}</span>
                </li>
              ))}
            </ul>
          </details>
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
