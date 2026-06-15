/**
 * Pilot archive feature audit — code references, migration readiness, program inventory.
 *
 * Usage: npm run audit:pilot-archive
 */

import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { createClient } from '@supabase/supabase-js';
import { PROTECTED_PILOT_PROGRAM_CODES } from '../src/config/adminProtectedPrograms';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const JSON_PATH = path.join(REPORTS_DIR, 'pilot-archive-audit.json');
const PDF_PATH = path.join(REPORTS_DIR, 'pilot-archive-audit.pdf');
const MIGRATION_PATH = path.join(process.cwd(), 'supabase/pilot_programs_archive.sql');

type CodeReference = {
  file: string;
  summary: string;
};

type PilotProgramRow = {
  program_code: string;
  program_name: string;
  pilot_status: string;
  archived_at: string | null;
  archived_by: string | null;
  created_at: string;
};

type AuditReport = {
  generatedAt: string;
  migration: {
    file: string;
    exists: boolean;
    includesArchivedAt: boolean;
    includesArchivedBy: boolean;
    includesStatusIndex: boolean;
    includesUpdatePolicy: boolean;
  };
  database: {
    configured: boolean;
    archiveColumnsApplied: boolean | null;
    error: string | null;
  };
  codeReferences: CodeReference[];
  softDelete: {
    archiveUpdatesStatusOnly: boolean;
    portalLookupFiltersActive: boolean;
    restoreClearsArchiveMetadata: boolean;
    permanentDeleteGated: boolean;
    protectedProgramsConfigured: string[];
  };
  inventory: {
    active: PilotProgramRow[];
    archived: PilotProgramRow[];
    safeToArchive: PilotProgramRow[];
  };
};

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

function collectCodeReferences(): CodeReference[] {
  const files: Array<{ file: string; patterns: RegExp[]; summary: string }> = [
    {
      file: 'src/lib/adminPilotCleanupService.ts',
      patterns: [/archivePilotProgram/, /archived_at/, /pilot_status: 'archived'/],
      summary: 'Archive/restore service — soft delete via pilot_status + archived_at/by',
    },
    {
      file: 'src/components/admin/AdminPilotProgramRow.tsx',
      patterns: [/Archive Pilot/, /Restore Pilot/, /pilot_status === 'archived'/],
      summary: 'Admin program row archive + restore actions',
    },
    {
      file: 'src/components/admin/tabs/AdminPilotProgramsTab.tsx',
      patterns: [/pilot_status !== 'archived'/],
      summary: 'Active vs archived pilot program sections',
    },
    {
      file: 'src/components/admin/tabs/AdminDataCleanupTab.tsx',
      patterns: [/archivePilotProgram/, /Archive Pilot/],
      summary: 'Data cleanup tab archive preview + action',
    },
    {
      file: 'src/components/admin/tabs/AdminAddStudentTab.tsx',
      patterns: [/pilot_status !== 'archived'/],
      summary: 'Add student excludes archived programs',
    },
    {
      file: 'src/lib/pilotProgramService.ts',
      patterns: [/\.eq\('pilot_status', 'active'\)/],
      summary: 'Portal access code lookup excludes archived pilots',
    },
    {
      file: 'src/types/pilotProgram.ts',
      patterns: [/archived_at/, /PilotStatus.*archived/],
      summary: 'PilotStatus + archived metadata types',
    },
    {
      file: 'supabase/pilot_programs_archive.sql',
      patterns: [/archived_at/, /archived_by/],
      summary: 'Database migration for archive metadata columns',
    },
  ];

  return files
    .filter(({ file }) => fs.existsSync(path.join(process.cwd(), file)))
    .map(({ file, patterns, summary }) => {
      const source = readSource(file);
      const matched = patterns.every((pattern) => pattern.test(source));
      return { file, summary: matched ? summary : `${summary} (pattern mismatch)` };
    });
}

async function loadInventory(): Promise<{
  archiveColumnsApplied: boolean | null;
  error: string | null;
  programs: PilotProgramRow[];
}> {
  const url = process.env.REACT_APP_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { archiveColumnsApplied: null, error: 'Supabase env vars not configured', programs: [] };
  }

  const supabase = createClient(url, key);

  const columnProbe = await supabase.from('pilot_programs').select('archived_at, archived_by').limit(1);
  if (columnProbe.error) {
    const missingColumns = /archived_at|column/i.test(columnProbe.error.message);
    return {
      archiveColumnsApplied: missingColumns ? false : null,
      error: columnProbe.error.message,
      programs: [],
    };
  }

  const { data, error } = await supabase
    .from('pilot_programs')
    .select('program_code, program_name, pilot_status, archived_at, archived_by, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return { archiveColumnsApplied: true, error: error.message, programs: [] };
  }

  return {
    archiveColumnsApplied: true,
    error: null,
    programs: (data ?? []) as PilotProgramRow[],
  };
}

function isSafeToArchive(program: PilotProgramRow): boolean {
  if (program.pilot_status === 'archived') return false;
  if (PROTECTED_PILOT_PROGRAM_CODES.includes(program.program_code as (typeof PROTECTED_PILOT_PROGRAM_CODES)[number])) {
    return false;
  }
  return true;
}

