const PDFDocument = require('pdfkit');
const { requireAdmin, json } = require('./_lib/adminAuth');
const { buildPilotOutcomes } = require('./_lib/pilotOutcomes');

function text(value, max = 3000) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, max);
}

function safeFilePart(value) {
  return text(value, 120).replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ');
}

function metric(value, suffix = '') {
  return value == null ? 'Not enough data' : `${value}${suffix}`;
}

async function load(supabase, table) {
  const { data, error } = await supabase.from(table).select('*').limit(10000);
  return error ? [] : data || [];
}

async function getProgramOutcome(supabase, programId) {
  const [programs, participants, assessments, modules, weeks, wallets, rewards] = await Promise.all([
    load(supabase, 'pilot_programs'),
    load(supabase, 'participants'),
    load(supabase, 'assessment_results_v2'),
    load(supabase, 'module_results'),
    load(supabase, 'participant_week_progress'),
    load(supabase, 'player_wallets'),
    load(supabase, 'player_reward_claims'),
  ]);
  return buildPilotOutcomes({
    programs: programs.filter((program) => program.id === programId),
    participants,
    assessments,
    modules,
    weeks,
    wallets,
    rewards,
  }).programs[0] || null;
}

function narrative(program) {
  if (!program.matchedCount) {
    return 'This pilot does not yet have enough matched baseline and post-assessment data to describe outcome change.';
  }
  const direction = program.absoluteDelta > 0 ? 'increased' : program.absoluteDelta < 0 ? 'decreased' : 'was unchanged';
  return `Among ${program.matchedCount} students with matched records, the average score ${direction} from ${metric(program.baselineAverage)} to ${metric(program.postAverage)}. These results describe this pilot cohort and do not establish causation.`;
}

function recommendations(program) {
  const recommendations = [];
  if (program.post.count < program.activeStudentCount) recommendations.push('Improve post-assessment completion before final reporting.');
  if (program.matchedCount < 5) recommendations.push('Continue data collection before considering expansion.');
  if (program.weeklyCompletion.rate != null && program.weeklyCompletion.rate < 70) recommendations.push('Review weekly participation barriers with the facilitator.');
  if (!recommendations.length) recommendations.push('Review the results with the facilitator and consider the next four-week cycle.');
  return recommendations;
}

function addHeader(doc) {
  doc.fillColor('#14345f').fontSize(10).font('Helvetica-Bold').text('FOCUS FLAME ACADEMY');
  doc.fillColor('#52657f').fontSize(9).font('Helvetica').text("A Caiden's Courage Learning Adventure");
  doc.moveDown(0.5).strokeColor('#d8a847').moveTo(54, doc.y).lineTo(558, doc.y).stroke().moveDown();
}

function heading(doc, value) {
  if (doc.y > 700) doc.addPage();
  doc.fillColor('#14345f').font('Helvetica-Bold').fontSize(15).text(value, { keepTogether: true });
  doc.moveDown(0.35);
}

function line(doc, label, value) {
  if (doc.y > 725) doc.addPage();
  doc.fillColor('#213047').font('Helvetica-Bold').fontSize(9).text(`${label}: `, { continued: true });
  doc.font('Helvetica').text(String(value));
}

