import { analyzeWeakDistractors, weakDistractorLabel } from './distractorAnalysis';
import type {
  AuditedQuestion,
  BankAuditFinding,
  BankAuditSummary,
  BankIssueCounts,
  CanonicalSkill,
  DifficultyLabel,
  DuplicateAction,
  DuplicateGroupReport,
  HealthScores,
  NormalizedQuestion,
  RewritePriorityEntry,
} from './types';

const CANONICAL_SKILLS: CanonicalSkill[] = [
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
];

const VALID_CHARACTER_DISPLAY: Record<string, string> = {
  caiden: 'Caiden',
  miranda: 'Miranda',
  zeke: 'Zeke',
  charlie: 'Charlie Perk',
  b4: 'B-4',
  marcus: 'Marcus',
  'uncle-t': 'Uncle T',
  victoria: 'Dr. Victoria',
  'dr-victoria': 'Dr. Victoria',
};

const CAIDEN_MISSPELLING = /\b(caden|kayden|kaden|caidan|cayden|kaiden|cadan)\b/gi;

const OBVIOUS_MORAL_PATTERNS = [
  /\bwhat should\b/i,
  /\bwhich is best\b/i,
  /\bwhat is the right thing\b/i,
  /\bwhat should they do\b/i,
  /\bwhich choice is best\b/i,
];

const PLACEHOLDER_EXPLANATION = 'Review explanation needed before publishing.';

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function answerSetKey(question: NormalizedQuestion): string {
  const labels = question.choices.map((choice) => normalizeText(choice.label)).sort();
  return labels.join('|');
}

export function inferDifficultyFromGradeBand(gradeBand: NormalizedQuestion['gradeBand']): DifficultyLabel {
  if (gradeBand === 'K-1' || gradeBand === '2-3') return 'easy';
  if (gradeBand === '4-5') return 'medium';
  if (gradeBand === '6-8') return 'hard';
  if (gradeBand === 'adult') return 'medium';
  return 'unknown';
}

export function mapToCanonicalSkill(question: NormalizedQuestion): CanonicalSkill | 'Other' {
  const blob = [
    question.skillArea,
    ...question.skillTags,
    question.questionText,
    question.scenarioText,
    question.questionType,
  ]
    .join(' ')
    .toLowerCase();

  if (/executive|focus move|planning|priorit|task initiation|working memory/.test(blob)) {
    return 'Executive Function';
  }
  if (/self.?regulat|emotion|calm|feelings|mood/.test(blob)) {
    return 'Self Regulation';
  }
  if (/communicat|listen|speak|express/.test(blob)) {
    return 'Communication';
  }
  if (/team|cooperat|collaborat|group/.test(blob)) {
    return 'Teamwork';
  }
  if (/problem.?solv|strategy|solution|debug/.test(blob)) {
    return 'Problem Solving';
  }
  if (/empathy|kind|support|understand others/.test(blob)) {
    return 'Empathy';
  }
  if (/focus recover|reset|return|attention recover/.test(blob)) {
    return 'Focus Recovery';
  }
  if (/courage|brave|bravery/.test(blob)) {
    return 'Courage';
  }
  if (/read|passage|comprehen|infer|context clue|miranda/.test(blob)) {
    return 'Reading Comprehension';
  }
  if (/math|number|quantit|minute|hour|budget|token|coin|percent/.test(blob)) {
    return 'Math Reasoning';
  }
  return 'Other';
}

function scanCaidenMisspellings(text: string): string[] {
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(CAIDEN_MISSPELLING.source, 'gi');
  while ((match = regex.exec(text)) !== null) {
    if (match[0].toLowerCase() !== 'caiden') {
      matches.push(match[0]);
    }
  }
  return matches;
}

export function hasMissingMetadata(question: NormalizedQuestion): string[] {
  const missing: string[] = [];
  if (!question.questionId?.trim()) missing.push('id');
  if (!question.character?.trim()) missing.push('character');
  if (!question.gradeBand) missing.push('grade_band');
  if (!question.skillTags.length && !question.skillArea) missing.push('skill');
  if (question.difficulty === 'unknown' && !question.metadataInferred) missing.push('difficulty');
  if (!question.scenarioText?.trim()) missing.push('scenario');
  if (!question.questionText?.trim()) missing.push('question');
  if (!question.choices.length) missing.push('answers');
  if (!question.correctAnswerLabel?.trim()) missing.push('correct_answer');
  const explanation = question.explanation?.trim();
  if (!explanation || explanation === PLACEHOLDER_EXPLANATION) missing.push('explanation');
  return missing;
}

