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
import ParticipantGradeMeta from '../shared/ParticipantGradeMeta';
import '../shared/participant-grade-meta.css';
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
  hasPin?: boolean;
  pinLastRotatedAt?: string | null;
  lastStudentLoginAt?: string | null;
  parentConnectionLabel?: string;
  familyClaimCode?: string | null;
  familyClaimUrl?: string | null;
  oneTimePin?: string | null;
  onRevealPin?: () => void;
  onCopyPin?: () => void;
  onResetPin?: () => void;
  onCopyLoginInstructions?: () => void;
  onCopyClaimLink?: () => void;
  onInviteParent?: () => void;
  pinActionLoading?: boolean;
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
  hasPin = false,
  pinLastRotatedAt = null,
  lastStudentLoginAt = null,
  parentConnectionLabel,
  familyClaimCode,
  familyClaimUrl,
  oneTimePin,
  onRevealPin,
  onCopyPin,
  onResetPin,
  onCopyLoginInstructions,
  onCopyClaimLink,
  onInviteParent,
  pinActionLoading = false,
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
          <p className="pilot-drawerSubtitle">Student access and progress summary</p>
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

        <section className="pilot-studentAccessPanel" aria-labelledby="pilot-student-access-title">
          <div className="pilot-studentAccessHead">
            <div>
              <h3 id="pilot-student-access-title" className="pilot-studentAccessTitle">
                Student Access
              </h3>
              <p className="pilot-studentAccessCopy">
                Reveal, copy, or reset the student PIN. Reset only when an adult wants a new PIN.
              </p>
            </div>
            <span className="pilot-studentAccessStatus">{hasPin ? 'PIN ready' : 'Missing PIN'}</span>
          </div>

          <dl className="pilot-drawerGrid pilot-studentAccessGrid">
            <div>
              <dt>Student PIN</dt>
              <dd>
                {oneTimePin ? (
                  <span className="pilot-studentPinReveal">
                    PIN for {snapshot.childName}: <strong>{oneTimePin}</strong>
                  </span>
                ) : hasPin ? (
                  <span className="pilot-resultsMono">••••</span>
                ) : (
                  'Not generated'
                )}
              </dd>
            </div>
            <div>
              <dt>Last PIN reset</dt>
              <dd>{formatDate(pinLastRotatedAt)}</dd>
            </div>
            <div>
              <dt>Last student login</dt>
              <dd>{formatDate(lastStudentLoginAt)}</dd>
            </div>
            <div>
              <dt>Parent connected</dt>
              <dd>{parentConnectionLabel || '—'}</dd>
            </div>
            <div>
              <dt>Family Claim Code</dt>
              <dd>
                <CopyableCompactValue value={familyClaimCode || snapshot.familyAccessCode} type="code" />
              </dd>
            </div>
            <div>
              <dt>Family Claim Link</dt>
              <dd>
                {familyClaimUrl ? (
                  <CopyableCompactValue value={familyClaimUrl} type="text" label="Claim link" />
                ) : (
                  '—'
                )}
              </dd>
            </div>
          </dl>

          <div className="pilot-studentAccessActions">
            <button
              type="button"
              className="pilot-rosterLaunchBtn"
              onClick={onRevealPin}
              disabled={!hasPin || pinActionLoading}
            >
              {pinActionLoading ? 'Revealing…' : 'Reveal PIN'}
            </button>
            <button
              type="button"
              className="pilot-rosterLaunchBtn"
              onClick={onCopyPin}
              disabled={!hasPin || pinActionLoading}
            >
              Copy PIN
            </button>
            <button
              type="button"
              className="pilot-rosterLaunchBtn"
              onClick={onResetPin}
              disabled={pinActionLoading}
              title="Resetting this PIN replaces the child's old login PIN."
            >
              {pinActionLoading ? 'Resetting…' : 'Reset PIN'}
            </button>
            <button type="button" className="pilot-rosterLaunchBtn" onClick={onCopyLoginInstructions}>
              Copy Login Instructions
            </button>
            <button
              type="button"
              className="pilot-rosterLaunchBtn"
              onClick={onCopyClaimLink}
              disabled={!onCopyClaimLink}
            >
              Copy Family Claim Link
            </button>
            {onInviteParent ? (
              <button type="button" className="pilot-rosterLaunchBtn" onClick={onInviteParent}>
                Invite Parent
              </button>
            ) : null}
          </div>
        </section>

        <dl className="pilot-drawerGrid">
          <div>
            <dt>Nickname</dt>
            <dd>{snapshot.nickname}</dd>
          </div>
          <div>
            <dt>Grade</dt>
            <dd>
              <ParticipantGradeMeta
                gradeLevel={snapshot.gradeLevel}
                gradeBand={snapshot.gradeBand}
                allowStretch={snapshot.allowStretchLevel}
                variant="facilitator"
              />
            </dd>
          </div>
          <div>
            <dt>Parent/Guardian</dt>
            <dd>{snapshot.parentName}</dd>
          </div>
          <div>
            <dt>Parent/Guardian Email</dt>
            <dd>
              <CopyableCompactValue value={snapshot.parentEmail} type="email" />
            </dd>
          </div>
          <div>
            <dt>Parent/Guardian Phone</dt>
            <dd>
              <CopyableCompactValue value={snapshot.parentPhone} type="phone" />
            </dd>
          </div>
          <div>
            <dt>Emergency Contact Name</dt>
            <dd>{snapshot.emergencyContactName}</dd>
          </div>
          <div>
            <dt>Emergency Contact Phone</dt>
            <dd>{snapshot.emergencyContactPhone}</dd>
          </div>
          <div>
            <dt>Family Access Code</dt>
            <dd>
              <CopyableCompactValue value={snapshot.familyAccessCode} type="code" />
            </dd>
          </div>
          <div>
            <dt>Camp Program Code</dt>
            <dd>
              <CopyableCompactValue value={snapshot.campProgramCode} type="code" label="Program" />
            </dd>
          </div>
          <div>
            <dt>Baseline Status</dt>
            <dd>{snapshot.baselineStatus}</dd>
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
            <dt>Current Week</dt>
            <dd>Week {Math.max(1, snapshot.modulesCompleted || 1)}</dd>
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
              <dt>Family Program</dt>
              <dd>{snapshot.familyProgramCode}</dd>
            </div>
          </dl>
        </details>
      </div>
    </PilotDrawer>
  );
}