function buildPdf(program, options) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margin: 54, bufferPages: true, info: { Title: `Pilot Outcomes Report — ${program.programName}` } });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    addHeader(doc);
    doc.moveDown(1.5);
    doc.fillColor('#14345f').font('Helvetica-Bold').fontSize(28).text('Pilot Outcomes Report');
    doc.moveDown();
    doc.fillColor('#213047').fontSize(18).text(program.programName);
    doc.font('Helvetica').fontSize(11).text(program.programType);
    doc.moveDown();
    line(doc, 'Reporting period', `${options.reportingStart || 'Program start'} – ${options.reportingEnd || 'Prepared date'}`);
    line(doc, 'Prepared', new Date().toISOString().slice(0, 10));
    line(doc, 'Confidentiality', 'Administrative pilot review — privacy-safe cohort summary');
    doc.addPage();
    addHeader(doc);
    heading(doc, 'Executive summary');
    doc.fillColor('#213047').font('Helvetica').fontSize(10).text(narrative(program));
    doc.moveDown();
    line(doc, 'Students enrolled', program.activeStudentCount);
    line(doc, 'Matched pre/post students', `${program.matchedCount} of ${program.activeStudentCount}`);
    line(doc, 'Average baseline', metric(program.baselineAverage));
    line(doc, 'Average post', metric(program.postAverage));
    line(doc, 'Absolute delta', metric(program.absoluteDelta));
    line(doc, 'Percentage delta', program.percentageDeltaAvailable ? metric(program.percentageDelta, '%') : 'Unavailable');
    line(doc, 'Weekly completion', program.weeklyCompletion.rate == null ? 'Not enough data' : `${program.weeklyCompletion.rate}% (${program.weeklyCompletion.count}/${program.weeklyCompletion.total})`);
    heading(doc, 'Program snapshot');
    line(doc, 'Facilitator', program.facilitator);
    line(doc, 'Start date', program.startDate || 'Not provided');
    line(doc, 'Baseline participation', `${program.baseline.count}/${program.baseline.total}`);
    line(doc, 'Post participation', `${program.post.count}/${program.post.total}`);
    line(doc, 'Assessments completed', program.assessmentCount);
    line(doc, 'Missions completed', program.missionCount);
    line(doc, 'Focus Coins', program.focusCoins);
    line(doc, 'Certificates', program.certificateCount);
    heading(doc, 'Outcomes');
    line(doc, 'Improved', program.students.filter((row) => row.delta > 0).length);
    line(doc, 'Unchanged', program.students.filter((row) => row.delta === 0).length);
    line(doc, 'Declined', program.students.filter((row) => row.delta < 0).length);
    line(doc, 'Incomplete', program.students.filter((row) => row.delta == null).length);
    if (options.includeCharts !== false) {
      doc.moveDown().font('Helvetica-Bold').text('Category-level gains');
      for (const category of program.categories) {
        doc.font('Helvetica').text(`${category.category}: ${metric(category.delta)} (n=${category.n})`);
      }
      if (!program.categories.length) doc.font('Helvetica').text('Not enough data');
    }
    heading(doc, 'Engagement');
    line(doc, 'Weekly adventures completed', `${program.weeklyCompletion.count}/${program.weeklyCompletion.total || 'unavailable'}`);
    line(doc, 'Last activity', program.lastActivity || 'Not enough data');
    if (options.includeNotes !== false) {
      heading(doc, 'Educator observations');
      for (const [label, value] of [
        ['What worked', options.notes?.whatWorked],
        ['Student response', options.notes?.studentResponse],
        ['Challenges', options.notes?.challenges],
        ['Recommended next steps', options.notes?.recommendedNextSteps],
        ['Approved quote/testimonial', options.notes?.approvedQuote],
      ]) line(doc, label, text(value) || 'Not provided');
    }
    heading(doc, 'Data notes');
    doc.font('Helvetica').fontSize(9).fillColor('#213047').text(
      'Pre/post change uses only students with both a valid baseline and post score. Incomplete records remain visible in participation and data-quality totals. Results describe this pilot cohort and do not establish clinical, diagnostic, causal, or statistically significant effects.',
    );
    heading(doc, 'Next-step recommendations');
    recommendations(program).forEach((item) => doc.font('Helvetica').fontSize(10).text(`• ${item}`));
    if (options.includeStudentAppendix) {
      doc.addPage();
      addHeader(doc);
      heading(doc, 'Privacy-safe student appendix');
      for (const student of program.students) {
        if (doc.y > 720) {
          doc.addPage();
          addHeader(doc);
          heading(doc, 'Privacy-safe student appendix — continued');
        }
        doc.font('Helvetica-Bold').fontSize(9).text(student.studentLabel, { continued: true });
        doc.font('Helvetica').text(`  Grade: ${student.grade}  Baseline: ${metric(student.baselineScore)}  Post: ${metric(student.postScore)}  Delta: ${metric(student.delta)}  State: ${student.dataCompleteness}`);
      }
    }
    const range = doc.bufferedPageRange();
    for (let page = range.start; page < range.start + range.count; page += 1) {
      doc.switchToPage(page);
      doc.font('Helvetica').fontSize(8).fillColor('#52657f').text(
        `caidenscourage.com  •  Focus Flame Academy  •  A Caiden's Courage Learning Adventure  •  Page ${page + 1} of ${range.count}  •  ${new Date().toISOString().slice(0, 10)}`,
        54,
        724,
        { width: 504, align: 'center', lineBreak: false },
      );
    }
    doc.end();
  });
}

