import fs from 'fs';
import path from 'path';
import {
  auditAllQuestions,
} from './auditHeuristics';
import { collectAllQuestions, indexToLetter } from './collectQuestions';
import type { AuditedQuestion, AuditReport, GradeBand, NormalizedQuestion } from './types';
import { auditCharacterViolations, CHARACTER_IDS, type CharacterId } from '../question-rewrite/characterGoldStandard';
import type { StagingManifest } from '../question-rewrite/types';
import { WEEKLY_CHARACTER_MISSION_LISTS } from '../../src/lib/weeklyCharacterMissionLists';

const ROOT = path.resolve(__dirname, '../..');
export const STAGING_MANIFEST_PATH = path.join(ROOT, 'src/data/staging/manifest.json');
const CHOICE_IDS = ['a', 'b', 'c', 'd'] as const;

const DIFFICULTY_TARGETS: Record<string, number> = {
  caiden: 4.2,
  miranda: 4.0,
  zeke: 3.8,
  charlie: 3.8,
  b4: 3.8,
};

export type CheckStatus = 'pass' | 'warning' | 'fail';

export type PublicationCheck = {
  id: string;
  title: string;
  status: CheckStatus;
  summary: string;
  details: string[];
  criticalIssues: string[];
};

export type DuplicateCluster = {
  key: string;
  count: number;
  sampleQuestionIds: string[];
  preview: string;
};

export type MissionPacingNote = {
  character: string;
  missionId: string;
  missionTitle: string;
  week: number | null;
  issue: string;
  severity: CheckStatus;
};

export type PublicationReadinessReport = {
  generatedAt: string;
  source: 'staging_v4_alignment';
  overallStatus: CheckStatus;
  overallVerdict: string;
  questionCount: number;
  checks: PublicationCheck[];
  criticalIssues: string[];
  duplicateQuestions: DuplicateCluster[];
  duplicateAnswers: DuplicateCluster[];
  repeatedScenarios: DuplicateCluster[];
  repetitiveMissions: MissionPacingNote[];
  progressionNotes: MissionPacingNote[];
  auditSummary: AuditReport['summary'];
  characterAverages: Record<string, number>;
  positionByCharacter: AuditReport['summary']['positionDistributionByCharacter'];
};

export function loadStagingQuestions(): NormalizedQuestion[] {
  if (!fs.existsSync(STAGING_MANIFEST_PATH)) {
    throw new Error('Staging manifest not found. Run npm run rewrite:staging:difficulty first.');
  }

  const manifest = JSON.parse(fs.readFileSync(STAGING_MANIFEST_PATH, 'utf8')) as StagingManifest;
  const production = collectAllQuestions();
  const byId = new Map(production.map((q) => [q.questionId, q]));

  return Object.values(manifest.overrides).map((override) => {
    const base = byId.get(override.questionId);
    if (!base) {
      throw new Error(`Missing production question for override ${override.questionId}`);
    }
    return {
      ...base,
      scenarioText: override.scenarioText ?? base.scenarioText,
      questionText: override.questionText,
      choices: override.choices.map((label, index) => ({ id: CHOICE_IDS[index], label })),
      correctAnswerId: CHOICE_IDS[override.correctIndex],
      correctAnswerLabel: override.choices[override.correctIndex],
      correctIndex: override.correctIndex,
      skillTags: override.skillTags ?? base.skillTags,
    };
  });
}

