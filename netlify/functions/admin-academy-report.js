const PDFDocument = require('pdfkit');
const { requireAdmin, json } = require('./_lib/adminAuth');
const { loadAcademyData } = require('./_lib/academyData');
const { buildAcademyOutcomes } = require('./_lib/academyOutcomes');

function text(value) {
  return String(value ?? '').replace(/[<>]/g, '');
}

function metric(value, suffix = '') {
  return value == null ? 'Unavailable' : `${value}${suffix}`;
}

function academyHtml(academy) {
  const a = academy.aggregate;
  const domains = a.impactSnapshot.domains
    .map((domain) => `<tr><td>${text(domain.label)}</td><td>${metric(domain.baselinePercentage, '%')}</td><td>${metric(domain.postPercentage, '%')}</td><td>${metric(domain.deltaPercentagePoints, ' pts')}</td><td>${domain.matchedStudentCount}</td><td>${text(domain.displayStatus)}</td></tr>`)
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Focus Flame Academy Overview</title><style>body{font:15px/1.5 system-ui;color:#213047;max-width:900px;margin:32px auto;padding:24px}h1,h2{color:#14345f}.card{border:1px solid #d8e2ef;border-radius:16px;padding:18px;margin:14px 0}table{border-collapse:collapse;width:100%}th,td{border:1px solid #d8e2ef;padding:8px;text-align:left}@media print{body{margin:0}}</style></head><body><p><strong>FOCUS FLAME ACADEMY</strong><br>A Caiden's Courage Learning Adventure</p><h1>Focus Flame Academy Overview</h1><p>Reporting period: ${text(academy.cohortSummary.earliestActivity || 'Unavailable')} through ${text(academy.cohortSummary.latestActivity || 'Unavailable')}</p><div class="card"><h2>Executive summary</h2><p>${a.activeStudentCount} students are included across ${academy.cohortSummary.programsRepresented} programs and ${academy.cohortSummary.activeOrganizations} organizations.</p><p>${text(academy.eligibilityRule.statement)}</p></div><div class="card"><h2>Program Health</h2><p>${a.baseline.count} baseline; ${a.post.count} post; ${a.missionCount} completed missions; ${a.focusCoins} coins; ${a.certificateCount} certificates.</p></div><div class="card"><h2>Academy-wide Live Student Progress</h2>${a.liveLearningSnapshot.cards.map((card) => `<p><strong>${text(card.label)}:</strong> ${text(card.centerValue)} — ${text(card.statusLabel)}</p>`).join('')}</div><div class="card"><h2>Verified Outcomes</h2><table><thead><tr><th>Domain</th><th>Baseline</th><th>Post</th><th>Delta</th><th>Matched</th><th>Status</th></tr></thead><tbody>${domains}</tbody></table><p>Activity and engagement are never converted into verified growth.</p></div><div class="card"><h2>Data quality</h2><p>Missing program links: ${academy.dataQuality.missingProgramLinks}. Missing grades: ${academy.dataQuality.missingGradeLevels}. Duplicate identities: ${academy.dataQuality.duplicateIdentities}. Excluded test/synthetic records: ${academy.dataQuality.excludedTestSyntheticRecords}. Below threshold: ${academy.dataQuality.studentsBelowEligibilityThreshold}. Missing weekly-progress source: ${academy.dataQuality.missingWeeklyProgressSource ? 'Yes' : 'No'}.</p></div><div class="card"><h2>Methodology</h2><p>Operational metrics describe participation and activity. Live signals are directional evidence from completed learning records. Verified outcomes require matched baseline and post assessments.</p></div></body></html>`;
}

function academyPdf(academy) {
  const doc = new PDFDocument({ size: 'LETTER', margin: 54, bufferPages: true });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  const heading = (value) => {
    doc.moveDown(.65).fillColor('#14345f').font('Helvetica-Bold').fontSize(15).text(value);
    doc.moveDown(.25).fillColor('#213047').font('Helvetica').fontSize(10);
  };
  doc.fillColor('#14345f').font('Helvetica-Bold').fontSize(11).text('FOCUS FLAME ACADEMY');
  doc.fontSize(24).text('Focus Flame Academy Overview');
  doc.moveDown(.3).fillColor('#59687c').font('Helvetica').fontSize(10)
    .text(`Reporting period: ${academy.cohortSummary.earliestActivity || 'Unavailable'} through ${academy.cohortSummary.latestActivity || 'Unavailable'}`);
  heading('Executive summary');
  doc.text(`${academy.aggregate.activeStudentCount} students are included across ${academy.cohortSummary.programsRepresented} programs and ${academy.cohortSummary.activeOrganizations} organizations.`);
  doc.moveDown(.3).text(academy.eligibilityRule.statement);
  heading('Cohort definition');
  doc.text(`Total accounts: ${academy.cohortSummary.totalParticipantAccounts}. Automatically eligible: ${academy.cohortSummary.automaticallyEligibleStudents}. Manually included: ${academy.cohortSummary.manuallyIncludedStudents}. Manually excluded: ${academy.cohortSummary.manuallyExcludedStudents}. Low-engagement exclusions: ${academy.cohortSummary.lowEngagementExclusions}.`);
  heading('Program Health');
  const a = academy.aggregate;
  doc.text(`${a.baseline.count} baseline; ${a.post.count} post; ${a.missionCount} completed missions; ${a.focusCoins} coins; ${a.certificateCount} certificates.`);
  heading('Academy-wide Live Student Progress');
  for (const card of a.liveLearningSnapshot.cards) {
    doc.font('Helvetica-Bold').text(`${card.label}: ${card.centerValue}`, { continued: true });
    doc.font('Helvetica').text(` — ${card.statusLabel}. ${card.summary}`);
  }
  heading('Verified Outcomes');
  for (const domain of a.impactSnapshot.domains) {
    doc.font('Helvetica-Bold').text(domain.label, { continued: true });
    doc.font('Helvetica').text(` — baseline ${metric(domain.baselinePercentage, '%')}; post ${metric(domain.postPercentage, '%')}; delta ${metric(domain.deltaPercentagePoints, ' pts')}; matched ${domain.matchedStudentCount}; ${domain.displayStatus}.`);
  }
  doc.moveDown(.3).font('Helvetica-Oblique').text('Activity and engagement are never converted into verified growth.');
  heading('Engagement and completion');
  doc.text(`Sessions: ${a.students.reduce((sum, row) => sum + (row.kidPlaySessions || 0), 0)}. Completed missions: ${a.missionCount}. Assessments: ${a.assessmentCount}. Coins: ${a.focusCoins}. Certificates: ${a.certificateCount}.`);
  heading('Data quality disclosure');
  doc.text(`Missing program links: ${academy.dataQuality.missingProgramLinks}. Missing grades: ${academy.dataQuality.missingGradeLevels}. Duplicate identities: ${academy.dataQuality.duplicateIdentities}. Excluded test/synthetic records: ${academy.dataQuality.excludedTestSyntheticRecords}. Below threshold: ${academy.dataQuality.studentsBelowEligibilityThreshold}. Missing weekly-progress source: ${academy.dataQuality.missingWeeklyProgressSource ? 'Yes' : 'No'}.`);
  heading('Methodology');
  doc.text('Operational metrics describe participation and activity. Live signals are directional evidence from completed learning records. Verified outcomes require matched baseline and post assessments.');
  doc.end();
  return new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));
}

exports.handler = async (event) => {
  if (!['GET', 'POST'].includes(event.httpMethod)) {
    return json(405, { error: 'Method not allowed.' }, 'method-not-allowed');
  }
  const auth = await requireAdmin(event);
  if (auth.response) return auth.response;
  const { supabase, correlationId } = auth.context;
  const { data, unavailableSources } = await loadAcademyData(supabase, correlationId);
  const academy = buildAcademyOutcomes(data, {
    weeklyProgressSourceAvailable: !unavailableSources.includes('participant_week_progress'),
  });
  const format = String(event.queryStringParameters?.format || 'pdf').toLowerCase();
  if (format === 'html') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
      body: academyHtml(academy),
    };
  }
  const pdf = await academyPdf(academy);
  return {
    statusCode: 200,
    isBase64Encoded: true,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="focus-flame-academy-overview-${new Date().toISOString().slice(0, 10)}.pdf"`,
      'Cache-Control': 'no-store',
    },
    body: pdf.toString('base64'),
  };
};

exports._test = { academyHtml, academyPdf };
