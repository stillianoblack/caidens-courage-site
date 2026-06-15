import React, { useMemo } from 'react';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from '../../lib/pilotTrackingLocalStorage';
import { formatAssessmentTypeLabel } from '../../lib/pilotStudentProgress';
import {
  formatAssessmentCompletionProgress,
  formatAssessmentScore,
  formatModuleScore,
  resolveParticipantDisplayName,
  type ParticipantNameLookup,
} from '../../lib/pilotResultsDisplay';
import ResponsivePortalTable, {
  type ResponsivePortalTableColumn,
} from '../portal-design-system/ResponsivePortalTable';
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

function formatSubmittedAt(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function buildAssessmentColumns(
  participantLookup: ParticipantNameLookup,
  onStudentClick?: (participantId: string) => void,
): ResponsivePortalTableColumn<LocalAssessmentV2Record>[] {
  return [
    {
      id: 'child',
      header: 'Child',
      mobileRole: 'primary',
      render: (row) => (
        <StudentNameButton
          participantId={row.participant_id}
          lookup={participantLookup}
          onStudentClick={onStudentClick}
        />
      ),
    },
    {
      id: 'assessment',
      header: 'Assessment',
      mobileRole: 'secondary',
      render: (row) => formatAssessmentTypeLabel(row.assessment_type),
    },
    {
      id: 'score',
      header: 'Score',
      mobileRole: 'metric',
      render: (row) => formatAssessmentScore(row),
    },
    {
      id: 'completed-progress',
      header: 'Completed',
      mobileRole: 'detail',
      mobileLabel: 'Completed',
      mobileOnly: true,
      render: (row) => formatAssessmentCompletionProgress(row),
    },
    {
      id: 'submitted',
      header: 'Completed',
      mobileRole: 'detail',
      mobileLabel: 'Submitted',
      render: (row) => formatSubmittedAt(row.completed_at),
    },
    {
      id: 'status',
      header: 'Status',
      mobileRole: 'detail',
      render: () => <PilotStatusChip status="complete" />,
    },
  ];
}

function buildModuleColumns(
  participantLookup: ParticipantNameLookup,
  onStudentClick?: (participantId: string) => void,
): ResponsivePortalTableColumn<LocalModuleResultRecord>[] {
  return [
    {
      id: 'child',
      header: 'Child',
      mobileRole: 'primary',
      render: (row) => (
        <StudentNameButton
          participantId={row.participant_id}
          lookup={participantLookup}
          onStudentClick={onStudentClick}
        />
      ),
    },
    {
      id: 'module',
      header: 'Module',
      mobileRole: 'secondary',
      render: (row) => (
        <>
          {row.module_title || row.module_id}
          {row.character ? ` · ${row.character}` : ''}
        </>
      ),
    },
    {
      id: 'score',
      header: 'Score',
      mobileRole: 'metric',
      render: (row) => formatModuleScore(row),
    },
    {
      id: 'submitted',
      header: 'Completed',
      mobileRole: 'detail',
      mobileLabel: 'Submitted',
      render: (row) => formatSubmittedAt(row.completed_at),
    },
    {
      id: 'status',
      header: 'Status',
      mobileRole: 'detail',
      render: () => <PilotStatusChip status="complete" />,
    },
  ];
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

  const assessmentColumns = useMemo(
    () => buildAssessmentColumns(participantLookup, onStudentClick),
    [onStudentClick, participantLookup],
  );
  const moduleColumns = useMemo(
    () => buildModuleColumns(participantLookup, onStudentClick),
    [onStudentClick, participantLookup],
  );

  const assessmentActions = onStudentClick
    ? (row: LocalAssessmentV2Record) => (
        <button
          type="button"
          className="pilot-nextCta"
          onClick={() => onStudentClick(row.participant_id)}
        >
          View details
        </button>
      )
    : undefined;

  const moduleActions = onStudentClick
    ? (row: LocalModuleResultRecord) => (
        <button
          type="button"
          className="pilot-nextCta"
          onClick={() => onStudentClick(row.participant_id)}
        >
          View details
        </button>
      )
    : undefined;

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
            <ResponsivePortalTable
              columns={assessmentColumns}
              rows={recentAssessments}
              rowKey={(row) => row.id}
              tableClassName="pilot-resultsTable pilot-resultsTable--admin"
              wrapClassName="pilot-tableScroll pilot-tableScroll--subtle"
              mobileAriaLabel={assessmentTitle}
              expandedActions={assessmentActions}
            />
          )}
        </section>
      ) : null}

      {recentModules.length > 0 || showEmptyStates ? (
        <section className="pilot-panelBlock pilot-resultsTableSection">
          <h2 className="pilot-panelBlockTitle">{moduleTitle}</h2>
          {recentModules.length === 0 ? (
            <p className="pilot-emptyNote">No module completions yet.</p>
          ) : (
            <ResponsivePortalTable
              columns={moduleColumns}
              rows={recentModules}
              rowKey={(row) => row.id}
              tableClassName="pilot-resultsTable pilot-resultsTable--admin"
              wrapClassName="pilot-tableScroll pilot-tableScroll--subtle"
              mobileAriaLabel={moduleTitle}
              expandedActions={moduleActions}
            />
          )}
        </section>
      ) : null}
    </>
  );
}
