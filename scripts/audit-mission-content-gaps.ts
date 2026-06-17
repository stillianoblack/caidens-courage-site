/**
 * Audit mission question counts per character / mission / grade band.
 * Flags content gaps (< 5 questions) and correct-answer position bias.
 *
 * Run: yarn audit:mission-content-gaps
 */
import fs from 'fs';
import path from 'path';
import { MISSION_QUESTIONS_PER_ATTEMPT } from '../src/config/missionQuestions';
import type { StudentGradeBand } from '../src/types/gradeBandContentMetadata';

const BANDS: StudentGradeBand[] = ['K-1', '2-3', '4-5', '6-8'];
const TARGET = MISSION_QUESTIONS_PER_ATTEMPT;
const PILOT_WEEKS = [1, 2, 3, 4];

type GapRow = {
  character: string;
  missionId: string;
  week?: number;
  gradeBand: string;
  count: number;
  target: number;
};

type BiasRow = {
  character: string;
  missionId: string;
  gradeBand: string;
  total: number;
  positions: Record<string, number>;
  dominant: string;
};

type MissionAuditShape = {
  id: string;
  gradeContent: Partial<
    Record<
      StudentGradeBand,
      {
        questions: readonly {
          id: string;
          options?: readonly { id: string }[];
          correctAnswer?: string;
          correctId?: string;
        }[];
      }
    >
  >;
};

function correctPosition(
  options: readonly { id: string }[],
  correctId: string,
): string | null {
  const index = options.findIndex((option) => option.id === correctId);
  if (index < 0) return null;
  return String.fromCharCode(65 + index);
}

function auditRegistry(
  character: string,
  registry: Record<string, MissionAuditShape>,
): { gaps: GapRow[]; biases: BiasRow[] } {
  const gaps: GapRow[] = [];
  const biases: BiasRow[] = [];

  for (const mission of Object.values(registry)) {
    for (const band of BANDS) {
      const questions = mission.gradeContent[band]?.questions ?? [];
      if (questions.length === 0) continue;

      if (questions.length < TARGET) {
        gaps.push({
          character,
          missionId: mission.id,
          gradeBand: band,
          count: questions.length,
          target: TARGET,
        });
      }

      const positions: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
      for (const question of questions) {
        const correctId =
          'correctId' in question && question.correctId
            ? question.correctId
            : 'correctAnswer' in question
              ? question.correctAnswer
              : null;
        const options = question.options ?? [];
        if (!correctId || options.length === 0) continue;
        const pos = correctPosition(options, correctId);
        if (pos) positions[pos] = (positions[pos] ?? 0) + 1;
      }

      const dominant = Object.entries(positions).sort((a, b) => b[1] - a[1])[0];
      if (dominant && dominant[1] === questions.length && questions.length >= 2) {
        biases.push({
          character,
          missionId: mission.id,
          gradeBand: band,
          total: questions.length,
          positions,
          dominant: dominant[0],
        });
      }
    }
  }

  return { gaps, biases };
}

