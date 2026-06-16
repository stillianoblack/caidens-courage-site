#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { collectProductionQuestions } from './collectQuestions';
import { PLACEHOLDER_EXPLANATION } from './questionBankAudit';
import type { NormalizedQuestion } from './types';

const ROOT = path.resolve(__dirname, '../..');
const STAGING_MANIFEST_PATH = path.join(ROOT, 'src/data/staging/manifest.json');

type StagingOverride = {
  questionId: string;
  character: string;
  missionId: string;
  gradeBand: string;
  scenarioText: string;
  questionText: string;
  choices: string[];
  correctIndex: number;
  skillTags?: string[];
  hint?: string;
  explanation?: string;
  source_type?: string;
  excluded_from_health_score?: boolean;
  mode?: string;
  week_number?: number;
  content_version?: string;
  contentVersion?: string;
};

type StagingManifest = {
  generatedAt?: string;
  version?: string;
  totalQuestions?: number;
  overrides: Record<string, StagingOverride>;
};

function productionLookup(questions: NormalizedQuestion[]): Map<string, NormalizedQuestion> {
  const map = new Map<string, NormalizedQuestion>();
  for (const question of questions) {
    map.set(`${question.questionId}:${question.gradeBand}`, question);
    map.set(question.questionId, question);
  }
  return map;
}

function dedupeSkillTags(tags: string[] | undefined): string[] {
  if (!tags?.length) return [];
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
}

export type BackfillResult = {
  manifestPath: string;
  overridesUpdated: number;
  explanationsAdded: number;
  metadataFieldsAdded: number;
};

export function backfillQuestionMetadata(): BackfillResult {
  if (!fs.existsSync(STAGING_MANIFEST_PATH)) {
    return {
      manifestPath: STAGING_MANIFEST_PATH,
      overridesUpdated: 0,
      explanationsAdded: 0,
      metadataFieldsAdded: 0,
    };
  }

  const production = collectProductionQuestions().filter((q) => q.source === 'adaptive_mission');
  const lookup = productionLookup(production);
  const manifest = JSON.parse(fs.readFileSync(STAGING_MANIFEST_PATH, 'utf8')) as StagingManifest;

  let overridesUpdated = 0;
  let explanationsAdded = 0;
  let metadataFieldsAdded = 0;

  for (const [key, override] of Object.entries(manifest.overrides)) {
    const productionQuestion = lookup.get(`${override.questionId}:${override.gradeBand}`);
    let changed = false;

    if (!override.source_type) {
      override.source_type = 'staging_override';
      metadataFieldsAdded += 1;
      changed = true;
    }
    if (override.excluded_from_health_score !== true) {
      override.excluded_from_health_score = true;
      metadataFieldsAdded += 1;
      changed = true;
    }
    if (!override.mode) {
      override.mode = 'adaptive_staging';
      metadataFieldsAdded += 1;
      changed = true;
    }
    if (!override.content_version && !override.contentVersion) {
      override.content_version = 'adaptive_staging_v4_difficulty';
      metadataFieldsAdded += 1;
      changed = true;
    }
    if (override.week_number == null && productionQuestion?.week != null) {
      override.week_number = productionQuestion.week;
      metadataFieldsAdded += 1;
      changed = true;
    }

    const dedupedTags = dedupeSkillTags(override.skillTags);
    if (dedupedTags.length && dedupedTags.length !== (override.skillTags?.length ?? 0)) {
      override.skillTags = dedupedTags;
      changed = true;
    } else if (!override.skillTags?.length && productionQuestion?.skillTags.length) {
      override.skillTags = productionQuestion.skillTags;
      metadataFieldsAdded += 1;
      changed = true;
    }

    if (!override.explanation?.trim()) {
      const fromProduction = productionQuestion?.explanation?.trim();
      override.explanation =
        fromProduction && fromProduction !== PLACEHOLDER_EXPLANATION
          ? fromProduction
          : PLACEHOLDER_EXPLANATION;
      explanationsAdded += 1;
      changed = true;
    }

    if (!override.character && productionQuestion?.character) {
      override.character = productionQuestion.character;
      metadataFieldsAdded += 1;
      changed = true;
    }

    if (changed) {
      manifest.overrides[key] = override;
      overridesUpdated += 1;
    }
  }

  manifest.generatedAt = new Date().toISOString();
  fs.writeFileSync(STAGING_MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');

  return {
    manifestPath: STAGING_MANIFEST_PATH,
    overridesUpdated,
    explanationsAdded,
    metadataFieldsAdded,
  };
}

if (require.main === module) {
  const result = backfillQuestionMetadata();
  console.log('[backfill:metadata]', result);
}
