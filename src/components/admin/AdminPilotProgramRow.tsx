import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recordToActivePilotProgram } from '../../config/activePilotProgram';
import { isProtectedPilotProgramCode } from '../../config/adminProtectedPrograms';
import { writeLastPilotProgram } from '../../config/lastPilotProgram';
import { applyProgramPortalUnlock } from '../../config/portalContext';
import { FAMILY_HUB_PATH, PROGRAM_DASHBOARD_PATH } from '../../config/courageRoutes';
import {
  archivePilotProgram,
  fetchPilotProgramAdminStats,
  restorePilotProgram,
  type PilotCleanupTableCount,
} from '../../lib/adminPilotCleanupService';
import {
  fromDbProgramType,
  isIndependentFamilyType,
} from '../../lib/independentFamilyProgram';
import type { PilotProgramRecord } from '../../types/pilotProgram';
import AdminCopyField from './AdminCopyField';

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
  const [stats, setStats] = useState<PilotCleanupTableCount[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const activeProgram = recordToActivePilotProgram(program);
  const isIndependentFamily = isIndependentFamilyType(program.program_type);
  const protectedProgram = isProtectedPilotProgramCode(program.program_code);
  const isArchived = program.pilot_status === 'archived';

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

  return (
    <article className="adminPortal-programCard">
      <div className="adminPortal-programHeader">
        <div>
          <h2 className="adminPortal-programName">{program.program_name}</h2>
          <p className="adminPortal-programMeta">{fromDbProgramType(program.program_type)}</p>
        </div>
        <span className={statusClass(program.pilot_status)}>{program.pilot_status}</span>
      </div>

      <div className="adminPortal-detailGrid">
        <AdminCopyField label="Program Code" value={program.program_code} onCopied={onCopied} />
        <AdminCopyField label="Family Access Code" value={program.family_access_code} onCopied={onCopied} />
        <div className="adminPortal-detailItem">
          <span className="adminPortal-detailLabel">Created</span>
          <span className="adminPortal-detailValue">{formatCreatedAt(program.created_at)}</span>
        </div>
        <div className="adminPortal-detailItem">
          <span className="adminPortal-detailLabel">Admin Email</span>
          <span className="adminPortal-detailValue">{program.admin_email}</span>
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
          </>
        ) : null}
      </div>

      {protectedProgram ? (
        <p className="adminPortal-protectedNote" role="status">
          Protected pilot — archive and delete are disabled in code.
        </p>
      ) : null}

      {actionMessage ? <p className="adminPortal-actionSuccess" role="status">{actionMessage}</p> : null}
      {actionError ? <p className="adminPortal-error">{actionError}</p> : null}

      <div className="adminPortal-actions">
        <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Hide Details' : 'View Details'}
        </button>
        {!isIndependentFamily && program.facilitator_access_code ? (
          <button type="button" className="adminPortal-btn adminPortal-btn--primary" onClick={openFacilitatorDashboard}>
            Open Facilitator Dashboard
          </button>
        ) : null}
        <button type="button" className="adminPortal-btn adminPortal-btn--gold" onClick={openFamilyPortal}>
          Open Family Portal
        </button>
        {showArchiveActions && !protectedProgram ? (
          isArchived ? (
            <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => void handleRestore()}>
              Restore Pilot
            </button>
          ) : (
            <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => void handleArchive()}>
              Archive Pilot
            </button>
          )
        ) : null}
      </div>
    </article>
  );
}
