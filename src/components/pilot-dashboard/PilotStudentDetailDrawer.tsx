import React, { useMemo } from 'react';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from '../../lib/pilotTrackingLocalStorage';
import {
  buildStudentDetailSnapshot,
  findFamilyLinkForStudent,
  findParticipantById,
  pilotStudentStatusLabel,
} from '../../lib/pilotStudentProgress';
import type { StudentParticipantRecord } from '../../lib/pilotTrackingService';
import type { StudentFamilyLink } from '../../lib/studentFamilyLinkService';
import CopyableCompactValue from './CopyableCompactValue';
import PilotDrawer from './PilotDrawer';
import PilotStatusChip from './PilotStatusChip';

type PilotStudentDetailDrawerProps = {
  open: boolean;
  participantId: string | null;
  onClose: () => void;
  participants: StudentParticipantRecord[];
  familyLinks: StudentFamilyLink[];
  assessmentResults: LocalAssessmentV2Record[];
  moduleResults: LocalModuleResultRecord[];
  programCode?: string;
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function PilotStudentDetailDrawer({
  open,
  participantId,
  onClose,
  participants,
  familyLinks,
  assessmentResults,
  moduleResults,
  programCode,
}: PilotStudentDetailDrawerProps) {
  const snapshot = useMemo(() => {
    if (!participantId) return null;
    const participant = findParticipantById(participants, participantId);
    if (!participant) return null;
    const link = findFamilyLinkForStudent(familyLinks, participantId);
    return buildStudentDetailSnapshot({
      participant,
      link,
      assessments: assessmentResults,
      modules: moduleResults,
      programCode,
    });
  }, [assessmentResults, familyLinks, moduleResults, participantId, participants, programCode]);

  if (!snapshot) return null;

  return (
    <PilotDrawer open={open} onClose={onClose} titleId="pilot-student-drawer-title">
      <div className="pilot-drawerHead">
        <div>
          <h2 id="pilot-student-drawer-title" className="pilot-drawerTitle">
            {snapshot.childName}
          </h2>
          <p className="pilot-drawerSubtitle">Student progress summary</p>
        </div>
        <button type="button" className="pilot-drawerClose" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="pilot-drawerBody pilot-drawerBody--detail">
        <div className="pilot-drawerStatusRow">
          <PilotStatusChip status={snapshot.status} />
          {snapshot.certificateReady ? (
            <span className="pilot-drawerBadge">Certificate Ready</span>
          ) : null}
        </div>

        <dl className="pilot-drawerGrid">
          <div>
            <dt>Nickname</dt>
            <dd>{snapshot.nickname}</dd>
          </div>
          <div>
            <dt>Parent/Guardian</dt>
            <dd>{snapshot.parentName}</dd>
          </div>
          <div>
            <dt>Parent/Guardian Email</dt>
            <dd>{snapshot.parentEmail}</dd>
          </div>
          <div>
            <dt>Parent/Guardian Phone</dt>
            <dd>{snapshot.parentPhone}</dd>
          </div>
          <div>
            <dt>Baseline Score</dt>
            <dd>{snapshot.baselineScore}</dd>
          </div>
          <div>
            <dt>Modules Completed</dt>
            <dd>{snapshot.modulesCompleted}</dd>
          </div>
          <div>
            <dt>Last Assessment</dt>
            <dd>{formatDate(snapshot.lastAssessmentAt)}</dd>
          </div>
          <div>
            <dt>Last Module</dt>
            <dd>{formatDate(snapshot.lastModuleAt)}</dd>
          </div>
          <div>
            <dt>Last Activity</dt>
            <dd>{formatDate(snapshot.lastActivityAt)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{pilotStudentStatusLabel(snapshot.status)}</dd>
          </div>
        </dl>

        <details className="pilot-drawerDebug">
          <summary>Debug IDs</summary>
          <dl className="pilot-drawerGrid pilot-drawerGrid--debug">
            <div>
              <dt>Participant ID</dt>
              <dd className="pilot-resultsMono">{snapshot.participantId}</dd>
            </div>
            <div>
              <dt>Camp Program</dt>
              <dd>{snapshot.campProgramCode}</dd>
            </div>
            <div>
              <dt>Family Program</dt>
              <dd>{snapshot.familyProgramCode}</dd>
            </div>
          </dl>
        </details>
      </div>
    </PilotDrawer>
  );
}
