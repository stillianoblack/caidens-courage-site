import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '../../portal-design-system/ToastProvider';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { writeFacilitatorStudentContinuityForLaunch } from '../../../lib/facilitatorSessionContinuity';
import { kidPlaySessionStartPath } from '../../../config/courageRoutes';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import { programDashboardTabPath } from '../../../lib/programDashboardNav';
import {
  filterRosterRows,
  isRosterFilterId,
  ROSTER_FILTER_LABELS,
} from '../../../lib/pilotOverviewInsights';
import { resolveFacilitatorRosterProgramCode } from '../../../lib/resolveFacilitatorRosterProgramCode';
import { buildStudentLoginInstructions } from '../../../lib/familyClaimCode';
import { resetStudentPinViaFunction, revealStudentPinViaFunction, copyStudentPinWithAudit } from '../../../lib/studentPinService';
import { ensureStudentAccessReady, copyFamilyClaimLinkForStudent } from '../../../lib/ensureStudentAccessReady';
import {
  logMissingRosterAccessContext,
  resolveStudentRosterAccessContext,
  type StudentRosterAccessContext,
} from '../../../lib/studentRosterAccessContext';
import { resolveFacilitatorKidPlayLaunch } from '../../../lib/facilitatorKidPlayLaunch';
import { isKidPlayRosterLocked, setKidPlayRosterLocked } from '../../../lib/kidPlayRosterLock';
import { kidShellAwareNavigate } from '../../../lib/kidShellNav';
import { usePilotRosterData, type PilotRosterRow } from '../../../hooks/usePilotRosterData';
import FacilitatorMoveSessionModal from '../../kid-play-shell/FacilitatorMoveSessionModal';
import KidPlayRosterLockGate from '../../kid-play-shell/KidPlayRosterLockGate';
import { PortalPageIntro } from '../../portal-design-system';
import DashboardWidgetSkeleton from '../DashboardWidgetSkeleton';
import PilotAddStudentDrawer from '../PilotAddStudentDrawer';
import PilotAdminStudentTable from '../PilotAdminStudentTable';
import PilotStudentDetailDrawer from '../PilotStudentDetailDrawer';
import PilotInviteParentModal from '../PilotInviteParentModal';
import { inviteParentForStudent } from '../../../lib/inviteParentForStudent';

type PilotRosterPanelProps = {
  programCode?: string;
  loading?: boolean;
};

