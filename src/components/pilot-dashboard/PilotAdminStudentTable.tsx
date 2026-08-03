import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { PilotRosterRow } from '../../hooks/usePilotRosterData';
import type { GradeLevel } from '../../data/gradeLevelOptions';
import { facilitatorBaselineCheckPath } from '../../lib/askB4DeepLinks';
import { useToast } from '../portal-design-system/ToastProvider';
import ResponsivePortalTable, {
  type ResponsivePortalTableColumn,
} from '../portal-design-system/ResponsivePortalTable';
import CopyableCompactValue from './CopyableCompactValue';
import PilotRosterGradeSelect from './PilotRosterGradeSelect';

export type PilotAdminStudentTableVariant = 'roster' | 'settings';

type PilotAdminStudentTableProps = {
  rows: PilotRosterRow[];
  variant: PilotAdminStudentTableVariant;
  onStudentClick?: (participantId: string) => void;
  onGradeSaved?: (participantId: string, gradeLevel: GradeLevel) => void;
  onInviteParent?: (row: PilotRosterRow) => void;
  showBaselineActions?: boolean;
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

function ContactCell({ row }: { row: PilotRosterRow }) {
  const hasEmail = row.parentEmail.trim() && row.parentEmail !== '—';
  const hasPhone = row.parentPhone.trim() && row.parentPhone !== '—';

  if (!hasEmail && !hasPhone) {
    return <span className="pilot-adminCellMuted">—</span>;
  }

  return (
    <div className="pilot-adminContactCell">
      {hasEmail ? <CopyableCompactValue value={row.parentEmail} type="email" /> : null}
      {hasPhone ? <CopyableCompactValue value={row.parentPhone} type="phone" /> : null}
    </div>
  );
}

function RosterStatusPill({ tone, children }: { tone: 'ready' | 'pending' | 'info' | 'neutral'; children: React.ReactNode }) {
  return <span className={`pilot-rosterStatusPill pilot-rosterStatusPill--${tone}`}>{children}</span>;
}

function buildRosterColumns(
  isRoster: boolean,
  onStudentClick?: (participantId: string) => void,
  onGradeSaved?: (participantId: string, gradeLevel: GradeLevel) => void,
  onInviteParent?: (row: PilotRosterRow) => void,
  showBaselineActions = false,
): ResponsivePortalTableColumn<PilotRosterRow>[] {
  const columns: ResponsivePortalTableColumn<PilotRosterRow>[] = [
    {
      id: 'child',
      header: 'Child',
      mobileRole: 'primary',
      className: 'pilot-adminCellChild',
      render: (row) => <ChildNameCell row={row} onStudentClick={onStudentClick} />,
      renderMobileSummary: (row) => <span title={row.childName}>{row.childName}</span>,
    },
  ];

  if (isRoster && showBaselineActions) {
    columns.push({
      id: 'baseline-action',
      header: 'Baseline',
      mobileRole: 'detail',
      className: 'pilot-adminCellText',
      render: (row) => (
        <Link to={facilitatorBaselineCheckPath(row.participantId)} className="pilot-studentLinkBtn">
          {row.baselineStatus === 'Complete' ? 'Open Baseline' : 'Start Baseline'}
        </Link>
      ),
    });
  }

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
      renderMobileSummary: (row) => <span title={row.parentGuardianName}>{row.parentGuardianShort}</span>,
    },
    ...(isRoster
      ? [
          {
            id: 'parent-status',
            header: 'Parent Status',
            mobileRole: 'detail' as const,
            className: 'pilot-adminCellText',
            render: (row: PilotRosterRow) => (
              <RosterStatusPill
                tone={row.parentConnectionStatus === 'connected'
                  ? 'ready'
                  : row.parentConnectionStatus === 'invited'
                    ? 'pending'
                    : 'neutral'}
              >
                {row.parentConnectionStatus === 'connected'
                  ? 'Parent Connected'
                  : row.parentConnectionStatus === 'invited'
                    ? 'Invitation Pending'
                    : 'Parent Not Connected'}
              </RosterStatusPill>
            ),
          },
          {
            id: 'student-access',
            header: 'Student Access',
            mobileRole: 'detail' as const,
            className: 'pilot-adminCellText',
            render: (row: PilotRosterRow) => {
              const pinStatus = row.pinStatus ?? (row.hasPin ? 'ready' : 'missing');
              return (
                <RosterStatusPill tone={pinStatus === 'ready' ? 'ready' : pinStatus === 'disabled' ? 'neutral' : 'pending'}>
                  {pinStatus === 'ready' ? 'PIN Ready' : pinStatus === 'disabled' ? 'Disabled' : 'Missing PIN'}
                </RosterStatusPill>
              );
            },
          },
          ...(onInviteParent
            ? [
                {
                  id: 'invite-parent',
                  header: 'Family',
                  mobileRole: 'detail' as const,
                  className: 'pilot-adminCellText',
                  render: (row: PilotRosterRow) => (
                    <button
                      type="button"
                      className="pilot-studentLinkBtn"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onInviteParent(row);
                      }}
                    >
                      Invite Parent
                    </button>
                  ),
                },
              ]
            : []),
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
    ...(isRoster
      ? [
          {
            id: 'contact',
            header: 'Contact',
            mobileRole: 'detail' as const,
            className: 'pilot-adminCellContact',
            render: (row: PilotRosterRow) => <ContactCell row={row} />,
          },
        ]
      : [
          {
            id: 'email',
            header: 'Email',
            mobileRole: 'detail' as const,
            className: 'pilot-adminCellChip',
            render: (row: PilotRosterRow) => (
              <CopyableCompactValue value={row.parentEmail} type="email" />
            ),
          },
        ]),
    {
      id: 'family-code',
      header: 'Family Code',
      mobileRole: 'detail',
      className: 'pilot-adminCellChip',
      render: (row) => (
        <CopyableCompactValue
          value={row.familyClaimCode || (row.familyAccessCode !== '—' ? row.familyAccessCode : '—')}
          type="code"
        />
      ),
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

  return columns;
}

export default function PilotAdminStudentTable({
  rows,
  variant,
  onStudentClick,
  onGradeSaved,
  onInviteParent,
  showBaselineActions = false,
}: PilotAdminStudentTableProps) {
  const isRoster = variant === 'roster';
  const columns = useMemo(
    () =>
      buildRosterColumns(isRoster, onStudentClick, onGradeSaved, onInviteParent, showBaselineActions),
    [isRoster, onGradeSaved, onInviteParent, onStudentClick, showBaselineActions],
  );

  const expandedActions = onStudentClick
    ? (row: PilotRosterRow) => (
        <button
          type="button"
          className="pilot-nextCta"
          onClick={() => onStudentClick(row.participantId)}
        >
          View student details
        </button>
      )
    : undefined;

  return (
    <ResponsivePortalTable
      columns={columns}
      rows={rows}
      rowKey={(row) => row.participantId}
      tableClassName="pilot-resultsTable pilot-resultsTable--adminCompact"
      wrapClassName={
        isRoster ? 'pilot-adminTableWrap pilot-adminTableWrap--roster' : 'pilot-adminTableWrap'
      }
      mobileAriaLabel={isRoster ? 'Program roster' : 'Student data'}
      expandedActions={expandedActions}
      mobileListVariant={isRoster ? 'standalone' : 'grouped'}
    />
  );
}
