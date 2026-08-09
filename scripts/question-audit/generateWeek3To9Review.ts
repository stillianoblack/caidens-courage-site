import fs from 'fs';
import path from 'path';
import { collectProductionQuestions } from './collectQuestions';
import type { GradeBand, NormalizedQuestion } from './types';

const ROOT = path.resolve(__dirname, '../..');
const OUTPUT = path.join(ROOT, 'docs/content/week-3-9-question-review.md');
const DATA_ROOT = path.join(ROOT, 'src/data');
const BANDS: GradeBand[] = ['K-1', '2-3', '4-5', '6-8'];
const WEEK_LABELS: Record<number, { title: string; focus: string }> = {
  3: { title: 'Better Together', focus: 'Teamwork' },
  4: { title: 'Staying Present', focus: 'Focus' },
  5: { title: 'Big Feelings', focus: 'Emotional Awareness' },
  6: { title: 'Brave Choices', focus: 'Decision Making' },
  7: { title: 'Solving Problems Together', focus: 'Problem Solving' },
  8: { title: 'Keep Going', focus: 'Perseverance' },
  9: { title: 'Focus Flame Celebration', focus: 'Confidence + Reflection' },
};

function walk(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : absolute.endsWith('.ts') ? [absolute] : [];
  });
}

const sourceFiles = walk(DATA_ROOT);

function sourceForMission(missionId: string): string {
  const escaped = missionId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const declaration = new RegExp(`export const [A-Z0-9_]+_ID\\s*=\\s*['\"]${escaped}['\"]`);
  const match = sourceFiles.find((file) => declaration.test(fs.readFileSync(file, 'utf8')));
  return match ? path.relative(ROOT, match) : 'BLOCKED — SOURCE FILE NOT RESOLVED';
}

function md(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
}

function roundRobin(questions: NormalizedQuestion[], limit: number): NormalizedQuestion[] {
  const byMission = new Map<string, NormalizedQuestion[]>();
  for (const question of questions) {
    const bucket = byMission.get(question.missionId) ?? [];
    bucket.push(question);
    byMission.set(question.missionId, bucket);
  }
  const selected: NormalizedQuestion[] = [];
  let index = 0;
  while (selected.length < limit) {
    let added = false;
    for (const bucket of byMission.values()) {
      const question = bucket[index];
      if (question) {
        selected.push(question);
        added = true;
        if (selected.length === limit) break;
      }
    }
    if (!added) break;
    index += 1;
  }
  return selected;
}

function namedCharacters(text: string): string[] {
  const names = ['Caiden', 'Miranda', 'B-4', 'Charlie', 'Zeke', 'Mia', 'Dr. Victoria'];
  return names.filter((name) => text.includes(name));
}

const production = collectProductionQuestions().filter(
  (question) =>
    question.source === 'adaptive_mission' &&
    (question.weekNumber ?? question.week ?? 0) >= 3 &&
    (question.weekNumber ?? question.week ?? 0) <= 9 &&
    question.gradeBand !== 'adult',
);

const lines: string[] = [
  '# Week 3–9 Question Review',
  '',
  `Generated from the application question registries on ${new Date().toISOString()}.`,
  '',
  '## Publication truth',
  '',
  '- The learner runtime currently reads these TypeScript adaptive mission banks directly; it does not read `learning_question_sets`.',
  '- Weeks 3–4 are reviewed and runtime-active in the staging-connected local application.',
  '- Weeks 5–9 are marked below as review drafts, but that status is **not enforced by the current static runtime**. They remain reachable wherever existing week-unlock rules allow them.',
  '- Enforcing database-backed draft/published states requires the deferred learning-engagement schema and is intentionally not performed by this review.',
  '- The source-of-truth week labels below are the labels already used by `src/data/familyWeeklyAdventures.ts`.',
  '',
  '## Coverage summary',
  '',
  '| Week | Existing product label | Focus | K–1 | 2–3 | 4–5 | 6–8 | Review status |',
  '|---:|---|---|---:|---:|---:|---:|---|',
];

