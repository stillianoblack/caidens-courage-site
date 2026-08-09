const PDFDocument = require('pdfkit');
const { requireAdmin, json } = require('./_lib/adminAuth');
const { buildPilotOutcomes } = require('./_lib/pilotOutcomes');
const {
  formatDecimal,
  formatPercentage,
  formatPoints,
  missingImpactStatus,
} = require('../../src/lib/pilotOutcomesPresentation');

function text(value, max = 3000) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, max);
}

function safeFilePart(value) {
  return text(value, 120).replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ');
}

function metric(value, suffix = '') {
  if (suffix === '%') return formatPercentage(value);
  return value == null ? 'Not enough data' : formatDecimal(value) || 'Not enough data';
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
  const live = program.liveLearningSnapshot;
  const overallLive = live?.cards?.find((card) => card.key === 'overall');
  const domainLive = (live?.cards || []).filter(
    (card) => card.available && ['reading', 'sel', 'focus'].includes(card.key),
  );
  const positiveStatuses = new Set(['Strong signal', 'Positive signal', 'Developing signal']);
  if (
    !program.matchedCount &&
    overallLive?.available &&
    positiveStatuses.has(overallLive.statusLabel)
  ) {
    const domainPhrase =
      domainLive.length >= 3
        ? 'reading, SEL, and focus activities'
        : `${domainLive.length} learning domain(s) with recorded activity`;
    return `Students are actively participating and demonstrating ${overallLive.statusLabel.toLowerCase()} live learning signals across ${domainPhrase}. Verified pre/post growth remains pending.`;
  }
  if (!program.matchedCount) {
    if (domainLive.length) {
      return 'Students are building live learning signal data from mission activity. Verified pre/post growth remains pending until matched post-assessments are recorded.';
    }
    return 'This pilot does not yet have enough matched baseline and post-assessment data to describe outcome change.';
  }
  const direction = program.absoluteDelta > 0 ? 'increased' : program.absoluteDelta < 0 ? 'decreased' : 'was unchanged';
  return `Among ${program.matchedCount} students with matched records, the average score ${direction} from ${metric(program.baselineAverage)} to ${metric(program.postAverage)}. These results describe this pilot cohort and do not establish causation.`;
}

function reportLiveLearningPayload(program) {
  return program.liveLearningSnapshot || null;
}

function reportVerifiedGrowthPayload(program) {
  return program.verifiedGrowthSnapshot || program.impactSnapshot;
}

