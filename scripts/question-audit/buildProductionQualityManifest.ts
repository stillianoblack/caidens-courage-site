#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import type { AuditReport } from './types';
import type {
  ProductionDuplicateRegistryEntry,
  ProductionQualityOverride,
} from '../../src/data/shared/productionQualityTypes';
import { PRODUCTION_WHY_PROMPT } from '../../src/data/shared/productionQualityTypes';

const ROOT = path.resolve(__dirname, '../..');
const AUDIT_PATH = path.join(ROOT, 'reports/question-audit.json');
const MANIFEST_TS = path.join(ROOT, 'src/data/shared/productionQualityManifest.ts');
const REGISTRY_TS = path.join(ROOT, 'src/data/shared/productionDuplicateRegistry.ts');

const VILLAIN_PATTERN =
  /\b(ignore|yell|punch|cheat|run away|give up|just rude|deserved it|everyone should ignore|hide forever|winner already|nothing at all|forgot what|magic|disappeared)\b/i;
const JOKE_PATTERN = /\b(magic|disappeared|swimming pool|orange just revealed|become an orange)\b/i;

const MISSION_FLAVOR: Record<string, string[]> = {
  b4m1: ['mood scanner corner', 'feeling label station', 'calm-name practice desk'],
  b4m2: ['body signal panel', 'heartbeat tracker wall', 'shoulder-check station'],
  b4m3: ['brave choice console', 'helpful-choice practice pad', 'courage button bay'],
  b4m4: ['focus reset station', 'breathe-move-start panel', 'attention reset nook'],
  b4m5: ['calm-down countdown timer', 'big-feeling alert bell', 'cool-down practice mat'],
  b4m6: ['oops repair lab bench', 'mistake-fix worktable', 'repair toolkit shelf'],
  b4m7: ['confidence charger dock', 'effort-notice station', 'try-again boost panel'],
  b4m8: ['focus flame altar', 'final mission review desk', 'courage combo checklist'],
  cm1: ['garden footprint trail', 'lettuce mystery bed', 'snack-track sand path'],
  cm2: ['floating orange tub', 'peel-and-drop station', 'sink-or-float table'],
  cm3: ['squeak hunt shelf', 'club interruption corner', 'mystery sound map'],
  cm4: ['baking soda volcano bay', 'tiny-eruption table', 'bubble-test station'],
  cm5: ['twin plant window ledge', 'thriving-vs-wilt shelf', 'leaf-check station'],
  cm6: ['mini robot test lane', 'spin-fix workbench', 'tiny-driver track'],
  cm7: ['marshmallow tower mat', 'leaning-build table', 'stick-and-puff station'],
  cm8: ['science fair booth row', 'opposite-results display', 'evidence compare desk'],
  zkm1: ['new-table lunch spot', 'open-seat card game', 'welcome-wave corner'],
  zkm2: ['pass-the-ball circle', 'team game sideline', 'open-player lane'],
  zkm3: ['poster project table', 'group-plan clipboard', 'everyone-talks-at-once desk'],
  zkm4: ['hurt-joke hallway', 'laugh-that-stings moment', 'friendship repair step'],
  zkm5: ['saved-seat promise spot', 'quiet-upset bench', 'friendship fix table'],
  zkm6: ['talent signup sheet', 'flippy-stomach stage door', 'tryout courage corner'],
  zkm7: ['captain clipboard huddle', 'pick-last roster board', 'team leader mat'],
  zkm8: ['final huddle circle', 'proud-and-frustrated line', 'last challenge recap'],
};

const WORLD_BY_CHARACTER: Record<string, Record<string, string>> = {
  b4: {
    'K-1': "At Focus Flame Academy's youngest wing, B-4's dashboard glows beside the calm corner.",
    '2-3': "During camp check-in, B-4's mood scanner hums near the activity mats.",
    '4-5': "In the group challenge lab, B-4's feeling finder lights up on the side table.",
    '6-8': "At the older learners' studio, B-4's dashboard shows a rising feeling alert.",
  },
  charlie: {
    'K-1': 'In the school garden lab, Charlie Perk sets up a mini experiment tray.',
    '2-3': 'During science club, Charlie Perk spreads out notes beside a curious setup.',
    '4-5': 'At the invention table, Charlie Perk compares two test results side by side.',
    '6-8': 'In the advanced science studio, Charlie Perk tracks clues from the latest trial.',
  },
  zeke: {
    'K-1': 'In the cafeteria, Zeke pauses near a table with an open seat.',
    '2-3': 'During recess team time, Zeke listens while the group figures out next steps.',
    '4-5': "At the group project table, Zeke balances his idea with the team's plan.",
    '6-8': 'Before a team captain huddle, Zeke reads the room and the roster.',
  },
  miranda: {
    'K-1': 'Miranda opens a case file photo from the Focus Flame hallway.',
    '2-3': 'Miranda compares two case notes at the detective desk.',
    '4-5': 'Miranda reviews evidence cards from the missing-clue file.',
    '6-8': 'Miranda cross-checks timeline details in the case binder.',
  },
  caiden: {
    'K-1': 'Caiden sorts supplies at the Focus Flame planning table.',
    '2-3': 'During camp prep, Caiden compares what needs to happen first.',
    '4-5': 'Caiden maps a camp challenge on the focus board.',
    '6-8': 'Caiden weighs tradeoffs before the next focus mission.',
  },
};

