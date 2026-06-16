import { indexToLetter } from './collectQuestions';
import type { BankAuditSummary } from './types';

export function generateRewritePriorityMarkdown(bankAudit: BankAuditSummary): string {
  const lines: string[] = [];
  lines.push('# Question Rewrite Priority');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push(`Top ${bankAudit.rewritePriority.length} production questions to rewrite before publishing.`);
  lines.push('');

  for (const entry of bankAudit.rewritePriority) {
    lines.push(`## ${entry.rank}. ${entry.questionId} (score ${entry.priorityScore})`);
    lines.push('');
    lines.push(`- **Character:** ${entry.character}`);
    lines.push(`- **Mission:** ${entry.missionId}`);
    lines.push(`- **Grade band:** ${entry.gradeBand}`);
    lines.push(`- **Week:** ${entry.week ?? '—'}`);
    lines.push(`- **Source:** ${entry.source}`);
    lines.push('');
    lines.push('**Issue reasons:**');
    for (const reason of entry.issueReasons) {
      lines.push(`- ${reason}`);
    }
    lines.push('');
    lines.push(`**Suggested rewrite direction:** ${entry.suggestedRewriteDirection}`);
    lines.push('');
    lines.push(`**Scenario:** ${entry.scenarioText || '_none_'}`);
    lines.push('');
    lines.push(`**Question:** ${entry.questionText}`);
    lines.push('');
    lines.push('**Choices:**');
    entry.choices.forEach((choice, index) => {
      const mark = choice.label === entry.correctAnswerLabel ? ' **(correct)**' : '';
      lines.push(`${indexToLetter(index)}. ${choice.label}${mark}`);
    });
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}
