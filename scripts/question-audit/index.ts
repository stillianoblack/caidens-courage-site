#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { auditAllQuestions } from './auditHeuristics';
import { collectAllQuestions } from './collectQuestions';
import { generateMarkdownReport } from './generateMarkdown';
import { generatePdfReport } from './generatePdf';

const ROOT = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(ROOT, 'reports');

async function main(): Promise<void> {
  console.log('[audit:questions] Collecting questions from adaptive mission data…');
  const questions = collectAllQuestions();
  console.log(`[audit:questions] Collected ${questions.length} questions`);

  console.log('[audit:questions] Running quality heuristics…');
  const report = auditAllQuestions(questions);

  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  const jsonPath = path.join(REPORTS_DIR, 'question-audit.json');
  const mdPath = path.join(REPORTS_DIR, 'question-audit.md');
  const pdfPath = path.join(REPORTS_DIR, 'question-audit.pdf');

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`[audit:questions] Wrote ${jsonPath}`);

  const markdown = generateMarkdownReport(report);
  fs.writeFileSync(mdPath, markdown, 'utf8');
  console.log(`[audit:questions] Wrote ${mdPath}`);

  console.log('[audit:questions] Generating PDF…');
  await generatePdfReport(report, pdfPath);
  console.log(`[audit:questions] Wrote ${pdfPath}`);

  const { summary } = report;
  console.log('');
  console.log('=== Audit Summary ===');
  console.log(`Total questions: ${summary.totalQuestions}`);
  console.log(`Rewrite priority — high: ${summary.rewritePriorityCounts.high}, medium: ${summary.rewritePriorityCounts.medium}, low: ${summary.rewritePriorityCounts.low}`);
  console.log('Top flags:');
  Object.entries(summary.flagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([flag, count]) => console.log(`  - ${flag}: ${count}`));
  console.log('');
  console.log('Done. No live question content was modified.');
}

main().catch((error) => {
  console.error('[audit:questions] Failed:', error);
  process.exit(1);
});
