import React, { useMemo, useState } from 'react';
import SettingsCard from '../../family-portal/settings/SettingsCard';
import AdminPilotProgramRow from '../AdminPilotProgramRow';
import type { PilotProgramRecord } from '../../../types/pilotProgram';

type AdminPilotProgramsTabProps = {
  programs: PilotProgramRecord[];
  loading: boolean;
  loadError: string | null;
  onCopied: (message: string) => void;
  onChanged: () => void;
};

export default function AdminPilotProgramsTab({
  programs,
  loading,
  loadError,
  onCopied,
  onChanged,
}: AdminPilotProgramsTabProps) {
  const [showArchived, setShowArchived] = useState(true);

  const visiblePrograms = useMemo(() => {
    if (showArchived) return programs;
    return programs.filter((program) => program.pilot_status !== 'archived');
  }, [programs, showArchived]);

  return (
    <SettingsCard
      title="Pilot Programs"
      subtitle="Camp, school, family, and testing pilots. Archive hides programs from active portal unlock while keeping data recoverable."
    >
      <label className="adminPortal-toggleRow">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(event) => setShowArchived(event.target.checked)}
        />
        <span>Show archived pilots</span>
      </label>

      {loading ? <p className="adminPortal-empty">Loading pilot programs…</p> : null}
      {loadError ? <p className="adminPortal-error">{loadError}</p> : null}
      {!loading && !loadError && visiblePrograms.length === 0 ? (
        <p className="adminPortal-empty">No pilot programs found.</p>
      ) : null}

      <div className="adminPortal-programList">
        {visiblePrograms.map((program) => (
          <AdminPilotProgramRow
            key={program.id ?? program.program_code}
            program={program}
            onCopied={onCopied}
            onChanged={onChanged}
          />
        ))}
      </div>
    </SettingsCard>
  );
}