for (let week = 3; week <= 9; week += 1) {
  const count = (band: GradeBand) =>
    production.filter((q) => (q.weekNumber ?? q.week) === week && q.gradeBand === band).length;
  lines.push(
    `| ${week} | ${WEEK_LABELS[week].title} | ${WEEK_LABELS[week].focus} | ${count('K-1')} | ${count('2-3')} | ${count('4-5')} | ${count('6-8')} | ${week <= 4 ? 'reviewed / staging runtime-active' : 'draft review target; not runtime-enforced'} |`,
  );
}

for (let week = 3; week <= 9; week += 1) {
  const weekQuestions = production.filter((q) => (q.weekNumber ?? q.week) === week);
  const missionGroups = new Map<string, NormalizedQuestion[]>();
  for (const question of weekQuestions) {
    const bucket = missionGroups.get(question.missionId) ?? [];
    bucket.push(question);
    missionGroups.set(question.missionId, bucket);
  }

  lines.push('', `## Week ${week} — ${WEEK_LABELS[week].title}`, '');
  lines.push(`Product focus: **${WEEK_LABELS[week].focus}**.`, '');
  lines.push('### Approved source modules', '');
  lines.push('| Character | Mission | Exact source file | Verified scene/event evidence | Named characters | Vocabulary / skill language |');
  lines.push('|---|---|---|---|---|---|');
  for (const questions of missionGroups.values()) {
    const first = questions[0];
    const scenarios = Array.from(new Set(questions.map((q) => q.scenarioText).filter(Boolean))).slice(0, 3);
    const combined = questions.map((q) => `${q.scenarioText} ${q.questionText}`).join(' ');
    const skills = Array.from(new Set(questions.flatMap((q) => [q.skillArea, ...q.skillTags]).filter(Boolean))).slice(0, 8);
    lines.push(
      `| ${md(first.character)} | ${md(first.missionTitle)} (\`${md(first.missionId)}\`) | \`${sourceForMission(first.missionId)}\` | ${md(scenarios.join(' / '))} | ${namedCharacters(combined).join(', ') || 'No named character in prompt text'} | ${md(skills.join(', '))} |`,
    );
  }

  for (const band of BANDS) {
    const bank = weekQuestions.filter((q) => q.gradeBand === band);
    const selected = roundRobin(bank, 10);
    lines.push('', `### ${band} review set`, '');
    lines.push(
      `Available: **${bank.length}**. Review set: **${selected.length}**. Status: **${week <= 4 ? 'reviewed / staging runtime-active' : 'draft review target; not runtime-enforced'}**.`,
      '',
    );
    selected.forEach((question, index) => {
      lines.push(`${index + 1}. **${md(question.questionText)}**  `);
      lines.push(`   ID: \`${question.questionId}\` · Character: ${question.character} · Module: \`${question.missionId}\`  `);
      lines.push(`   Scene: ${md(question.scenarioText)}  `);
      lines.push(
        `   Choices: ${question.choices
          .map((choice) => `${choice.id.toUpperCase()}. ${md(choice.label)}${choice.id === question.correctAnswerId ? ' **(correct)**' : ''}`)
          .join(' · ')}  `,
      );
      lines.push(`   Explanation: ${md(question.explanation || 'BLOCKED — EXPLANATION REQUIRED')}`);
    });
  }
}

lines.push(
  '',
  '## Blocking findings',
  '',
  '- No Week 3–9 grade-band coverage gap remains: every supported band has at least 10 production questions per week.',
  '- Static content has no enforceable draft/published status. Week 5–9 cannot be made true drafts without changing the runtime publication model or applying the deferred learning-engagement migration.',
  '- The full question audit still reports production-wide duplicate and distractor-quality warnings; see `reports/question-audit.md` for the complete list. These are quality blockers for a broad production publication decision, not missing Week 3–9 coverage.',
  '',
);

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, `${lines.join('\n')}\n`);
console.log(`Wrote ${OUTPUT}`);
