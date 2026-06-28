import React from 'react';
import { useNavigate } from 'react-router-dom';
import { recordToActivePilotProgram } from '../../config/activePilotProgram';
import { writeLastPilotProgram } from '../../config/lastPilotProgram';
import { applyProgramPortalUnlock } from '../../config/portalContext';
import { FAMILY_HUB_PATH, PROGRAM_DASHBOARD_PATH } from '../../config/courageRoutes';
import { copyToClipboard } from '../../lib/copyToClipboard';
import {
  isIndependentFamilyType,
  resolveAdminPilotProgramMeta,
} from '../../lib/independentFamilyProgram';
import type { PilotProgramRecord } from '../../types/pilotProgram';
import AdminCopyField from './AdminCopyField';

type AdminPilotProgramCardProps = {
  program: PilotProgramRecord;
  onCopied: (message: string) => void;
};

function formatCreatedAt(value?: string): string {
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

export default function AdminPilotProgramCard({ program, onCopied }: AdminPilotProgramCardProps) {
  const navigate = useNavigate();
  const activeProgram = recordToActivePilotProgram(program);
  const isIndependentFamily = isIndependentFamilyType(program.program_type);
  const programMetaLabel = resolveAdminPilotProgramMeta(program);

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

  const copyCode = async (value: string) => {
    await copyToClipboard(value, 'Copied', onCopied);
  };

  return (
    <article className="adminPortal-programCard">
      <div className="adminPortal-programHeader">
        <div>
          <h2 className="adminPortal-programName">{program.program_name}</h2>
          <p className="adminPortal-programMeta">
            <span className="adminPortal-programCategory">{programMetaLabel}</span>
          </p>
        </div>
        <span className={statusClass(program.pilot_status)}>{program.pilot_status}</span>
      </div>

      <div className="adminPortal-detailGrid">
        <AdminCopyField label="Internal Program Code" value={program.program_code} onCopied={onCopied} />
        {isIndependentFamily || !program.facilitator_access_code ? null : (
          <AdminCopyField
            label="Facilitator Code"
            value={program.facilitator_access_code}
            onCopied={onCopied}
          />
        )}
        <AdminCopyField label="Family Access Code" value={program.family_access_code} onCopied={onCopied} />
        <div className="adminPortal-detailItem">
          <span className="adminPortal-detailLabel">Estimated Students</span>
          <span className="adminPortal-detailValue">
            {program.estimated_student_count_range ?? program.estimated_students ?? '—'}
          </span>
        </div>
        <div className="adminPortal-detailItem">
          <span className="adminPortal-detailLabel">Age Range</span>
          <span className="adminPortal-detailValue">{program.age_range || '—'}</span>
        </div>
        <div className="adminPortal-detailItem">
          <span className="adminPortal-detailLabel">
            {isIndependentFamily ? 'Parent / Guardian First Name' : 'Admin First Name'}
          </span>
          <span className="adminPortal-detailValue">{program.admin_first_name}</span>
        </div>
        <div className="adminPortal-detailItem">
          <span className="adminPortal-detailLabel">
            {isIndependentFamily ? 'Parent / Guardian Email' : 'Admin Email'}
          </span>
          <span className="adminPortal-detailValue">{program.admin_email}</span>
        </div>
        <div className="adminPortal-detailItem">
          <span className="adminPortal-detailLabel">Created At</span>
          <span className="adminPortal-detailValue">{formatCreatedAt(program.created_at)}</span>
        </div>
        {program.group_name ? (
          <div className="adminPortal-detailItem">
            <span className="adminPortal-detailLabel">
              {isIndependentFamily ? 'Family Name' : 'Group Name'}
            </span>
            <span className="adminPortal-detailValue">{program.group_name}</span>
          </div>
        ) : null}
      </div>

      <div className="adminPortal-actions">
        {isIndependentFamily ? null : (
          <button
            type="button"
            className="adminPortal-btn adminPortal-btn--primary"
            onClick={openFacilitatorDashboard}
          >
            Open Facilitator Dashboard
          </button>
        )}
        <button type="button" className="adminPortal-btn adminPortal-btn--gold" onClick={openFamilyPortal}>
          Open Family Portal
        </button>
        {isIndependentFamily || !program.facilitator_access_code ? null : (
          <button
            type="button"
            className="adminPortal-btn adminPortal-btn--ghost"
            onClick={() => copyCode(program.facilitator_access_code!)}
          >
            Copy Facilitator Code
          </button>
        )}
        <button
          type="button"
          className="adminPortal-btn adminPortal-btn--ghost"
          onClick={() => copyCode(program.family_access_code)}
        >
          Copy Family Code
        </button>
        <button
          type="button"
          className="adminPortal-btn adminPortal-btn--ghost"
          onClick={() => copyCode(program.program_code)}
        >
          Copy Program Code
        </button>
      </div>
    </article>
  );
}