async function main(): Promise<void> {
  // Offline audit — avoid Supabase client init in Node (no native WebSocket).
  process.env.REACT_APP_SUPABASE_URL = '';
  process.env.REACT_APP_SUPABASE_ANON_KEY = '';

  const { WEEKLY_CHARACTER_MISSION_LISTS } = await import('../src/lib/weeklyCharacterMissionLists');

  await import('../src/data/caiden/index');
  await import('../src/data/miranda/index');
  await import('../src/data/b4/index');
  await import('../src/data/charlie/index');
  await import('../src/data/zeke/index');

  const { CAIDEN_ADAPTIVE_QUEST_REGISTRY } = await import('../src/data/caiden/caidenAdaptiveBuilder');
  const { MIRANDA_ADAPTIVE_QUEST_REGISTRY } = await import('../src/data/miranda/mirandaAdaptiveBuilder');
  const { B4_ADAPTIVE_MISSION_REGISTRY } = await import('../src/data/b4/b4AdaptiveBuilder');
  const { CHARLIE_ADAPTIVE_MISSION_REGISTRY } = await import('../src/data/charlie/charlieAdaptiveBuilder');
  const { ZEKE_ADAPTIVE_MISSION_REGISTRY } = await import('../src/data/zeke/zekeAdaptiveBuilder');

  const audits = [
    auditRegistry('caiden', CAIDEN_ADAPTIVE_QUEST_REGISTRY),
    auditRegistry('miranda', MIRANDA_ADAPTIVE_QUEST_REGISTRY),
    auditRegistry('b4', B4_ADAPTIVE_MISSION_REGISTRY),
    auditRegistry('charlie', CHARLIE_ADAPTIVE_MISSION_REGISTRY),
    auditRegistry('zeke', ZEKE_ADAPTIVE_MISSION_REGISTRY),
  ];

  const gaps = audits.flatMap((row) => row.gaps);
  const biases = audits.flatMap((row) => row.biases);

  for (const week of PILOT_WEEKS) {
    for (const [character, missions] of Object.entries(WEEKLY_CHARACTER_MISSION_LISTS)) {
      const missionId = missions[week - 1];
      if (!missionId) continue;
      for (const gap of gaps.filter((row) => row.character === character && row.missionId === missionId)) {
        gap.week = week;
      }
    }
  }

  const pilotGaps = gaps.filter((row) => row.week != null);
  const PRIORITY_W1_3 = ['caiden', 'miranda', 'b4'];
  const pilotComplete: string[] = [];
  for (const week of [1, 2, 3]) {
    for (const character of PRIORITY_W1_3) {
      const missionId = WEEKLY_CHARACTER_MISSION_LISTS[character]?.[week - 1];
      if (!missionId) continue;
      const bandGaps = pilotGaps.filter(
        (row) => row.week === week && row.character === character && row.missionId === missionId,
      );
      if (bandGaps.length === 0) {
        pilotComplete.push(`- Week ${week} **${character}** \`${missionId}\`: **5/5** all bands (K-1, 2-3, 4-5, 6-8)`);
      }
    }
  }
  const charlieZekeW13Gaps = pilotGaps.filter(
    (row) => (row.week ?? 0) <= 3 && (row.character === 'charlie' || row.character === 'zeke'),
  );
  const week4PlusGaps = pilotGaps.filter((row) => (row.week ?? 0) >= 4);

  const lines: string[] = [
    '# Pilot mission content gaps',
    '',
    `Target questions per mission per grade band: **${TARGET}**`,
    '',
    '## Status summary',
    '',
    '### Week 1–3 priority (Caiden, Miranda, B-4)',
    '',
    ...(pilotComplete.length > 0 ? pilotComplete : ['- None complete yet']),
    '',
    `### Remaining Week 1–3 gaps (Charlie, Zeke): **${charlieZekeW13Gaps.length}** band rows`,
    '',
    `### Remaining Week 4+ pilot gaps: **${week4PlusGaps.length}** band rows`,
    '',
    `### Total missions/bands below 5: **${gaps.length}**`,
    '',
    '## Week 1–4 pilot missions (priority gaps only)',
    '',
    '| Week | Character | Mission | Band | Count | Target | Missing |',
    '|------|-----------|---------|------|-------|--------|---------|',
  ];

  for (const row of pilotGaps.sort((a, b) => (a.week ?? 0) - (b.week ?? 0))) {
    const missing = Math.max(0, row.target - row.count);
    lines.push(
      `| ${row.week} | ${row.character} | ${row.missionId} | ${row.gradeBand} | ${row.count} | ${row.target} | ${missing} |`,
    );
  }

  lines.push('', '## Week 1–4 — missing questions to reach 5 (authoring checklist)', '');
  lines.push('| Week | Character | Mission | Band | Current | Target | Missing |');
  lines.push('|------|-----------|---------|------|---------|--------|---------|');
  const uniquePilot = new Map<string, GapRow>();
  for (const row of pilotGaps) {
    const key = `${row.character}::${row.missionId}::${row.gradeBand}`;
    uniquePilot.set(key, row);
  }
  for (const row of uniquePilot.values()) {
    const missing = Math.max(0, row.target - row.count);
    lines.push(
      `| ${row.week} | ${row.character} | ${row.missionId} | ${row.gradeBand} | ${row.count} | ${row.target} | ${missing} |`,
    );
  }

  lines.push('', '## All missions with fewer than 5 questions', '');
  for (const row of gaps) {
    lines.push(
      `- **${row.character}** / \`${row.missionId}\` / ${row.gradeBand}: ${row.count} of ${row.target}`,
    );
  }

  lines.push('', '## Correct-answer position bias (all answers same slot)', '');
  if (biases.length === 0) {
    lines.push('None detected.');
  } else {
    for (const row of biases) {
      lines.push(
        `- **${row.character}** / \`${row.missionId}\` / ${row.gradeBand}: all ${row.total} → **${row.dominant}** (${JSON.stringify(row.positions)})`,
      );
    }
  }

  lines.push('', '## TODO — author next', '');
  for (const row of uniquePilot.values()) {
    const need = row.target - row.count;
    lines.push(
      `- [ ] ${row.character} week ${row.week} \`${row.missionId}\` ${row.gradeBand}: add **${need}** question(s)`,
    );
  }

  const outPath = path.join(process.cwd(), 'reports/pilot-mission-content-gaps.md');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join('\n'));
  console.log(`Wrote ${outPath}`);
  console.log(`Gaps: ${gaps.length}, position biases: ${biases.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
