import React, { useMemo } from 'react';
import SettingsCard from '../../family-portal/settings/SettingsCard';
import type { AdminProgramDirectoryRecord } from '../../../types/adminProgramDirectory';

type AdminPilotProgramsTabProps = {
  programs: AdminProgramDirectoryRecord[];
  loading: boolean;
  loadError: boolean;
  onRetry: () => void;
};

export default function AdminPilotProgramsTab({
  programs,
  loading,
  loadError,
  onRetry,
}: AdminPilotProgramsTabProps) {
  const activePrograms = useMemo(
    () => programs.filter((program) => program.status !== 'archived'),
    [programs],
  );
  const archivedPrograms = useMemo(
    () => programs.filter((program) => program.status === 'archived'),
    [programs],
  );

  const renderProgram = (program: AdminProgramDirectoryRecord) => (
    <article key={program.id} className="adminPortal-programCard">
      <div className="adminPortal-programHeader">
        <div>
          <h2 className="adminPortal-programName">{program.displayName}</h2>
          <p className="adminPortal-programMeta">{program.programType}</p>
          <p className="adminPortal-programSummary">
            Created:{' '}
            {program.createdAt ? new Date(program.createdAt).toLocaleDateString() : '—'}
          </p>
        </div>
        <span className="adminPortal-status">{program.status}</span>
      </div>
    </article>
  );

  return (
    <SettingsCard
      title="Pilot Programs"
      subtitle="Camp, school, family, and testing pilots. Archive hides programs from active portal unlock while keeping all student data recoverable."
    >
      {loading ? <p className="adminPortal-empty">Loading pilot programs…</p> : null}
      {loadError ? (
        <div className="adminPortal-error" role="alert">
          <h3>We couldn’t load your programs.</h3>
          <p>Please try again in a moment.</p>
          <button type="button" className="adminPortal-btn adminPortal-btn--primary" onClick={onRetry}>
            Try Again
          </button>
        </div>
      ) : null}

      {!loading && !loadError ? (
        <>
          <section className="adminPortal-programSection" aria-labelledby="admin-active-pilots">
            <h3 id="admin-active-pilots" className="adminPortal-sectionTitle">
              Active Pilots ({activePrograms.length})
            </h3>
            {activePrograms.length === 0 ? (
              <p className="adminPortal-empty">No active pilot programs.</p>
            ) : (
              <div className="adminPortal-programList">
                {activePrograms.map(renderProgram)}
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
              <div className="adminPortal-programList">
                {archivedPrograms.map(renderProgram)}
              </div>
            )}
          </section>
        </>
      ) : null}
    </SettingsCard>
  );
}