function isMetadataOnlyMissing(missing: string[]): boolean {
  return missing.length > 0 && missing.every((field) =>
    ['difficulty', 'explanation', 'skill'].includes(field),
  );
}

function perQuestionBankFlags(question: NormalizedQuestion): BankAuditFinding[] {
  const findings: BankAuditFinding[] = [];
  if (question.excludedFromHealthScore) return findings;

  const combined = `${question.scenarioText} ${question.questionText} ${question.choices.map((c) => c.label).join(' ')}`;

  for (const misspelling of scanCaidenMisspellings(combined)) {
    findings.push({
      code: 'caiden_spelling_issue',
      severity: 'warning',
      category: 'production_content',
      questionId: question.questionId,
      message: `Misspelling "${misspelling}" — correct spelling is Caiden`,
    });
  }

  const display = VALID_CHARACTER_DISPLAY[question.character.toLowerCase()];
  if (!display && !['adult', 'facilitator'].includes(question.character)) {
    findings.push({
      code: 'invalid_character_name',
      severity: 'info',
      category: 'production_content',
      questionId: question.questionId,
      message: `Character "${question.character}" is not in the approved roster`,
    });
  }

  for (const pattern of OBVIOUS_MORAL_PATTERNS) {
    if (pattern.test(question.questionText)) {
      findings.push({
        code: 'potentially_obvious_answer',
        severity: 'warning',
        category: 'production_content',
        questionId: question.questionId,
        message: 'Potentially obvious answer question',
      });
      break;
    }
  }

  const weakReasons = analyzeWeakDistractors(question);
  for (const reason of weakReasons) {
    findings.push({
      code:
        reason === 'repeated_option'
          ? 'duplicate_answer_options'
          : reason === 'correct_answer_clue_words'
            ? 'correct_answer_clue_words'
            : reason === 'correct_answer_too_long'
              ? 'correct_answer_longer_than_distractors'
              : 'obviously_wrong_distractors',
      severity: 'warning',
      category: 'weak_distractor',
      questionId: question.questionId,
      message: weakDistractorLabel(reason),
      details: { weakDistractorReason: reason },
    });
  }

  const missing = hasMissingMetadata(question);
  if (missing.length) {
    findings.push({
      code: 'missing_metadata',
      severity: missing.includes('id') || missing.includes('question') ? 'critical' : 'warning',
      category: isMetadataOnlyMissing(missing) ? 'metadata_only' : 'production_content',
      questionId: question.questionId,
      message: `Missing metadata: ${missing.join(', ')}`,
      details: { missingFields: missing },
    });
  }

  return findings;
}

type GroupedDuplicate = {
  key: string;
  questionIds: string[];
  sampleText: string;
};

function groupDuplicates(
  questions: NormalizedQuestion[],
  keyFn: (q: NormalizedQuestion) => string,
  sampleFn: (q: NormalizedQuestion) => string,
): GroupedDuplicate[] {
  const groups = new Map<string, string[]>();
  const samples = new Map<string, string>();

  for (const question of questions) {
    const key = keyFn(question);
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(question.questionId);
    groups.set(key, list);
    if (!samples.has(key)) samples.set(key, sampleFn(question));
  }

  return Array.from(groups.entries())
    .filter(([, ids]) => ids.length > 1)
    .map(([key, questionIds]) => ({
      key,
      questionIds,
      sampleText: samples.get(key) ?? '',
    }));
}

