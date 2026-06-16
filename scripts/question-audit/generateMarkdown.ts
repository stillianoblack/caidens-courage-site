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
  const { summary, bankAudit, recommendations, questions } = report;
  const lines: string[] = [];

  lines.push('# Caiden\'s Courage — Question Bank Audit');
  lines.push('');
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push('');
  lines.push('## Dashboard Summary');
  lines.push('');
  lines.push(`**Question Health Score: ${summary.questionHealthScore}**`);
  lines.push('');
  lines.push('### Health Scores');
  lines.push('');
  lines.push(`| Score | Value |`);
  lines.push(`| --- | ---: |`);
  lines.push(`| Overall Question Health | ${bankAudit.healthScores.overall} |`);
  lines.push(`| Production Content Health | ${bankAudit.healthScores.productionContent} |`);
  lines.push(`| Metadata Completeness | ${bankAudit.healthScores.metadataCompleteness} |`);
  lines.push(`| Distractor Quality | ${bankAudit.healthScores.distractorQuality} |`);
  lines.push(`| Scenario Variety | ${bankAudit.healthScores.scenarioVariety} |`);
  lines.push('');
  lines.push(`- **Production questions:** ${bankAudit.productionQuestionCount}`);
  lines.push(`- **Staging overrides:** ${bankAudit.stagingQuestionCount}`);
  lines.push(`- **Total questions audited:** ${summary.totalQuestions}`);
  lines.push(`- **Sources scanned:** ${summary.sourcesScanned.join(', ')}`);
  lines.push(`- **High rewrite priority:** ${summary.rewritePriorityCounts.high}`);
  lines.push(`- **Medium rewrite priority:** ${summary.rewritePriorityCounts.medium}`);
  lines.push(`- **Low rewrite priority:** ${summary.rewritePriorityCounts.low}`);
  lines.push('');
  lines.push('### Issues Found (Production)');
  lines.push('');
  lines.push(`- ${bankAudit.classifiedCounts.production.duplicateQuestions} duplicate question groups`);
  lines.push(`- ${bankAudit.classifiedCounts.production.duplicateScenarios} duplicate scenario groups`);
  lines.push(`- ${bankAudit.classifiedCounts.production.caidenSpellingIssues} Caiden spelling issues`);
  lines.push(`- ${bankAudit.classifiedCounts.weakDistractor} weak distractor warnings`);
  lines.push(`- ${bankAudit.classifiedCounts.metadataOnly} metadata-only issues`);
  lines.push(`- ${bankAudit.classifiedCounts.trueDuplicate} true duplicate content findings`);
  lines.push(`- ${bankAudit.classifiedCounts.production.highScenarioDuplication} high scenario duplication stems`);
  lines.push(`- ${bankAudit.classifiedCounts.production.skillsUnderMinimum} skills below minimum coverage (10 questions)`);
  lines.push('');
  lines.push('### Staging (excluded from production health score)');
  lines.push('');
  lines.push(`- ${bankAudit.duplicateActionPlan.filter((g) => g.action === 'staging_duplicate_only').length} staging duplicate groups`);
  lines.push('');

  lines.push('## Recommendations');
  lines.push('');
  for (const item of recommendations) {
    lines.push(`- ${item}`);
  }
  lines.push('');

  lines.push('## Difficulty Balance');
  lines.push('');
  for (const band of ['K-1', '2-3', '4-5', '6-8']) {
    const bandCounts = bankAudit.difficultyCounts[band];
    if (!bandCounts) continue;
    const totals = { easy: 0, medium: 0, hard: 0, unknown: 0 };
    for (const bucket of Object.values(bandCounts)) {
      totals.easy += bucket.easy ?? 0;
      totals.medium += bucket.medium ?? 0;
      totals.hard += bucket.hard ?? 0;
      totals.unknown += bucket.unknown ?? 0;
    }
    lines.push(`### Grade ${band}`);
    lines.push('');
    lines.push(`- Easy: ${totals.easy}`);
    lines.push(`- Medium: ${totals.medium}`);
    lines.push(`- Hard: ${totals.hard}`);
    if (totals.unknown) lines.push(`- Unknown: ${totals.unknown}`);
    lines.push('');

    const characters = Object.keys(bandCounts).filter((key) => !key.startsWith('skill::')).sort();
    if (characters.length) {
      lines.push('| Character | Easy | Medium | Hard | Unknown |');
      lines.push('| --- | ---: | ---: | ---: | ---: |');
      for (const character of characters) {
        const c = bandCounts[character];
        lines.push(
          `| ${character} | ${c.easy ?? 0} | ${c.medium ?? 0} | ${c.hard ?? 0} | ${c.unknown ?? 0} |`,
        );
      }
      lines.push('');
    }

    const skills = Object.keys(bandCounts).filter((key) => key.startsWith('skill::')).sort();
    if (skills.length) {
      lines.push('**By skill:**');
      lines.push('');
      lines.push('| Skill | Easy | Medium | Hard | Unknown |');
      lines.push('| --- | ---: | ---: | ---: | ---: |');
      for (const skillKey of skills) {
        const c = bandCounts[skillKey];
        const label = skillKey.replace('skill::', '');
        lines.push(`| ${label} | ${c.easy ?? 0} | ${c.medium ?? 0} | ${c.hard ?? 0} | ${c.unknown ?? 0} |`);
      }
      lines.push('');
    }
  }

  lines.push('## Skill Coverage');
  lines.push('');
  lines.push('| Skill | Total Questions | Status |');
  lines.push('| --- | ---: | --- |');
  const skillOrder = [
    'Executive Function',
    'Self Regulation',
    'Communication',
    'Teamwork',
    'Problem Solving',
    'Empathy',
    'Focus Recovery',
    'Courage',
    'Reading Comprehension',
    'Math Reasoning',
    'Other',
  ] as const;
  for (const skill of skillOrder) {
    const count = bankAudit.skillTotals[skill] ?? 0;
    const status = skill !== 'Other' && count < 10 ? '**Below minimum**' : 'OK';
    lines.push(`| ${skill} | ${count} | ${status} |`);
  }
  lines.push('');

  const topSkillCharacter = bankAudit.skillCoverage.slice(0, 20);
  if (topSkillCharacter.length) {
    lines.push('### Coverage by Character × Skill (top 20)');
    lines.push('');
    lines.push('| Character | Skill | Count |');
    lines.push('| --- | --- | ---: |');
    for (const row of topSkillCharacter) {
      lines.push(`| ${row.character} | ${row.skill} | ${row.count} |`);
    }
    lines.push('');
  }

  if (bankAudit.highDuplicationScenarios.length) {
    lines.push('## High Scenario Duplication');
    lines.push('');
    for (const row of bankAudit.highDuplicationScenarios.slice(0, 15)) {
      lines.push(`- **HIGH DUPLICATION WARNING** — appears ${row.count} times: "${row.sample}…"`);
    }
    lines.push('');
  }

  if (bankAudit.duplicateQuestions.length) {
    lines.push('## Duplicate Questions');
    lines.push('');
    for (const group of bankAudit.duplicateQuestions.slice(0, 20)) {
      lines.push(`- ${group.questionIds.length} IDs share: "${group.sampleText.slice(0, 100)}…"`);
      lines.push(`  - IDs: ${group.questionIds.slice(0, 8).join(', ')}${group.questionIds.length > 8 ? '…' : ''}`);
    }
    lines.push('');
  }

  lines.push('## Executive Summary (Quality Heuristics)');
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
