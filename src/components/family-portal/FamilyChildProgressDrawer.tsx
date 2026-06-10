import React, { useMemo } from 'react';
import {
  BaselineOverviewBars,
  CopyableCompactValue,
  SlideOutDrawer,
} from '../portal-design-system';
import StatusChip from '../portal-design-system/StatusChip';
import type { BaselineBarRow } from '../portal-design-system/BaselineOverviewBars';
import type { FamilyChildSummary } from '../../lib/familyChildrenMetrics';
import type { ProgramGoalsRecord } from '../../lib/programGoalsService';
import type { StudentFamilyLink } from '../../lib/studentFamilyLinkService';

type FamilyChildProgressDrawerProps = {
  open: boolean;
  onClose: () => void;
  child: FamilyChildSummary | null;
  goalsRecord?: ProgramGoalsRecord | null;
  gallerySubmissionCount?: number;
  certificateCount?: number;
  campProgramCode?: string | null;
  campProgramName?: string | null;
  baselineScorePct?: number | null;
  baselineRows?: BaselineBarRow[];
  familyLink?: StudentFamilyLink | null;
  parentGuardianName?: string | null;
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
  campProgramCode = null,
  campProgramName = null,
  baselineScorePct = null,
  baselineRows = [],
  familyLink = null,
  parentGuardianName = null,
}: FamilyChildProgressDrawerProps) {
  const goals = useMemo(() => goalsRecord?.selected_goals ?? [], [goalsRecord?.selected_goals]);

  if (!child) return null;

  const guardianName =
    parentGuardianName ||
    [familyLink?.parent_first_name, familyLink?.parent_last_name].filter(Boolean).join(' ').trim() ||
    null;
  const guardianEmail = familyLink?.parent_email?.trim() || null;
  const guardianPhone = familyLink?.parent_phone?.trim() || null;
  const campLabel = campProgramName ?? campProgramCode;

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
            <p className="pilot-drawerSubtitle">
              {child.nickname && child.nickname !== child.displayName
                ? `Nickname: ${child.nickname}`
                : campLabel
                  ? `Linked program: ${campLabel}`
                  : 'Child progress and family goals'}
            </p>
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

          {campLabel ? (
            <p className="family-panelHelper">
              Linked camp/program: <strong>{campLabel}</strong>
              {campProgramCode && campProgramCode !== campLabel ? (
                <span className="family-childDrawerCodeWrap">
                  <CopyableCompactValue
                    value={campProgramCode}
                    type="code"
                    label="Camp Code"
                    truncateMiddle
                  />
                </span>
              ) : null}
            </p>
          ) : null}

          {guardianName || guardianEmail || guardianPhone ? (
            <section className="family-childDrawerSection">
              <h3 className="family-panelBlockTitle">Parent / Guardian</h3>
              <dl className="pilot-drawerGrid">
                {guardianName ? (
                  <div>
                    <dt>Name</dt>
                    <dd>{guardianName}</dd>
                  </div>
                ) : null}
                {guardianEmail ? (
                  <div>
                    <dt>Email</dt>
                    <dd>
                      <CopyableCompactValue value={guardianEmail} type="email" label="Email" />
                    </dd>
                  </div>
                ) : null}
                {guardianPhone ? (
                  <div>
                    <dt>Phone</dt>
                    <dd>
                      <CopyableCompactValue value={guardianPhone} type="phone" label="Phone" />
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>
          ) : null}

          <dl className="pilot-drawerGrid">
            <div>
              <dt>Baseline score</dt>
              <dd>{baselineScorePct != null ? `${baselineScorePct}%` : '—'}</dd>
            </div>
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
              <dt>Certificates earned</dt>
              <dd>{certificateCount}</dd>
            </div>
          </dl>

          {baselineRows.length > 0 ? (
            <section className="family-childDrawerSection">
              <h3 className="family-panelBlockTitle">Baseline scores</h3>
              <BaselineOverviewBars rows={baselineRows} />
            </section>
          ) : null}

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

          <p className="family-childDrawerExportNote">
            Progress export (summary, modules, certificates, goals) — coming soon.
          </p>

          {child.participantId ? (
            <details className="pilot-drawerDebug pilot-drawerDebug--inline">
              <summary>Debug IDs</summary>
              <dl className="pilot-drawerGrid">
                <div>
                  <dt>participant_id</dt>
                  <dd>{child.participantId}</dd>
                </div>
                {familyLink?.id ? (
                  <div>
                    <dt>family_link_id</dt>
                    <dd>{familyLink.id}</dd>
                  </div>
                ) : null}
                {campProgramCode ? (
                  <div>
                    <dt>camp_program_code</dt>
                    <dd>{campProgramCode}</dd>
                  </div>
                ) : null}
              </dl>
            </details>
          ) : null}
        </>
      }
    />
  );
}