function classifyDuplicateGroup(
  group: GroupedDuplicate,
  questions: NormalizedQuestion[],
): DuplicateGroupReport {
  const matched = questions.filter((q) => group.questionIds.includes(q.questionId));
  const sources = [...new Set(matched.map((q) => q.source))];
  const characters = [...new Set(matched.map((q) => q.character))];
  const gradeBands = [...new Set(matched.map((q) => q.gradeBand))];

  let action: DuplicateAction = 'needs_human_review';
  let rationale = 'Review duplicate group before merging or removing.';

  const allStaging = sources.every((source) => source === 'staging_override');
  const hasStaging = sources.includes('staging_override');
  const hasProduction = sources.includes('adaptive_mission') || sources.includes('adult_training');

  if (allStaging) {
    action = 'staging_duplicate_only';
    rationale = 'All copies are staging overrides — excluded from production health score.';
  } else if (hasStaging && hasProduction) {
    action = 'staging_duplicate_only';
    rationale = 'Staging override mirrors production content for testing — not a production failure.';
  } else if (characters.length > 1 || gradeBands.length > 1) {
    action = 'keep_different_context';
    rationale = 'Same text reused across different character or grade-band contexts — keep unless intentionally unified.';
  } else if (group.questionIds.length === 2) {
    action = 'safe_to_merge';
    rationale = 'Exact duplicate within the same character and grade band — candidate for merge.';
  }

  return {
    key: group.key,
    questionIds: group.questionIds,
    sampleText: group.sampleText,
    sources,
    characters,
    gradeBands,
    action,
    rationale,
  };
}

function buildDifficultyCounts(questions: NormalizedQuestion[]) {
  const counts: Record<string, Record<string, Record<DifficultyLabel, number>>> = {};

  for (const question of questions) {
    const band = question.gradeBand;
    const character = question.character;
    const skill = mapToCanonicalSkill(question);
    const difficulty = question.difficulty;

    counts[band] ??= {};
    counts[band][character] ??= {};
    counts[band][character][difficulty] = (counts[band][character][difficulty] ?? 0) + 1;

    const skillKey = `skill::${skill}`;
    counts[band][skillKey] ??= {};
    counts[band][skillKey][difficulty] = (counts[band][skillKey][difficulty] ?? 0) + 1;
  }

  return counts;
}

function flagPoorDifficultyDistribution(questions: NormalizedQuestion[]): BankAuditFinding[] {
  const findings: BankAuditFinding[] = [];
  const byBand = new Map<string, Record<DifficultyLabel, number>>();

  for (const question of questions.filter((q) => !q.excludedFromHealthScore)) {
    const bucket = byBand.get(question.gradeBand) ?? { easy: 0, medium: 0, hard: 0, unknown: 0 };
    bucket[question.difficulty] += 1;
    byBand.set(question.gradeBand, bucket);
  }

  for (const [band, counts] of byBand.entries()) {
    const total = counts.easy + counts.medium + counts.hard + counts.unknown;
    if (total < 10) continue;
    if (counts.hard === 0 && (band === '4-5' || band === '6-8')) {
      findings.push({
        code: 'poor_difficulty_distribution',
        severity: 'warning',
        category: 'production_content',
        message: `Grade ${band} has no Hard questions (${counts.easy} easy, ${counts.medium} medium)`,
        details: { gradeBand: band, counts },
      });
    }
  }

  return findings;
}

function emptyIssueCounts(): BankIssueCounts {
  return {
    duplicateQuestions: 0,
    duplicateScenarios: 0,
    duplicateAnswerSets: 0,
    sameQuestionDifferentIds: 0,
    nearDuplicateQuestions: 0,
    caidenSpellingIssues: 0,
    obviousAnswerWarnings: 0,
    highScenarioDuplication: 0,
    weakDistractorWarnings: 0,
    missingMetadata: 0,
    skillsUnderMinimum: 0,
  };
}

function countFindings(findings: BankAuditFinding[]): BankIssueCounts {
  return {
    duplicateQuestions: findings.filter((f) =>
      ['exact_duplicate_question', 'same_question_text_different_ids'].includes(f.code),
    ).length,
    duplicateScenarios: findings.filter((f) => f.code === 'exact_duplicate_scenario').length,
    duplicateAnswerSets: findings.filter((f) => f.code === 'exact_duplicate_answer_set').length,
    sameQuestionDifferentIds: findings.filter((f) => f.code === 'same_question_text_different_ids').length,
    nearDuplicateQuestions: findings.filter((f) => f.code === 'near_duplicate_question').length,
    caidenSpellingIssues: findings.filter((f) => f.code === 'caiden_spelling_issue').length,
    obviousAnswerWarnings: findings.filter((f) => f.code === 'potentially_obvious_answer').length,
    highScenarioDuplication: findings.filter((f) => f.code === 'high_scenario_duplication').length,
    weakDistractorWarnings: findings.filter((f) => f.category === 'weak_distractor').length,
    missingMetadata: findings.filter((f) => f.code === 'missing_metadata').length,
    skillsUnderMinimum: 0,
  };
}

