#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import {
  runPublicationReadinessAudit,
  statusColor,
  statusLabel,
  type PublicationCheck,
  type PublicationReadinessReport,
} from './publicationReadiness';

const ROOT = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(ROOT, 'reports');

async function writePublicationPdf(
  report: PublicationReadinessReport,
  outputPath: string,
): Promise<void> {
  const PDFDocument = (await import('pdfkit')).default;
  const M = 48;
  const W = 612 - M * 2;

  const section = (doc: import('pdfkit').default, check: PublicationCheck) => {
    if (doc.y > 660) doc.addPage();
    doc
      .fillColor(statusColor(check.status))
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(`${statusLabel(check.status)} — ${check.title}`);
    doc.fillColor('#000').font('Helvetica').fontSize(9).text(check.summary, { width: W });
    check.details.slice(0, 8).forEach((line) => doc.text(`  • ${line}`, { width: W }));
    if (check.criticalIssues.length > 0) {
      doc.font('Helvetica-Bold').fontSize(8).text('  Critical:');
      doc.font('Helvetica');
      check.criticalIssues.slice(0, 5).forEach((line) => doc.text(`    – ${line}`, { width: W }));
    }
    doc.moveDown(0.35);
  };

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: M, size: 'LETTER' });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(22).text('Publication Readiness Report', M, 52);
    doc.font('Helvetica').fontSize(10).fillColor('#444');
    doc.text('Final audit — staging v4 (post character alignment pass)', M, 78);
    doc.text(`Generated ${new Date(report.generatedAt).toLocaleString()}`, M, 94);
    doc.text(`Source: ${report.source} · ${report.questionCount} questions`, M, 110);
    doc.fillColor('#000');

    doc.addPage();
    doc
      .fillColor(statusColor(report.overallStatus))
      .font('Helvetica-Bold')
      .fontSize(16)
      .text(`Overall: ${statusLabel(report.overallStatus)}`);
    doc.fillColor('#000').font('Helvetica').fontSize(11).text(report.overallVerdict, { width: W });
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12).text('Executive summary');
    doc.font('Helvetica').fontSize(9);
    doc.text(`Critical issues: ${report.criticalIssues.length}`);
    doc.text(`Duplicate question clusters: ${report.duplicateQuestions.length}`);
    doc.text(`Duplicate answer clusters: ${report.duplicateAnswers.length}`);
    doc.text(`Repeated scenario clusters: ${report.repeatedScenarios.length}`);
    doc.text(`Repetitive missions: ${report.repetitiveMissions.length}`);
    doc.text(`Progression notes: ${report.progressionNotes.length}`);
    doc.moveDown(0.4);

    doc.font('Helvetica-Bold').text('Character difficulty averages');
    doc.font('Helvetica');
    Object.entries(report.characterAverages).forEach(([character, avg]) => {
      doc.text(`  ${character}: ${avg.toFixed(2)}/5`);
    });

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Verification checklist');
    doc.font('Helvetica').fontSize(9);
    report.checks.forEach((check) => section(doc, check));

    if (report.criticalIssues.length > 0) {
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(12).text('Remaining critical issues');
      doc.font('Helvetica').fontSize(8);
      report.criticalIssues.forEach((issue, i) => doc.text(`${i + 1}. ${issue}`, { width: W }));
    }

    if (report.duplicateQuestions.length > 0) {
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(12).text('Duplicated question content');
      doc.font('Helvetica').fontSize(8);
      report.duplicateQuestions.slice(0, 15).forEach((c, i) => {
        doc.text(`${i + 1}. ${c.count}× — ${c.preview.slice(0, 90)}`, { width: W });
        doc.text(`   IDs: ${c.sampleQuestionIds.join(', ')}`, { width: W });
        doc.moveDown(0.15);
      });
    }

    if (report.duplicateAnswers.length > 0) {
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(12).text('Duplicated answer sets');
      doc.font('Helvetica').fontSize(8);
      report.duplicateAnswers.slice(0, 12).forEach((c, i) => {
        doc.text(`${i + 1}. ${c.count}× shared choices`, { width: W });
        doc.text(`   ${c.preview.slice(0, 100)}…`, { width: W });
        doc.text(`   IDs: ${c.sampleQuestionIds.join(', ')}`, { width: W });
        doc.moveDown(0.15);
      });
    }

    if (report.repeatedScenarios.length > 0) {
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(12).text('Repeated scenarios');
      doc.font('Helvetica').fontSize(8);
      report.repeatedScenarios.slice(0, 12).forEach((c, i) => {
        doc.text(`${i + 1}. ${c.count}× — ${c.preview.slice(0, 95)}…`, { width: W });
        doc.moveDown(0.1);
      });
    }

    if (report.repetitiveMissions.length > 0 || report.progressionNotes.length > 0) {
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(12).text('Mission pacing & repetition');
      doc.font('Helvetica').fontSize(8);
      if (report.repetitiveMissions.length > 0) {
        doc.font('Helvetica-Bold').text('Repetitive missions');
        doc.font('Helvetica');
        report.repetitiveMissions.forEach((n, i) => {
          doc.text(
            `${i + 1}. Week ${n.week} · ${n.character} · ${n.missionTitle}: ${n.issue}`,
            { width: W },
          );
        });
        doc.moveDown(0.3);
      }
      if (report.progressionNotes.length > 0) {
        doc.font('Helvetica-Bold').text('Progression notes');
        doc.font('Helvetica');
        report.progressionNotes.forEach((n, i) => {
          doc.text(`${i + 1}. Week ${n.week} · ${n.character}: ${n.issue}`, { width: W });
        });
      }
    }

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(11).text('Audit scope');
    doc.font('Helvetica').fontSize(9);
    doc.text('• Audit only — no question content was modified.');
    doc.text('• Staging manifest represents publication candidate (REACT_APP_STAGING_QUESTIONS=true).');
    doc.text('• K–1 questions at 3/5 are an intentional age-appropriate floor.');
    doc.text('• Caiden quests 6–9 contain 32 questions each (extended math missions).');
    doc.text('• Repeated stems within missions reflect shared mission templates from staging upgrades.');

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

async function main(): Promise<void> {
  console.log('[publication-audit] Running final publication readiness audit…');
  const report = runPublicationReadinessAudit();

  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  const jsonPath = path.join(REPORTS_DIR, 'publication-readiness.json');
  const pdfPath = path.join(REPORTS_DIR, 'publication-readiness.pdf');

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  await writePublicationPdf(report, pdfPath);

  console.log('[publication-audit] Complete');
  console.log(`  Overall: ${statusLabel(report.overallStatus)} — ${report.overallVerdict}`);
  console.log(`  PDF: ${pdfPath}`);
  console.log(`  JSON: ${jsonPath}`);
  console.log('');
  report.checks.forEach((c) => {
    console.log(`  ${statusLabel(c.status).padEnd(7)} ${c.title}`);
  });
  console.log('');
  console.log('No live question content was modified.');
}

main().catch((err) => {
  console.error('[publication-audit] Failed:', err);
  process.exit(1);
});
