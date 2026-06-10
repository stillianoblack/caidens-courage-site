import React, { useMemo } from 'react';
import { SlideOutDrawer } from '../portal-design-system';
import StatusChip from '../portal-design-system/StatusChip';
import type { FamilyChildSummary } from '../../lib/familyChildrenMetrics';
import type { ProgramGoalsRecord } from '../../lib/programGoalsService';

type FamilyChildProgressDrawerProps = {
  open: boolean;
  onClose: () => void;
  child: FamilyChildSummary | null;
  goalsRecord?: ProgramGoalsRecord | null;
  gallerySubmissionCount?: number;
  certificateCount?: number;
};

function baselineVariant(status: FamilyChildSummary['baselineStatus']) {
  if (status === 'Complete') return 'baseline-complete' as const;
  if (status === 'In Progress') return 'in-progress' as const;
  return 'not-started' as const;
}

export default function FamilyChildProgressDrawer({
  open,
  onClose,
  child,
  goalsRecord,
  gallerySubmissionCount = 0,
  certificateCount = 0,
}: FamilyChildProgressDrawerProps) {
  const goals = useMemo(() => goalsRecord?.selected_goals ?? [], [goalsRecord?.selected_goals]);

  if (!child) return null;

  return (
    <SlideOutDrawer
      open={open}
      onClose={onClose}
      titleId="family-child-progress-title"
      className="pilot-drawer pilot-drawer--form"
      header={
        <div className="pilot-drawerHead">
          <div>
            <h2 id="family-child-progress-title" className="pilot-drawerTitle">
              {child.displayName}
            </h2>
            <p className="pilot-drawerSubtitle">Child progress and family goals</p>
          </div>
          <button type="button" className="pilot-drawerClose" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
      }
      body={
        <>
          <div className="pilot-drawerStatusRow">
            <StatusChip
              label={child.baselineStatus}
              variant={baselineVariant(child.baselineStatus)}
            />
            <span className="pilot-drawerBadge">{child.progressPct}% overall</span>
          </div>

          <dl className="pilot-drawerGrid">
            <div>
              <dt>Modules completed</dt>
              <dd>
                {child.completedCount} of {child.totalCount}
              </dd>
            </div>
            <div>
              <dt>Last activity</dt>
              <dd>{child.latestActivity ?? '—'}</dd>
            </div>
            <div>
              <dt>Gallery submissions</dt>
              <dd>{gallerySubmissionCount}</dd>
            </div>
            <div>
              <dt>Certificates</dt>
              <dd>{certificateCount}</dd>
            </div>
          </dl>

          {goals.length > 0 ? (
            <section className="family-childDrawerGoals">
              <h3 className="family-panelBlockTitle">Family goals</h3>
              <ul className="family-childDrawerGoalsList">
                {goals.map((goal) => (
                  <li key={goal}>{goal}</li>
                ))}
              </ul>
            </section>
          ) : (
            <p className="family-panelHelper">No family goals saved yet.</p>
          )}

          {child.participantId ? (
            <details className="pilot-drawerDebug pilot-drawerDebug--inline">
              <summary>Debug IDs</summary>
              <dl className="pilot-drawerGrid">
                <div>
                  <dt>participant_id</dt>
                  <dd>{child.participantId}</dd>
                </div>
              </dl>
            </details>
          ) : null}
        </>
      }
    />
  );
}
