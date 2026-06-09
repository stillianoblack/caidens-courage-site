import React from 'react';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from '../../lib/pilotTrackingLocalStorage';
import { formatAssessmentTypeLabel } from '../../lib/pilotStudentProgress';
import {
  formatAssessmentScore,
  formatModuleScore,
  resolveParticipantDisplayName,
  type ParticipantNameLookup,
} from '../../lib/pilotResultsDisplay';
import PilotStatusChip from './PilotStatusChip';

type PilotTrackingDataTablesProps = {
  assessmentResults: LocalAssessmentV2Record[];
  moduleResults: LocalModuleResultRecord[];
  participantLookup: ParticipantNameLookup;
  onStudentClick?: (participantId: string) => void;
  assessmentTitle?: string;
  moduleTitle?: string;
  assessmentLimit?: number;
  moduleLimit?: number;
  showEmptyStates?: boolean;
};

function StudentNameButton({
  participantId,
  lookup,
  onStudentClick,
}: {
  participantId: string;
  lookup: ParticipantNameLookup;
  onStudentClick?: (participantId: string) => void;
}) {
  const label = resolveParticipantDisplayName(participantId, lookup);
  if (!onStudentClick) return <>{label}</>;
  return (
    <button
      type="button"
      className="pilot-studentLinkBtn"
      onClick={() => onStudentClick(participantId)}
    >
      {label}
    </button>
  );
}

export default function PilotTrackingDataTables({
  assessmentResults,
  moduleResults,
  participantLookup,
  onStudentClick,
  assessmentTitle = 'Recent Student Assessments',
  moduleTitle = 'Recent Module Completions',
  assessmentLimit = 12,
  moduleLimit = 12,
  showEmptyStates = false,
}: PilotTrackingDataTablesProps) {
  const recentAssessments = assessmentResults.slice(0, assessmentLimit);
  const recentModules = moduleResults.slice(0, moduleLimit);

  if (showEmptyStates && recentAssessments.length === 0 && recentModules.length === 0) {
    return (
      <>
        <section className="pilot-panelBlock pilot-resultsTableSection">
          <h2 className="pilot-panelBlockTitle">{assessmentTitle}</h2>
          <p className="pilot-emptyNote">No assessment results yet.</p>
        </section>
        <section className="pilot-panelBlock pilot-resultsTableSection">
          <h2 className="pilot-panelBlockTitle">{moduleTitle}</h2>
          <p className="pilot-emptyNote">No module completions yet.</p>
        </section>
      </>
    );
  }

  return (
    <>
      {recentAssessments.length > 0 || showEmptyStates ? (
        <section className="pilot-panelBlock pilot-resultsTableSection">
          <h2 className="pilot-panelBlockTitle">{assessmentTitle}</h2>
          {recentAssessments.length === 0 ? (
            <p className="pilot-emptyNote">No assessment results yet.</p>
          ) : (
          <div className="pilot-tableScroll pilot-tableScroll--subtle">
            <table className="pilot-resultsTable pilot-resultsTable--admin">
              <thead>
                <tr>
                  <th scope="col">Child</th>
                  <th scope="col">Assessment</th>
                  <th scope="col">Score</th>
                  <th scope="col">Completed</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAssessments.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <StudentNameButton
                        participantId={row.participant_id}
                        lookup={participantLookup}
                        onStudentClick={onStudentClick}
                      />
                    </td>
                    <td>{formatAssessmentTypeLabel(row.assessment_type)}</td>
                    <td>{formatAssessmentScore(row)}</td>
                    <td>{row.completed_at ? new Date(row.completed_at).toLocaleString() : '—'}</td>
                    <td>
                      <PilotStatusChip status="complete" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </section>
      ) : null}

      {recentModules.length > 0 || showEmptyStates ? (
        <section className="pilot-panelBlock pilot-resultsTableSection">
          <h2 className="pilot-panelBlockTitle">{moduleTitle}</h2>
          {recentModules.length === 0 ? (
            <p className="pilot-emptyNote">No module completions yet.</p>
          ) : (
          <div className="pilot-tableScroll pilot-tableScroll--subtle">
            <table className="pilot-resultsTable pilot-resultsTable--admin">
              <thead>
                <tr>
                  <th scope="col">Child</th>
                  <th scope="col">Module</th>
                  <th scope="col">Score</th>
                  <th scope="col">Completed</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentModules.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <StudentNameButton
                        participantId={row.participant_id}
                        lookup={participantLookup}
                        onStudentClick={onStudentClick}
                      />
                    </td>
                    <td>
                      {row.module_title || row.module_id}
                      {row.character ? ` · ${row.character}` : ''}
                    </td>
                    <td>{formatModuleScore(row)}</td>
                    <td>{row.completed_at ? new Date(row.completed_at).toLocaleString() : '—'}</td>
                    <td>
                      <PilotStatusChip status="complete" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </section>
      ) : null}
    </>
  );
}
