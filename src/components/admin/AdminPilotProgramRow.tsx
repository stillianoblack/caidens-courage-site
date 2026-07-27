import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recordToActivePilotProgram } from '../../config/activePilotProgram';
import { isSuperAdminSession } from '../../config/adminAccess';
import { writeLastPilotProgram } from '../../config/lastPilotProgram';
import { applyProgramPortalUnlock } from '../../config/portalContext';
import { FAMILY_HUB_PATH, PROGRAM_DASHBOARD_PATH } from '../../config/courageRoutes';
import {
  archivePilotProgram,
  fetchPilotProgramAdminStats,
  restorePilotProgram,
  updatePilotProgramProtectionLevel,
  type PilotCleanupTableCount,
} from '../../lib/adminPilotCleanupService';
import { copyToClipboard } from '../../lib/copyToClipboard';
import { fetchPilotProgramStudentCount } from '../../lib/pilotProgramAdminScale';
import {
  isIndependentFamilyType,
  resolveAdminPilotProgramMeta,
} from '../../lib/independentFamilyProgram';
import type { PilotProgramRecord } from '../../types/pilotProgram';
import AdminCopyField from './AdminCopyField';
import AdminPilotEstimatedRangeModal from './AdminPilotEstimatedRangeModal';
import AdminPilotProgramScaleSummary from './AdminPilotProgramScaleSummary';
import AdminPilotRenameModal from './AdminPilotRenameModal';
import { normalizePilotFeatureFlags, PILOT_PROGRAM_FEATURE_FLAG_KEYS } from '../../lib/pilotProgramFeatureFlags';
import {
  getPilotProgramProtectionDecision,
  PILOT_PROGRAM_PROTECTION_LEVELS,
  PROTECTION_ACTION_BLOCKED_MESSAGE,
  resolvePilotProgramProtectionLevel,
} from '../../lib/pilotProgramProtection';
import type { PilotProgramProtectionLevel } from '../../types/pilotProgram';

type AdminPilotProgramRowProps = {
  program: PilotProgramRecord;
  onCopied: (message: string) => void;
  onChanged: () => void;
  showArchiveActions?: boolean;
};

