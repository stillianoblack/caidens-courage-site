import React, { useMemo, useState } from 'react';
import { useToast } from '../../portal-design-system/ToastProvider';
import { Link, useSearchParams } from 'react-router-dom';
import { programDashboardTabPath } from '../../../lib/programDashboardNav';
import {
  filterRosterRows,
  isRosterFilterId,
  ROSTER_FILTER_LABELS,
} from '../../../lib/pilotOverviewInsights';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import { usePilotRosterData } from '../../../hooks/usePilotRosterData';
import DashboardWidgetSkeleton from '../DashboardWidgetSkeleton';
import PilotAddStudentDrawer from '../PilotAddStudentDrawer';
import PilotAdminStudentTable from '../PilotAdminStudentTable';
import PilotStudentDetailDrawer from '../PilotStudentDetailDrawer';

type PilotRosterPanelProps = {
  programCode?: string;
  loading?: boolean;
};

export default function PilotRosterPanel({ programCode, loading: externalLoading }: PilotRosterPanelProps) {
  const activeProgram = readActivePilotProgram();
  const resolvedProgramCode = programCode?.trim() || activeProgram?.programCode?.trim() || '';
  const { rows, participants, familyLinks, assessmentResults, moduleResults, loading, warning, refresh } =
    usePilotRosterData(resolvedProgramCode, true, activeProgram?.familyAccessCode);
  const [searchParams, setSearchParams] = useSearchParams();
  const rawFilter = searchParams.get('filter');
  const rosterFilter = isRosterFilterId(rawFilter) ? rawFilter : null;
  const [drawerParticipantId, setDrawerParticipantId] = useState<string | null>(null);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const { showToast } = useToast();
  const showLoading = externalLoading || loading;

  const displayRows = useMemo(
    () => filterRosterRows(rows, rosterFilter),
    [rows, rosterFilter],
  );

  const clearFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('filter');
    setSearchParams(next, { replace: true });
  };

  if (showLoading) {
    return (
      <div className="pilot-panel pilot-panel--roster">
        <DashboardWidgetSkeleton kpiCount={0} showGrowth={false} />
      </div>
    );
  }

  return (
    <div className="pilot-panel pilot-panel--roster">
      <div className="pilot-panelIntro pilot-panelIntro--roster">
        <div>
          <h2 className="pilot-panelIntroTitle">Program Roster</h2>
          <p className="pilot-panelIntroSubtitle">
            Students enrolled in the active program with Parent/Guardian contact and progress summary.
          </p>
        </div>
        <button
          type="button"
          className="pilot-rosterAddBtn"
          onClick={() => setAddStudentOpen(true)}
          disabled={!resolvedProgramCode}
        >
          Add Student
        </button>
      </div>

      {rosterFilter ? (
        <div className="pilot-rosterFilterBanner">
          <span className="pilot-rosterFilterChip">
            Filtered by: {ROSTER_FILTER_LABELS[rosterFilter]}
          </span>
          <button type="button" className="pilot-rosterFilterClear" onClick={clearFilter}>
            Clear filter
          </button>
        </div>
      ) : null}

      {warning ? <p className="pilot-syncWarning">{warning}</p> : null}

      {displayRows.length === 0 ? (
        <p className="pilot-emptyNote">
          {rosterFilter
            ? `No students match “${ROSTER_FILTER_LABELS[rosterFilter]}”.`
            : 'No students yet. Add your first student.'}
        </p>
      ) : (
        <PilotAdminStudentTable
          rows={displayRows}
          variant="roster"
          onStudentClick={setDrawerParticipantId}
        />
      )}

      <PilotStudentDetailDrawer
        open={Boolean(drawerParticipantId)}
        participantId={drawerParticipantId}
        onClose={() => setDrawerParticipantId(null)}
        participants={participants}
        familyLinks={familyLinks}
        assessmentResults={assessmentResults}
        moduleResults={moduleResults}
        programCode={resolvedProgramCode}
      />

      <PilotAddStudentDrawer
        open={addStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        programCode={resolvedProgramCode}
        onSuccess={() => {
          showToast("Student added. I'll keep their progress organized here.", 'success');
          void refresh();
        }}
      />

      {rows.length > 0 && rosterFilter ? (
        <p className="pilot-rosterFilterMeta">
          Showing {displayRows.length} of {rows.length} students.{' '}
          <Link to={programDashboardTabPath('roster')}>View full roster</Link>
        </p>
      ) : null}
    </div>
  );
}
