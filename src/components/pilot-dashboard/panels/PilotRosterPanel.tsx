import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '../../portal-design-system/ToastProvider';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import { resetStudentPinViaFunction, revealStudentPinViaFunction } from '../../../lib/studentPinService';
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
  const program = readActivePilotProgram();
  const { showToast } = useToast();
  const showLoading = externalLoading || loading;

  const handleCopyLoginInstructions = useCallback(
    async (row: PilotRosterRow) => {
      let revealedPin = pinReveal?.participantId === row.participantId ? pinReveal.pin : null;
      if (!revealedPin) {
        const result = await revealStudentPinViaFunction({
          participantId: row.participantId,
          programCode: row.campProgramCode,
        });
        if (!('pin' in result)) {
          showToast(result.error, 'error');
          return;
        }
        revealedPin = result.pin;
        setPinReveal({ participantId: row.participantId, childName: row.childName, pin: result.pin });
      }
      const instructions = buildStudentLoginInstructions({
        studentName: row.childName,
        programName: program?.programName?.trim() || row.campProgramCode,
        programCode: row.campProgramCode,
        pin: revealedPin,
      });
      try {
        await navigator.clipboard.writeText(instructions);
        showToast(`Login instructions copied for ${row.childName}.`, 'success');
      } catch {
        showToast('Copy failed.', 'error');
      }
    },
    [pinReveal, program?.programName, showToast],
  );

  const handleCopyClaimLink = useCallback(
    async (row: PilotRosterRow) => {
      if (!row.familyClaimUrl) {
        showToast('No family claim link yet.', 'error');
        return;
      }
      try {
        await navigator.clipboard.writeText(row.familyClaimUrl);
        showToast('Family claim link copied.', 'success');
      } catch {
        showToast('Copy failed.', 'error');
      }
    },
    [showToast],
  );

  const handleResetPin = useCallback(
    async (row: PilotRosterRow) => {
      setPinActionLoadingId(row.participantId);
      const result = await resetStudentPinViaFunction({
        participantId: row.participantId,
        programCode: row.campProgramCode,
      });
      setPinActionLoadingId(null);
      if (!('pin' in result)) {
        showToast(result.error, 'error');
        return;
      }
      setPinReveal({ participantId: row.participantId, childName: row.childName, pin: result.pin });
      setDrawerParticipantId(row.participantId);
      void refresh();
    },
    [refresh, showToast],
  );

  const handleRevealPin = useCallback(
    async (row: PilotRosterRow) => {
      setPinActionLoadingId(row.participantId);
      const result = await revealStudentPinViaFunction({
        participantId: row.participantId,
        programCode: row.campProgramCode,
      });
      setPinActionLoadingId(null);
      if (!('pin' in result)) {
        showToast(result.error, 'error');
        return;
      }
      setPinReveal({ participantId: row.participantId, childName: row.childName, pin: result.pin });
      setDrawerParticipantId(row.participantId);
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
              disabled={!launcherRow}
              onClick={() => launcherRow && void handleCopyLoginInstructions(launcherRow)}
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
          onStudentClick={setDrawerParticipantId}
          onGradeSaved={updateParticipantGrade}
        />
      )}

      <PilotStudentDetailDrawer
        open={Boolean(drawerParticipantId)}
        participantId={drawerParticipantId}
        onClose={() => {
          setDrawerParticipantId(null);
          setPinReveal(null);
        }}
        participants={participants}
        familyLinks={familyLinks}
        assessmentResults={assessmentResults}
        moduleResults={moduleResults}
        programCode={resolvedProgramCode}
        hasPin={displayRows.find((row) => row.participantId === drawerParticipantId)?.hasPin}
        familyClaimCode={displayRows.find((row) => row.participantId === drawerParticipantId)?.familyClaimCode}
        familyClaimUrl={displayRows.find((row) => row.participantId === drawerParticipantId)?.familyClaimUrl}
        oneTimePin={pinReveal?.participantId === drawerParticipantId ? pinReveal.pin : null}
        pinActionLoading={pinActionLoadingId === drawerParticipantId}
        onResetPin={() => {
          const row = rows.find((item) => item.participantId === drawerParticipantId);
          if (row) void handleResetPin(row);
        }}
        onRevealPin={() => {
          const row = rows.find((item) => item.participantId === drawerParticipantId);
          if (row) void handleRevealPin(row);
        }}
        onCopyPin={() => {
          const row = rows.find((item) => item.participantId === drawerParticipantId);
          if (!row) return;
          const copy = async () => {
            let pin = pinReveal?.participantId === row.participantId ? pinReveal.pin : null;
            if (!pin) {
              const result = await revealStudentPinViaFunction({
                participantId: row.participantId,
                programCode: row.campProgramCode,
              });
              if (!('pin' in result)) {
                showToast(result.error, 'error');
                return;
              }
              pin = result.pin;
              setPinReveal({ participantId: row.participantId, childName: row.childName, pin });
            }
            await navigator.clipboard.writeText(pin);
            showToast('PIN copied.', 'success');
          };
          void copy();
        }}
        onCopyLoginInstructions={() => {
          const row = rows.find((item) => item.participantId === drawerParticipantId);
          if (row) void handleCopyLoginInstructions(row);
        }}
        onCopyClaimLink={() => {
          const row = rows.find((item) => item.participantId === drawerParticipantId);
          if (row) void handleCopyClaimLink(row);
        }}
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