function computeHealthScores(
  production: NormalizedQuestion[],
  productionFindings: BankAuditFinding[],
  issueCounts: BankIssueCounts,
  duplicateActionPlan: BankAuditSummary['duplicateActionPlan'],
): HealthScores {
  const prodTotal = Math.max(production.length, 1);
  const scoredProduction = production.filter((q) => !q.excludedFromHealthScore);

  const metadataComplete = scoredProduction.filter((q) => hasMissingMetadata(q).length === 0).length;
  const metadataCompleteness = Math.round((metadataComplete / prodTotal) * 100);

  const weakCount = productionFindings.filter((f) => f.category === 'weak_distractor').length;
  const distractorQuality = Math.max(0, Math.round(100 - (weakCount / prodTotal) * 100));

  const highDup = issueCounts.highScenarioDuplication;
  const scenarioVariety = Math.max(0, Math.round(100 - highDup * 2));

  let productionContent = 100;
  const documentedDuplicateGroups = duplicateActionPlan.filter(
    (g) => g.action === 'keep_different_context' || g.action === 'staging_duplicate_only',
  ).length;
  const duplicatePenaltyGroups = Math.max(0, issueCounts.duplicateQuestions - Math.floor(documentedDuplicateGroups / 2));
  productionContent -= Math.min(25, duplicatePenaltyGroups * 2);
  productionContent -= Math.min(20, issueCounts.duplicateScenarios * 1.5);
  productionContent -= Math.min(15, issueCounts.caidenSpellingIssues * 3);
  productionContent -= Math.min(20, (weakCount / prodTotal) * 100);
  productionContent -= Math.min(10, issueCounts.obviousAnswerWarnings);
  productionContent = Math.max(0, Math.min(100, Math.round(productionContent)));

  const overall = Math.round(
    productionContent * 0.4 +
      metadataCompleteness * 0.2 +
      distractorQuality * 0.2 +
      scenarioVariety * 0.2,
  );

  return {
    overall,
    productionContent,
    metadataCompleteness,
    distractorQuality,
    scenarioVariety,
  };
}

function buildRecommendations(summary: BankAuditSummary): string[] {
  const recs: string[] = [];
  const prod = summary.classifiedCounts.production;

  if (summary.classifiedCounts.trueDuplicate > 0) {
    recs.push(`Resolve ${summary.classifiedCounts.trueDuplicate} true production duplicate groups before publish.`);
  }
  if (prod.duplicateScenarios > 0) {
    recs.push(`Reduce ${prod.duplicateScenarios} repeated production scenario stems (target ≤3 uses per stem).`);
  }
  if (prod.caidenSpellingIssues > 0) {
    recs.push('Fix Caiden spelling variations — canonical spelling is "Caiden".');
  }
  if (prod.weakDistractorWarnings > 0) {
    recs.push('Improve distractor quality — replace joke, villain, and giveaway answers with plausible tradeoffs.');
  }
  if (summary.classifiedCounts.metadataOnly > 0) {
    recs.push(`Backfill metadata on ${summary.classifiedCounts.metadataOnly} questions (explanation, difficulty, skill tags).`);
  }

  for (const skill of summary.skillsUnderMinimum) {
    recs.push(`Add more ${skill} questions (currently below 10).`);
  }

  if (prod.highScenarioDuplication > 0) {
    recs.push('Reduce duplicate scenario stems — vary story openings and contexts.');
  }

  const stagingDupes = summary.duplicateActionPlan.filter((g) => g.action === 'staging_duplicate_only').length;
  if (stagingDupes > 0) {
    recs.push(`${stagingDupes} duplicate groups are staging-only — tracked separately from production health.`);
  }

  if (!recs.length) {
    recs.push('Question bank meets baseline publication checks. Continue spot-reviewing high-priority rewrites.');
  }

  return [...new Set(recs)];
}

