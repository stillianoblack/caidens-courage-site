import React from 'react';
import {
  downloadPilotCsv,
  exportAssessmentResultsCsv,
  exportGuardianContactCsv,
  exportModuleResultsCsv,
  exportStudentProgressCsv,
} from '../../lib/pilotExportCsv';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from '../../lib/pilotTrackingLocalStorage';
import type { ParticipantNameLookup } from '../../lib/pilotResultsDisplay';
import type { StudentParticipantRecord } from '../../lib/pilotTrackingService';
import type { StudentFamilyLink } from '../../lib/studentFamilyLinkService';

type PilotResultsExportsBarProps = {
  programCode?: string;
  participants: StudentParticipantRecord[];
  familyLinks: StudentFamilyLink[];
  assessmentResults: LocalAssessmentV2Record[];
  moduleResults: LocalModuleResultRecord[];
  participantLookup: ParticipantNameLookup;
};

export default function PilotResultsExportsBar({
  programCode,
  participants,
  familyLinks,
  assessmentResults,
  moduleResults,
  participantLookup,
}: PilotResultsExportsBarProps) {
  const dateStamp = new Date().toISOString().slice(0, 10);
  const codeSlug = programCode?.trim() || 'program';

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
            programCode,
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
            programCode,
          }),
        );
        break;
      default:
        break;
    }
  };

  return (
    <section className="pilot-panelBlock pilot-exportsBar">
      <div className="pilot-panelBlockHead">
        <h2 className="pilot-panelBlockTitle">Export Data</h2>
        <p className="pilot-panelBlockSub">Download live program data as CSV.</p>
      </div>
      <div className="pilot-exportsBarActions">
        <button type="button" className="pilot-resultsBtn pilot-resultsBtn--secondary" onClick={() => handleExport('progress')}>
          Student Progress CSV
        </button>
        <button type="button" className="pilot-resultsBtn pilot-resultsBtn--secondary" onClick={() => handleExport('assessments')}>
          Assessment CSV
        </button>
        <button type="button" className="pilot-resultsBtn pilot-resultsBtn--secondary" onClick={() => handleExport('modules')}>
          Module CSV
        </button>
        <button type="button" className="pilot-resultsBtn pilot-resultsBtn--primary" onClick={() => handleExport('guardians')}>
          Guardian Contact CSV
        </button>
      </div>
    </section>
  );
}
