const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { requireAdmin, json } = require('./_lib/adminAuth');
const { loadAcademyData } = require('./_lib/academyData');
const { buildAcademyOutcomes } = require('./_lib/academyOutcomes');
const {
  BRAND,
  addReportFooters,
  drawMetricCard,
  drawSectionTitle,
  formatReportDate,
  formatReportingPeriod,
} = require('./_lib/reportPdfFormatting');

function text(value) {
  return String(value ?? '').replace(/[<>]/g, '');
}

function metric(value, suffix = '') {
  return value == null ? 'Unavailable' : `${value}${suffix}`;
}

function academyPopulationDisclosure(academy) {
  const summary = academy.cohortSummary;
  return {
    operational:
      `Focus Flame Academy contains ${summary.canonicalStudentAccounts} canonical student accounts. ` +
      `After excluding ${summary.testInternalParticipants} test/internal accounts, ` +
      `${summary.nonTestLearners} non-test learners remain. ` +
      `${summary.establishedParticipants} students met the established reporting threshold, ` +
      `${summary.emergingParticipants} showed emerging engagement, and ` +
      `${summary.minimalParticipants} had minimal or no recorded learning activity.`,
    formal:
      `The live learning signal analysis in this report uses the ` +
      `${academy.aggregate.activeStudentCount}-student established reporting cohort unless otherwise labeled. ` +
      `This is an Academy-wide report. The ${academy.aggregate.activeStudentCount} students referenced in the formal reporting cohort ` +
      `are the established students included across qualifying Academy programs. ` +
      `This is not the enrollment count for any single program.`,
  };
}

