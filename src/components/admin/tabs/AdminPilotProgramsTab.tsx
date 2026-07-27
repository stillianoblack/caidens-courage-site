import React, { useMemo } from 'react';
import SettingsCard from '../../family-portal/settings/SettingsCard';
import AdminPilotProgramRow from '../AdminPilotProgramRow';
import type { PilotProgramRecord } from '../../../types/pilotProgram';
import '../admin-program-health-visual.css';

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
  const activePrograms = useMemo(
    () => programs.filter((program) => program.pilot_status !== 'archived'),
    [programs],
  );
  const archivedPrograms = useMemo(
    () => programs.filter((program) => program.pilot_status === 'archived'),
    [programs],
  );

  return (
    <SettingsCard
      title="Pilot Programs"
      subtitle="Camp, school, family, and testing pilots. Archive hides programs from active portal unlock while keeping all student data recoverable."
    >
      {loading ? <p className="adminPortal-empty">Loading pilot programs…</p> : null}
      {loadError ? <p className="adminPortal-error">{loadError}</p> : null}

      {!loading && !loadError ? (
        <div className="phVisual">
          <section className="adminPortal-programSection" aria-labelledby="admin-active-pilots">
            <p className="phVisual-eyebrow">Pilot Programs</p>
            <h3 id="admin-active-pilots" className="adminPortal-sectionTitle">
              Active Pilots ({activePrograms.length})
            </h3>
            {activePrograms.length === 0 ? (
              <p className="adminPortal-empty">No active pilot programs.</p>
            ) : (
              <div className="phVisual-programList">
                {activePrograms.map((program) => (
                  <AdminPilotProgramRow
                    key={program.id ?? program.program_code}
                    program={program}
                    onCopied={onCopied}
                    onChanged={onChanged}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="adminPortal-programSection" aria-labelledby="admin-archived-pilots">
            <h3 id="admin-archived-pilots" className="adminPortal-sectionTitle">
              Archived Pilots ({archivedPrograms.length})
            </h3>
            <p className="adminPortal-sectionHelper">
              Archived pilots are hidden from portal unlock. Restore any pilot to make it active again.
            </p>
            {archivedPrograms.length === 0 ? (
              <p className="adminPortal-empty">No archived pilots.</p>
            ) : (
              <div className="phVisual-programList">
                {archivedPrograms.map((program) => (
                  <AdminPilotProgramRow
                    key={program.id ?? program.program_code}
                    program={program}
                    onCopied={onCopied}
                    onChanged={onChanged}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </SettingsCard>
  );
}
