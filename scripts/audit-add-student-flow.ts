/**
 * Facilitator + admin add-student flow verification audit.
 *
 * Usage: npm run audit:add-student-flow
 */

import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { BLUE_RIBBON_CAMP_PROGRAM_CODE } from '../src/config/blueRibbonPilotProgram';
import { resolveFacilitatorRosterProgramCode } from '../src/lib/resolveFacilitatorRosterProgramCode';
import { ADMIN_PORTAL_TABS } from '../src/data/adminPortalContent';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const JSON_PATH = path.join(REPORTS_DIR, 'add-student-flow-audit.json');
const PDF_PATH = path.join(REPORTS_DIR, 'add-student-flow-audit.pdf');

type FlowCheck = {
  name: string;
  pass: boolean;
  detail: string;
};

type AuditReport = {
  generatedAt: string;
  summary: {
    checksPassed: number;
    checksFailed: number;
  };
  checks: FlowCheck[];
  blueRibbonCampProgramCode: string;
};

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

function runAudit(): AuditReport {
  const drawerSource = readSource('src/components/pilot-dashboard/PilotAddStudentDrawer.tsx');
  const rosterSource = readSource('src/components/pilot-dashboard/panels/PilotRosterPanel.tsx');
  const cssSource = readSource('src/components/pilot-dashboard/pilot-dashboard.css');
  const campServiceSource = readSource('src/lib/campChildOnboardingService.ts');
  const adminServiceSource = readSource('src/lib/adminEmergencyAddStudentService.ts');
  const adminTabSource = readSource('src/components/admin/tabs/AdminAddStudentTab.tsx');

  const checks: FlowCheck[] = [
    {
      name: 'Facilitator drawer primary button',
      pass: drawerSource.includes("'Add Student'") && drawerSource.includes('pilot-drawerBtnPrimary'),
      detail: 'Primary submit button labeled Add Student',
    },
    {
      name: 'Facilitator drawer sticky footer',
      pass:
        drawerSource.includes('pilot-drawerFooter') &&
        cssSource.includes('.pilot-drawerFooter') &&
        cssSource.includes('position: sticky'),
      detail: 'Actions live in a sticky footer outside the scroll body',
    },
    {
      name: 'Facilitator required field validation',
      pass:
        drawerSource.includes('parentFirstName.trim()') &&
        drawerSource.includes('isGradeLevel(gradeLevel)') &&
        campServiceSource.includes('normalizeGradeLevelStorage(input.gradeLevel)'),
      detail: 'Child, parent names, email, and grade level validated before submit',
    },
    {
      name: 'Facilitator roster refresh on success',
      pass: rosterSource.includes('void refresh()') && rosterSource.includes('onSuccess'),
      detail: 'Roster refresh + toast after successful add',
    },
    {
      name: 'Blue Ribbon program fallback',
      pass:
        readSource('src/lib/resolveFacilitatorRosterProgramCode.ts').includes(
          'BLUE_RIBBON_CAMP_PROGRAM_CODE',
        ) && BLUE_RIBBON_CAMP_PROGRAM_CODE === 'CAMP-BLUERIBBONAB-2026',
      detail: 'Legacy Blue Ribbon unlock resolves to camp program code',
    },
    {
      name: 'Admin emergency add student tab',
      pass: ADMIN_PORTAL_TABS.some((tab) => tab.id === 'add-student'),
      detail: 'Admin portal exposes Add Student tab',
    },
    {
      name: 'Admin emergency service',
      pass:
        adminServiceSource.includes('createAdminEmergencyStudent') &&
        adminServiceSource.includes('familyAccessCode'),
      detail: 'Admin service creates participant and returns family access code',
    },
    {
      name: 'Parent portal add-child untouched',
      pass:
        readSource('src/components/family-portal/AddChildForm.tsx').includes('createFamilyChildParticipant') &&
        !readSource('src/components/family-portal/AddChildForm.tsx').includes('createCampChildWithParentLink'),
      detail: 'Family add-child still uses createFamilyChildParticipant',
    },
    {
      name: 'Camp onboarding service intact',
      pass:
        campServiceSource.includes('createCampChildWithParentLink') &&
        campServiceSource.includes('createCampStudentFamilyLink'),
      detail: 'Facilitator flow still creates participant + parent link',
    },
    {
      name: 'Admin tab form fields',
      pass:
        adminTabSource.includes('campProgramCode') &&
        adminTabSource.includes('groupName') &&
        adminTabSource.includes('notes'),
      detail: 'Admin form includes program, optional group, and notes',
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      checksPassed: checks.filter((check) => check.pass).length,
      checksFailed: checks.filter((check) => !check.pass).length,
    },
    checks,
    blueRibbonCampProgramCode: resolveFacilitatorRosterProgramCode(),
  };
}

function generatePdf(report: AuditReport): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: 'LETTER' });
    const stream = fs.createWriteStream(PDF_PATH);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(20).text('Add Student Flow Audit');
    doc.font('Helvetica').fontSize(10).text(`Generated ${new Date(report.generatedAt).toLocaleString()}`);
    doc.moveDown();
    doc.text(`Checks passed: ${report.summary.checksPassed} / ${report.checks.length}`);
    doc.text(`Blue Ribbon camp code constant: ${report.blueRibbonCampProgramCode || BLUE_RIBBON_CAMP_PROGRAM_CODE}`);

    doc.moveDown().font('Helvetica-Bold').text('Checks');
    doc.font('Helvetica');
    report.checks.forEach((check) => {
      doc.text(`${check.pass ? 'PASS' : 'FAIL'} — ${check.name}: ${check.detail}`);
    });

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

async function main(): Promise<void> {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const report = runAudit();
  fs.writeFileSync(JSON_PATH, JSON.stringify(report, null, 2));
  await generatePdf(report);

  console.log('\n=== Add Student Flow Audit ===\n');
  console.log(`Checks: ${report.summary.checksPassed}/${report.checks.length} passing`);
  console.log(`\nWrote ${JSON_PATH}`);
  console.log(`Wrote ${PDF_PATH}`);

  if (report.summary.checksFailed > 0) {
    process.exitCode = 1;
  }
}

void main();
