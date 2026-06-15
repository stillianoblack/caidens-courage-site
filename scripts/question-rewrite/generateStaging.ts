#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { collectAllQuestions } from '../question-audit/collectQuestions';
import { balanceCorrectPositions } from './positionBalancer';
import { rewriteQuestion, selectCaidenMathTargetIds } from './rewriteEngine';
import type { StagingManifest } from './types';

const ROOT = path.resolve(__dirname, '../..');
const STAGING_DIR = path.join(ROOT, 'src/data/staging');
const MANIFEST_PATH = path.join(STAGING_DIR, 'manifest.json');

function main(): void {
  console.log('[rewrite:staging] Collecting production questions…');
  const questions = collectAllQuestions();
  console.log(`[rewrite:staging] Found ${questions.length} questions`);

  const mathTargetIds = selectCaidenMathTargetIds(questions);
  console.log(`[rewrite:staging] Caiden math enhancement targets: ${mathTargetIds.size}`);

  const groups = new Map<string, typeof questions>();
  for (const q of questions) {
    const key = `${q.character}::${q.missionId}`;
    const list = groups.get(key) ?? [];
    list.push(q);
    groups.set(key, list);
  }

  const overrides: StagingManifest['overrides'] = {};
  const beforeSnapshots: StagingManifest['beforeSnapshots'] = {};

  for (const [, group] of groups) {
    group.sort((a, b) => a.questionId.localeCompare(b.questionId));
    const positions = balanceCorrectPositions(group.length);
    group.forEach((question, index) => {
      const { override, before } = rewriteQuestion(question, positions[index], mathTargetIds);
      overrides[question.questionId] = override;
      beforeSnapshots[question.questionId] = before;
    });
  }

  const manifest: StagingManifest = {
    generatedAt: new Date().toISOString(),
    version: 'adaptive_staging_v3',
    totalQuestions: questions.length,
    overrides,
    beforeSnapshots,
  };

  if (!fs.existsSync(STAGING_DIR)) {
    fs.mkdirSync(STAGING_DIR, { recursive: true });
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`[rewrite:staging] Wrote ${MANIFEST_PATH}`);
  console.log(`[rewrite:staging] Total overrides: ${Object.keys(overrides).length}`);
}

main();
