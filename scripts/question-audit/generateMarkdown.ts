import type { AuditReport, AuditedQuestion } from './types';
import { indexToLetter } from './collectQuestions';

function formatChoices(question: AuditedQuestion): string {
  return question.choices
    .map((choice, index) => {
      const marker = choice.id === question.correctAnswerId ? ' **(correct)**' : '';
      return `${indexToLetter(index)}. ${choice.label}${marker}`;
    })
    .join('\n');
}

function formatQuestionBlock(question: AuditedQuestion, index: number): string {
  const flags = question.flags.length > 0 ? question.flags.join(', ') : '_none_';
  return `### ${index + 1}. ${question.questionId} — ${question.missionTitle} (${question.gradeBand})

| Field | Value |
|-------|-------|
| Character | ${question.character} |
| Mission ID | \`${question.missionId}\` |
| Week | ${question.week ?? '—'} |
| Grade band | ${question.gradeBand} |
| Question type | ${question.questionType} |
| Difficulty | **${question.difficultyScore}/5** (${question.rewritePriority} priority) |
| Correct position | ${indexToLetter(question.correctIndex)} |
| Flags | ${flags} |

**Scenario:** ${question.scenarioText || '_none_'}

**Question:** ${question.questionText}

**Choices:**

${formatChoices(question)}

**Difficulty reason:** ${question.difficultyReason}

**Recommended rewrite:** ${question.recommendedRewrite}

**Improved distractors (suggested):**
${question.improvedDistractors.map((d) => `- ${d}`).join('\n')}

**Cognitive notes:** ${question.cognitiveNotes.join('; ')}
`;
}

export function generateMarkdownReport(report: AuditReport): string {
  const { summary, questions } = report;
  const lines: string[] = [];

  lines.push('# Caiden\'s Courage — Question Quality Audit');
  lines.push('');
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push('');
  lines.push('## Executive Summary');
  lines.push('');
  lines.push(`- **Total questions audited:** ${summary.totalQuestions}`);
  lines.push(`- **High rewrite priority:** ${summary.rewritePriorityCounts.high}`);
  lines.push(`- **Medium rewrite priority:** ${summary.rewritePriorityCounts.medium}`);
  lines.push(`- **Low rewrite priority:** ${summary.rewritePriorityCounts.low}`);
  lines.push('');

  lines.push('### Average Difficulty by Character');
  lines.push('');
  lines.push('| Character | Avg difficulty (1–5) |');
  lines.push('|-----------|----------------------|');
  for (const [character, avg] of Object.entries(summary.averageDifficultyByCharacter).sort()) {
    lines.push(`| ${character} | ${avg.toFixed(2)} |`);
  }
  lines.push('');

  lines.push('### Issue Flag Counts');
  lines.push('');
  lines.push('| Flag | Count |');
  lines.push('|------|-------|');
  const flagEntries = Object.entries(summary.flagCounts).sort((a, b) => b[1] - a[1]);
  if (flagEntries.length === 0) {
    lines.push('| _none_ | 0 |');
  } else {
    for (const [flag, count] of flagEntries) {
      lines.push(`| ${flag} | ${count} |`);
    }
  }
  lines.push('');

  lines.push('### Answer Position Distribution by Character');
  lines.push('');
  lines.push('| Character | A | B | C | D | Uneven? | Dominant |');
  lines.push('|-----------|---|---|---|---|---------|----------|');
  for (const [character, dist] of Object.entries(summary.positionDistributionByCharacter).sort()) {
    lines.push(
      `| ${character} | ${dist.A} | ${dist.B} | ${dist.C} | ${dist.D} | ${dist.uneven ? 'yes' : 'no'} | ${dist.dominantPosition ?? '—'} |`,
    );
  }
  lines.push('');

  lines.push('## Top 10 Questions Needing Rewrite');
  lines.push('');
  summary.topRewriteCandidates.forEach((q, i) => {
    lines.push(
      `${i + 1}. **${q.questionId}** (${q.character} / ${q.missionTitle} / ${q.gradeBand}) — difficulty ${q.difficultyScore}/5 — ${q.flags.join(', ') || 'no flags'}`,
    );
  });
  lines.push('');

  lines.push('## Rewrite Priority List');
  lines.push('');
  for (const priority of ['high', 'medium', 'low'] as const) {
    const subset = questions.filter((q) => q.rewritePriority === priority);
    lines.push(`### ${priority.toUpperCase()} priority (${subset.length})`);
    lines.push('');
    for (const q of subset.slice(0, 25)) {
      lines.push(`- \`${q.questionId}\` — ${q.character} / week ${q.week ?? '?'} / ${q.missionTitle} / ${q.gradeBand} — score ${q.difficultyScore}`);
    }
    if (subset.length > 25) {
      lines.push(`- _…and ${subset.length - 25} more_`);
    }
    lines.push('');
  }

  const characters = [...new Set(questions.map((q) => q.character))].sort();
  for (const character of characters) {
    lines.push(`## ${character.toUpperCase()}`);
    lines.push('');
    const charQuestions = questions.filter((q) => q.character === character);
    const missions = [...new Set(charQuestions.map((q) => q.missionId))];
    for (const missionId of missions) {
      const missionQuestions = charQuestions.filter((q) => q.missionId === missionId);
      const title = missionQuestions[0]?.missionTitle ?? missionId;
      lines.push(`### Mission: ${title} (\`${missionId}\`)`);
      lines.push('');
      const bands = [...new Set(missionQuestions.map((q) => q.gradeBand))];
      for (const band of bands) {
        lines.push(`#### Grade band: ${band}`);
        lines.push('');
        const bandQuestions = missionQuestions.filter((q) => q.gradeBand === band);
        bandQuestions.forEach((q, i) => {
          lines.push(formatQuestionBlock(q, i));
          lines.push('');
        });
      }
    }
  }

  lines.push('---');
  lines.push('_This report was generated locally. No live question content was modified._');
  return lines.join('\n');
}