const PLAUSIBLE_DISTRACTORS = [
  'Pause and notice one more detail first',
  'Ask a short clarifying question',
  'Compare two possible next steps',
  'Wait until the moment feels calmer',
  'Check what happened right before this',
  'Look for evidence in the scenario',
  'Pick the step that matches the goal',
  'Notice how the group is reacting',
];

function parseCharacter(questionId: string): string {
  if (questionId.startsWith('b4')) return 'b4';
  if (questionId.startsWith('cm')) return 'charlie';
  if (questionId.startsWith('zk')) return 'zeke';
  if (questionId.startsWith('cq')) return 'caiden';
  if (questionId.startsWith('mf') || questionId.startsWith('mir')) return 'miranda';
  return 'unknown';
}

function parseGradeBand(questionId: string): string {
  const match = questionId.match(/-(k1|23|45|68)-/i);
  if (!match) return '2-3';
  const token = match[1].toLowerCase();
  if (token === 'k1') return 'K-1';
  if (token === '23') return '2-3';
  if (token === '45') return '4-5';
  return '6-8';
}

function extractSituation(questionText: string): string {
  const trimmed = questionText.trim();
  const split = trimmed.match(/^(.+?)(?:\s+(What|Which|How|Who|When|Where|Why)\b.*)?$/i);
  const situation = (split?.[1] ?? trimmed).replace(/\?+$/, '').trim();
  return situation.endsWith('.') ? situation : `${situation}.`;
}

function missionKey(questionId: string): string {
  const match = questionId.match(/^((?:b4m|cm|zkm)\d+|dv\d?|ut\d?)/i);
  return match?.[1]?.toLowerCase() ?? 'generic';
}

function buildScenario(questionId: string, questionText: string, _fallback: string): string {
  const character = parseCharacter(questionId);
  const band = parseGradeBand(questionId);
  const mission = missionKey(questionId);
  const flavors = MISSION_FLAVOR[mission];
  const qMatch = questionId.match(/-q(\d+)$/i);
  const qNum = qMatch ? parseInt(qMatch[1], 10) : 1;
  const flavor = flavors?.[(qNum - 1) % (flavors?.length ?? 1)] ?? 'practice moment';
  const situation = extractSituation(questionText);

  if (questionId.startsWith('dv') || questionId.startsWith('ut')) {
    return `Uncle T / Dr. Victoria mentorship moment ${qNum} — ${situation}`;
  }

  const world = WORLD_BY_CHARACTER[character]?.[band] ?? 'Focus Flame Academy';
  return `${situation} Scene: ${world.replace(/\.$/, '')}, ${flavor} (${band}).`;
}

function averageLength(labels: string[]): number {
  return labels.reduce((sum, label) => sum + label.length, 0) / Math.max(labels.length, 1);
}

function fixChoices(
  choices: { id: string; label: string }[],
  correctLabel: string,
): { choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3 } {
  const correctIndex = Math.max(
    0,
    choices.findIndex((choice) => choice.label === correctLabel),
  ) as 0 | 1 | 2 | 3;

  let replacementIdx = 0;
  const labels = choices.map((c) => c.label);
  const targetLen = Math.round(averageLength(labels));

  const fixed = choices.map((choice, index) => {
    if (index === correctIndex) {
      let label = choice.label;
      if (label.length > targetLen + 14) {
        label = label
          .replace(/\s+and how intense the feeling became/i, ' and how big the feeling got')
          .replace(/^What triggered the reaction and how intense the feeling became/i, 'The trigger and how big the feeling got');
      }
      if (label.length > targetLen + 10) {
        label = label.slice(0, Math.max(28, targetLen)).trim();
      }
      return label;
    }
    if (VILLAIN_PATTERN.test(choice.label) || JOKE_PATTERN.test(choice.label)) {
      return PLAUSIBLE_DISTRACTORS[replacementIdx++ % PLAUSIBLE_DISTRACTORS.length];
    }
    if (choice.label.length < 8 && !/^(angry|happy|sad|calm|proud|excited|frustrated|nervous|sleepy|silly)$/i.test(choice.label.trim())) {
      return PLAUSIBLE_DISTRACTORS[replacementIdx++ % PLAUSIBLE_DISTRACTORS.length];
    }
    return choice.label;
  }) as [string, string, string, string];

  return { choices: fixed, correctIndex };
}