function academyHtml(academy) {
  const a = academy.aggregate;
  const disclosure = academyPopulationDisclosure(academy);
  const domains = a.impactSnapshot.domains
    .map((domain) => `<tr><td>${text(domain.label)}</td><td>${metric(domain.baselinePercentage, '%')}</td><td>${metric(domain.postPercentage, '%')}</td><td>${metric(domain.deltaPercentagePoints, ' pts')}</td><td>${domain.matchedStudentCount}</td><td>${text(domain.displayStatus)}</td></tr>`)
    .join('');
  const composition = academy.programSummaries.map((program) => `<tr><th>${text(program.programName)}</th><td>${program.enrolledStudents}</td><td>${program.establishedStudents}</td><td>${program.emergingStudents}</td><td>${program.minimalStudents}</td><td>${program.includedStudents}</td></tr>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Focus Flame Academy Overview</title><style>body{font:15px/1.5 system-ui;color:#213047;max-width:900px;margin:32px auto;padding:24px}h1,h2{color:#14345f}.card{border:1px solid #d8e2ef;border-radius:16px;padding:18px;margin:14px 0}table{border-collapse:collapse;width:100%}th,td{border:1px solid #d8e2ef;padding:8px;text-align:left}@media print{body{margin:0}}</style></head><body><p><strong>FOCUS FLAME ACADEMY</strong><br>A Caiden's Courage Learning Adventure</p><h1>Focus Flame Academy Overview</h1><p><strong>Academy-wide</strong></p><p>Reporting period: ${text(academy.cohortSummary.earliestActivity || 'Unavailable')} through ${text(academy.cohortSummary.latestActivity || 'Unavailable')}</p><p>Calculated at: ${text(academy.calculatedAt)}</p><div class="card"><h2>Executive summary</h2><p>${text(disclosure.operational)}</p><p><strong>${text(disclosure.formal)}</strong></p><p>Cohort denominator: ${academy.cohortSummary.canonicalStudentAccounts} canonical student accounts. Categories are mutually exclusive and total ${academy.cohortSummary.canonicalStudentAccounts}.</p></div><div class="card"><h2>Program Composition</h2><table><thead><tr><th>Program</th><th>Enrolled</th><th>Established</th><th>Emerging</th><th>Minimal</th><th>Formal report</th></tr></thead><tbody>${composition}</tbody></table></div><div class="card"><h2>Formal reporting cohort</h2><p>${a.activeStudentCount} students are included across ${academy.cohortSummary.programsRepresented} programs and ${academy.cohortSummary.activeOrganizations} organizations.</p><p>${text(academy.eligibilityRule.statement)}</p></div><div class="card"><h2>Program Health</h2><p>${a.baseline.count} baseline; ${a.post.count} post; ${a.missionCount} completed missions; ${a.focusCoins} coins; ${a.certificateCount} certificates.</p></div><div class="card"><h2>Academy-wide Live Student Progress</h2>${a.liveLearningSnapshot.cards.map((card) => `<p><strong>${text(card.label)}:</strong> ${text(card.centerValue)} — ${text(card.statusLabel)}</p>`).join('')}</div><div class="card"><h2>Verified Outcomes</h2><table><thead><tr><th>Domain</th><th>Baseline</th><th>Post</th><th>Delta</th><th>Matched</th><th>Status</th></tr></thead><tbody>${domains}</tbody></table><p>Activity and engagement are never converted into verified growth.</p></div><div class="card"><h2>Data quality</h2><p>Missing program links: ${academy.dataQuality.missingProgramLinks}. Missing grades: ${academy.dataQuality.missingGradeLevels}. Duplicate identities: ${academy.dataQuality.duplicateIdentities}. Excluded test/synthetic records: ${academy.dataQuality.excludedTestSyntheticRecords}. Not automatically eligible: ${academy.dataQuality.studentsBelowEligibilityThreshold} (${academy.cohortSummary.lowEngagementExclusions} non-test below threshold plus ${academy.cohortSummary.testInternalParticipants} test/internal). Missing weekly-progress source: ${academy.dataQuality.missingWeeklyProgressSource ? 'Yes' : 'No'}.</p></div><div class="card"><h2>Methodology</h2><p>Operational metrics describe participation and activity. Live signals are directional evidence from completed learning records. Verified outcomes require matched baseline and post assessments.</p></div></body></html>`;
}

function academyPdf(academy) {
  const doc = new PDFDocument({ size: 'LETTER', margin: 54, bufferPages: true });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  const disclosure = academyPopulationDisclosure(academy);
  const a = academy.aggregate;
  const preparedAt = academy.calculatedAt || new Date();
  const period = formatReportingPeriod(academy.cohortSummary.earliestActivity, academy.cohortSummary.latestActivity || preparedAt);

  doc.fillColor(BRAND.gold).font('Helvetica-Bold').fontSize(9).text('FOCUS FLAME ACADEMY', { characterSpacing: 1.3 });
  doc.moveDown(.7).fillColor(BRAND.navy).fontSize(28).text('Focus Flame Academy Overview');
  doc.moveDown(.45).fillColor(BRAND.ink).font('Helvetica').fontSize(12)
    .text('Academy-wide participation, engagement, and formal reporting across qualifying programs.', { width: 470 });
  doc.moveDown(1).fillColor(BRAND.muted).fontSize(9).text(`Reporting period: ${period}`);
  doc.text('Confidential administrative report');
  doc.moveDown(1.5);
  drawSectionTitle(doc, 'Executive overview', 'Academy-wide');
  const cards = [
    [academy.cohortSummary.canonicalStudentAccounts, 'Canonical accounts'],
    [academy.cohortSummary.nonTestLearners, 'Non-test learners'],
    [academy.cohortSummary.establishedParticipants, 'Established cohort'],
    [academy.cohortSummary.emergingParticipants, 'Emerging'],
    [academy.cohortSummary.minimalParticipants, 'Minimal / no engagement'],
    [academy.cohortSummary.testInternalParticipants, 'Test / internal excluded'],
  ];
  cards.forEach(([value, label], index) => drawMetricCard(doc, {
    x: 54 + (index % 3) * 172,
    y: 252 + Math.floor(index / 3) * 84,
    width: 160,
    label,
    value,
  }));
  doc.x = 54;
  doc.y = 430;
  doc.fillColor(BRAND.ink).font('Helvetica').fontSize(10).text(disclosure.operational, { width: 504, lineGap: 2 });
  doc.moveDown(.65).font('Helvetica-Bold').text(disclosure.formal, { width: 504, lineGap: 2 });
  doc.moveDown(.65).font('Helvetica').text(
    `Categories are mutually exclusive and total ${academy.cohortSummary.canonicalStudentAccounts} canonical student accounts.`,
  );
  doc.moveDown(.45).fillColor(BRAND.muted).fontSize(8.5).text(
    `Manual inclusions: ${academy.cohortSummary.manuallyIncludedStudents}. Manual exclusions: ${academy.cohortSummary.manuallyExcludedStudents}.`,
  );

  doc.addPage();
  drawSectionTitle(doc, 'Program composition', 'Participation');
  const externalPrograms = academy.programSummaries.filter((program) => !/test|internal|demo|sandbox/i.test(`${program.programName} ${program.programCode || ''}`));
  const headers = ['Program', 'Enrolled', 'Established', 'Emerging', 'Minimal', 'Included'];
  const widths = [218, 57, 62, 56, 54, 57];
  let tableY = doc.y;
  let tableX = 54;
  headers.forEach((header, index) => {
    doc.rect(tableX, tableY, widths[index], 24).fillAndStroke(BRAND.navy, BRAND.navy);
    doc.fillColor(BRAND.white).font('Helvetica-Bold').fontSize(7.2).text(header, tableX + 4, tableY + 8, { width: widths[index] - 8 });
    tableX += widths[index];
  });
  tableY += 24;
  externalPrograms.forEach((program, rowIndex) => {
    const row = [program.programName, program.enrolledStudents, program.establishedStudents, program.emergingStudents, program.minimalStudents, program.includedStudents];
    tableX = 54;
    row.forEach((value, index) => {
      doc.rect(tableX, tableY, widths[index], 30).fillAndStroke(rowIndex % 2 ? BRAND.white : BRAND.pale, BRAND.border);
      doc.fillColor(BRAND.ink).font(index === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(7.5).text(String(value), tableX + 4, tableY + 8, {
        width: widths[index] - 8,
        height: 18,
      });
      tableX += widths[index];
    });
    tableY += 30;
  });
  doc.x = 54;
  doc.y = tableY + 10;
  doc.fillColor(BRAND.muted).font('Helvetica').fontSize(8.5)
    .text(`${academy.cohortSummary.testInternalParticipants} test/internal accounts are excluded from formal reporting.`, 54, doc.y, { width: 504 });
  doc.moveDown(1.2);
  drawSectionTitle(doc, 'Academy-wide live student progress', 'Directional and operational');
  const liveCards = (a.liveLearningSnapshot?.cards || []).slice(0, 6);
  const liveStartY = doc.y;
  liveCards.forEach((card, index) => drawMetricCard(doc, {
    x: 54 + (index % 3) * 172,
    y: liveStartY + Math.floor(index / 3) * 84,
    width: 160,
    label: card.label,
    value: card.centerValue,
    note: card.evidenceType === 'operational' ? 'Operational' : 'Directional',
  }));
  doc.x = 54;
  doc.y = liveStartY + Math.ceil(liveCards.length / 3) * 84 + 10;
  doc.fillColor(BRAND.muted).font('Helvetica').fontSize(8.5)
    .text('Weekly completion is not available because the weekly progress source has not yet been connected.');

  doc.addPage();
  drawSectionTitle(doc, 'Verified outcomes', 'Matched assessments');
  doc.fillColor(BRAND.ink).font('Helvetica').fontSize(10)
    .text('Verified growth remains pending until matched post-assessments are recorded.');
  doc.moveDown(.8);
  for (const domain of a.impactSnapshot.domains) {
    const y = doc.y;
    doc.roundedRect(54, y, 504, 74, 9).fillAndStroke(BRAND.pale, BRAND.border);
    doc.fillColor(BRAND.navy).font('Helvetica-Bold').fontSize(11).text(domain.label, 68, y + 12, { width: 190 });
    doc.fillColor(BRAND.ink).font('Helvetica').fontSize(9)
      .text(`Baseline: ${metric(domain.baselinePercentage, '%')}`, 270, y + 12, { width: 120 })
      .text(`Post: ${domain.postPercentage == null ? 'Awaiting post-assessments' : metric(domain.postPercentage, '%')}`, 270, y + 29, { width: 220 })
      .text(`Matched: ${domain.matchedStudentCount}`, 68, y + 40, { width: 130 });
    doc.fillColor(BRAND.gold).font('Helvetica-Bold').fontSize(8.5)
      .text('VERIFIED OUTCOMES PENDING', 68, y + 56, { width: 190 });
    doc.y = y + 86;
  }
  doc.fillColor(BRAND.navy).font('Helvetica-Bold').fontSize(10)
    .text('Activity and engagement are never converted into verified growth.');
  doc.moveDown(1);
  drawSectionTitle(doc, 'Methodology and data quality', 'Disclosure');
  doc.fillColor(BRAND.ink).font('Helvetica').fontSize(9).text(
    'Operational metrics describe participation and activity. Live signals are directional evidence from completed learning records. Verified outcomes require matched baseline and post assessments.',
    { lineGap: 2 },
  );
  doc.moveDown(.6).text(
    `Missing program links: ${academy.dataQuality.missingProgramLinks}. Missing grades: ${academy.dataQuality.missingGradeLevels}. ` +
    `Duplicate identities: ${academy.dataQuality.duplicateIdentities}. Excluded test/synthetic records: ${academy.dataQuality.excludedTestSyntheticRecords}.`,
  );
  doc.moveDown(.6).font('Helvetica-Bold').text(`Not automatically eligible: ${academy.dataQuality.studentsBelowEligibilityThreshold}`);
  doc.font('Helvetica').text(
    `Includes ${academy.cohortSummary.lowEngagementExclusions} non-test learners below the engagement threshold and ` +
    `${academy.cohortSummary.testInternalParticipants} test/internal accounts.`,
  );
  addReportFooters(doc, { scope: 'Academy Overview', preparedAt });
  doc.end();
  return new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));
}

