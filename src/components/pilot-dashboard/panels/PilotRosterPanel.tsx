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
import { resetStudentPinViaFunction } from '../../../lib/studentPinService';
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
  const [movePrompt, setMovePrompt] = useState<{
    row: PilotRosterRow;
    existingSessionId: string;
  } | null>(null);
  const [pinReveal, setPinReveal] = useState<{ childName: string; pin: string } | null>(null);
  const program = readActivePilotProgram();
  const { showToast } = useToast();
  const showLoading = externalLoading || loading;

  const handleCopyLoginInstructions = useCallback(
    async (row: PilotRosterRow) => {
      const instructions = buildStudentLoginInstructions({
        studentName: row.childName,
        programName: program?.programName?.trim() || row.campProgramCode,
        programCode: row.campProgramCode,
        pin: 'Ask facilitator for PIN',
      });
      try {
        await navigator.clipboard.writeText(instructions);
        showToast('Login instructions copied.', 'success');
      } catch {
        showToast('Copy failed.', 'error');
      }
    },
    [program?.programName, showToast],
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
      const result = await resetStudentPinViaFunction({
        participantId: row.participantId,
        programCode: row.campProgramCode,
      });
      if (!('pin' in result)) {
        showToast(result.error, 'error');
        return;
      }
      setPinReveal({ childName: row.childName, pin: result.pin });
      void refresh();
    },
    [refresh, showToast],
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
          onLaunchStudentSession={handleLaunchStudentSession}
          launchSessionLoadingId={launchSessionLoadingId}
          onResetPin={(row) => void handleResetPin(row)}
          onCopyLoginInstructions={(row) => void handleCopyLoginInstructions(row)}
          onCopyClaimLink={(row) => void handleCopyClaimLink(row)}
        />
      )}

      <PilotStudentDetailDrawer
        open={Boolean(drawerParticipantId)}
        participantId={drawerParticipantId}
        onClose={() => setDrawerParticipantId(null)}
        participants={participants}
        familyLinks={familyLinks}
        assessmentResults={assessmentResults}
        moduleResults={moduleResults}
        programCode={resolvedProgramCode}
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

      {pinReveal ? (
        <div className="pilot-rosterFilterBanner">
          <span>
            New PIN for {pinReveal.childName}: <strong>{pinReveal.pin}</strong> (shown once)
          </span>
          <button
            type="button"
            className="pilot-rosterFilterClear"
            onClick={() => {
              void navigator.clipboard.writeText(pinReveal.pin);
              showToast('PIN copied.', 'success');
            }}
          >
            Copy PIN
          </button>
          <button type="button" className="pilot-rosterFilterClear" onClick={() => setPinReveal(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

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
