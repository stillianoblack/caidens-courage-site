import React, { useState } from 'react';
import { isAdminPermanentDeleteEnabled } from '../../../config/adminProtectedPrograms';
import {
  archivePilotProgram,
  deletePilotProgramPermanently,
  previewPilotCleanup,
  type PilotCleanupPreview,
} from '../../../lib/adminPilotCleanupService';
import SettingsCard from '../../family-portal/settings/SettingsCard';

type AdminDataCleanupTabProps = {
  onChanged: () => void;
};

export default function AdminDataCleanupTab({ onChanged }: AdminDataCleanupTabProps) {
  const [programCode, setProgramCode] = useState('');
  const [preview, setPreview] = useState<PilotCleanupPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deleteEnabled = isAdminPermanentDeleteEnabled();

  const handlePreview = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    const result = await previewPilotCleanup(programCode);
    setPreview(result);
    if (result.error) setError(result.error);
    setLoading(false);
  };

  const handleArchive = async () => {
    setMessage(null);
    setError(null);
    const result = await archivePilotProgram(programCode);
    if (result.success) {
      setMessage(result.message);
      onChanged();
      void handlePreview();
    } else {
      setError(result.message);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setMessage(null);
    setError(null);
    const result = await deletePilotProgramPermanently(programCode);
    if (result.success) {
      setMessage(result.message);
      onChanged();
      setPreview(null);
    } else {
      setError(result.message);
    }
  };

  return (
    <SettingsCard
      title="Data Cleanup"
      subtitle="Archive-first workflow for old test pilots. Preview affected records before taking action."
    >
      <label className="adminPortal-field">
        <span>Pilot program code</span>
        <input
          value={programCode}
          onChange={(event) => setProgramCode(event.target.value.toUpperCase())}
          placeholder="FAMILY-TEST-2026"
        />
      </label>

      <div className="adminPortal-actions">
        <button
          type="button"
          className="adminPortal-btn adminPortal-btn--primary"
          disabled={loading || !programCode.trim()}
          onClick={() => void handlePreview()}
        >
          {loading ? 'Loading preview…' : 'Preview Affected Records'}
        </button>
      </div>

      {preview ? (
        <div className="adminPortal-cleanupPreview">
          <p>
            <strong>{preview.programName || preview.programCode}</strong> · {preview.pilotStatus}
          </p>
          {!preview.archiveColumnsAvailable ? (
            <p className="adminPortal-error" role="alert">
              Archive columns are missing. Run <code>supabase/pilot_programs_archive.sql</code> in
              Supabase.
            </p>
          ) : null}
          <p className="adminPortal-cleanupWarning" role="status">
            Archiving hides this pilot from active dashboards but keeps data recoverable.
          </p>
          <table className="adminPortal-cleanupTable">
            <thead>
              <tr>
                <th>Table</th>
                <th>Records</th>
              </tr>
            </thead>
            <tbody>
              {preview.tables.map((row) => (
                <tr key={row.table}>
                  <td>{row.table}</td>
                  <td>{row.note ? row.note : row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {message ? <p className="adminPortal-actionSuccess" role="status">{message}</p> : null}
      {error ? <p className="adminPortal-error">{error}</p> : null}

      <div className="adminPortal-actions">
        <button
          type="button"
          className="adminPortal-btn adminPortal-btn--gold"
          disabled={!preview || preview.protected || preview.pilotStatus === 'archived'}
          onClick={() => void handleArchive()}
        >
          Archive Pilot
        </button>
      </div>

      {deleteEnabled ? (
        <div className="adminPortal-dangerZone">
          <label className="adminPortal-toggleRow">
            <input
              type="checkbox"
              checked={confirmDelete}
              onChange={(event) => setConfirmDelete(event.target.checked)}
            />
            <span>I understand this cannot be undone.</span>
          </label>
          <button
            type="button"
            className="adminPortal-btn adminPortal-btn--danger"
            disabled={!preview || preview.protected || !confirmDelete}
            onClick={() => void handleDelete()}
          >
            Delete Permanently
          </button>
        </div>
      ) : (
        <p className="adminPortal-cardSub">
          Permanent delete is disabled. Set <code>REACT_APP_ADMIN_ALLOW_DELETE=true</code> to enable
          dev-only hard delete.
        </p>
      )}
    </SettingsCard>
  );
}
