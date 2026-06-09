import React, { useMemo } from 'react';
import { readActivePilotProgram } from '../../config/activePilotProgram';
import { usePilotRosterData } from '../../hooks/usePilotRosterData';
import { usePilotTrackingResults } from '../../hooks/usePilotTrackingResults';
import {
  downloadPilotCsv,
  exportAssessmentResultsCsv,
  exportGuardianContactCsv,
  exportModuleResultsCsv,
  exportStudentProgressCsv,
} from '../../lib/pilotExportCsv';
import CopyableCompactValue from './CopyableCompactValue';
import PilotAdminStudentTable from './PilotAdminStudentTable';
import PilotDrawer from './PilotDrawer';

export type ProgramSettingsTabId =
  | 'program-info'
  | 'facilitators'
  | 'access-codes'
  | 'student-data'
  | 'exports'
  | 'support';

type PilotProgramSettingsDrawerProps = {
  open: boolean;
  activeTab: ProgramSettingsTabId;
  onTabChange: (tab: ProgramSettingsTabId) => void;
  onClose: () => void;
  onOpenSupport: () => void;
  programCode?: string;
};

const TABS: Array<{ id: ProgramSettingsTabId; label: string }> = [
  { id: 'program-info', label: 'Program Info' },
  { id: 'facilitators', label: 'Facilitators' },
  { id: 'access-codes', label: 'Access Codes' },
  { id: 'student-data', label: 'Student Data' },
  { id: 'exports', label: 'Exports' },
  { id: 'support', label: 'Support' },
];

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function SettingsRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="pilot-settingsRow">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function PilotProgramSettingsDrawer({
  open,
  activeTab,
  onTabChange,
  onClose,
  onOpenSupport,
  programCode,
}: PilotProgramSettingsDrawerProps) {
  const program = readActivePilotProgram();
  const code = programCode?.trim() || program?.programCode?.trim() || '';
  const {
    participants,
    familyLinks,
    assessmentResults,
    moduleResults,
    participantLookup,
  } = usePilotTrackingResults(0, code, open && Boolean(code));
  const { rows: rosterRows } = usePilotRosterData(code, open && Boolean(code));
  const dateStamp = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const codeSlug = code || 'program';

  if (!open) return null;

  const handleExport = (type: 'progress' | 'assessments' | 'modules' | 'guardians') => {
    switch (type) {
      case 'progress':
        downloadPilotCsv(
          `student-progress-${codeSlug}-${dateStamp}.csv`,
          exportStudentProgressCsv({
            participants,
            assessments: assessmentResults,
            modules: moduleResults,
            links: familyLinks,
            programCode: code,
            lookup: participantLookup,
          }),
        );
        break;
      case 'assessments':
        downloadPilotCsv(
          `assessments-${codeSlug}-${dateStamp}.csv`,
          exportAssessmentResultsCsv({ assessments: assessmentResults, lookup: participantLookup }),
        );
        break;
      case 'modules':
        downloadPilotCsv(
          `modules-${codeSlug}-${dateStamp}.csv`,
          exportModuleResultsCsv({ modules: moduleResults, lookup: participantLookup }),
        );
        break;
      case 'guardians':
        downloadPilotCsv(
          `guardian-contacts-${codeSlug}-${dateStamp}.csv`,
          exportGuardianContactCsv({
            participants,
            links: familyLinks,
            lookup: participantLookup,
            programCode: code,
          }),
        );
        break;
      default:
        break;
    }
  };

  const renderPanel = () => {
    if (!program) {
      return <p className="pilot-emptyNote">No active program context found.</p>;
    }

    switch (activeTab) {
      case 'program-info':
        return (
          <dl className="pilot-settingsGrid">
            <SettingsRow label="Program name" value={program.programName} />
            <SettingsRow label="Program code" value={program.programCode} />
            <SettingsRow label="Facilitator access code" value={program.facilitatorAccessCode || '—'} />
            <SettingsRow label="Family access code" value={program.familyAccessCode} />
            <SettingsRow label="Group name" value={program.groupName || '—'} />
            <SettingsRow label="Estimated students" value={program.estimatedStudents} />
            <SettingsRow label="Age range" value={program.ageRange} />
            <SettingsRow label="Created at" value={formatDate(program.createdAt)} />
            <SettingsRow label="Status" value={program.pilotStatus} />
          </dl>
        );
      case 'facilitators':
        return (
          <dl className="pilot-settingsGrid">
            <SettingsRow label="Main account holder" value={program.adminFirstName} />
            <SettingsRow label="Admin first name" value={program.adminFirstName} />
            <SettingsRow label="Admin email" value={program.adminEmail} />
            <SettingsRow label="Role / status" value="Primary facilitator · Active" />
            <SettingsRow
              label="Additional facilitators"
              value="Additional facilitator accounts can be added in a future release."
            />
          </dl>
        );
      case 'access-codes':
        return (
          <div className="pilot-settingsCodes">
            {[
              { label: 'Program code', value: program.programCode },
              { label: 'Facilitator code', value: program.facilitatorAccessCode || '—' },
              { label: 'Family code', value: program.familyAccessCode },
            ].map((item) => (
              <div key={item.label} className="pilot-settingsCodeRow">
                <span className="pilot-settingsCodeLabel">{item.label}</span>
                <CopyableCompactValue value={String(item.value)} type="code" label={item.label} />
              </div>
            ))}
          </div>
        );
      case 'student-data':
        return rosterRows.length === 0 ? (
          <p className="pilot-emptyNote">No students yet. Add your first student from the Roster tab.</p>
        ) : (
          <PilotAdminStudentTable rows={rosterRows} variant="settings" />
        );
      case 'exports':
        return (
          <div className="pilot-settingsExportsPanel">
            <button type="button" onClick={() => handleExport('progress')}>Student Progress CSV</button>
            <button type="button" onClick={() => handleExport('assessments')}>Assessment CSV</button>
            <button type="button" onClick={() => handleExport('modules')}>Module CSV</button>
            <button type="button" onClick={() => handleExport('guardians')}>Guardian Contact CSV</button>
          </div>
        );
      case 'support':
        return (
          <div className="pilot-settingsSupport">
            <p className="pilot-panelIntroSubtitle">
              Pilot support, upgrades, and facilitator help resources.
            </p>
            <button type="button" className="pilot-drawerBtnPrimary" onClick={onOpenSupport}>
              Open Support &amp; Upgrades
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PilotDrawer
      open={open}
      onClose={onClose}
      className="pilot-drawer pilot-drawer--settings"
      titleId="pilot-settings-drawer-title"
    >
      <div className="pilot-drawerHead">
        <h2 id="pilot-settings-drawer-title" className="pilot-drawerTitle">
          Program Settings
        </h2>
        <button type="button" className="pilot-drawerClose" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <div className="pilot-drawerBody pilot-drawerBody--settings">
        <div className="pilot-settingsLayout">
          <nav className="pilot-settingsTabs" aria-label="Settings sections">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`pilot-settingsTab${activeTab === tab.id ? ' pilot-settingsTab--active' : ''}`}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="pilot-settingsPanel">{renderPanel()}</div>
        </div>
      </div>
    </PilotDrawer>
  );
}