function liveChartItems(program) {
  const snapshot = reportLiveLearningPayload(program);
  if (!snapshot) return [];
  return snapshot.cards.map((card) => {
    const numeric = typeof card.centerValue === 'string' && card.centerValue.endsWith('%')
      ? Number(card.centerValue.replace('%', ''))
      : null;
    return {
      label: card.label,
      kind: card.evidenceType === 'operational' ? 'completion' : 'live',
      center: card.centerValue,
      delta: null,
      ring: Number.isFinite(numeric) ? numeric : null,
      status: card.statusLabel,
      caption: card.summary,
    };
  });
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

function addContentPage(doc) {
  doc.addPage();
  addHeader(doc);
}

function ensureSpace(doc, height = 24) {
  if (doc.y + height > 690) addContentPage(doc);
}

function heading(doc, value) {
  ensureSpace(doc, 34);
  doc.fillColor('#14345f').font('Helvetica-Bold').fontSize(15).text(value, { keepTogether: true });
  doc.moveDown(0.35);
}

function line(doc, label, value) {
  ensureSpace(doc, 16);
  doc.fillColor('#213047').font('Helvetica-Bold').fontSize(9).text(`${label}: `, { continued: true });
  doc.font('Helvetica').text(String(value));
}

function signedPoints(value) {
  return formatPoints(value);
}

function circleState(value) {
  if (value == null) return { color: '#687789' };
  if (value > 0) return { color: '#19734b' };
  if (value < 0) return { color: '#a53b32' };
  return { color: '#6b5f24' };
}

function drawImpactCircle(doc, item, x, y) {
  const radius = 41;
  const centerX = x + radius;
  const centerY = y + radius;
  const state = item.kind === 'completion' || item.kind === 'live'
    ? { color: '#2469ad' }
    : circleState(item.delta);
  doc.lineWidth(8).strokeColor('#dfe7ef').circle(centerX, centerY, radius).stroke();
  if (item.ring != null) {
    const bounded = Math.max(0, Math.min(100, item.ring));
    if (bounded === 100) {
      doc.lineWidth(8).strokeColor(state.color).circle(centerX, centerY, radius).stroke();
    } else if (bounded > 0) {
      doc
        .lineWidth(8)
        .strokeColor(state.color)
        .path(`M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 ${bounded > 50 ? 1 : 0} 1 ${centerX + radius * Math.sin((bounded / 100) * Math.PI * 2)} ${centerY - radius * Math.cos((bounded / 100) * Math.PI * 2)}`)
        .stroke();
    }
  } else {
    doc.lineWidth(2).dash(4, { space: 3 }).strokeColor(state.color).circle(centerX, centerY, radius - 5).stroke().undash();
  }
  doc
    .fillColor('#14345f')
    .font('Helvetica-Bold')
    .fontSize(item.center.length > 12 ? 8 : 11)
    .text(item.center, centerX - 32, centerY - 7, { width: 64, align: 'center' });
  doc
    .fillColor('#14345f')
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(item.label, x - 10, y + 91, { width: 102, align: 'center', height: 25 });
  doc
    .fillColor(state.color)
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .text(item.status, x - 12, y + 116, { width: 106, align: 'center', height: 13 });
  doc
    .fillColor('#52657f')
    .font('Helvetica')
    .fontSize(7)
    .text(item.caption, x - 12, y + 131, { width: 106, align: 'center', height: 28 });
}

function reportImpactPayload(program) {
  return reportVerifiedGrowthPayload(program);
}

function impactItems(program) {
  const snapshot = reportImpactPayload(program);
  const domainItems = snapshot.domains.map((domain) => ({
    label: domain.label,
    center: signedPoints(domain.deltaPercentagePoints),
    delta: domain.deltaPercentagePoints,
    ring: domain.postPercentage,
    status: domain.deltaPercentagePoints == null ? missingImpactStatus('domain') : domain.displayStatus,
    caption:
      domain.deltaPercentagePoints == null
        ? `${domain.matchedStudentCount} matched; ${domain.requiredMatchedCount} required`
        : `${domain.baselinePercentage}% to ${domain.postPercentage}%; n=${domain.matchedStudentCount}`,
  }));
  const weekly = snapshot.weeklyCompletion;
  const participation = snapshot.participation;
  const overall = snapshot.overallMatchedGrowth;
  return [
    ...domainItems,
    {
      label: 'Weekly completion',
      kind: 'completion',
      center: formatPercentage(weekly.percentage),
      delta: weekly.percentage == null ? null : 0,
      ring: weekly.percentage,
      status: weekly.percentage == null ? missingImpactStatus('weekly') : weekly.displayStatus,
      caption: `${weekly.numerator} of ${weekly.denominator || 'unavailable'} student-weeks`,
    },
    {
      label: 'Participation',
      kind: 'completion',
      center: formatPercentage(participation.percentage),
      delta: participation.percentage == null ? null : 0,
      ring: participation.percentage,
      status: participation.percentage == null ? missingImpactStatus('participation') : participation.displayStatus,
      caption: `${participation.numerator} of ${participation.denominator} students`,
    },
    {
      label: 'Overall matched growth',
      center: signedPoints(overall.deltaPercentagePoints),
      delta: overall.deltaPercentagePoints,
      ring: null,
      status: overall.deltaPercentagePoints == null ? missingImpactStatus('overall') : overall.displayStatus,
      caption: `${overall.includedDomainCount} of ${overall.totalDomainCount} domains; unweighted`,
    },
  ];
}

function drawLiveLearningSnapshot(doc, program) {
  const items = liveChartItems(program);
  if (!items.length) return;
  addContentPage(doc);
  heading(doc, 'Live Learning Signals');
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#52657f')
    .text('Directional signals from tagged mission activity and accuracy. These are not verified baseline/post growth.');
  const startY = doc.y + 12;
  const columns = [78, 250, 422];
  items.forEach((item, index) => {
    drawImpactCircle(doc, item, columns[index % 3], startY + Math.floor(index / 3) * 155);
  });
  doc.y = startY + Math.ceil(items.length / 3) * 155 + 8;
  const guide = program.liveLearningSnapshot?.evidenceGuide;
  if (guide) {
    doc
      .fillColor('#213047')
      .font('Helvetica')
      .fontSize(8)
      .text(
        `Evidence labels — Operational: ${guide.operational} Directional: ${guide.directional} Verified: ${guide.verified}`,
        54,
        doc.y,
        { width: 504 },
      );
  }
}

function drawProgramHealthSummary(doc, program) {
  addContentPage(doc);
  heading(doc, 'Program Health');
  line(doc, 'Students enrolled', program.activeStudentCount);
  line(doc, 'Baseline completed', `${program.baseline.count}/${program.baseline.total}`);
  line(doc, 'Post completed', `${program.post.count}/${program.post.total}`);
  line(doc, 'Weekly completion', program.weeklyCompletion.rate == null ? 'Awaiting activity' : `${formatPercentage(program.weeklyCompletion.rate)} (${program.weeklyCompletion.count}/${program.weeklyCompletion.total})`);
  line(doc, 'Assessments completed', program.assessmentCount);
  line(doc, 'Missions completed', program.missionCount);
  line(doc, 'Focus Coins earned', program.focusCoins);
  line(doc, 'Certificates earned', program.certificateCount);
  line(doc, 'Last activity', program.lastActivity || 'Not recorded');
}

function drawImpactSnapshot(doc, program) {
  const snapshot = reportImpactPayload(program);
  addContentPage(doc);
  heading(doc, 'Verified Growth');
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#52657f')
    .text('Confirmed change based on matched baseline and post-assessments. Center values are percentage-point changes.');
  const items = impactItems(program);
  const startY = doc.y + 12;
  const columns = [78, 250, 422];
  items.forEach((item, index) => {
    drawImpactCircle(doc, item, columns[index % 3], startY + Math.floor(index / 3) * 155);
  });
  doc.y = startY + 310;
  doc
    .fillColor('#213047')
    .font('Helvetica')
    .fontSize(8)
    .text(
      `Methodology: ${snapshot.overallMatchedGrowth.weighting}. Completion and engagement are excluded from academic/SEL growth. Findings with fewer than 5 matched students are directional.`,
      54,
      startY + 310,
      { width: 504 },
    );
  addContentPage(doc);
  heading(doc, 'Detailed outcomes');
  const headers = ['Measure', 'Baseline', 'Post', 'Delta', 'Matched', 'Excluded', 'Status'];
  const widths = [118, 61, 61, 58, 46, 47, 82];
  const rows = snapshot.domains.map((domain) => [
    domain.label,
    metric(domain.baselinePercentage, '%'),
    metric(domain.postPercentage, '%'),
    signedPoints(domain.deltaPercentagePoints),
    String(domain.matchedStudentCount),
    String(domain.excludedRecordCount),
    domain.dataQualityStatus,
  ]);
  let tableY = doc.y;
  let x = 54;
  headers.forEach((header, index) => {
    doc.rect(x, tableY, widths[index], 20).fillAndStroke('#edf3fa', '#b8c7d8');
    doc.fillColor('#14345f').font('Helvetica-Bold').fontSize(7).text(header, x + 3, tableY + 6, { width: widths[index] - 6 });
    x += widths[index];
  });
  tableY += 20;
  rows.forEach((row) => {
    x = 54;
    row.forEach((value, index) => {
      doc.rect(x, tableY, widths[index], 27).strokeColor('#cbd5e1').stroke();
      doc.fillColor('#213047').font('Helvetica').fontSize(6.8).text(value, x + 3, tableY + 5, { width: widths[index] - 6, height: 19 });
      x += widths[index];
    });
    tableY += 27;
  });
  doc.y = tableY + 8;
  doc.fillColor('#52657f').font('Helvetica').fontSize(8).text(
    'Baseline and post percentages use only students with both mapped domain scores. Excluded records are not imputed.',
    54,
    tableY + 8,
    { width: 504 },
  );
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
    doc.fillColor('#14345f').font('Helvetica-Bold').fontSize(26).text('Focus Flame Academy Pilot Outcomes Report');
    doc.moveDown();
    doc.fillColor('#213047').fontSize(18).text(program.programName);
    doc.font('Helvetica').fontSize(11).text(program.programType);
    doc.moveDown();
    line(doc, 'Reporting period', `${options.reportingStart || 'Program start'} – ${options.reportingEnd || 'Prepared date'}`);
    line(doc, 'Prepared', new Date().toISOString().slice(0, 10));
    line(doc, 'Confidentiality', 'Administrative pilot review — privacy-safe cohort summary');
    addContentPage(doc);
    heading(doc, 'Executive summary');
    doc.fillColor('#213047').font('Helvetica').fontSize(10).text(narrative(program));
    doc.moveDown();
    line(doc, 'Students enrolled', program.activeStudentCount);
    line(doc, 'Matched pre/post students', `${program.matchedCount} of ${program.activeStudentCount}`);
    line(doc, 'Average baseline', metric(program.baselineAverage));
    line(doc, 'Average post', metric(program.postAverage));
    line(doc, 'Absolute delta', metric(program.absoluteDelta));
    line(doc, 'Percentage delta', program.percentageDeltaAvailable ? metric(program.percentageDelta, '%') : 'Unavailable');
    line(doc, 'Weekly completion', program.weeklyCompletion.rate == null ? 'Not enough data' : `${formatPercentage(program.weeklyCompletion.rate)} (${program.weeklyCompletion.count}/${program.weeklyCompletion.total})`);
    drawProgramHealthSummary(doc, program);
    if (options.includeCharts !== false) {
      drawLiveLearningSnapshot(doc, program);
      drawImpactSnapshot(doc, program);
    }
    addContentPage(doc);
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
    heading(doc, 'Key strengths');
    doc.font('Helvetica').fontSize(9).text(
      program.impactSnapshot.overallMatchedGrowth.deltaPercentagePoints != null
        ? `Matched domain results show ${signedPoints(program.impactSnapshot.overallMatchedGrowth.deltaPercentagePoints)} across ${program.impactSnapshot.overallMatchedGrowth.includedDomainCount} mapped domains.`
        : 'Not enough matched domain data is available to identify measured strengths.',
    );
    heading(doc, 'Areas needing additional data');
    program.reportBlockers.forEach((blocker) => {
      ensureSpace(doc, 15);
      doc.font('Helvetica').fontSize(9).text(`- ${blocker}`);
    });
    program.impactSnapshot.domains
      .filter((domain) => domain.deltaPercentagePoints == null)
      .forEach((domain) => {
        ensureSpace(doc, 15);
        doc.font('Helvetica').fontSize(9).text(`- ${domain.label}: ${domain.missingReason}`);
      });
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
    recommendations(program).forEach((item) => {
      ensureSpace(doc, 18);
      doc.font('Helvetica').fontSize(10).text(`- ${item}`);
    });
    if (options.includeStudentAppendix) {
      doc.addPage();
      addHeader(doc);
      heading(doc, 'Privacy-safe student appendix');
      for (const student of program.students) {
        if (doc.y > 720) {
          addContentPage(doc);
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
  const domainRows = program.impactSnapshot.domains.map((domain) => `<tr><th>${text(domain.label)}</th><td>${metric(domain.baselinePercentage, '%')}</td><td>${metric(domain.postPercentage, '%')}</td><td>${signedPoints(domain.deltaPercentagePoints)}</td><td>${domain.matchedStudentCount}</td><td>${domain.excludedRecordCount}</td><td>${text(domain.dataQualityStatus)}</td></tr>`).join('');
  const liveRows = (program.liveLearningSnapshot?.cards || []).map((card) => `<tr><th>${text(card.label)}</th><td>${text(card.centerValue)}</td><td>${text(card.statusLabel)}</td><td>${text(card.summary)}</td></tr>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Focus Flame Academy Pilot Outcomes Report</title><style>body{font:16px/1.5 system-ui;color:#213047;max-width:850px;margin:40px auto;padding:24px}h1,h2{color:#14345f}table{border-collapse:collapse;width:100%}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}@media print{body{margin:0}.no-print{display:none}}</style></head><body><p><strong>FOCUS FLAME ACADEMY</strong><br>A Caiden's Courage Learning Adventure</p><h1>Focus Flame Academy Pilot Outcomes Report</h1><h2>${text(program.programName)}</h2><p>${text(narrative(program))}</p><h2>Live Learning Signals</h2><table><thead><tr><th>Measure</th><th>Value</th><th>Status</th><th>Summary</th></tr></thead><tbody>${liveRows || '<tr><td colspan="4">No live signal payload</td></tr>'}</tbody></table><h2>Verified Growth</h2><table><thead><tr><th>Measure</th><th>Baseline</th><th>Post</th><th>Delta</th><th>Matched</th><th>Excluded</th><th>Status</th></tr></thead><tbody>${domainRows}</tbody></table><p>${text(program.impactSnapshot.overallMatchedGrowth.weighting)}. Completion and engagement are excluded from academic/SEL growth.</p><h2>Data notes</h2><p>Operational metrics describe enrollment and activity. Directional live signals describe mission activity. Verified growth requires matched baseline and post assessments. Missing records are not inferred.</p><button class="no-print" onclick="print()">Print report</button></body></html>`;
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
module.exports.impactItems = impactItems;
module.exports.reportImpactPayload = reportImpactPayload;
module.exports.reportLiveLearningPayload = reportLiveLearningPayload;
module.exports.reportVerifiedGrowthPayload = reportVerifiedGrowthPayload;
module.exports.liveChartItems = liveChartItems;
module.exports.narrative = narrative;