function formatCreatedAt(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatLastActivity(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function statusClass(status: string): string {
  const normalized = status.trim().toLowerCase();
  if (normalized === 'active') return 'adminPortal-status adminPortal-status--active';
  if (normalized === 'archived') return 'adminPortal-status adminPortal-status--paused';
  if (normalized === 'testing') return 'adminPortal-status adminPortal-status--completed';
  if (normalized === 'paused') return 'adminPortal-status adminPortal-status--paused';
  if (normalized === 'completed') return 'adminPortal-status adminPortal-status--completed';
  return 'adminPortal-status';
}

function readCount(tables: PilotCleanupTableCount[], table: string): number {
  return tables.find((row) => row.table === table)?.count ?? 0;
}

export default function AdminPilotProgramRow({
  program,
  onCopied,
  onChanged,
  showArchiveActions = true,
}: AdminPilotProgramRowProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [estimateOpen, setEstimateOpen] = useState(false);
  const [stats, setStats] = useState<PilotCleanupTableCount[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [studentCount, setStudentCount] = useState<number | null>(
    typeof program.admin_student_count === 'number' ? program.admin_student_count : null,
  );
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const activeProgram = recordToActivePilotProgram(program);
  const isIndependentFamily = isIndependentFamilyType(program.program_type);
  const programMetaLabel = resolveAdminPilotProgramMeta(program);
  const isArchived = program.pilot_status === 'archived';
  const protectionLevel = resolvePilotProgramProtectionLevel(program);
  const editLabelsDecision = getPilotProgramProtectionDecision(program, 'edit_labels');
  const archiveDecision = getPilotProgramProtectionDecision(program, 'archive');
  const deleteDecision = getPilotProgramProtectionDecision(program, 'delete');
  const regenerateDecision = getPilotProgramProtectionDecision(program, 'regenerate_codes');
  const canEditProtectionLevel = isSuperAdminSession();
  const featureFlags = normalizePilotFeatureFlags(program.feature_flags ?? undefined);

  useEffect(() => {
    if (typeof program.admin_student_count === 'number') {
      setStudentCount(program.admin_student_count);
      return;
    }
    let cancelled = false;
    void fetchPilotProgramStudentCount(program.program_code).then((count) => {
      if (!cancelled) setStudentCount(count);
    });
    return () => {
      cancelled = true;
    };
  }, [program.admin_student_count, program.program_code]);

  useEffect(() => {
    if (!expanded) return;
    setStatsLoading(true);
    void fetchPilotProgramAdminStats(program.program_code).then((rows) => {
      setStats(rows);
      setStatsLoading(false);
    });
  }, [expanded, program.program_code]);

  const openFacilitatorDashboard = () => {
    const facilitatorCode = program.facilitator_access_code;
    if (!facilitatorCode) return;
    applyProgramPortalUnlock(activeProgram, 'facilitator', facilitatorCode);
    writeLastPilotProgram(activeProgram, 'facilitator', program.admin_email, facilitatorCode);
    navigate(PROGRAM_DASHBOARD_PATH);
  };

  const openFamilyPortal = () => {
    applyProgramPortalUnlock(activeProgram, 'family', program.family_access_code);
    writeLastPilotProgram(activeProgram, 'family', program.admin_email, program.family_access_code);
    navigate(FAMILY_HUB_PATH);
  };

  const handleArchive = async () => {
    if (!archiveDecision.allowed) {
      setActionError(archiveDecision.message ?? PROTECTION_ACTION_BLOCKED_MESSAGE);
      return;
    }
    if (
      archiveDecision.requiresConfirmation &&
      !window.confirm('Archive this pilot? Student data will remain recoverable.')
    ) {
      return;
    }
    setActionError(null);
    setActionMessage(null);
    const result = await archivePilotProgram(program.program_code);
    if (result.success) {
      setActionMessage(result.message);
      onChanged();
    } else {
      setActionError(result.message);
    }
  };

  const handleRestore = async () => {
    setActionError(null);
    setActionMessage(null);
    const result = await restorePilotProgram(program.program_code);
    if (result.success) {
      setActionMessage(result.message);
      onChanged();
    } else {
      setActionError(result.message);
    }
  };

  const handleProtectionChange = async (nextLevel: PilotProgramProtectionLevel) => {
    if (nextLevel === protectionLevel) return;
    if (
      nextLevel === 'production' &&
      !window.confirm('Production protection prevents deletion, archiving, code regeneration, and portal-type changes.')
    ) {
      return;
    }
    if (
      protectionLevel === 'production' &&
      !window.confirm('Lower Production protection for this program? Destructive actions may become available.')
    ) {
      return;
    }

    setActionError(null);
    setActionMessage(null);
    const result = await updatePilotProgramProtectionLevel(program.program_code, nextLevel);
    if (result.success) {
      setActionMessage(result.message);
      onChanged();
    } else {
      setActionError(result.message);
    }
  };

  const facilitatorName = program.admin_first_name?.trim() || '—';
  const facilitatorEmail = program.admin_email?.trim() || '—';
  const lastActivity = program.admin_last_activity_at ?? null;

  const copyCode = async (value: string, label: string) => {
    await copyToClipboard(value, `${label} copied`, onCopied);
  };

  const emailFacilitator = () => {
    if (!program.admin_email?.trim()) return;
    const subject = encodeURIComponent(`${program.program_name} — Caiden's Courage pilot`);
    window.location.href = `mailto:${program.admin_email}?subject=${subject}`;
  };

  return (
    <>
      <article className="adminPortal-programCard">
        <div className="adminPortal-programHeader">
          <div>
            <h2 className="adminPortal-programName">{program.program_name}</h2>
            <p className="adminPortal-programMeta">
              <span className="adminPortal-programCategory">{programMetaLabel}</span>
              <span className="adminPortal-programMetaDivider"> · </span>
              <span className="adminPortal-programSummaryLabel">Status:</span> {program.pilot_status}
            </p>
          </div>
          <span className={statusClass(program.pilot_status)}>{program.pilot_status}</span>
        </div>

        <div className="adminPortal-programDirectoryMeta">
          <p>
            <strong>Facilitator name</strong>
            {facilitatorName}
          </p>
          <p>
            <strong>Facilitator email</strong>
            {facilitatorEmail}
          </p>
          <p>
            <strong>Student count</strong>
            {studentCount == null ? '…' : studentCount}
          </p>
          <p>
            <strong>Last activity</strong>
            {formatLastActivity(lastActivity)}
          </p>
          <p>
            <strong>Created date</strong>
            {formatCreatedAt(program.created_at)}
          </p>
        </div>

        {expanded ? (
          <div className="adminPortal-detailGrid">
            <AdminCopyField label="Internal Program Code" value={program.program_code} onCopied={onCopied} />
            <AdminCopyField label="Family Access Code" value={program.family_access_code} onCopied={onCopied} />
            {!isIndependentFamily && program.facilitator_access_code ? (
              <AdminCopyField label="Facilitator Code" value={program.facilitator_access_code} onCopied={onCopied} />
            ) : null}
            <div className="adminPortal-detailItem">
              <span className="adminPortal-detailLabel">Display Name</span>
              <span className="adminPortal-detailValue">{program.program_name}</span>
            </div>
            {!isIndependentFamily && program.group_name && program.group_name !== program.program_name ? (
              <div className="adminPortal-detailItem">
                <span className="adminPortal-detailLabel">Group Name</span>
                <span className="adminPortal-detailValue">{program.group_name}</span>
              </div>
            ) : null}
            <div className="adminPortal-detailItem">
              <span className="adminPortal-detailLabel">Age / Grade Band</span>
              <span className="adminPortal-detailValue">
                {program.age_grade_band || program.age_range || '—'}
                {program.age_grade_notes ? ` (${program.age_grade_notes})` : ''}
              </span>
            </div>
            <AdminPilotProgramScaleSummary
              program={program}
              onEditEstimate={() => setEstimateOpen(true)}
            />
            <div className="adminPortal-detailItem adminPortal-detailItem--wide">
              <label className="adminPortal-detailLabel" htmlFor={`protection-${program.id ?? program.program_code}`}>
                Program Protection
              </label>
              <select
                id={`protection-${program.id ?? program.program_code}`}
                className="adminPortal-select"
                value={protectionLevel}
                disabled={!canEditProtectionLevel}
                title={!canEditProtectionLevel ? 'Only Super Admin can edit protection level.' : undefined}
                onChange={(event) => void handleProtectionChange(event.target.value as PilotProgramProtectionLevel)}
              >
                {PILOT_PROGRAM_PROTECTION_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
              <p className="adminPortal-fieldHint">
                Protection controls whether this program can be archived, deleted, or have access codes regenerated.
                {!canEditProtectionLevel ? ' Only Super Admin can change this value.' : ''}
              </p>
            </div>
            {expanded && !statsLoading ? (
              <>
                <div className="adminPortal-detailItem">
                  <span className="adminPortal-detailLabel">Participants</span>
                  <span className="adminPortal-detailValue">{readCount(stats, 'participants')}</span>
                </div>
                <div className="adminPortal-detailItem">
                  <span className="adminPortal-detailLabel">Assessments (v2)</span>
                  <span className="adminPortal-detailValue">{readCount(stats, 'assessment_results_v2')}</span>
                </div>
                <div className="adminPortal-detailItem">
                  <span className="adminPortal-detailLabel">Module Results</span>
                  <span className="adminPortal-detailValue">{readCount(stats, 'module_results')}</span>
                </div>
                <div className="adminPortal-detailItem adminPortal-detailItem--wide">
                  <span className="adminPortal-detailLabel">Feature flags (prep)</span>
                  <span className="adminPortal-detailValue adminPortal-featureFlags">
                    {PILOT_PROGRAM_FEATURE_FLAG_KEYS.map((key) => (
                      <span key={key} className="adminPortal-featureFlag">
                        {key.replace(/^can_/, '').replace(/_/g, ' ')}:{' '}
                        {featureFlags[key] ? 'on' : 'off'}
                      </span>
                    ))}
                  </span>
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {!archiveDecision.allowed || !deleteDecision.allowed || !regenerateDecision.allowed ? (
          <p className="adminPortal-protectedNote" role="status">
            {PROTECTION_ACTION_BLOCKED_MESSAGE}
          </p>
        ) : null}

        {actionMessage ? <p className="adminPortal-actionSuccess" role="status">{actionMessage}</p> : null}
        {actionError ? <p className="adminPortal-error">{actionError}</p> : null}

        <div className="adminPortal-actions">
          <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Hide Details' : 'View Details'}
          </button>
          <button
            type="button"
            className="adminPortal-btn adminPortal-btn--ghost"
            onClick={() => void copyCode(program.program_code, 'Program code')}
          >
            Copy Program Code
          </button>
          {!isIndependentFamily && program.facilitator_access_code ? (
            <button
              type="button"
              className="adminPortal-btn adminPortal-btn--ghost"
              onClick={() => void copyCode(program.facilitator_access_code!, 'Facilitator code')}
            >
              Copy Facilitator Code
            </button>
          ) : null}
          <button
            type="button"
            className="adminPortal-btn adminPortal-btn--ghost"
            disabled={!regenerateDecision.allowed}
            title={!regenerateDecision.allowed ? regenerateDecision.message : undefined}
            onClick={() => setActionError('Reset Facilitator Access is gated but not implemented in this admin view yet.')}
          >
            Reset Facilitator Access
          </button>
          <button
            type="button"
            className="adminPortal-btn adminPortal-btn--ghost"
            onClick={emailFacilitator}
            disabled={!program.admin_email?.trim()}
          >
            Email Facilitator
          </button>
          <button
            type="button"
            className="adminPortal-btn adminPortal-btn--ghost"
            onClick={() => setRenameOpen(true)}
            disabled={!editLabelsDecision.allowed}
            title={!editLabelsDecision.allowed ? editLabelsDecision.message : undefined}
          >
            Edit Name
          </button>
          {!isIndependentFamily && program.facilitator_access_code ? (
            <button type="button" className="adminPortal-btn adminPortal-btn--primary" onClick={openFacilitatorDashboard}>
              Open Facilitator Dashboard
            </button>
          ) : null}
          <button type="button" className="adminPortal-btn adminPortal-btn--gold" onClick={openFamilyPortal}>
            Open Family Portal
          </button>
          {showArchiveActions ? (
            isArchived ? (
              <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => void handleRestore()}>
                Restore Pilot
              </button>
            ) : (
              <button
                type="button"
                className="adminPortal-btn adminPortal-btn--ghost"
                disabled={!archiveDecision.allowed}
                title={!archiveDecision.allowed ? archiveDecision.message : undefined}
                onClick={() => void handleArchive()}
              >
                Archive
              </button>
            )
          ) : null}
        </div>
      </article>

      <AdminPilotRenameModal
        open={renameOpen}
        program={program}
        onClose={() => setRenameOpen(false)}
        onSaved={onChanged}
        onToast={onCopied}
      />

      <AdminPilotEstimatedRangeModal
        open={estimateOpen}
        program={program}
        onClose={() => setEstimateOpen(false)}
        onSaved={onChanged}
        onToast={onCopied}
      />
    </>
  );
}
