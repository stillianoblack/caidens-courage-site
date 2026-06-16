import fs from 'fs';
import path from 'path';
import type { AuditReport } from './types';
import { PRODUCTION_DUPLICATE_REGISTRY } from '../../src/data/shared/productionDuplicateRegistry';

const ROOT = path.resolve(__dirname, '../..');

export function generateNextPassReportMarkdown(report: AuditReport): string {
  const lines: string[] = [];
  const production = report.questions.filter(
    (q) => (q.source === 'adaptive_mission' || q.source === 'adult_training') && !q.excludedFromHealthScore,
  );

  lines.push("# Question Quality — Next Pass");
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Current Health Scores');
  lines.push('');
  const scores = report.bankAudit.healthScores;
  lines.push(`| Score | Value |`);
  lines.push(`| --- | ---: |`);
  lines.push(`| Overall Question Health | ${scores.overall} |`);
  lines.push(`| Production Content Health | ${scores.productionContent} |`);
  lines.push(`| Metadata Completeness | ${scores.metadataCompleteness} |`);
  lines.push(`| Distractor Quality | ${scores.distractorQuality} |`);
  lines.push(`| Scenario Variety | ${scores.scenarioVariety} |`);
  lines.push('');

  lines.push('## Top Repeated Scenario Stems (Production)');
  lines.push('');
  for (const [index, stem] of report.bankAudit.highDuplicationScenarios.entries()) {
    lines.push(`### ${index + 1}. Appears ${stem.count} times`);
    lines.push('');
    lines.push(`> ${stem.sample}…`);
    lines.push('');
    lines.push(`- **Question IDs:** ${stem.questionIds.join(', ')}`);
    lines.push(`- **Recommended fix:** Give each question a grade-band-specific opening tied to its situation (Focus Flame Academy, camp, group lab, studio).`);
    lines.push('');
  }

  lines.push('## Top 50 Weak Distractor Questions');
  lines.push('');
  for (const entry of report.bankAudit.rewritePriority) {
    lines.push(`### ${entry.rank}. ${entry.questionId} (${entry.character} / ${entry.gradeBand})`);
    lines.push('');
    lines.push(`- **Mission:** ${entry.missionId}`);
    lines.push(`- **Issues:** ${entry.issueReasons.join('; ')}`);
    lines.push(`- **Fix:** ${entry.suggestedRewriteDirection}`);
    lines.push('');
  }

  lines.push('## True Production Duplicate Groups');
  lines.push('');
  const prodDupes = report.bankAudit.duplicateActionPlan.filter(
    (g) => g.action !== 'staging_duplicate_only' && g.sources.some((s) => s === 'adaptive_mission' || s === 'adult_training'),
  );
  lines.push(`Total production duplicate groups requiring review: **${prodDupes.length}**`);
  lines.push('');
  for (const group of prodDupes) {
    lines.push(`- **${group.action}** — ${group.sampleText.slice(0, 80)}…`);
    lines.push(`  - IDs: ${group.questionIds.join(', ')}`);
    lines.push(`  - ${group.rationale}`);
  }
  lines.push('');

  lines.push('## Duplicate Registry Actions');
  lines.push('');
  for (const entry of PRODUCTION_DUPLICATE_REGISTRY.slice(0, 40)) {
    lines.push(`- **${entry.action}** — ${entry.questionIds.join(', ')}`);
    lines.push(`  - ${entry.note}`);
  }
  lines.push('');

  lines.push('## Recommended Fixes by Character');
  lines.push('');
  const byCharacter = new Map<string, typeof production>();
  for (const q of production) {
    const list = byCharacter.get(q.character) ?? [];
    list.push(q);
    byCharacter.set(q.character, list);
  }
  for (const [character, questions] of [...byCharacter.entries()].sort()) {
    const weak = questions.filter((q) => q.weakDistractorReasons?.length).length;
    const missingScenario = questions.filter((q) =>
      report.bankAudit.highDuplicationScenarios.some((stem) => stem.questionIds.includes(q.questionId)),
    ).length;
    lines.push(`- **${character}** — ${questions.length} production questions, ${weak} weak distractor flags, ${missingScenario} high-duplication stem hits`);
  }
  lines.push('');

  lines.push('## Recommended Fixes by Grade Band');
  lines.push('');
  for (const band of ['K-1', '2-3', '4-5', '6-8', 'adult']) {
    const subset = production.filter((q) => q.gradeBand === band);
    if (!subset.length) continue;
    lines.push(`- **${band}** — ${subset.length} questions; prioritize ${band === '6-8' ? 'why prompts + tradeoff distractors' : 'shorter plausible wrong answers'}`);
  }
  lines.push('');

  lines.push('## Recommended Fixes by Skill');
  lines.push('');
  const bySkill = new Map<string, number>();
  for (const q of production) {
    bySkill.set(q.canonicalSkill, (bySkill.get(q.canonicalSkill) ?? 0) + 1);
  }
  for (const [skill, count] of [...bySkill.entries()].sort((a, b) => b[1] - a[1])) {
    lines.push(`- **${skill}** — ${count} questions`);
  }

  return lines.join('\n');
}

export function writeNextPassReport(report: AuditReport): string {
  const outputPath = path.join(ROOT, 'reports/question-quality-next-pass.md');
  fs.writeFileSync(outputPath, generateNextPassReportMarkdown(report), 'utf8');
  return outputPath;
}
