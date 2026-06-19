import React, { useCallback, useMemo } from 'react';
import type { PilotRosterRow } from '../../hooks/usePilotRosterData';
import type { GradeLevel } from '../../data/gradeLevelOptions';
import { useToast } from '../portal-design-system/ToastProvider';
import ResponsivePortalTable, {
  type ResponsivePortalTableColumn,
} from '../portal-design-system/ResponsivePortalTable';
import CopyableCompactValue from './CopyableCompactValue';
import PilotRosterGradeSelect from './PilotRosterGradeSelect';
import PilotStatusChip from './PilotStatusChip';

export type PilotAdminStudentTableVariant = 'roster' | 'settings';

type PilotAdminStudentTableProps = {
  rows: PilotRosterRow[];
  variant: PilotAdminStudentTableVariant;
  onStudentClick?: (participantId: string) => void;
  onGradeSaved?: (participantId: string, gradeLevel: GradeLevel) => void;
  onLaunchStudentSession?: (row: PilotRosterRow) => void;
  launchSessionLoadingId?: string | null;
  onResetPin?: (row: PilotRosterRow) => void;
  onCopyLoginInstructions?: (row: PilotRosterRow) => void;
  onCopyClaimLink?: (row: PilotRosterRow) => void;
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

function buildRosterColumns(
  isRoster: boolean,
  onStudentClick?: (participantId: string) => void,
  onGradeSaved?: (participantId: string, gradeLevel: GradeLevel) => void,
  onLaunchStudentSession?: (row: PilotRosterRow) => void,
  launchSessionLoadingId?: string | null,
): ResponsivePortalTableColumn<PilotRosterRow>[] {
  const columns: ResponsivePortalTableColumn<PilotRosterRow>[] = [
    {
      id: 'child',
      header: 'Child',
      mobileRole: 'primary',
      className: 'pilot-adminCellChild',
      render: (row) => <ChildNameCell row={row} onStudentClick={onStudentClick} />,
    },
  ];

  if (isRoster) {
    columns.push({
      id: 'nickname',
      header: 'Nickname',
      mobileRole: 'detail',
      className: 'pilot-adminCellText pilot-adminCellNickname',
      render: (row) => row.nickname,
    });
  }

  columns.push(
    {
      id: 'parent',
      header: 'Parent/Guardian',
      mobileRole: 'secondary',
      className: 'pilot-adminCellParent',
      render: (row) => <ParentGuardianCell row={row} />,
    },
    ...(isRoster
      ? [
          {
            id: 'parent-status',
            header: 'Parent Status',
            mobileRole: 'detail' as const,
            className: 'pilot-adminCellText',
            render: (row: PilotRosterRow) => row.parentConnectionLabel,
          },
          {
            id: 'student-access',
            header: 'Student Access',
            mobileRole: 'detail' as const,
            className: 'pilot-adminCellText',
            render: (row: PilotRosterRow) => (row.hasPin ? 'PIN ready' : 'Missing PIN'),
          },
        ]
      : []),
    ...(isRoster
      ? [
          {
            id: 'grade',
            header: 'Grade',
            mobileRole: 'detail' as const,
            className: 'pilot-adminCellGrade',
            render: (row: PilotRosterRow) => (
              <PilotRosterGradeSelect
                participantId={row.participantId}
                gradeLevel={row.gradeLevel}
                onSaved={(gradeLevel) => onGradeSaved?.(row.participantId, gradeLevel)}
              />
            ),
          },
        ]
      : []),
    {
      id: 'email',
      header: 'Email',
      mobileRole: 'detail',
      className: 'pilot-adminCellChip',
      render: (row) => <CopyableCompactValue value={row.parentEmail} type="email" />,
    },
    ...(isRoster
      ? [
          {
            id: 'phone',
            header: 'Phone',
            mobileRole: 'detail' as const,
            className: 'pilot-adminCellChip',
            render: (row: PilotRosterRow) => (
              <CopyableCompactValue value={row.parentPhone} type="phone" />
            ),
          },
        ]
      : []),
    {
      id: 'family-code',
      header: 'Family Code',
      mobileRole: 'detail',
      className: 'pilot-adminCellChip',
      render: (row) => <CopyableCompactValue value={row.familyAccessCode} type="code" />,
    },
    ...(isRoster
      ? []
      : [
          {
            id: 'baseline',
            header: 'Baseline',
            mobileRole: 'metric' as const,
            className: 'pilot-adminCellText',
            render: (row: PilotRosterRow) => row.baselineStatus,
          },
          {
            id: 'last-activity',
            header: 'Last Activity',
            mobileRole: 'detail' as const,
            className: 'pilot-adminCellDate',
            render: (row: PilotRosterRow) => formatCompactActivityDate(row.lastActivityAt),
          },
        ]),
  );

  if (isRoster) {
    columns.push({
      id: 'status',
      header: 'Status',
      mobileRole: 'metric',
      render: (row) => <PilotStatusChip status={row.status} />,
    });
    columns.push({
      id: 'launch-session',
      header: 'Session',
      mobileRole: 'detail',
      className: 'pilot-adminCellAction',
      render: (row) => (
        <button
          type="button"
          className="pilot-rosterLaunchBtn"
          onClick={() => onLaunchStudentSession?.(row)}
          disabled={!onLaunchStudentSession || launchSessionLoadingId === row.participantId}
        >
          {launchSessionLoadingId === row.participantId ? 'Launching…' : 'Launch Student Session'}
        </button>
      ),
    });
  }

  return columns;
}

export default function PilotAdminStudentTable({
  rows,
  variant,
  onStudentClick,
  onGradeSaved,
  onLaunchStudentSession,
  launchSessionLoadingId,
  onResetPin,
  onCopyLoginInstructions,
  onCopyClaimLink,
}: PilotAdminStudentTableProps) {
  const isRoster = variant === 'roster';
  const columns = useMemo(
    () =>
      buildRosterColumns(
        isRoster,
        onStudentClick,
        onGradeSaved,
        onLaunchStudentSession,
        launchSessionLoadingId,
      ),
    [
      isRoster,
      launchSessionLoadingId,
      onGradeSaved,
      onLaunchStudentSession,
      onStudentClick,
    ],
  );

  const expandedActions = onStudentClick
    ? (row: PilotRosterRow) => (
        <>
          <button
            type="button"
            className="pilot-nextCta"
            onClick={() => onStudentClick(row.participantId)}
          >
            View student details
          </button>
          {onLaunchStudentSession ? (
            <button
              type="button"
              className="pilot-nextCta"
              onClick={() => onLaunchStudentSession(row)}
              disabled={launchSessionLoadingId === row.participantId}
            >
              {launchSessionLoadingId === row.participantId
                ? 'Launching…'
                : 'Launch Student Session'}
            </button>
          ) : null}
        </>
      )
    : undefined;

  return (
    <ResponsivePortalTable
      columns={columns}
      rows={rows}
      rowKey={(row) => row.participantId}
      tableClassName="pilot-resultsTable pilot-resultsTable--adminCompact"
      wrapClassName="pilot-adminTableWrap pilot-adminTableWrap--scrollFallback"
      mobileAriaLabel={isRoster ? 'Program roster' : 'Student data'}
      expandedActions={expandedActions}
      mobileListVariant={isRoster ? 'standalone' : 'grouped'}
    />
  );
}
