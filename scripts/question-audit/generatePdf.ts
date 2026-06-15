import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import type { AuditReport, AuditedQuestion } from './types';
import { indexToLetter } from './collectQuestions';

const MARGIN = 48;
const PAGE_WIDTH = 612;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function ensureSpace(doc: PDFKit.PDFDocument, height: number): void {
  if (doc.y + height > doc.page.height - MARGIN) {
    doc.addPage();
  }
}

function sectionTitle(doc: PDFKit.PDFDocument, text: string): void {
  ensureSpace(doc, 30);
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#1a365d').text(text, MARGIN, doc.y, {
    width: CONTENT_WIDTH,
  });
  doc.moveDown(0.3);
}

function bodyText(doc: PDFKit.PDFDocument, text: string, options?: { bold?: boolean }): void {
  doc
    .font(options?.bold ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(10)
    .fillColor('#1a202c')
    .text(text, MARGIN, doc.y, { width: CONTENT_WIDTH, lineGap: 2 });
}

function renderSummary(doc: PDFKit.PDFDocument, report: AuditReport): void {
  const { summary } = report;

  doc.font('Helvetica-Bold').fontSize(26).fillColor('#1a365d').text("Caiden's Courage", MARGIN, 120);
  doc.fontSize(20).text('Question Quality Audit', MARGIN, doc.y + 4);
  doc
    .font('Helvetica')
    .fontSize(11)
    .fillColor('#4a5568')
    .text(`Generated ${new Date(summary.generatedAt).toLocaleString()}`, MARGIN, doc.y + 12);

  doc.addPage();
  sectionTitle(doc, 'Summary Statistics');
  bodyText(doc, `Total questions audited: ${summary.totalQuestions}`);
  bodyText(doc, `High priority rewrites: ${summary.rewritePriorityCounts.high}`);
  bodyText(doc, `Medium priority rewrites: ${summary.rewritePriorityCounts.medium}`);
  bodyText(doc, `Low priority rewrites: ${summary.rewritePriorityCounts.low}`);
  doc.moveDown(0.5);

  sectionTitle(doc, 'Average Difficulty by Character');
  for (const [character, avg] of Object.entries(summary.averageDifficultyByCharacter).sort()) {
    bodyText(doc, `${character}: ${avg.toFixed(2)} / 5`);
  }
  doc.moveDown(0.5);

  sectionTitle(doc, 'Issue Flag Counts');
  const flags = Object.entries(summary.flagCounts).sort((a, b) => b[1] - a[1]);
  if (flags.length === 0) {
    bodyText(doc, 'No flags detected.');
  } else {
    for (const [flag, count] of flags) {
      bodyText(doc, `${flag}: ${count}`);
    }
  }
  doc.moveDown(0.5);

  sectionTitle(doc, 'Answer Position Distribution by Character');
  for (const [character, dist] of Object.entries(summary.positionDistributionByCharacter).sort()) {
    bodyText(
      doc,
      `${character}: A=${dist.A} B=${dist.B} C=${dist.C} D=${dist.D}${dist.uneven ? ` (uneven — dominant ${dist.dominantPosition})` : ''}`,
    );
  }
  doc.moveDown(0.5);

  sectionTitle(doc, 'Top 10 Questions Needing Rewrite');
  summary.topRewriteCandidates.forEach((q, i) => {
    bodyText(
      doc,
      `${i + 1}. ${q.questionId} — ${q.character} / ${q.missionTitle} / ${q.gradeBand} — difficulty ${q.difficultyScore}/5`,
    );
  });
}

function renderQuestion(doc: PDFKit.PDFDocument, question: AuditedQuestion, index: number): void {
  ensureSpace(doc, 120);
  sectionTitle(
    doc,
    `${index + 1}. ${question.questionId} (${question.character} · week ${question.week ?? '?'} · ${question.gradeBand})`,
  );
  bodyText(doc, `Mission: ${question.missionTitle} [${question.missionId}]`, { bold: true });
  bodyText(doc, `Type: ${question.questionType} · Difficulty: ${question.difficultyScore}/5 · Priority: ${question.rewritePriority}`);
  bodyText(doc, `Flags: ${question.flags.join(', ') || 'none'}`);
  bodyText(doc, `Correct answer position: ${indexToLetter(question.correctIndex)}`);
  doc.moveDown(0.2);
  bodyText(doc, `Scenario: ${question.scenarioText || '(none)'}`);
  bodyText(doc, `Question: ${question.questionText}`);
  doc.moveDown(0.2);
  question.choices.forEach((choice, choiceIndex) => {
    const mark = choice.id === question.correctAnswerId ? ' ✓' : '';
    bodyText(doc, `${indexToLetter(choiceIndex)}. ${choice.label}${mark}`);
  });
  doc.moveDown(0.2);
  bodyText(doc, `Reason: ${question.difficultyReason}`);
  bodyText(doc, `Rewrite: ${question.recommendedRewrite}`);
  if (question.improvedDistractors.length > 0) {
    bodyText(doc, `Suggested distractors: ${question.improvedDistractors.join(' | ')}`);
  }
  doc.moveDown(0.6);
}

export async function generatePdfReport(report: AuditReport, outputPath: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: 'LETTER', autoFirstPage: true });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    renderSummary(doc, report);

    const characters = [...new Set(report.questions.map((q) => q.character))].sort();
    for (const character of characters) {
      doc.addPage();
      sectionTitle(doc, `${character.toUpperCase()} — Detailed Audit`);
      const charQuestions = report.questions.filter((q) => q.character === character);
      charQuestions.forEach((q, i) => renderQuestion(doc, q, i));
    }

    doc.addPage();
    sectionTitle(doc, 'Rewrite Priority List');
    for (const priority of ['high', 'medium', 'low'] as const) {
      bodyText(doc, `${priority.toUpperCase()} (${report.summary.rewritePriorityCounts[priority]})`, { bold: true });
      const subset = report.questions.filter((q) => q.rewritePriority === priority);
      subset.slice(0, 40).forEach((q) => {
        bodyText(doc, `• ${q.questionId} — ${q.character} / week ${q.week ?? '?'} / ${q.missionTitle} / score ${q.difficultyScore}`);
      });
      if (subset.length > 40) {
        bodyText(doc, `…and ${subset.length - 40} more`);
      }
      doc.moveDown(0.4);
    }

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

export function generatePdfReportSync(report: AuditReport, outputPath: string): Promise<void> {
  return generatePdfReport(report, outputPath);
}