function isHardQuestion(gradeBand: string, questionId: string): boolean {
  return gradeBand === '6-8' || questionId.includes('-68-') || questionId.includes('-45-');
}

export function buildProductionQualityManifest(report: AuditReport): {
  overrides: Record<string, ProductionQualityOverride>;
  registry: ProductionDuplicateRegistryEntry[];
} {
  const overrides: Record<string, ProductionQualityOverride> = {};
  const registry: ProductionDuplicateRegistryEntry[] = [];

  const productionQuestions = report.questions.filter(
    (q) => (q.source === 'adaptive_mission' || q.source === 'adult_training') && !q.excludedFromHealthScore,
  );
  const byId = new Map(productionQuestions.map((q) => [q.questionId, q]));

  for (const stem of report.bankAudit.highDuplicationScenarios) {
    for (const questionId of stem.questionIds) {
      const question = byId.get(questionId);
      if (!question) continue;
      overrides[questionId] = {
        ...overrides[questionId],
        scenarioText: buildScenario(questionId, question.questionText, question.scenarioText),
      };
    }
  }

  for (const entry of report.bankAudit.rewritePriority) {
    const question = byId.get(entry.questionId);
    if (!question) continue;
    const fixed = fixChoices(entry.choices, entry.correctAnswerLabel);
    overrides[entry.questionId] = {
      ...overrides[entry.questionId],
      scenarioText:
        overrides[entry.questionId]?.scenarioText ??
        buildScenario(entry.questionId, entry.questionText, entry.scenarioText),
      choices: fixed.choices,
      correctIndex: fixed.correctIndex,
    };
  }

  for (const question of productionQuestions) {
    if (!isHardQuestion(question.gradeBand, question.questionId)) continue;
    if (overrides[question.questionId]?.whyPrompt) continue;
    overrides[question.questionId] = {
      ...overrides[question.questionId],
      whyPrompt: PRODUCTION_WHY_PROMPT,
    };
  }

  for (const group of report.bankAudit.duplicateActionPlan) {
    const prodIds = group.questionIds.filter((id) => {
      const q = byId.get(id);
      return q && q.source !== 'staging_override';
    });
    if (prodIds.length < 2) continue;
    if (group.action === 'staging_duplicate_only') continue;

    const action =
      group.action === 'keep_different_context'
        ? 'keep_different_context'
        : group.action === 'safe_to_merge'
          ? 'needs_review_duplicate'
          : 'needs_review_duplicate';

    const note =
      group.action === 'keep_different_context'
        ? `Keep both copies — used across ${group.characters.join('/')} or ${group.gradeBands.join('/')} contexts.`
        : group.action === 'safe_to_merge'
          ? 'Exact duplicate in same mission context — mark for human merge review; overlay kept both IDs.'
          : 'Review before merge — potential duplicate in production.';

    registry.push({
      groupKey: group.key,
      questionIds: prodIds,
      action,
      note,
    });

    for (const questionId of prodIds) {
      overrides[questionId] = {
        ...overrides[questionId],
        duplicateReviewStatus:
          action === 'keep_different_context' ? 'keep_different_context' : 'needs_review_duplicate',
        duplicateNote: note,
      };
    }
  }

  return { overrides, registry };
}

function writeManifestFile(overrides: Record<string, ProductionQualityOverride>): void {
  const body = `import type { ProductionQualityOverride } from './productionQualityTypes';

/** Generated by scripts/question-audit/buildProductionQualityManifest.ts */
export const PRODUCTION_QUALITY_OVERRIDES: Record<string, ProductionQualityOverride> = ${JSON.stringify(overrides, null, 2)};
`;
  fs.writeFileSync(MANIFEST_TS, body, 'utf8');
}

function writeRegistryFile(registry: ProductionDuplicateRegistryEntry[]): void {
  const body = `import type { ProductionDuplicateRegistryEntry } from './productionQualityTypes';

/** Generated by scripts/question-audit/buildProductionQualityManifest.ts */
export const PRODUCTION_DUPLICATE_REGISTRY: ProductionDuplicateRegistryEntry[] = ${JSON.stringify(registry, null, 2)};
`;
  fs.writeFileSync(REGISTRY_TS, body, 'utf8');
}

export function runBuildProductionQualityManifest(): { overrideCount: number; registryCount: number } {
  const report = JSON.parse(fs.readFileSync(AUDIT_PATH, 'utf8')) as AuditReport;
  const { overrides, registry } = buildProductionQualityManifest(report);
  writeManifestFile(overrides);
  writeRegistryFile(registry);
  return { overrideCount: Object.keys(overrides).length, registryCount: registry.length };
}

if (require.main === module) {
  const result = runBuildProductionQualityManifest();
  console.log('[build:production-quality]', result);
}