function buildHtml(program) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Pilot Outcomes Report</title><style>body{font:16px/1.5 system-ui;color:#213047;max-width:850px;margin:40px auto;padding:24px}h1,h2{color:#14345f}table{border-collapse:collapse;width:100%}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}@media print{body{margin:0}.no-print{display:none}}</style></head><body><p><strong>FOCUS FLAME ACADEMY</strong><br>A Caiden's Courage Learning Adventure</p><h1>Pilot Outcomes Report</h1><h2>${text(program.programName)}</h2><p>${text(narrative(program))}</p><table><tbody><tr><th>Students enrolled</th><td>${program.activeStudentCount}</td></tr><tr><th>Matched students</th><td>${program.matchedCount}</td></tr><tr><th>Baseline average</th><td>${metric(program.baselineAverage)}</td></tr><tr><th>Post average</th><td>${metric(program.postAverage)}</td></tr><tr><th>Absolute delta</th><td>${metric(program.absoluteDelta)}</td></tr></tbody></table><h2>Data notes</h2><p>Results use matched students and describe this pilot cohort. Missing records are not inferred.</p><button class="no-print" onclick="print()">Print report</button></body></html>`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' }, 'method-not-allowed');
  const auth = await requireAdmin(event);
  if (auth.response) return auth.response;
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'The report request could not be read.' }, auth.context.correlationId);
  }
  const programId = text(body.programId, 80);
  const program = await getProgramOutcome(auth.context.supabase, programId);
  if (!program) return json(404, { error: 'Program outcomes were not found.' }, auth.context.correlationId);
  const format = body.format === 'html' ? 'html' : 'pdf';
  const filename = `Caiden's Courage Pilot Outcomes — ${safeFilePart(program.programName)} — ${new Date().toISOString().slice(0, 10)}.${format}`;
  const options = {
    reportingStart: text(body.reportingStart, 20),
    reportingEnd: text(body.reportingEnd, 20),
    includeStudentAppendix: Boolean(body.includeStudentAppendix),
    includeNotes: body.includeNotes !== false,
    includeCharts: body.includeCharts !== false,
    notes: Object.fromEntries(Object.entries(body.notes || {}).map(([key, value]) => [key, text(value)])),
  };
  try {
    const content = format === 'html' ? Buffer.from(buildHtml(program)) : await buildPdf(program, options);
    await auth.context.supabase.from('pilot_outcome_reports').insert({
      program_id: programId,
      status: body.status === 'final' ? 'final' : 'draft',
      reporting_start: options.reportingStart || null,
      reporting_end: options.reportingEnd || null,
      include_student_appendix: options.includeStudentAppendix,
      include_notes: options.includeNotes,
      include_charts: options.includeCharts,
      generated_at: new Date().toISOString(),
    }).then(() => undefined, () => undefined);
    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        'Content-Type': format === 'html' ? 'text/html; charset=utf-8' : 'application/pdf',
        'Content-Disposition': `${body.disposition === 'inline' ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'no-store, private',
        'X-Content-Type-Options': 'nosniff',
      },
      body: content.toString('base64'),
    };
  } catch (error) {
    console.error('[PILOT_OUTCOMES_REPORT_FAILED]', {
      correlationId: auth.context.correlationId,
      message: error instanceof Error ? error.message : 'unknown',
    });
    return json(500, { error: 'The report could not be generated. Use the print view instead.' }, auth.context.correlationId);
  }
};

module.exports.buildPdf = buildPdf;
module.exports.buildHtml = buildHtml;