function buildRewritePriority(
  questions: NormalizedQuestion[],
  findings: BankAuditFinding[],
): RewritePriorityEntry[] {
  const production = questions.filter(
    (q) => (q.source === 'adaptive_mission' || q.source === 'adult_training') && !q.excludedFromHealthScore,
  );

  const findingsByQuestion = new Map<string, BankAuditFinding[]>();
  for (const finding of findings) {
    if (!finding.questionId) continue;
    const list = findingsByQuestion.get(finding.questionId) ?? [];
    list.push(finding);
    findingsByQuestion.set(finding.questionId, list);
  }

  const scenarioCounts = new Map<string, number>();
  for (const question of production) {
    const stem = normalizeText(question.scenarioText).slice(0, 80);
    if (!stem) continue;
    scenarioCounts.set(stem, (scenarioCounts.get(stem) ?? 0) + 1);
  }

  const scored = production.map((question) => {
    const qFindings = findingsByQuestion.get(question.questionId) ?? [];
    const stem = normalizeText(question.scenarioText).slice(0, 80);
    const stemCount = scenarioCounts.get(stem) ?? 1;

    let priorityScore = 0;
    const issueReasons: string[] = [];

    if (stemCount > 3) {
      priorityScore += stemCount * 3;
      issueReasons.push(`Scenario stem reused ${stemCount} times`);
    }
    if (qFindings.some((f) => f.category === 'weak_distractor')) {
      priorityScore += 12;
      issueReasons.push(
        ...qFindings
          .filter((f) => f.category === 'weak_distractor')
          .map((f) => f.message),
      );
    }
    if (qFindings.some((f) => f.code === 'missing_metadata')) {
      priorityScore += 6;
      issueReasons.push('Missing metadata fields');
    }
    if (qFindings.some((f) => f.code === 'potentially_obvious_answer')) {
      priorityScore += 10;
      issueReasons.push('Potentially obvious answer pattern');
    }
    if (qFindings.some((f) => f.code === 'same_question_text_different_ids')) {
      priorityScore += 8;
      issueReasons.push('Duplicate question text with different IDs');
    }

    if (question.week !== null && question.week <= 2) {
      priorityScore += 4;
    }

    let suggestedRewriteDirection = 'Tighten scenario specificity and balance answer plausibility.';
    if (issueReasons.some((r) => r.includes('Scenario stem'))) {
      suggestedRewriteDirection = 'Rewrite scenario opening with a fresh context while keeping the same skill target.';
    } else if (issueReasons.some((r) => r.includes('distractor') || r.includes('villain') || r.includes('Joke'))) {
      suggestedRewriteDirection = 'Replace weak distractors with plausible alternatives that reflect real tradeoffs.';
    } else if (issueReasons.some((r) => r.includes('obvious'))) {
      suggestedRewriteDirection = 'Reframe question to compare evidence or sequence steps instead of moral choice wording.';
    }

    return {
      question,
      priorityScore,
      issueReasons: [...new Set(issueReasons)],
      suggestedRewriteDirection,
    };
  });

  return scored
    .filter((row) => row.priorityScore > 0)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 50)
    .map((row, index) => ({
      rank: index + 1,
      questionId: row.question.questionId,
      character: row.question.character,
      missionId: row.question.missionId,
      gradeBand: row.question.gradeBand,
      week: row.question.week,
      source: row.question.source,
      scenarioText: row.question.scenarioText,
      questionText: row.question.questionText,
      choices: row.question.choices,
      correctAnswerLabel: row.question.correctAnswerLabel,
      issueReasons: row.issueReasons,
      suggestedRewriteDirection: row.suggestedRewriteDirection,
      priorityScore: row.priorityScore,
    }));
}

export function markStagingProductionDuplicates(questions: NormalizedQuestion[]): NormalizedQuestion[] {
  const productionKeys = new Set(
    questions
      .filter((q) => q.source === 'adaptive_mission')
      .map((q) => `${q.questionId}:${q.gradeBand}`),
  );

  return questions.map((question) => {
    if (question.source !== 'staging_override') return question;
    const key = `${question.questionId}:${question.gradeBand}`;
    if (!productionKeys.has(key)) return question;
    return {
      ...question,
      excludedFromHealthScore: true,
      mode: 'adaptive_staging',
    };
  });
}