function executiveShareoutPdf(academy) {
  const doc = new PDFDocument({
    size: 'LETTER',
    margin: 54,
    bufferPages: true,
    info: {
      Title: 'Focus Flame Academy Executive Share-Out',
      Subject: 'Privacy-safe Academy pilot participation and learning signals',
      Author: "Caiden's Courage",
    },
  });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  const preparedAt = academy.calculatedAt || new Date();
  const period = formatReportingPeriod(
    academy.cohortSummary.earliestActivity,
    academy.cohortSummary.latestActivity || preparedAt,
  );
  const a = academy.aggregate;
  const asset = (name) => {
    const candidate = path.join(__dirname, '..', '..', 'public', name);
    return fs.existsSync(candidate) ? candidate : null;
  };
  const logo = asset('logo.png');
  const hero = asset('images/CaidensCourage_SocialImage.png');
  const page = (eyebrow, title, intro) => {
    doc.addPage();
    doc.fillColor(BRAND.gold).font('Helvetica-Bold').fontSize(8).text(eyebrow.toUpperCase(), { characterSpacing: 1.2 });
    doc.moveDown(.35).fillColor(BRAND.navy).fontSize(23).text(title, { width: 480 });
    if (intro) {
      doc.moveDown(.45).fillColor(BRAND.ink).font('Helvetica').fontSize(10.5).text(intro, { width: 490, lineGap: 2 });
    }
    doc.moveDown(.7);
    doc.moveTo(54, doc.y).lineTo(558, doc.y).lineWidth(2).strokeColor(BRAND.gold).stroke();
    doc.moveDown(.8);
  };
  const evidencePill = (x, y, label) => {
    doc.roundedRect(x, y, 92, 18, 9).fill(BRAND.navy);
    doc.fillColor(BRAND.white).font('Helvetica-Bold').fontSize(7).text(label.toUpperCase(), x, y + 6, {
      width: 92,
      align: 'center',
      lineBreak: false,
    });
  };
  const storyCard = (y, number, title, copy) => {
    doc.roundedRect(54, y, 504, 92, 12).fillAndStroke(BRAND.pale, BRAND.border);
    doc.fillColor(BRAND.gold).font('Helvetica-Bold').fontSize(25).text(String(number), 72, y + 17, { width: 72 });
    doc.fillColor(BRAND.navy).font('Helvetica-Bold').fontSize(11).text(title, 150, y + 17, { width: 365 });
    doc.fillColor(BRAND.ink).font('Helvetica').fontSize(9).text(copy, 150, y + 37, { width: 365, lineGap: 2 });
  };

  doc.rect(0, 0, 612, 792).fill(BRAND.navy);
  if (hero) {
    doc.save().opacity(.28).image(hero, 0, 0, { width: 612, height: 238 }).restore();
  }
  doc.rect(0, 0, 612, 238).fillOpacity(.55).fill(BRAND.navy).fillOpacity(1);
  if (logo) {
    doc.image(logo, 54, 44, { fit: [76, 76] });
  }
  doc.fillColor(BRAND.gold).font('Helvetica-Bold').fontSize(9)
    .text("CAIDEN'S COURAGE", 54, 146, { characterSpacing: 1.5 });
  doc.fillColor(BRAND.white).fontSize(30).text('From participation to possibility', 54, 176, { width: 500 });
  doc.fillColor(BRAND.white).font('Helvetica').fontSize(14)
    .text('Focus Flame Academy Executive Share-Out', 54, 270, { width: 500 });
  doc.fillColor('#dce8f6').fontSize(10)
    .text('A privacy-safe view of Academy-wide participation, engagement, and early learning signals.', 54, 306, {
      width: 445,
      lineGap: 3,
    });
  doc.roundedRect(54, 382, 504, 150, 16).fill('#1d477d');
  doc.fillColor(BRAND.gold).font('Helvetica-Bold').fontSize(9).text('THE PILOT STORY', 76, 406, { characterSpacing: 1.1 });
  doc.fillColor(BRAND.white).fontSize(20).text(
    `${academy.cohortSummary.nonTestLearners} learners began building a record of courage, focus, and connection.`,
    76,
    435,
    { width: 435, lineGap: 4 },
  );
  doc.fillColor('#dce8f6').font('Helvetica').fontSize(9.5)
    .text(`Reporting period: ${period}`, 76, 501, { width: 435 });
  doc.fillColor(BRAND.white).fontSize(8.5)
    .text('Prepared for school and district leadership | Privacy-safe cohort reporting', 54, 674, { width: 504 });

  page(
    'The opportunity',
    'A learning experience designed to help every student find their Focus Flame',
    "Caiden's Courage combines story, choice, reflection, and skill-building adventures to create approachable pathways into reading, social-emotional learning, and executive-function practice.",
  );
  storyCard(
    180,
    academy.cohortSummary.canonicalStudentAccounts,
    'Canonical student accounts',
    `The Academy measured participation across ${academy.cohortSummary.canonicalStudentAccounts} canonical accounts while separating ${academy.cohortSummary.testInternalParticipants} test/internal accounts from formal reporting.`,
  );
  storyCard(
    288,
    academy.cohortSummary.nonTestLearners,
    'Non-test learners',
    `${academy.cohortSummary.nonTestLearners} learners remain in the external pilot population after test/internal exclusions.`,
  );
  storyCard(
    396,
    academy.cohortSummary.establishedParticipants,
    'Established reporting cohort',
    `${academy.cohortSummary.establishedParticipants} learners met the approved engagement threshold and form the Academy-wide live-signal cohort.`,
  );
  doc.fillColor(BRAND.navy).font('Helvetica-Bold').fontSize(13)
    .text('Engagement is not a footnote. It is the beginning of the learning story.', 54, 536, { width: 504 });
  doc.moveDown(.5).fillColor(BRAND.ink).font('Helvetica').fontSize(9.5).text(
    `${academy.cohortSummary.emergingParticipants} learners showed emerging engagement and ${academy.cohortSummary.minimalParticipants} recorded minimal or no engagement. These mutually exclusive categories help leaders see both momentum and opportunity.`,
    { width: 504, lineGap: 2 },
  );
  evidencePill(54, 631, 'Operational');

  page(
    'What learners did',
    'Participation became visible through completed learning experiences',
    'These operational measures describe recorded activity. They show how learners entered the experience and built a foundation for future outcomes measurement.',
  );
  const operational = [
    [a.baseline.count, 'Baseline assessments'],
    [a.assessmentCount, 'Assessments recorded'],
    [a.missionCount, 'Missions completed'],
    [a.focusCoins, 'Focus Coins earned'],
    [a.certificateCount, 'Certificates earned'],
    [academy.cohortSummary.establishedParticipants, 'Established learners'],
  ];
  operational.forEach(([value, label], index) => drawMetricCard(doc, {
    x: 54 + (index % 3) * 172,
    y: 188 + Math.floor(index / 3) * 92,
    width: 160,
    height: 78,
    label,
    value,
    note: 'Operational',
  }));
  doc.fillColor(BRAND.navy).font('Helvetica-Bold').fontSize(16)
    .text('A featured pilot: Blue Ribbon Results Academy', 54, 405, { width: 504 });
  const blueRibbon = academy.programSummaries.find((program) => /blue ribbon/i.test(program.programName));
  if (blueRibbon) {
    doc.moveDown(.5).fillColor(BRAND.ink).font('Helvetica').fontSize(10).text(
      `${blueRibbon.enrolledStudents} students enrolled. ${blueRibbon.establishedStudents} reached established engagement, ` +
      `${blueRibbon.emergingStudents} showed emerging engagement, and ${blueRibbon.minimalStudents} recorded minimal or no engagement.`,
      { width: 504, lineGap: 3 },
    );
  }
  doc.moveDown(1);
  const whyY = doc.y;
  doc.roundedRect(54, whyY, 504, 92, 12).fillAndStroke('#fff8e8', '#ead39a');
  doc.fillColor(BRAND.navy).font('Helvetica-Bold').fontSize(12).text('Why this matters for schools', 74, whyY + 18, { width: 460 });
  doc.fillColor(BRAND.ink).font('Helvetica').fontSize(9.5).text(
    'A shared reporting language helps educators distinguish enrollment, emerging engagement, established participation, directional learning signals, and verified outcomes.',
    74,
    whyY + 42,
    { width: 450, lineGap: 2 },
  );
  evidencePill(54, 652, 'Operational');

  page(
    'Early learning signals',
    'Directional evidence helps leaders see where learning activity is taking shape',
    'Live signals summarize recorded mission activity and accuracy within the established Academy cohort. They are directional, not verified pre/post growth.',
  );
  const visibleLiveCards = (a.liveLearningSnapshot?.cards || [])
    .filter((card) => ['reading', 'sel', 'focus', 'overall'].includes(card.key))
    .slice(0, 4);
  visibleLiveCards.forEach((card, index) => {
    const x = 54 + (index % 2) * 258;
    const y = 196 + Math.floor(index / 2) * 128;
    const numeric = Number.parseFloat(String(card.centerValue));
    doc.roundedRect(x, y, 246, 112, 14).fillAndStroke(BRAND.pale, BRAND.border);
    doc.fillColor(BRAND.navy).font('Helvetica-Bold').fontSize(22).text(card.centerValue, x + 18, y + 18, { width: 85 });
    doc.fillColor(BRAND.ink).font('Helvetica-Bold').fontSize(9.5).text(card.label, x + 108, y + 20, { width: 118 });
    doc.roundedRect(x + 18, y + 68, 208, 9, 4).fill('#dce5f0');
    if (Number.isFinite(numeric)) doc.roundedRect(x + 18, y + 68, Math.max(5, 208 * numeric / 100), 9, 4).fill(BRAND.gold);
    doc.fillColor(BRAND.muted).font('Helvetica').fontSize(7.5)
      .text('Directional live signal', x + 18, y + 86, { width: 208 });
  });
  doc.fillColor(BRAND.navy).font('Helvetica-Bold').fontSize(14)
    .text('What the signals can tell us', 54, 482, { width: 504 });
  doc.moveDown(.45).fillColor(BRAND.ink).font('Helvetica').fontSize(9.5).text(
    'They help identify where learners are interacting successfully with reading, SEL, and focus-oriented activities—and where program teams may want to strengthen support or collect more evidence.',
    { width: 504, lineGap: 3 },
  );
  doc.moveDown(.7).fillColor(BRAND.muted).font('Helvetica-Oblique').fontSize(8.5).text(
    'Activity and engagement are never converted into verified growth. Verified growth remains pending until matched post-assessments are recorded.',
    { width: 504, lineGap: 2 },
  );
  evidencePill(54, 652, 'Directional');

  page(
    'The next chapter',
    'Build the evidence, deepen the experience, expand with intention',
    'The pilot establishes an operational foundation and a set of early learning signals. The next phase is designed to turn consistent participation into stronger matched evidence over time.',
  );
  const nextSteps = [
    ['1', 'Complete matched post-assessments', 'Create a defensible view of verified change across reading, SEL, and executive-function domains.'],
    ['2', 'Support emerging learners', 'Use cohort visibility to help more learners move from emerging activity into established participation.'],
    ['3', 'Partner around implementation', 'Align program cadence, educator touchpoints, and reporting windows to each school community.'],
  ];
  nextSteps.forEach(([number, title, copy], index) => {
    const y = 190 + index * 104;
    doc.circle(78, y + 32, 22).fill(BRAND.gold);
    doc.fillColor(BRAND.navy).font('Helvetica-Bold').fontSize(16).text(number, 64, y + 24, { width: 28, align: 'center' });
    doc.fillColor(BRAND.navy).font('Helvetica-Bold').fontSize(11).text(title, 118, y + 12, { width: 410 });
    doc.fillColor(BRAND.ink).font('Helvetica').fontSize(9.5).text(copy, 118, y + 35, { width: 410, lineGap: 2 });
  });
  doc.roundedRect(54, 526, 504, 122, 16).fill(BRAND.navy);
  doc.fillColor(BRAND.gold).font('Helvetica-Bold').fontSize(9).text('BRING THE FOCUS FLAME TO YOUR COMMUNITY', 78, 550, {
    characterSpacing: 1,
  });
  doc.fillColor(BRAND.white).fontSize(18).text('Explore a Caiden’s Courage partnership', 78, 579, { width: 420 });
  doc.fillColor('#dce8f6').font('Helvetica').fontSize(10)
    .text('Visit caidenscourage.com to learn more about school, camp, and family learning experiences.', 78, 611, { width: 420 });

  addReportFooters(doc, { scope: 'Executive Share-Out', preparedAt, coverColor: '#dce8f6' });
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
  const executive = format === 'executive';
  const pdf = executive ? await executiveShareoutPdf(academy) : await academyPdf(academy);
  return {
    statusCode: 200,
    isBase64Encoded: true,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${executive ? 'focus-flame-academy-executive-shareout' : 'focus-flame-academy-overview'}-${new Date().toISOString().slice(0, 10)}.pdf"`,
      'Cache-Control': 'no-store',
    },
    body: pdf.toString('base64'),
  };
};

exports._test = {
  academyHtml,
  academyPdf,
  executiveShareoutPdf,
  academyPopulationDisclosure,
  formatReportDate,
  formatReportingPeriod,
};
