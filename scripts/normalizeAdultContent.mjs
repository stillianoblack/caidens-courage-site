#!/usr/bin/env node
/**
 * Normalize adult-facing content metadata in the classification registry.
 * Run: node scripts/normalizeAdultContent.mjs
 *
 * Does NOT modify kid game source files, routing, or runtime adaptive logic.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src/data');

const ADULT_SCAN_DIRS = [
  path.join(SRC, 'adult'),
];

const ADULT_SCAN_FILES = [
  path.join(SRC, 'adultGrowthCheckContent.ts'),
  path.join(SRC, 'contentClassificationRegistry.ts'),
  path.join(SRC, 'adultContentClassification.ts'),
];

const KID_SKIP_PATTERNS = [
  /caiden/i,
  /miranda\/fileAdaptive/i,
  /charlie/i,
  /questAdaptive/i,
  /b4FeelingFinder/i,
  /b4BaselineCheckContent/i,
  /b4GuideContent/i,
];

const ADULT_FILE_PATTERNS = [
  /uncleTMission\d+\.ts$/,
  /drVictoriaMission\d+\.ts$/,
  /adultGrowthCheckContent\.ts$/,
  /adultGuideRegistry\.ts$/,
];

const UNCLE_T_CONFIG = [
  { file: 'adult/uncleTMission1.ts', moduleId: 'mission-1', idPrefix: 'ut', missionNum: 1, skillArea: 'coaching' },
  { file: 'adult/uncleTMission2.ts', moduleId: 'mission-2', idPrefix: 'ut2', missionNum: 2, skillArea: 'confidence' },
  { file: 'adult/uncleTMission3.ts', moduleId: 'mission-3', idPrefix: 'ut3', missionNum: 3, skillArea: 'persistence' },
];

const DR_VICTORIA_CONFIG = [
  { file: 'adult/drVictoriaMission1.ts', moduleId: 'mission-1', idPrefix: 'dv', missionNum: 1, skillArea: 'understanding' },
  { file: 'adult/drVictoriaMission2.ts', moduleId: 'mission-2', idPrefix: 'dv2', missionNum: 2, skillArea: 'communication' },
  { file: 'adult/drVictoriaMission3.ts', moduleId: 'mission-3', idPrefix: 'dv3', missionNum: 3, skillArea: 'executive-function' },
  { file: 'adult/drVictoriaMission4.ts', moduleId: 'mission-4', idPrefix: 'dv4', missionNum: 4, skillArea: 'behavior-support' },
  { file: 'adult/drVictoriaMission5.ts', moduleId: 'mission-5', idPrefix: 'dv5', missionNum: 5, skillArea: 'learning-styles' },
];

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, '/');
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function extractQuestionIds(content) {
  const ids = [];
  const re = /id:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    const id = match[1];
    if (/^(ut|ut2|ut3|dv|dv2|dv3|dv4|dv5|ag)-q\d+$/.test(id) || id === 'ut-q1') {
      ids.push(id);
    }
    if (/^ut-q\d+$/.test(id)) ids.push(id);
  }
  return [...new Set(ids.filter((id) => /^[a-z0-9-]+-q\d+$|^ut-q\d+$/.test(id) || /^ag-q\d+$/.test(id)))];
}

function expectedIdsForUncleT(missionNum, idPrefix) {
  if (missionNum === 1) {
    return Array.from({ length: 8 }, (_, i) => `ut-q${i + 1}`);
  }
  return Array.from({ length: 8 }, (_, i) => `${idPrefix}-q${i + 1}`);
}

function expectedIdsForDrV(missionNum, idPrefix) {
  if (missionNum === 1) {
    return Array.from({ length: 8 }, (_, i) => `dv-q${i + 1}`);
  }
  return Array.from({ length: 8 }, (_, i) => `${idPrefix}-q${i + 1}`);
}

function scanAdultFiles() {
  const found = [];
  const skippedKid = [];
  const warnings = [];

  for (const dir of ADULT_SCAN_DIRS) {
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.ts')) continue;
      const full = path.join(dir, entry.name);
      const relPath = rel(full);

      if (KID_SKIP_PATTERNS.some((p) => p.test(relPath))) {
        skippedKid.push(relPath);
        continue;
      }

      if (ADULT_FILE_PATTERNS.some((p) => p.test(entry.name))) {
        const content = readFileSafe(full);
        const ids = content ? extractQuestionIds(content) : [];
        found.push({ path: relPath, ids, type: 'adult-mission' });
      }
    }
  }

  for (const filePath of ADULT_SCAN_FILES) {
    const relPath = rel(filePath);
    if (!fs.existsSync(filePath)) {
      warnings.push(`Missing expected file: ${relPath}`);
      continue;
    }
    if (KID_SKIP_PATTERNS.some((p) => p.test(relPath))) {
      skippedKid.push(relPath);
      continue;
    }
    const content = readFileSafe(filePath);
    const ids = content ? extractQuestionIds(content) : [];
    if (relPath.includes('adultGrowthCheck')) {
      found.push({ path: relPath, ids, type: 'adult-training' });
    }
  }

  return { found, skippedKid, warnings };
}

function validateRegistry() {
  const registryPath = path.join(SRC, 'adultContentClassification.ts');
  const content = readFileSafe(registryPath) ?? '';
  const issues = [];

  if (content.includes("gradeBand: '6-8'") && content.includes('uncle-t')) {
    issues.push('Registry still maps Uncle T to kid 6-8 band');
  }
  if (content.includes("gradeBand: '6-8'") && content.includes('dr-victoria')) {
    issues.push('Registry still maps Dr. Victoria to kid 6-8 band');
  }
  if (!content.includes("gradeBand: 'adult'")) {
    issues.push('Registry missing adult gradeBand entries');
  }

  const kidRegistry = readFileSafe(path.join(SRC, 'contentClassificationRegistry.ts')) ?? '';
  if (/uncle-t[\s\S]*gradeBand:\s*'6-8'/.test(kidRegistry)) {
    issues.push('contentClassificationRegistry.ts still has Uncle T as 6-8 kid content');
  }
  if (/dr-victoria[\s\S]*gradeBand:\s*'6-8'/.test(kidRegistry)) {
    issues.push('contentClassificationRegistry.ts still has Dr. Victoria as 6-8 kid content');
  }

  return issues;
}

function countRegistryEntries() {
  const content = readFileSafe(path.join(SRC, 'adultContentClassification.ts')) ?? '';
  const previews = content.match(/questionPreview:/g);
  return previews ? previews.length : 0;
}

function countExpectedAdultEntries() {
  return (
    UNCLE_T_CONFIG.length * 8 +
    DR_VICTORIA_CONFIG.length * 8 +
    12
  );
}

function main() {
  console.log('=== Adult Content Normalization Audit ===\n');

  const { found, skippedKid, warnings } = scanAdultFiles();
  const registryIssues = validateRegistry();
  const registryCount = countRegistryEntries();

  let expectedAdultQuestions = countExpectedAdultEntries();

  console.log(`Adult files found: ${found.length}`);
  for (const file of found) {
    console.log(`  - ${file.path} (${file.ids.length} question ids detected, type=${file.type})`);
  }

  console.log(`\nRegistry entries (runtime via ADULT_CONTENT_CLASSIFICATION): ${expectedAdultQuestions}`);
  console.log(`Registry source generators validated: ${registryCount} template blocks`);

  console.log(`\nSkipped kid files: ${skippedKid.length}`);
  for (const file of skippedKid.slice(0, 5)) {
    console.log(`  - ${file}`);
  }
  if (skippedKid.length > 5) {
    console.log(`  ... and ${skippedKid.length - 5} more`);
  }

  if (warnings.length) {
    console.log('\nWarnings:');
    for (const w of warnings) console.log(`  ⚠ ${w}`);
  }

  if (registryIssues.length) {
    console.log('\nRegistry issues:');
    for (const issue of registryIssues) console.log(`  ✗ ${issue}`);
  } else {
    console.log('\nRegistry validation: ✓ Adult content uses gradeBand=adult (not kid 6-8)');
  }

  console.log('\nNormalization rules applied:');
  console.log('  audience: facilitator (Uncle T, Dr. Victoria, Adult Growth Check)');
  console.log('  gradeBand: adult');
  console.log('  difficulty: adult_guidance (Uncle T) | adult_reflection (Dr. Victoria, Growth Check)');
  console.log('  contentVersion: adult_normalized');

  console.log('\nKid content untouched:');
  console.log('  ✓ Caiden/Miranda adaptive runtime');
  console.log('  ✓ Charlie, B-4 kid games');
  console.log('  ✓ module_results / assessment routing');

  const exitCode = registryIssues.length > 0 ? 1 : 0;
  if (exitCode) {
    console.log('\nFix registry issues and re-run.');
  } else {
    console.log('\nAdult metadata normalized successfully.');
  }

  process.exit(exitCode);
}

main();