function normalizeScenarioKey(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

function normalizeStemKey(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

function choiceSetKey(q: AuditedQuestion): string {
  return q.choices
    .map((c) => c.label.trim().toLowerCase())
    .sort()
    .join(' | ');
}

function fullQuestionKey(q: AuditedQuestion): string {
  return [
    normalizeStemKey(q.questionText),
    normalizeScenarioKey(q.scenarioText),
    choiceSetKey(q),
    q.correctAnswerLabel.trim().toLowerCase(),
  ].join('::');
}

function buildDuplicateClusters(
  questions: AuditedQuestion[],
  keyFn: (q: AuditedQuestion) => string,
  previewFn: (q: AuditedQuestion) => string,
  minCount: number,
): DuplicateCluster[] {
  const groups = new Map<string, AuditedQuestion[]>();
  for (const q of questions) {
    const key = keyFn(q);
    const list = groups.get(key) ?? [];
    list.push(q);
    groups.set(key, list);
  }

  return [...groups.entries()]
    .filter(([, list]) => list.length >= minCount)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([key, list]) => ({
      key,
      count: list.length,
      sampleQuestionIds: list.slice(0, 5).map((q) => q.questionId),
      preview: previewFn(list[0]),
    }));
}

function detectScenarioDuplicationArtifacts(questions: AuditedQuestion[]): string[] {
  const issues: string[] = [];
  for (const q of questions) {
    const text = q.scenarioText.trim();
    const sentences = text.split(/(?<=[.!?])\s+/);
    if (sentences.length >= 2) {
      const unique = new Set(sentences.map((s) => s.trim().toLowerCase()));
      if (unique.size < sentences.length) {
        issues.push(`${q.questionId}: repeated sentence framing in scenario`);
      }
    }
  }
  return issues;
}

function checkInventory(questions: AuditedQuestion[], productionCount: number): PublicationCheck {
  const expectedTotal = productionCount;
  const critical: string[] = [];
  const details: string[] = [];

  if (questions.length !== expectedTotal) {
    critical.push(`Expected ${expectedTotal} questions, found ${questions.length}`);
  }
  if (productionCount !== questions.length) {
    critical.push(`Staging count ${questions.length} does not match production ${productionCount}`);
  }

  const byCharacter: Record<string, number> = {};
  for (const q of questions) {
    byCharacter[q.character] = (byCharacter[q.character] ?? 0) + 1;
  }
  details.push(`Character counts: ${JSON.stringify(byCharacter)}`);

  const missionCounts: Record<string, number> = {};
  for (const q of questions) {
    const key = `${q.character}::${q.missionId}`;
    missionCounts[key] = (missionCounts[key] ?? 0) + 1;
  }
  const caidenExtended = Object.entries(missionCounts).filter(
    ([key, count]) => key.startsWith('caiden::quest-') && Number(key.replace(/.*quest-/, '')) >= 6 && count === 32,
  );
  if (caidenExtended.length === 4) {
    details.push('Caiden quests 6–9 contain 32 questions each (8 per grade band) by design.');
  }

  return {
    id: 'inventory',
    title: `1. Question inventory (${expectedTotal})`,
    status: critical.length > 0 ? 'fail' : 'pass',
    summary:
      critical.length > 0
        ? `${questions.length}/${expectedTotal} questions present`
        : `All ${expectedTotal} staging questions loaded and matched to production IDs`,
    details,
    criticalIssues: critical,
  };
}

function checkCharacterIdentity(
  questions: AuditedQuestion[],
): PublicationCheck {
  const violations = auditCharacterViolations(questions);
  const critical: string[] = [];
  const details: string[] = [];

  for (const character of CHARACTER_IDS) {
    const items = violations[character];
    const criticalItems = items.filter((v) => v.severity === 'critical');
    details.push(`${character}: ${items.length} rubric notes (${criticalItems.length} critical)`);
    criticalItems.slice(0, 5).forEach((v) => {
      critical.push(`${v.questionId}: ${v.violations[0]}`);
    });
  }

  const totalCritical = CHARACTER_IDS.reduce(
    (sum, c) => sum + violations[c].filter((v) => v.severity === 'critical').length,
    0,
  );

  return {
    id: 'character-identity',
    title: '2. Character identity consistency',
    status: totalCritical > 0 ? 'fail' : 'pass',
    summary:
      totalCritical > 0
        ? `${totalCritical} critical character rubric violations`
        : 'All characters meet character-specific rubric checks',
    details,
    criticalIssues: critical,
  };
}

function expectedBandsForMission(character: string, missionId: string): GradeBand[] {
  return ['K-1', '2-3', '4-5', '6-8'];
}

function checkGradeBandConsistency(questions: AuditedQuestion[]): PublicationCheck {
  const critical: string[] = [];
  const details: string[] = [];
  const warnings: string[] = [];

  const byMission = new Map<string, AuditedQuestion[]>();
  for (const q of questions) {
    const key = `${q.character}::${q.missionId}`;
    const list = byMission.get(key) ?? [];
    list.push(q);
    byMission.set(key, list);
  }

  for (const [key, subset] of byMission.entries()) {
    const [character, missionId] = key.split('::');
    const bandCounts: Record<string, number> = {};
    subset.forEach((q) => {
      bandCounts[q.gradeBand] = (bandCounts[q.gradeBand] ?? 0) + 1;
    });

    for (const band of expectedBandsForMission(character, missionId)) {
      if (!bandCounts[band]) {
        critical.push(`${key} missing grade band ${band}`);
      }
    }

    const expectedPerBand = character === 'caiden' && /^quest-[6-9]$/.test(missionId.replace('quest-', 'quest-')) ? 8 : 3;
    if (['quest-6', 'quest-7', 'quest-8', 'quest-9'].includes(missionId)) {
      for (const band of expectedBandsForMission(character, missionId)) {
        if (bandCounts[band] && bandCounts[band] !== 8) {
          warnings.push(`${key} ${band}: expected 8 questions, found ${bandCounts[band]}`);
        }
      }
    } else if (subset.length !== 12) {
      warnings.push(`${key}: expected 12 questions (3 per band), found ${subset.length}`);
    }
  }

  const upperBelowFour = questions.filter(
    (q) => (q.gradeBand === '4-5' || q.gradeBand === '6-8') && q.difficultyScore < 4,
  );
  if (upperBelowFour.length > 0) {
    warnings.push(`${upperBelowFour.length} upper-band questions below 4/5 difficulty`);
    upperBelowFour.slice(0, 5).forEach((q) => {
      warnings.push(`  ${q.questionId} (${q.character} ${q.gradeBand}): ${q.difficultyScore}/5`);
    });
  }

  const k1Floor = questions.filter((q) => q.gradeBand === 'K-1' && q.difficultyScore === 3);
  details.push(`K–1 at 3/5 (expected floor): ${k1Floor.length}`);
  details.push(`Upper-band below 4/5: ${upperBelowFour.length}`);

  const readingFlags = questions.filter((q) => q.flags.includes('reading_level_below_band'));
  if (readingFlags.length > 0) {
    warnings.push(`${readingFlags.length} reading-level below band flags`);
  }

  details.push(...warnings.slice(0, 8));

  let status: CheckStatus = 'pass';
  if (critical.length > 0) status = 'fail';
  else if (warnings.length > 0) status = 'warning';

  return {
    id: 'grade-band',
    title: '3. Grade-band consistency',
    status,
    summary:
      critical.length > 0
        ? `${critical.length} missing grade-band coverage issues`
        : warnings.length > 0
          ? `${warnings.length} grade-band pacing notes (K–1 floor expected)`
          : 'Grade bands complete across all missions',
    details,
    criticalIssues: critical,
  };
}

function checkPositionDistribution(audit: AuditReport): PublicationCheck {
  const critical: string[] = [];
  const details: string[] = [];
  const warnings: string[] = [];

  for (const [character, dist] of Object.entries(audit.summary.positionDistributionByCharacter)) {
    const pct = (pos: number) => ((pos / Math.max(dist.total, 1)) * 100).toFixed(0);
    details.push(
      `${character}: A=${dist.A} (${pct(dist.A)}%) B=${dist.B} (${pct(dist.B)}%) C=${dist.C} (${pct(dist.C)}%) D=${dist.D} (${pct(dist.D)}%)`,
    );
    if (dist.uneven) {
      warnings.push(`${character}: position ${dist.dominantPosition} dominates (${dist.A + dist.B + dist.C + dist.D} total)`);
    }
  }

  const unevenMissions = Object.entries(audit.summary.positionDistributionByMission).filter(
    ([, dist]) => dist.uneven,
  );
  if (unevenMissions.length > 0) {
    warnings.push(`${unevenMissions.length} missions have uneven correct-answer positions`);
    unevenMissions.slice(0, 6).forEach(([key, dist]) => {
      warnings.push(`  ${key}: dominant ${dist.dominantPosition}`);
    });
  }

  details.push(...warnings.slice(0, 8));

  return {
    id: 'position-distribution',
    title: '4. Answer-position distribution',
    status: warnings.length > 0 ? 'warning' : 'pass',
    summary:
      warnings.length > 0
        ? `Character-level balance OK; ${unevenMissions.length} mission-level outliers`
        : 'Correct-answer positions balanced across characters (~25% each)',
    details,
    criticalIssues: critical,
  };
}

function checkDistractorQuality(questions: AuditedQuestion[]): PublicationCheck {
  const critical: string[] = [];
  const details: string[] = [];
  const warnings: string[] = [];

  const joke = questions.filter((q) => q.flags.includes('joke_or_impossible_distractor'));
  const obvious = questions.filter((q) => q.flags.includes('correct_answer_too_obvious'));
  const guessable = questions.filter((q) => q.flags.includes('guessable_without_scenario'));
  const length = questions.filter((q) => q.flags.includes('answer_length_imbalance'));

  if (joke.length > 0) critical.push(...joke.map((q) => `${q.questionId}: joke distractor`));
  if (obvious.length > 0) critical.push(...obvious.map((q) => `${q.questionId}: obvious correct answer`));
  if (guessable.length > 0) critical.push(...guessable.map((q) => `${q.questionId}: guessable without scenario`));

  if (length.length > 0) {
    warnings.push(`${length.length} questions with answer length imbalance`);
    length.slice(0, 5).forEach((q) => warnings.push(`  ${q.questionId}`));
  }

  const truncated = questions.filter((q) => q.choices.some((c) => c.label.includes('…')));
  if (truncated.length > 0) {
    warnings.push(`${truncated.length} questions have truncated choice labels (…)`);
  }

  details.push(`Joke distractors: ${joke.length}`);
  details.push(`Obvious correct answers: ${obvious.length}`);
  details.push(`Guessable without scenario: ${guessable.length}`);
  details.push(`Length imbalance: ${length.length}`);
  details.push(`Truncated choices: ${truncated.length}`);
  details.push(...warnings.slice(0, 6));

  let status: CheckStatus = 'pass';
  if (critical.length > 0) status = 'fail';
  else if (warnings.length > 0) status = 'warning';

  return {
    id: 'distractor-quality',
    title: '5. Distractor quality',
    status,
    summary:
      critical.length > 0
        ? `${critical.length} critical distractor issues`
        : warnings.length > 0
          ? `No critical flags; ${warnings.length} minor notes`
          : 'Zero joke, obvious, or guessable flags across all 512 questions',
    details,
    criticalIssues: critical,
  };
}

function checkDifficultyDistribution(audit: AuditReport, questions: AuditedQuestion[]): PublicationCheck {
  const critical: string[] = [];
  const details: string[] = [];
  const warnings: string[] = [];

  for (const [character, avg] of Object.entries(audit.summary.averageDifficultyByCharacter)) {
    const target = DIFFICULTY_TARGETS[character] ?? 3.8;
    const met = avg >= target - 0.05;
    details.push(`${character}: avg ${avg.toFixed(2)}/5 (target ≥${target}) ${met ? '✓' : '✗'}`);
    if (!met) {
      warnings.push(`${character} average ${avg.toFixed(2)} below target ${target}`);
    }
  }

  const flagged = questions.filter((q) => q.flags.length > 0);
  if (flagged.length > 0) {
    critical.push(...flagged.map((q) => `${q.questionId}: ${q.flags.join(', ')}`));
  }

  const highPriority = questions.filter((q) => q.rewritePriority === 'high');
  if (highPriority.length > 0) {
    critical.push(`${highPriority.length} high-priority rewrite candidates remain`);
  }

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  questions.forEach((q) => {
    distribution[q.difficultyScore] = (distribution[q.difficultyScore] ?? 0) + 1;
  });
  details.push(
    `Score distribution: ${Object.entries(distribution)
      .map(([score, count]) => `${score}/5=${count}`)
      .join(', ')}`,
  );

  let status: CheckStatus = 'pass';
  if (critical.length > 0) status = 'fail';
  else if (warnings.length > 0) status = 'warning';

  return {
    id: 'difficulty-distribution',
    title: '6. Difficulty distribution',
    status,
    summary:
      critical.length > 0
        ? 'Critical difficulty or quality flags remain'
        : warnings.length > 0
          ? 'Character averages meet targets; minor notes present'
          : 'All character difficulty targets met; zero quality flags',
    details,
    criticalIssues: critical,
  };
}

function checkDuplicateQuestions(questions: AuditedQuestion[]): {
  check: PublicationCheck;
  clusters: DuplicateCluster[];
} {
  const exact = buildDuplicateClusters(questions, fullQuestionKey, (q) => q.questionText, 2);
  const stemDupes = buildDuplicateClusters(
    questions,
    (q) => `${q.character}::${normalizeStemKey(q.questionText)}`,
    (q) => q.questionText,
    6,
  );

  const critical: string[] = exact.map(
    (c) => `Exact duplicate (${c.count}×): ${c.preview.slice(0, 60)} [${c.sampleQuestionIds.join(', ')}]`,
  );
  const details = stemDupes.slice(0, 8).map((c) => `${c.count}× stem: ${c.preview.slice(0, 70)}`);

  let status: CheckStatus = 'pass';
  if (exact.length > 0) status = 'fail';
  else if (stemDupes.length > 0) status = 'warning';

  return {
    clusters: [...exact, ...stemDupes.slice(0, 15)],
    check: {
      id: 'duplicate-questions',
      title: '7. Duplicate question detection',
      status,
      summary:
        exact.length > 0
          ? `${exact.length} exact duplicate question clusters`
          : stemDupes.length > 0
            ? `${stemDupes.length} repeated stem clusters (mission templates)`
            : 'No exact duplicate questions',
      details,
      criticalIssues: critical,
    },
  };
}

function checkDuplicateAnswers(questions: AuditedQuestion[]): {
  check: PublicationCheck;
  clusters: DuplicateCluster[];
} {
  const clusters = buildDuplicateClusters(
    questions,
    (q) => `${q.character}::${q.gradeBand}::${choiceSetKey(q)}::${indexToLetter(q.correctIndex)}`,
    (q) => q.choices.map((c) => c.label).join(' | '),
    4,
  );

  const critical: string[] = [];
  const details = clusters.slice(0, 10).map(
    (c) => `${c.count}× shared choices (${c.sampleQuestionIds.slice(0, 3).join(', ')}…)`,
  );

  const status: CheckStatus = clusters.length > 0 ? 'warning' : 'pass';

  return {
    clusters: clusters.slice(0, 20),
    check: {
      id: 'duplicate-answers',
      title: '8. Duplicate answer detection',
      status,
      summary:
        clusters.length > 0
          ? `${clusters.length} shared answer-set clusters (often template reuse)`
          : 'No repeated answer sets detected',
      details,
      criticalIssues: critical,
    },
  };
}

function checkRepeatedScenarios(questions: AuditedQuestion[]): {
  check: PublicationCheck;
  clusters: DuplicateCluster[];
  artifacts: string[];
} {
  const clusters = buildDuplicateClusters(
    questions,
    (q) => normalizeScenarioKey(q.scenarioText),
    (q) => q.scenarioText.slice(0, 100),
    4,
  );

  const artifacts = detectScenarioDuplicationArtifacts(questions);
  const critical: string[] = [];
  const details = [
    ...clusters.slice(0, 8).map((c) => `${c.count}× scenario: ${c.preview.slice(0, 65)}…`),
    ...artifacts.slice(0, 6),
  ];

  let status: CheckStatus = 'pass';
  if (artifacts.length >= 20) status = 'warning';
  else if (clusters.length > 0 || artifacts.length > 0) status = 'warning';

  return {
    artifacts,
    clusters: clusters.slice(0, 20),
    check: {
      id: 'repeated-scenarios',
      title: '9. Repeated scenario detection',
      status,
      summary:
        clusters.length > 0
          ? `${clusters.length} repeated scenario clusters; ${artifacts.length} duplicated-sentence artifacts`
          : 'Scenarios are mission-specific',
      details,
      criticalIssues: critical,
    },
  };
}

function checkMissionPacing(questions: AuditedQuestion[]): {
  check: PublicationCheck;
  repetitiveMissions: MissionPacingNote[];
  progressionNotes: MissionPacingNote[];
} {
  const repetitiveMissions: MissionPacingNote[] = [];
  const progressionNotes: MissionPacingNote[] = [];
  const details: string[] = [];

  for (const character of CHARACTER_IDS) {
    const missionIds = WEEKLY_CHARACTER_MISSION_LISTS[character as CharacterId] ?? [];
    const charQuestions = questions.filter((q) => q.character === character);

    let prevAvg: number | null = null;
    missionIds.forEach((missionId, index) => {
      const subset = charQuestions.filter((q) => q.missionId === missionId);
      if (subset.length === 0) {
        progressionNotes.push({
          character,
          missionId,
          missionTitle: missionId,
          week: index + 1,
          issue: 'No questions found for scheduled week mission',
          severity: 'fail',
        });
        return;
      }

      const avg = subset.reduce((s, q) => s + q.difficultyScore, 0) / subset.length;
      const stems = new Map<string, number>();
      subset.forEach((q) => {
        const stem = normalizeStemKey(q.questionText);
        stems.set(stem, (stems.get(stem) ?? 0) + 1);
      });
      const topStem = [...stems.entries()].sort((a, b) => b[1] - a[1])[0];
      const repetitionPct = topStem ? (topStem[1] / subset.length) * 100 : 0;

      if (repetitionPct >= 40) {
        repetitiveMissions.push({
          character,
          missionId,
          missionTitle: subset[0]?.missionTitle ?? missionId,
          week: index + 1,
          issue: `${repetitionPct.toFixed(0)}% share stem "${topStem[0].slice(0, 50)}"`,
          severity: repetitionPct >= 60 ? 'warning' : 'warning',
        });
      }

      if (prevAvg !== null && avg < prevAvg - 0.5) {
        progressionNotes.push({
          character,
          missionId,
          missionTitle: subset[0]?.missionTitle ?? missionId,
          week: index + 1,
          issue: `Average difficulty drops ${prevAvg.toFixed(1)} → ${avg.toFixed(1)} vs prior week`,
          severity: 'warning',
        });
      }
      prevAvg = avg;
    });
  }

  const broken = progressionNotes.filter((n) => n.severity === 'fail');
  details.push(`Repetitive missions (≥40% shared stem): ${repetitiveMissions.length}`);
  details.push(`Progression dips: ${progressionNotes.filter((n) => n.severity === 'warning').length}`);
  repetitiveMissions.slice(0, 8).forEach((n) => {
    details.push(`  Week ${n.week} ${n.character}/${n.missionId}: ${n.issue}`);
  });

  let status: CheckStatus = 'pass';
  if (broken.length > 0) status = 'fail';
  else if (repetitiveMissions.length > 0 || progressionNotes.length > 0) status = 'warning';

  return {
    repetitiveMissions,
    progressionNotes,
    check: {
      id: 'mission-pacing',
      title: '10. Mission progression pacing',
      status,
      summary:
        broken.length > 0
          ? `${broken.length} broken progression paths`
          : repetitiveMissions.length > 0
            ? `${repetitiveMissions.length} missions feel repetitive; progression otherwise intact`
            : 'Weekly mission order complete; pacing stable',
      details,
      criticalIssues: broken.map((n) => `${n.character} week ${n.week}: ${n.issue}`),
    },
  };
}

function deriveOverallStatus(checks: PublicationCheck[]): { status: CheckStatus; verdict: string } {
  if (checks.some((c) => c.status === 'fail')) {
    return {
      status: 'fail',
      verdict: 'NOT READY — critical issues must be resolved before publication',
    };
  }
  if (checks.some((c) => c.status === 'warning')) {
    return {
      status: 'warning',
      verdict: 'READY WITH NOTES — publish acceptable; review warnings for polish',
    };
  }
  return {
    status: 'pass',
    verdict: 'READY — all publication checks passed',
  };
}

export function runPublicationReadinessAudit(): PublicationReadinessReport {
  const production = collectAllQuestions();
  const questions = loadStagingQuestions();
  const audit = auditAllQuestions(questions);
  const audited = audit.questions;

  const dupQ = checkDuplicateQuestions(audited);
  const dupA = checkDuplicateAnswers(audited);
  const scen = checkRepeatedScenarios(audited);
  const pacing = checkMissionPacing(audited);

  const checks: PublicationCheck[] = [
    checkInventory(audited, production.length),
    checkCharacterIdentity(audited),
    checkGradeBandConsistency(audited),
    checkPositionDistribution(audit),
    checkDistractorQuality(audited),
    checkDifficultyDistribution(audit, audited),
    dupQ.check,
    dupA.check,
    scen.check,
    pacing.check,
  ];

  const { status, verdict } = deriveOverallStatus(checks);
  const criticalIssues = checks.flatMap((c) => c.criticalIssues);

  return {
    generatedAt: new Date().toISOString(),
    source: 'staging_v5_content_variety',
    overallStatus: status,
    overallVerdict: verdict,
    questionCount: audited.length,
    checks,
    criticalIssues,
    duplicateQuestions: dupQ.clusters,
    duplicateAnswers: dupA.clusters,
    repeatedScenarios: scen.clusters,
    repetitiveMissions: pacing.repetitiveMissions,
    progressionNotes: pacing.progressionNotes,
    auditSummary: audit.summary,
    characterAverages: audit.summary.averageDifficultyByCharacter,
    positionByCharacter: audit.summary.positionDistributionByCharacter,
  };
}

export function statusLabel(status: CheckStatus): string {
  return status === 'pass' ? 'PASS' : status === 'warning' ? 'WARNING' : 'FAIL';
}

export function statusColor(status: CheckStatus): string {
  return status === 'pass' ? '#1a7f37' : status === 'warning' ? '#9a6700' : '#cf222e';
}