export function runQuestionBankAudit(questions: NormalizedQuestion[]): BankAuditSummary {
  const withStagingFlags = markStagingProductionDuplicates(questions);
  const production = withStagingFlags.filter(
    (q) => (q.source === 'adaptive_mission' || q.source === 'adult_training') && !q.excludedFromHealthScore,
  );
  const staging = withStagingFlags.filter((q) => q.source === 'staging_override');
  const scoredQuestions = withStagingFlags.filter((q) => !q.excludedFromHealthScore);

  const findings: BankAuditFinding[] = [];

  for (const question of withStagingFlags) {
    findings.push(...perQuestionBankFlags(question));
  }

  const duplicateQuestionsProd = groupDuplicates(
    production,
    (q) => normalizeText(q.questionText),
    (q) => q.questionText,
  );
  const duplicateQuestionsAll = groupDuplicates(
    withStagingFlags,
    (q) => normalizeText(q.questionText),
    (q) => q.questionText,
  );

  for (const group of duplicateQuestionsProd) {
    const differentIds = new Set(group.questionIds).size > 1;
    findings.push({
      code: differentIds ? 'same_question_text_different_ids' : 'exact_duplicate_question',
      severity: 'warning',
      category: 'true_duplicate',
      message: differentIds
        ? `Identical question text across ${group.questionIds.length} production IDs`
        : `Exact duplicate production question (${group.questionIds.length} instances)`,
      details: { questionIds: group.questionIds, sample: group.sampleText },
    });
  }

  for (const group of duplicateQuestionsAll) {
    const matched = withStagingFlags.filter((q) => group.questionIds.includes(q.questionId));
    const sources = new Set(matched.map((q) => q.source));
    if (sources.has('staging_override') && sources.size > 1) {
      for (const question of matched.filter((q) => q.source === 'staging_override')) {
        findings.push({
          code: 'staging_production_duplicate',
          severity: 'info',
          category: 'staging_override',
          questionId: question.questionId,
          message: 'Staging override duplicates production content (excluded from health score)',
        });
      }
    }
  }

  const nearDuplicateQuestions = groupDuplicates(
    production,
    (q) => normalizeText(q.questionText).split(' ').slice(0, 8).join(' '),
    (q) => q.questionText,
  ).filter((g) => g.questionIds.length > 1 && !duplicateQuestionsProd.some((d) => d.key === normalizeText(g.sampleText)));

  for (const group of nearDuplicateQuestions) {
    findings.push({
      code: 'near_duplicate_question',
      severity: 'info',
      category: 'true_duplicate',
      message: `Near-duplicate question stems (${group.questionIds.length})`,
      details: { questionIds: group.questionIds, sample: group.sampleText },
    });
  }

  const duplicateScenariosProd = groupDuplicates(
    production,
    (q) => normalizeText(q.scenarioText),
    (q) => q.scenarioText.slice(0, 120),
  );
  for (const group of duplicateScenariosProd) {
    findings.push({
      code: 'exact_duplicate_scenario',
      severity: 'warning',
      category: 'true_duplicate',
      message: `Exact duplicate production scenario (${group.questionIds.length} questions)`,
      details: { questionIds: group.questionIds, sample: group.sampleText },
    });
  }

  const duplicateAnswerSets = groupDuplicates(production, answerSetKey, (q) => q.questionText);
  for (const group of duplicateAnswerSets) {
    findings.push({
      code: 'exact_duplicate_answer_set',
      severity: 'info',
      category: 'true_duplicate',
      message: `Exact duplicate answer set (${group.questionIds.length} questions)`,
      details: { questionIds: group.questionIds },
    });
  }

  const scenarioStems = new Map<string, { count: number; sample: string; questionIds: string[] }>();
  for (const question of production) {
    const stem = normalizeText(question.scenarioText).slice(0, 80);
    if (!stem) continue;
    const row = scenarioStems.get(stem) ?? { count: 0, sample: question.scenarioText.slice(0, 100), questionIds: [] };
    row.count += 1;
    row.questionIds.push(question.questionId);
    scenarioStems.set(stem, row);
  }

  let highScenarioDuplication = 0;
  for (const [, row] of scenarioStems.entries()) {
    if (row.count > 3) {
      highScenarioDuplication += 1;
      findings.push({
        code: 'high_scenario_duplication',
        severity: 'critical',
        category: 'production_content',
        message: `HIGH DUPLICATION WARNING — scenario stem appears ${row.count} times`,
        details: { count: row.count, sample: row.sample, questionIds: row.questionIds.slice(0, 10) },
      });
    }
  }

  findings.push(...flagPoorDifficultyDistribution(production));

  const skillCoverageMap = new Map<string, { skill: CanonicalSkill | 'Other'; character: string; count: number }>();
  for (const question of production) {
    const skill = mapToCanonicalSkill(question);
    const key = `${question.character}::${skill}`;
    const row = skillCoverageMap.get(key) ?? { skill, character: question.character, count: 0 };
    row.count += 1;
    skillCoverageMap.set(key, row);
  }

  const skillTotals = new Map<CanonicalSkill | 'Other', number>();
  for (const row of skillCoverageMap.values()) {
    skillTotals.set(row.skill, (skillTotals.get(row.skill) ?? 0) + row.count);
  }

  const skillsUnderMinimum = CANONICAL_SKILLS.filter((skill) => (skillTotals.get(skill) ?? 0) < 10);

  const productionFindings = findings.filter(
    (f) => f.category !== 'staging_override' && f.category !== 'metadata_only',
  );
  const stagingFindings = findings.filter((f) => f.category === 'staging_override');
  const metadataOnly = findings.filter((f) => f.category === 'metadata_only').length;
  const trueDuplicate = findings.filter((f) => f.category === 'true_duplicate').length;
  const weakDistractor = findings.filter((f) => f.category === 'weak_distractor').length;

  const issueCounts = countFindings(productionFindings);
  issueCounts.highScenarioDuplication = highScenarioDuplication;
  issueCounts.skillsUnderMinimum = skillsUnderMinimum.length;
  issueCounts.duplicateQuestions = duplicateQuestionsProd.length;
  issueCounts.duplicateScenarios = duplicateScenariosProd.length;
  issueCounts.duplicateAnswerSets = duplicateAnswerSets.length;
  issueCounts.nearDuplicateQuestions = nearDuplicateQuestions.length;

  const duplicateActionPlan = duplicateQuestionsAll.map((group) =>
    classifyDuplicateGroup(group, withStagingFlags),
  );

  const healthScores = computeHealthScores(production, productionFindings, issueCounts, duplicateActionPlan);

  const summary: BankAuditSummary = {
    healthScore: healthScores.overall,
    healthScores,
    issueCounts,
    classifiedCounts: {
      production: issueCounts,
      staging: countFindings(stagingFindings),
      metadataOnly,
      trueDuplicate,
      weakDistractor,
    },
    findings,
    difficultyCounts: buildDifficultyCounts(scoredQuestions),
    skillCoverage: Array.from(skillCoverageMap.values()).sort((a, b) => b.count - a.count),
    skillTotals: Object.fromEntries(skillTotals.entries()) as Record<CanonicalSkill | 'Other', number>,
    skillsUnderMinimum,
    duplicateQuestions: duplicateQuestionsProd,
    duplicateScenarios: duplicateScenariosProd,
    duplicateActionPlan,
    highDuplicationScenarios: Array.from(scenarioStems.values())
      .filter((row) => row.count > 3)
      .sort((a, b) => b.count - a.count),
    sourcesScanned: [...new Set(withStagingFlags.map((q) => q.source))],
    totalQuestions: withStagingFlags.length,
    productionQuestionCount: production.length,
    stagingQuestionCount: staging.length,
    recommendations: [],
    rewritePriority: [],
  };

  summary.recommendations = buildRecommendations(summary);
  summary.rewritePriority = buildRewritePriority(withStagingFlags, findings);

  return summary;
}

export function mergeBankFindingsIntoQuestions(
  questions: AuditedQuestion[],
  bankSummary: BankAuditSummary,
): AuditedQuestion[] {
  const byQuestionId = new Map<string, BankAuditFinding[]>();
  for (const finding of bankSummary.findings) {
    if (!finding.questionId) continue;
    const list = byQuestionId.get(finding.questionId) ?? [];
    list.push(finding);
    byQuestionId.set(finding.questionId, list);
  }

  return questions.map((question) => ({
    ...question,
    bankFindings: byQuestionId.get(question.questionId) ?? [],
    canonicalSkill: mapToCanonicalSkill(question),
    weakDistractorReasons: analyzeWeakDistractors(question),
  }));
}

export { PLACEHOLDER_EXPLANATION };
