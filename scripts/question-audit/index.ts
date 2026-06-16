#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { auditAllQuestions } from './auditHeuristics';
import { collectAllQuestions } from './collectQuestions';
import { generateDuplicateActionPlanMarkdown } from './generateDuplicateActionPlan';
import { writeNextPassReport } from './generateNextPassReport';
import { generateMarkdownReport } from './generateMarkdown';
import { generatePdfReport } from './generatePdf';
import { generateRewritePriorityMarkdown } from './generateRewritePriority';
import { mergeBankFindingsIntoQuestions, runQuestionBankAudit } from './questionBankAudit';

const ROOT = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(ROOT, 'reports');

async function main(): Promise<void> {
  console.log('[audit:questions] Collecting questions from all game content sources…');
  const questions = collectAllQuestions();
  console.log(`[audit:questions] Collected ${questions.length} questions`);

  console.log('[audit:questions] Running question bank audit…');
  const bankAudit = runQuestionBankAudit(questions);

  console.log('[audit:questions] Running per-question quality heuristics…');
  const report = auditAllQuestions(questions, bankAudit);
  report.questions = mergeBankFindingsIntoQuestions(report.questions, bankAudit);

  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  const jsonPath = path.join(REPORTS_DIR, 'question-audit.json');
  const mdPath = path.join(REPORTS_DIR, 'question-audit.md');
  const pdfPath = path.join(REPORTS_DIR, 'question-audit.pdf');
  const dupPlanPath = path.join(REPORTS_DIR, 'question-duplicates-action-plan.md');
  const rewritePath = path.join(REPORTS_DIR, 'question-rewrite-priority.md');

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`[audit:questions] Wrote ${jsonPath}`);

  const markdown = generateMarkdownReport(report);
  fs.writeFileSync(mdPath, markdown, 'utf8');
  console.log(`[audit:questions] Wrote ${mdPath}`);

  fs.writeFileSync(dupPlanPath, generateDuplicateActionPlanMarkdown(bankAudit), 'utf8');
  console.log(`[audit:questions] Wrote ${dupPlanPath}`);

  fs.writeFileSync(rewritePath, generateRewritePriorityMarkdown(bankAudit), 'utf8');
  console.log(`[audit:questions] Wrote ${rewritePath}`);

  writeNextPassReport(report);
  console.log(`[audit:questions] Wrote ${path.join(REPORTS_DIR, 'question-quality-next-pass.md')}`);

  console.log('[audit:questions] Generating PDF…');
  await generatePdfReport(report, pdfPath);
  console.log(`[audit:questions] Wrote ${pdfPath}`);

  const { summary, bankAudit: bank } = report;
  const scores = bank.healthScores;
  console.log('');
  console.log('=== Question Bank Audit Summary ===');
  console.log(`Overall Question Health: ${scores.overall}`);
  console.log(`Production Content Health: ${scores.productionContent}`);
  console.log(`Metadata Completeness: ${scores.metadataCompleteness}`);
  console.log(`Distractor Quality: ${scores.distractorQuality}`);
  console.log(`Scenario Variety: ${scores.scenarioVariety}`);
  console.log('');
  console.log(`Total questions: ${summary.totalQuestions} (${bank.productionQuestionCount} production, ${bank.stagingQuestionCount} staging)`);
  console.log(`Sources scanned: ${summary.sourcesScanned.join(', ')}`);
  console.log('');
  console.log('Production issues:');
  console.log(`  ${bank.classifiedCounts.production.duplicateQuestions} duplicate question groups`);
  console.log(`  ${bank.classifiedCounts.production.duplicateScenarios} duplicate scenario groups`);
  console.log(`  ${bank.classifiedCounts.production.caidenSpellingIssues} Caiden spelling issues`);
  console.log(`  ${bank.classifiedCounts.weakDistractor} weak distractor warnings`);
  console.log(`  ${bank.classifiedCounts.metadataOnly} metadata-only issues`);
  console.log(`  ${bank.classifiedCounts.trueDuplicate} true duplicate findings`);
  console.log(`  ${bank.classifiedCounts.production.highScenarioDuplication} high scenario duplication stems`);
  console.log('');
  console.log(`Staging duplicate groups (excluded from production score): ${bank.duplicateActionPlan.filter((g) => g.action === 'staging_duplicate_only').length}`);
  console.log('');
  console.log('Recommendations:');
  report.recommendations.slice(0, 6).forEach((item) => console.log(`  - ${item}`));
  console.log('');
  console.log('Done. No live question content was modified.');
}

main().catch((error) => {
  console.error('[audit:questions] Failed:', error);
  process.exit(1);
});
