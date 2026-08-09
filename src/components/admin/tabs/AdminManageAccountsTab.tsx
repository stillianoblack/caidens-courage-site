import React, { useMemo, useState } from 'react';
import AdminParticipantReassignment from '../AdminParticipantReassignment';
import SettingsCard from '../../family-portal/settings/SettingsCard';
import { filterProgramsForSearch } from '../../../lib/adminPilotCleanupService';
import type { PilotProgramRecord } from '../../../types/pilotProgram';

type AdminManageAccountsTabProps = {
  programs: PilotProgramRecord[];
  onCopied: (message: string) => void;
};

export default function AdminManageAccountsTab({ programs, onCopied }: AdminManageAccountsTabProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => filterProgramsForSearch(programs, query), [programs, query]);

  const facilitators = filtered.filter((program) => Boolean(program.facilitator_access_code));
  const families = filtered.filter((program) => Boolean(program.family_access_code));

  return (
    <div className="adminPortal-stack">
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
            placeholder="Program code, email, family name, organization…"
          />
        </label>

        <div className="adminPortal-accountGrid">
          <div className="adminPortal-accountStat">
            <strong>{filtered.length}</strong>
            <span>Programs</span>
          </div>
          <div className="adminPortal-accountStat">
            <strong>{facilitators.length}</strong>
            <span>Facilitators</span>
          </div>
          <div className="adminPortal-accountStat">
            <strong>{families.length}</strong>
            <span>Families</span>
          </div>
        </div>

        {filtered.length > 0 ? (
          <ul className="adminPortal-accountList">
            {filtered.slice(0, 12).map((program) => (
              <li key={program.id ?? program.program_code} className="adminPortal-accountListItem">
                <div>
                  <strong>{program.program_name}</strong>
                  <p>{program.program_code}</p>
                  <p className="adminPortal-accountMeta">
                    {program.admin_email}
                    {program.group_name ? ` · ${program.group_name}` : ''}
                  </p>
                </div>
                <div className="adminPortal-accountTags">
                  <span className="adminPortal-tag">Family</span>
                  {program.facilitator_access_code ? (
                    <span className="adminPortal-tag">Facilitator</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="adminPortal-empty">No matching programs.</p>
        )}
      </SettingsCard>

      <AdminParticipantReassignment onCopied={onCopied} />
    </div>
  );
}
