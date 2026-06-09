import React, { useState } from 'react';
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
  const [drawerParticipantId, setDrawerParticipantId] = useState<string | null>(null);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const showLoading = externalLoading || loading;

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

      {successMessage ? <p className="pilot-rosterSuccess">{successMessage}</p> : null}
      {warning ? <p className="pilot-syncWarning">{warning}</p> : null}

      {rows.length === 0 ? (
        <p className="pilot-emptyNote">No students yet. Add your first student.</p>
      ) : (
        <PilotAdminStudentTable
          rows={rows}
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
        onSuccess={(message) => {
          setSuccessMessage(message);
          void refresh();
        }}
      />
    </div>
  );
}
