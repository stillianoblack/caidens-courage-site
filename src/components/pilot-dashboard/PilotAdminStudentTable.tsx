import React from 'react';
import type { PilotRosterRow } from '../../hooks/usePilotRosterData';
import CopyableCompactValue from './CopyableCompactValue';
import PilotStatusChip from './PilotStatusChip';

export type PilotAdminStudentTableVariant = 'roster' | 'settings';

type PilotAdminStudentTableProps = {
  rows: PilotRosterRow[];
  variant: PilotAdminStudentTableVariant;
  onStudentClick?: (participantId: string) => void;
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

function renderChildCell(
  row: PilotRosterRow,
  onStudentClick?: (participantId: string) => void,
): React.ReactNode {
  if (onStudentClick) {
    return (
      <button
        type="button"
        className="pilot-studentLinkBtn"
        onClick={() => onStudentClick(row.participantId)}
      >
        {row.childName}
      </button>
    );
  }
  return row.childName;
}

export default function PilotAdminStudentTable({
  rows,
  variant,
  onStudentClick,
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
            <th scope="col">Email</th>
            {isRoster ? <th scope="col">Phone</th> : null}
            {isRoster ? <th scope="col">Emergency</th> : null}
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
              <td className="pilot-adminCellChild">{renderChildCell(row, onStudentClick)}</td>
              {isRoster ? (
                <td className="pilot-adminCellText">{row.nickname}</td>
              ) : null}
              <td className="pilot-adminCellText">{row.parentGuardianName}</td>
              <td className="pilot-adminCellChip">
                <CopyableCompactValue value={row.parentEmail} type="email" />
              </td>
              {isRoster ? (
                <td className="pilot-adminCellChip">
                  <CopyableCompactValue value={row.parentPhone} type="phone" />
                </td>
              ) : null}
              {isRoster ? (
                <td className="pilot-adminCellChip">
                  {row.emergencyContact.trim() && row.emergencyContact !== '—' ? (
                    <CopyableCompactValue value={row.emergencyContact} type="text" label="Emergency" />
                  ) : (
                    <span className="pilot-copyChip pilot-copyChip--empty">—</span>
                  )}
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
