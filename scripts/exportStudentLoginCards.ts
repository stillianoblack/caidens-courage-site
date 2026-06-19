/**
 * Export printable student login cards for camp onboarding.
 *
 * Usage: yarn export:student-login-cards [--program=CODE]
 */

import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { createClient } from '@supabase/supabase-js';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const CSV_PATH = path.join(REPORTS_DIR, 'student-login-cards.csv');
const PDF_PATH = path.join(REPORTS_DIR, 'student-login-cards.pdf');

type StudentExportRow = {
  firstName: string;
  programName: string;
  programCode: string;
  pin: string;
  loginUrl: string;
};

function resolveSupabase() {
  const url = (
    process.env.SUPABASE_URL ||
    process.env.REACT_APP_SUPABASE_URL ||
    ''
  ).trim();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    ''
  ).trim();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function main() {
  const programFilter = process.argv.find((arg) => arg.startsWith('--program='))?.split('=')[1]?.trim();
  const supabase = resolveSupabase();
  if (!supabase) {
    console.error('Supabase service role env is not configured.');
    process.exit(1);
  }

  let query = supabase
    .from('participants')
    .select('id, first_name, nickname, program_code, student_pin_hash')
    .eq('role', 'student')
    .not('student_pin_hash', 'is', null);

  if (programFilter) {
    query = query.eq('program_code', programFilter);
  }

  const { data: students, error } = await query;
  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  const programCodes = Array.from(new Set((students ?? []).map((row) => String(row.program_code))));
  const programNameByCode = new Map<string, string>();

  for (const code of programCodes) {
    const { data: programRow } = await supabase
      .from('pilot_programs')
      .select('program_name')
      .eq('program_code', code)
      .maybeSingle();
    programNameByCode.set(code, programRow?.program_name ? String(programRow.program_name) : code);
  }

  const loginUrl =
    (process.env.REACT_APP_SITE_URL || process.env.URL || 'https://caidenscourage.com').replace(
      /\/+$/,
      '',
    ) + '/kids/login';

  const exportRows: StudentExportRow[] = [];

  for (const row of students ?? []) {
    const programCode = String(row.program_code);
    exportRows.push({
      firstName: String(row.first_name || row.nickname || 'Student'),
      programName: programNameByCode.get(programCode) || programCode,
      programCode,
      pin: 'Use reset/backfill to reveal PIN once',
      loginUrl,
    });
  }

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const csvLines = [
    'first_name,program_name,program_code,student_pin,login_url',
    ...exportRows.map((row) =>
      [row.firstName, row.programName, row.programCode, row.pin, row.loginUrl]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    ),
  ];
  fs.writeFileSync(CSV_PATH, csvLines.join('\n'));

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48 });
    const stream = fs.createWriteStream(PDF_PATH);
    doc.pipe(stream);

    for (const row of exportRows) {
      doc.fontSize(18).text(`${row.firstName}'s Login Card`, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Program: ${row.programName}`);
      doc.text(`Program code: ${row.programCode}`);
      doc.text(`PIN: ${row.pin}`);
      doc.text(`Login: ${row.loginUrl}`);
      doc.moveDown(1.5);
      doc.moveTo(48, doc.y).lineTo(564, doc.y).stroke();
      doc.moveDown(1.5);
    }

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });

  console.log(`Wrote ${CSV_PATH}`);
  console.log(`Wrote ${PDF_PATH}`);
  console.log('Note: export lists students without raw PINs. Use roster reset or secure backfill export for PINs.');
}

void main();
