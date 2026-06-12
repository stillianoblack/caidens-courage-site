import React, { useCallback } from 'react';
import type { PilotRosterRow } from '../../hooks/usePilotRosterData';
import type { GradeLevel } from '../../data/gradeLevelOptions';
import { useToast } from '../portal-design-system/ToastProvider';
import CopyableCompactValue from './CopyableCompactValue';
import PilotRosterGradeSelect from './PilotRosterGradeSelect';
import PilotStatusChip from './PilotStatusChip';

export type PilotAdminStudentTableVariant = 'roster' | 'settings';

type PilotAdminStudentTableProps = {
  rows: PilotRosterRow[];
  variant: PilotAdminStudentTableVariant;
  onStudentClick?: (participantId: string) => void;
  onGradeSaved?: (participantId: string, gradeLevel: GradeLevel) => void;
};

function formatCompactActivityDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function ChildNameCell({
  row,
  onStudentClick,
}: {
  row: PilotRosterRow;
  onStudentClick?: (participantId: string) => void;
}) {
  if (onStudentClick) {
    return (
      <button
        type="button"
        className="pilot-studentLinkBtn"
        title={row.childName}
        onClick={() => onStudentClick(row.participantId)}
      >
        {row.childName}
      </button>
    );
  }
  return <span title={row.childName}>{row.childName}</span>;
}

function ParentGuardianCell({ row }: { row: PilotRosterRow }) {
  const { showToast } = useToast();
  const fullName = row.parentGuardianName;
  const canCopy = fullName.trim() && fullName !== '—';

  const handleClick = useCallback(async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(fullName);
      showToast('Copied.', 'success');
    } catch {
      /* clipboard unavailable */
    }
  }, [canCopy, fullName, showToast]);

  return (
    <button
      type="button"
      className="pilot-parentShortBtn"
      title={fullName}
      onClick={() => void handleClick()}
      disabled={!canCopy}
    >
      {row.parentGuardianShort}
    </button>
  );
}

export default function PilotAdminStudentTable({
  rows,
  variant,
  onStudentClick,
  onGradeSaved,
}: PilotAdminStudentTableProps) {
  const isRoster = variant === 'roster';

  return (
    <div className="pilot-adminTableWrap pilot-adminTableWrap--scrollFallback">
      <table className="pilot-resultsTable pilot-resultsTable--adminCompact">
        <thead>
          <tr>
            <th scope="col">Child</th>
            {isRoster ? <th scope="col">Nickname</th> : null}
            <th scope="col">Parent/Guardian</th>
            {isRoster ? <th scope="col">Grade</th> : null}
            <th scope="col">Email</th>
            {isRoster ? <th scope="col">Phone</th> : null}
            <th scope="col">Family Code</th>
            <th scope="col">Baseline</th>
            {isRoster ? <th scope="col">Modules</th> : null}
            <th scope="col">Last Activity</th>
            {isRoster ? <th scope="col">Status</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.participantId}>
              <td className="pilot-adminCellChild">
                <ChildNameCell row={row} onStudentClick={onStudentClick} />
              </td>
              {isRoster ? (
                <td className="pilot-adminCellText pilot-adminCellNickname">{row.nickname}</td>
              ) : null}
              <td className="pilot-adminCellParent">
                <ParentGuardianCell row={row} />
              </td>
              {isRoster ? (
                <td className="pilot-adminCellGrade">
                  <PilotRosterGradeSelect
                    participantId={row.participantId}
                    gradeLevel={row.gradeLevel}
                    onSaved={(gradeLevel) => onGradeSaved?.(row.participantId, gradeLevel)}
                  />
                </td>
              ) : null}
              <td className="pilot-adminCellChip">
                <CopyableCompactValue value={row.parentEmail} type="email" />
              </td>
              {isRoster ? (
                <td className="pilot-adminCellChip">
                  <CopyableCompactValue value={row.parentPhone} type="phone" />
                </td>
              ) : null}
              <td className="pilot-adminCellChip">
                <CopyableCompactValue value={row.familyAccessCode} type="code" />
              </td>
              <td className="pilot-adminCellText">{row.baselineStatus}</td>
              {isRoster ? (
                <td className="pilot-adminCellNum">{row.moduleCompletions}</td>
              ) : null}
              <td className="pilot-adminCellDate">{formatCompactActivityDate(row.lastActivityAt)}</td>
              {isRoster ? (
                <td>
                  <PilotStatusChip status={row.status} />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
