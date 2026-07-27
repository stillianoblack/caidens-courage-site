import React, { useMemo, useState } from 'react';
import AdminParticipantReassignment from '../AdminParticipantReassignment';
import SettingsCard from '../../family-portal/settings/SettingsCard';
import type { AdminProgramDirectoryRecord } from '../../../types/adminProgramDirectory';

type AdminManageAccountsTabProps = {
  programs: AdminProgramDirectoryRecord[];
  onCopied: (message: string) => void;
};

export default function AdminManageAccountsTab({ programs, onCopied }: AdminManageAccountsTabProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return programs;
    return programs.filter((program) =>
      [program.displayName, program.programType, program.status]
        .some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [programs, query]);

  return (
    <>
      <SettingsCard
        title="Manage Accounts"
        subtitle="Search by program code, email, child name, organization, or access code. Admin-only tools — no raw SQL is shown to portal users."
      >
        <label className="adminPortal-field">
          <span>Search accounts</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Program name, type, or status…"
          />
        </label>

        <div className="adminPortal-accountGrid">
          <div className="adminPortal-accountStat">
            <strong>{filtered.length}</strong>
            <span>Programs</span>
          </div>
          <div className="adminPortal-accountStat">
            <strong>{filtered.filter((program) => program.status === 'active').length}</strong>
            <span>Active</span>
          </div>
          <div className="adminPortal-accountStat">
            <strong>{filtered.filter((program) => program.status === 'archived').length}</strong>
            <span>Archived</span>
          </div>
        </div>

        {filtered.length > 0 ? (
          <ul className="adminPortal-accountList">
            {filtered.slice(0, 12).map((program) => (
              <li key={program.id} className="adminPortal-accountListItem">
                <div>
                  <strong>{program.displayName}</strong>
                  <p className="adminPortal-accountMeta">{program.programType}</p>
                </div>
                <div className="adminPortal-accountTags">
                  <span className="adminPortal-tag">{program.status}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="adminPortal-empty">No matching programs.</p>
        )}
      </SettingsCard>

      <AdminParticipantReassignment onCopied={onCopied} />
    </>
  );
}