export default function PilotRosterPanel({ programCode, loading: externalLoading }: PilotRosterPanelProps) {
  const navigate = useNavigate();
  const resolvedProgramCode = resolveFacilitatorRosterProgramCode(programCode);
  const { rows, participants, familyLinks, assessmentResults, moduleResults, loading, warning, refresh, updateParticipantGrade } =
    usePilotRosterData(resolvedProgramCode, true);
  const [searchParams, setSearchParams] = useSearchParams();
  const rawFilter = searchParams.get('filter');
  const rosterFilter = isRosterFilterId(rawFilter) ? rawFilter : null;
  const [drawerParticipantId, setDrawerParticipantId] = useState<string | null>(null);
  const [drawerAccess, setDrawerAccess] = useState<StudentRosterAccessContext | null>(null);
  const [drawerAccessLoading, setDrawerAccessLoading] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [rosterLocked, setRosterLocked] = useState(() => isKidPlayRosterLocked());
  const [launchSessionLoadingId, setLaunchSessionLoadingId] = useState<string | null>(null);
  const [pinActionLoadingId, setPinActionLoadingId] = useState<string | null>(null);
  const [launcherParticipantId, setLauncherParticipantId] = useState<string>('');
  const [movePrompt, setMovePrompt] = useState<{
    row: PilotRosterRow;
    existingSessionId: string;
  } | null>(null);
  const [pinReveal, setPinReveal] = useState<{ participantId: string; childName: string; pin: string } | null>(null);
  const [inviteParentRow, setInviteParentRow] = useState<PilotRosterRow | null>(null);
  const [inviteParentSubmitting, setInviteParentSubmitting] = useState(false);
  const [inviteParentError, setInviteParentError] = useState<string | null>(null);
  const program = readActivePilotProgram();
  const { showToast } = useToast();
  const showLoading = externalLoading || loading;

  const resolveAccessContext = useCallback(
    (participantId: string | null, row?: PilotRosterRow | null): StudentRosterAccessContext | null => {
      if (!participantId) return null;
      const rosterRow = row ?? rows.find((item) => item.participantId === participantId) ?? null;
      return resolveStudentRosterAccessContext({
        participantId,
        participants,
        row: rosterRow,
        fallbackProgramCode: resolvedProgramCode,
      });
    },
    [participants, resolvedProgramCode, rows],
  );

  const openStudentDrawer = useCallback(
    (participantId: string) => {
      setDrawerParticipantId(participantId);
      setDrawerAccess(resolveAccessContext(participantId));
    },
    [resolveAccessContext],
  );

  const applyAccessReady = useCallback(
    (ready: Awaited<ReturnType<typeof ensureStudentAccessReady>>) => {
      if (!ready.success) return;
      setDrawerAccess((current) => {
        if (!current || current.participantId !== ready.access.participantId) return current;
        return {
          ...current,
          programCode: ready.access.programCode,
          hasPin: ready.access.hasPin,
          familyClaimCode: ready.access.familyClaimCode,
          familyClaimUrl: ready.access.familyClaimUrl,
        };
      });
    },
    [],
  );

  useEffect(() => {
    if (!drawerParticipantId) {
      setDrawerAccess(null);
      return;
    }

    const ctx = resolveAccessContext(drawerParticipantId);
    setDrawerAccess(ctx);

    let cancelled = false;
    setDrawerAccessLoading(true);
    void (async () => {
      const ready = await ensureStudentAccessReady({
        participantId: drawerParticipantId,
        programCodeHint: ctx?.programCode,
        displayNameHint: ctx?.childName,
      });
      if (cancelled) return;
      if (ready.success) {
        applyAccessReady(ready);
        if (ready.access.pinAssigned || ready.access.claimCodeAssigned) {
          void refresh();
        }
      }
      setDrawerAccessLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [applyAccessReady, drawerParticipantId, refresh, resolveAccessContext]);

  const requireDrawerContext = useCallback(
    (action: string): StudentRosterAccessContext | null => {
      const ctx =
        drawerAccess ??
        (drawerParticipantId ? resolveAccessContext(drawerParticipantId) : null);
      logMissingRosterAccessContext(action, ctx);
      if (!ctx?.participantId || !ctx.programCode) {
        showToast('Missing student access context. Refresh roster and try again.', 'error');
        return null;
      }
      return ctx;
    },
    [drawerAccess, drawerParticipantId, resolveAccessContext, showToast],
  );

  const handleCopyLoginInstructions = useCallback(
    async (ctx: StudentRosterAccessContext) => {
      const ready = await ensureStudentAccessReady({
        participantId: ctx.participantId,
        programCodeHint: ctx.programCode,
        displayNameHint: ctx.childName,
      });
      if (!ready.success) {
        showToast(ready.error, 'error');
        return;
      }
      applyAccessReady(ready);

      let revealedPin =
        pinReveal?.participantId === ctx.participantId
          ? pinReveal.pin
          : ready.access.generatedPin ?? null;
      if (!revealedPin) {
        const result = await revealStudentPinViaFunction({
          participantId: ctx.participantId,
          programCode: ready.access.programCode,
        });
        if (!('pin' in result)) {
          showToast(result.error, 'error');
          return;
        }
        revealedPin = result.pin;
        setPinReveal({ participantId: ctx.participantId, childName: ctx.childName, pin: result.pin });
      }
      const instructions = buildStudentLoginInstructions({
        studentName: ctx.childName,
        programName: program?.programName?.trim() || ready.access.programCode,
        programCode: ready.access.programCode,
        pin: revealedPin,
      });
      try {
        await navigator.clipboard.writeText(instructions);
        showToast(`Login instructions copied for ${ctx.childName}.`, 'success');
      } catch {
        showToast('Copy failed.', 'error');
      }
    },
    [applyAccessReady, pinReveal, program?.programName, showToast],
  );

  const handleCopyClaimLink = useCallback(
    async (ctx: StudentRosterAccessContext) => {
      const copied = await copyFamilyClaimLinkForStudent({
        participantId: ctx.participantId,
        programCodeHint: ctx.programCode,
        displayNameHint: ctx.childName,
      });
      if (!copied.success) {
        showToast(copied.error, 'error');
        return;
      }
      setDrawerAccess((current) =>
        current && current.participantId === ctx.participantId
          ? { ...current, familyClaimUrl: copied.url }
          : current,
      );
      showToast('Family claim link copied.', 'success');
      void refresh();
    },
    [refresh, showToast],
  );

  const handleCopyClaimCode = useCallback(
    async (ctx: StudentRosterAccessContext) => {
      const ready = await ensureStudentAccessReady({
        participantId: ctx.participantId,
        programCodeHint: ctx.programCode,
        displayNameHint: ctx.childName,
      });
      if (!ready.success) {
        showToast(ready.error, 'error');
        return;
      }
      const code = ready.access.familyClaimCode;
      if (!code) {
        showToast('No family claim code yet.', 'error');
        return;
      }
      try {
        await navigator.clipboard.writeText(code);
        showToast('Family claim code copied.', 'success');
      } catch {
        showToast('Copy failed.', 'error');
      }
      setDrawerAccess((current) =>
        current && current.participantId === ctx.participantId
          ? { ...current, familyClaimCode: code, familyClaimUrl: ready.access.familyClaimUrl }
          : current,
      );
    },
    [showToast],
  );

  const handleInviteParentSubmit = useCallback(
    async (input: {
      parentEmail: string;
      parentFirstName?: string;
      parentLastName?: string;
      sendWelcomeEmail: boolean;
    }) => {
      const ctx = inviteParentRow
        ? resolveStudentRosterAccessContext({
            participantId: inviteParentRow.participantId,
            participants,
            row: inviteParentRow,
            fallbackProgramCode: resolvedProgramCode,
          })
        : null;
      if (!ctx?.participantId || !ctx.programCode) {
        setInviteParentError('Missing student access context. Close and reopen the student drawer.');
        return;
      }

      setInviteParentSubmitting(true);
      setInviteParentError(null);

      const ready = await ensureStudentAccessReady({
        participantId: ctx.participantId,
        programCodeHint: ctx.programCode,
        displayNameHint: ctx.childName,
      });
      if (!ready.success) {
        setInviteParentSubmitting(false);
        setInviteParentError(ready.error);
        return;
      }

      const result = await inviteParentForStudent({
        participantId: ctx.participantId,
        campProgramCode: ready.access.programCode,
        parentEmail: input.parentEmail,
        parentFirstName: input.parentFirstName,
        parentLastName: input.parentLastName,
        sendWelcomeEmail: input.sendWelcomeEmail,
      });
      setInviteParentSubmitting(false);
      if (!result.success) {
        setInviteParentError(result.message);
        return;
      }
      showToast(result.message, 'success');
      setInviteParentRow(null);
      void refresh();
    },
    [inviteParentRow, participants, refresh, resolvedProgramCode, showToast],
  );

  const handleResetPin = useCallback(
    async (ctx: StudentRosterAccessContext) => {
      const confirmed = window.confirm(
        'Resetting this PIN replaces the child\'s old login PIN. Continue?',
      );
      if (!confirmed) return;

      setPinActionLoadingId(ctx.participantId);
      const ready = await ensureStudentAccessReady({
        participantId: ctx.participantId,
        programCodeHint: ctx.programCode,
        displayNameHint: ctx.childName,
      });
      if (!ready.success) {
        setPinActionLoadingId(null);
        showToast(ready.error, 'error');
        return;
      }

      const result = await resetStudentPinViaFunction({
        participantId: ctx.participantId,
        programCode: ready.access.programCode,
      });
      setPinActionLoadingId(null);
      if (!('pin' in result)) {
        showToast(result.error, 'error');
        return;
      }
      setPinReveal({ participantId: ctx.participantId, childName: ctx.childName, pin: result.pin });
      setDrawerAccess({
        ...ctx,
        programCode: ready.access.programCode,
        hasPin: true,
        familyClaimCode: ready.access.familyClaimCode,
        familyClaimUrl: ready.access.familyClaimUrl,
      });
      showToast(`PIN generated for ${ctx.childName}.`, 'success');
      void refresh();
    },
    [refresh, showToast],
  );

  const handleRevealPin = useCallback(
    async (ctx: StudentRosterAccessContext) => {
      setPinActionLoadingId(ctx.participantId);
      const ready = await ensureStudentAccessReady({
        participantId: ctx.participantId,
        programCodeHint: ctx.programCode,
        displayNameHint: ctx.childName,
      });
      if (!ready.success) {
        setPinActionLoadingId(null);
        showToast(ready.error, 'error');
        return;
      }

      const result = await revealStudentPinViaFunction({
        participantId: ctx.participantId,
        programCode: ready.access.programCode,
      });
      setPinActionLoadingId(null);
      if (!('pin' in result)) {
        showToast(result.error, 'error');
        return;
      }
      setPinReveal({ participantId: ctx.participantId, childName: ctx.childName, pin: result.pin });
      setDrawerAccess({
        ...ctx,
        programCode: ready.access.programCode,
        hasPin: true,
        familyClaimCode: ready.access.familyClaimCode,
        familyClaimUrl: ready.access.familyClaimUrl,
      });
    },
    [showToast],
  );

  const displayRows = useMemo(
    () =>
      filterRosterRows(rows, rosterFilter, {
        assessments: assessmentResults,
        modules: moduleResults,
      }),
    [assessmentResults, moduleResults, rosterFilter, rows],
  );

  const clearFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('filter');
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if (!launcherParticipantId && displayRows[0]) {
      setLauncherParticipantId(displayRows[0].participantId);
    }
  }, [displayRows, launcherParticipantId]);

  const launcherRow = useMemo(
    () => displayRows.find((row) => row.participantId === launcherParticipantId) ?? displayRows[0] ?? null,
    [displayRows, launcherParticipantId],
  );

  useEffect(() => {
    if (searchParams.get('addStudent') !== '1') return;
    setAddStudentOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete('addStudent');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    setRosterLocked(isKidPlayRosterLocked());
  }, []);

  const completeLaunch = useCallback(
    async (row: PilotRosterRow, moveFromExistingSessionId?: string) => {
      setLaunchSessionLoadingId(row.participantId);
      try {
        const program = readActivePilotProgram();
        const result = await resolveFacilitatorKidPlayLaunch({
          childId: row.participantId,
          childName: row.childName,
          organizationId: program?.id ?? null,
          moveFromExistingSessionId,
        });

        if (result.kind === 'error') {
          showToast(result.message, 'error');
          return;
        }

        if (result.kind === 'conflict') {
          setMovePrompt({
            row,
            existingSessionId: result.conflict.existingSession.id,
          });
          return;
        }

        setKidPlayRosterLocked(false);
        setRosterLocked(false);
        await writeFacilitatorStudentContinuityForLaunch({
          childId: row.participantId,
          childDisplayName: row.childName,
          programCode: program?.programCode ?? undefined,
        });
        kidShellAwareNavigate(navigate, kidPlaySessionStartPath(result.session.id));
      } finally {
        setLaunchSessionLoadingId(null);
      }
    },
    [navigate, showToast],
  );

  const handleLaunchStudentSession = useCallback(
    (row: PilotRosterRow) => {
      if (rosterLocked) {
        showToast('This shared device is locked. Enter facilitator email to continue.', 'error');
        return;
      }
      void completeLaunch(row);
    },
    [completeLaunch, rosterLocked, showToast],
  );

  const handleMoveSessionHere = useCallback(() => {
    if (!movePrompt) return;
    void completeLaunch(movePrompt.row, movePrompt.existingSessionId).finally(() => {
      setMovePrompt(null);
    });
  }, [completeLaunch, movePrompt]);

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
          <PortalPageIntro>
            Students enrolled in the active program with Parent/Guardian contact and progress summary.
          </PortalPageIntro>
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

      {displayRows.length > 0 ? (
        <section className="pilot-rosterLauncherCard" aria-labelledby="student-session-launcher-title">
          <div>
            <h3 id="student-session-launcher-title">Student Session Launcher</h3>
            <p>Select a student, launch Kid Shell, or copy login instructions.</p>
          </div>
          <label className="pilot-rosterLauncherField">
            <span>Select student</span>
            <select
              value={launcherRow?.participantId ?? ''}
              onChange={(event) => setLauncherParticipantId(event.target.value)}
            >
              {displayRows.map((row) => (
                <option key={row.participantId} value={row.participantId}>
                  {row.childName}
                </option>
              ))}
            </select>
          </label>
          <div className="pilot-rosterLauncherActions">
            <button
              type="button"
              className="pilot-rosterLaunchBtn"
              disabled={!launcherRow || launchSessionLoadingId === launcherRow.participantId}
              onClick={() => launcherRow && handleLaunchStudentSession(launcherRow)}
            >
              {launcherRow && launchSessionLoadingId === launcherRow.participantId
                ? 'Launching…'
                : 'Launch Student Session'}
            </button>
            <button
              type="button"
              className="pilot-rosterLaunchBtn"
              disabled={!launcherRow || drawerAccessLoading}
              onClick={() => {
                if (!launcherRow) return;
                const ctx = resolveAccessContext(launcherRow.participantId, launcherRow);
                if (ctx) void handleCopyLoginInstructions(ctx);
              }}
            >
              Copy login instructions
            </button>
          </div>
        </section>
      ) : null}

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
          onStudentClick={openStudentDrawer}
          onGradeSaved={updateParticipantGrade}
          onInviteParent={(row) => {
            openStudentDrawer(row.participantId);
            setInviteParentRow(row);
          }}
          showBaselineActions={rosterFilter === 'missing-baseline'}
        />
      )}

      <PilotStudentDetailDrawer
        open={Boolean(drawerParticipantId)}
        participantId={drawerParticipantId}
        onClose={() => {
          setDrawerParticipantId(null);
          setDrawerAccess(null);
          setPinReveal(null);
        }}
        participants={participants}
        familyLinks={familyLinks}
        assessmentResults={assessmentResults}
        moduleResults={moduleResults}
        programCode={drawerAccess?.programCode ?? resolvedProgramCode}
        hasPin={drawerAccess?.hasPin}
        pinLastRotatedAt={drawerAccess?.pinLastRotatedAt ?? null}
        lastStudentLoginAt={
          rows.find((row) => row.participantId === drawerParticipantId)?.lastActivityAt ?? null
        }
        parentConnectionLabel={drawerAccess?.parentConnectionLabel}
        familyClaimCode={drawerAccess?.familyClaimCode}
        familyClaimUrl={drawerAccess?.familyClaimUrl}
        oneTimePin={pinReveal?.participantId === drawerParticipantId ? pinReveal.pin : null}
        pinActionLoading={pinActionLoadingId === drawerParticipantId || drawerAccessLoading}
        onResetPin={() => {
          const ctx = requireDrawerContext('reset_pin');
          if (ctx) void handleResetPin(ctx);
        }}
        onRevealPin={() => {
          const ctx = requireDrawerContext('reveal_pin');
          if (ctx) void handleRevealPin(ctx);
        }}
        onCopyPin={() => {
          const ctx = requireDrawerContext('copy_pin');
          if (!ctx) return;
          const copy = async () => {
            const ready = await ensureStudentAccessReady({
              participantId: ctx.participantId,
              programCodeHint: ctx.programCode,
              displayNameHint: ctx.childName,
            });
            if (!ready.success) {
              showToast(ready.error, 'error');
              return;
            }
            let pin =
              pinReveal?.participantId === ctx.participantId
                ? pinReveal.pin
                : ready.access.generatedPin ?? null;
            if (!pin) {
              const result = await revealStudentPinViaFunction({
                participantId: ctx.participantId,
                programCode: ready.access.programCode,
              });
              if (!('pin' in result)) {
                showToast(result.error, 'error');
                return;
              }
              pin = result.pin;
              setPinReveal({ participantId: ctx.participantId, childName: ctx.childName, pin });
            }
            const copied = await copyStudentPinWithAudit({
              pin,
              participantId: ctx.participantId,
              programCode: ready.access.programCode,
            });
            showToast(copied ? 'PIN copied.' : 'Copy failed.', copied ? 'success' : 'error');
          };
          void copy();
        }}
        onCopyLoginInstructions={() => {
          const ctx = requireDrawerContext('copy_login_instructions');
          if (ctx) void handleCopyLoginInstructions(ctx);
        }}
        onCopyClaimLink={() => {
          const ctx = requireDrawerContext('copy_claim_link');
          if (ctx) void handleCopyClaimLink(ctx);
        }}
        onCopyClaimCode={() => {
          const ctx = requireDrawerContext('copy_claim_code');
          if (ctx) void handleCopyClaimCode(ctx);
        }}
        onInviteParent={() => {
          const ctx = requireDrawerContext('invite_parent');
          if (!ctx) return;
          const row = rows.find((item) => item.participantId === ctx.participantId);
          if (row) setInviteParentRow(row);
        }}
      />

      <PilotInviteParentModal
        open={Boolean(inviteParentRow)}
        childName={inviteParentRow?.childName ?? 'Student'}
        submitting={inviteParentSubmitting}
        error={inviteParentError}
        onClose={() => {
          setInviteParentRow(null);
          setInviteParentError(null);
        }}
        onSubmit={(input) => void handleInviteParentSubmit(input)}
      />

      <PilotAddStudentDrawer
        open={addStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        programCode={resolvedProgramCode}
        programName={program?.programName}
        onSuccess={(message) => {
          showToast(message || "Student added. I'll keep their progress organized here.", 'success');
          void refresh();
        }}
      />

      {rows.length > 0 && rosterFilter ? (
        <p className="pilot-rosterFilterMeta">
          Showing {displayRows.length} of {rows.length} students.{' '}
          <Link to={programDashboardTabPath('roster')}>View full roster</Link>
        </p>
      ) : null}

      <KidPlayRosterLockGate
        open={rosterLocked}
        onUnlocked={() => setRosterLocked(false)}
      />

      <FacilitatorMoveSessionModal
        open={Boolean(movePrompt)}
        childName={movePrompt?.row.childName ?? 'This student'}
        loading={Boolean(launchSessionLoadingId)}
        onCancel={() => setMovePrompt(null)}
        onMoveHere={handleMoveSessionHere}
      />
    </div>
  );
}