async function runAudit(): Promise<AuditReport> {
  const migrationSource = fs.existsSync(MIGRATION_PATH) ? fs.readFileSync(MIGRATION_PATH, 'utf8') : '';
  const cleanupSource = readSource('src/lib/adminPilotCleanupService.ts');
  const lookupSource = readSource('src/lib/pilotProgramService.ts');
  const protectedSource = readSource('src/config/adminProtectedPrograms.ts');

  const inventoryResult = await loadInventory();
  const active = inventoryResult.programs.filter((row) => row.pilot_status !== 'archived');
  const archived = inventoryResult.programs.filter((row) => row.pilot_status === 'archived');
  const safeToArchive = inventoryResult.programs.filter(isSafeToArchive);

  return {
    generatedAt: new Date().toISOString(),
    migration: {
      file: 'supabase/pilot_programs_archive.sql',
      exists: fs.existsSync(MIGRATION_PATH),
      includesArchivedAt: migrationSource.includes('archived_at'),
      includesArchivedBy: migrationSource.includes('archived_by'),
      includesStatusIndex: migrationSource.includes('pilot_programs_pilot_status_idx'),
      includesUpdatePolicy: migrationSource.includes('pilot_programs_anon_update'),
    },
    database: {
      configured: Boolean(process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL),
      archiveColumnsApplied: inventoryResult.archiveColumnsApplied,
      error: inventoryResult.error,
    },
    codeReferences: collectCodeReferences(),
    softDelete: {
      archiveUpdatesStatusOnly:
        cleanupSource.includes("pilot_status: 'archived'") &&
        !/participants.*delete|assessment.*delete|module_results.*delete/i.test(
          cleanupSource.slice(cleanupSource.indexOf('archivePilotProgram'), cleanupSource.indexOf('restorePilotProgram')),
        ),
      portalLookupFiltersActive: lookupSource.includes(".eq('pilot_status', 'active')"),
      restoreClearsArchiveMetadata:
        cleanupSource.includes('archived_at: null') && cleanupSource.includes('archived_by: null'),
      permanentDeleteGated: protectedSource.includes('REACT_APP_ADMIN_ALLOW_DELETE'),
      protectedProgramsConfigured: [...PROTECTED_PILOT_PROGRAM_CODES],
    },
    inventory: { active, archived, safeToArchive },
  };
}

function writeJson(report: AuditReport): void {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(JSON_PATH, JSON.stringify(report, null, 2));
}

function writePdf(report: AuditReport): void {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const doc = new PDFDocument({ margin: 48 });
  const stream = fs.createWriteStream(PDF_PATH);
  doc.pipe(stream);

  doc.fontSize(18).text("Pilot Archive Audit", { underline: true });
  doc.moveDown();
  doc.fontSize(10).text(`Generated: ${report.generatedAt}`);

  doc.moveDown().fontSize(13).text('Migration');
  doc.fontSize(10)
    .text(`File exists: ${report.migration.exists}`)
    .text(`archived_at column: ${report.migration.includesArchivedAt}`)
    .text(`archived_by column: ${report.migration.includesArchivedBy}`)
    .text(`pilot_status index: ${report.migration.includesStatusIndex}`)
    .text(`update policy: ${report.migration.includesUpdatePolicy}`);

  doc.moveDown().fontSize(13).text('Database');
  doc.fontSize(10)
    .text(`Supabase configured: ${report.database.configured}`)
    .text(`Archive columns applied: ${String(report.database.archiveColumnsApplied)}`)
    .text(report.database.error ? `Error: ${report.database.error}` : 'Error: none');

  doc.moveDown().fontSize(13).text('Soft delete checks');
  doc.fontSize(10)
    .text(`Archive updates status only: ${report.softDelete.archiveUpdatesStatusOnly}`)
    .text(`Portal lookup filters active: ${report.softDelete.portalLookupFiltersActive}`)
    .text(`Restore clears metadata: ${report.softDelete.restoreClearsArchiveMetadata}`)
    .text(`Permanent delete gated: ${report.softDelete.permanentDeleteGated}`)
    .text(`Protected programs: ${report.softDelete.protectedProgramsConfigured.join(', ')}`);

  doc.moveDown().fontSize(13).text(`Active pilots (${report.inventory.active.length})`);
  report.inventory.active.slice(0, 20).forEach((row) => {
    doc.fontSize(10).text(`• ${row.program_code} — ${row.program_name} (${row.pilot_status})`);
  });

  doc.moveDown().fontSize(13).text(`Archived pilots (${report.inventory.archived.length})`);
  report.inventory.archived.forEach((row) => {
    doc.text(`• ${row.program_code} — ${row.program_name} @ ${row.archived_at ?? 'unknown'}`);
  });

  doc.moveDown().fontSize(13).text(`Safe to archive (${report.inventory.safeToArchive.length})`);
  report.inventory.safeToArchive.slice(0, 20).forEach((row) => {
    doc.fontSize(10).text(`• ${row.program_code} — ${row.program_name} (${row.pilot_status})`);
  });

  doc.end();
}

async function main(): Promise<void> {
  const report = await runAudit();
  writeJson(report);
  writePdf(report);

  console.log('Pilot archive audit complete.');
  console.log(`JSON: ${JSON_PATH}`);
  console.log(`PDF:  ${PDF_PATH}`);
  console.log('');
  console.log(`Active pilots: ${report.inventory.active.length}`);
  console.log(`Archived pilots: ${report.inventory.archived.length}`);
  console.log(`Safe to archive: ${report.inventory.safeToArchive.length}`);
  console.log(`Archive columns applied: ${report.database.archiveColumnsApplied}`);
}

void main();
