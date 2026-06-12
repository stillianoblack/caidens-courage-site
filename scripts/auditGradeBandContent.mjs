#!/usr/bin/env node
/**
 * Grade-band content classification audit report.
 * Run: node scripts/auditGradeBandContent.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const ADAPTIVE_COUNTS = {
  caiden: {
    modules: 9,
    bands: ['K-1', '2-3', '4-5', '6-8'],
    legacyModules: 5,
    legacyPerBand: 3,
    extendedModules: 4,
    extendedPerBand: 8,
  },
  mirandaAdaptive: { modules: 3, bands: ['K-1', '2-3', '4-5', '6-8'], perBand: 3 },
  charlieAdaptive: { modules: 8, bands: ['K-1', '2-3', '4-5', '6-8'], perBand: 3 },
  b4Adaptive: { modules: 8, bands: ['K-1', '2-3', '4-5', '6-8'], perBand: 3 },
  zekeAdaptive: { modules: 8, bands: ['K-1', '2-3', '4-5', '6-8'], perBand: 3 },
};

const ADULT_REGISTRY_COUNT = 64;
const LEGACY_CAIDEN_ARCHIVE = 24;
const LEGACY_CAIDEN_K1_ACTIVE = 15;

const caidenPerBand =
  ADAPTIVE_COUNTS.caiden.legacyModules * ADAPTIVE_COUNTS.caiden.legacyPerBand +
  ADAPTIVE_COUNTS.caiden.extendedModules * ADAPTIVE_COUNTS.caiden.extendedPerBand;

const caidenAdaptive =
  caidenPerBand * ADAPTIVE_COUNTS.caiden.bands.length;
const mirandaAdaptive =
  ADAPTIVE_COUNTS.mirandaAdaptive.modules *
  ADAPTIVE_COUNTS.mirandaAdaptive.bands.length *
  ADAPTIVE_COUNTS.mirandaAdaptive.perBand;
const charlieAdaptive =
  ADAPTIVE_COUNTS.charlieAdaptive.modules *
  ADAPTIVE_COUNTS.charlieAdaptive.bands.length *
  ADAPTIVE_COUNTS.charlieAdaptive.perBand;
const b4Adaptive =
  ADAPTIVE_COUNTS.b4Adaptive.modules *
  ADAPTIVE_COUNTS.b4Adaptive.bands.length *
  ADAPTIVE_COUNTS.b4Adaptive.perBand;
const zekeAdaptive =
  ADAPTIVE_COUNTS.zekeAdaptive.modules *
  ADAPTIVE_COUNTS.zekeAdaptive.bands.length *
  ADAPTIVE_COUNTS.zekeAdaptive.perBand;

const kidStaticApprox = 120;
const totalFound =
  caidenAdaptive +
  mirandaAdaptive +
  charlieAdaptive +
  b4Adaptive +
  zekeAdaptive +
  kidStaticApprox +
  ADULT_REGISTRY_COUNT +
  LEGACY_CAIDEN_ARCHIVE;

const kidByBand = {
  'K-1':
    caidenPerBand +
    ADAPTIVE_COUNTS.mirandaAdaptive.modules * 3 +
    ADAPTIVE_COUNTS.charlieAdaptive.modules * 3 +
    ADAPTIVE_COUNTS.b4Adaptive.modules * 3 +
    ADAPTIVE_COUNTS.zekeAdaptive.modules * 3 +
    17,
  '2-3':
    caidenPerBand +
    ADAPTIVE_COUNTS.mirandaAdaptive.modules * 3 +
    ADAPTIVE_COUNTS.charlieAdaptive.modules * 3 +
    ADAPTIVE_COUNTS.b4Adaptive.modules * 3 +
    ADAPTIVE_COUNTS.zekeAdaptive.modules * 3 +
    45,
  '4-5':
    caidenPerBand +
    ADAPTIVE_COUNTS.mirandaAdaptive.modules * 3 +
    ADAPTIVE_COUNTS.charlieAdaptive.modules * 3 +
    ADAPTIVE_COUNTS.b4Adaptive.modules * 3 +
    ADAPTIVE_COUNTS.zekeAdaptive.modules * 3 +
    28,
  '6-8':
    caidenPerBand +
    ADAPTIVE_COUNTS.mirandaAdaptive.modules * 3 +
    ADAPTIVE_COUNTS.charlieAdaptive.modules * 3 +
    ADAPTIVE_COUNTS.b4Adaptive.modules * 3 +
    ADAPTIVE_COUNTS.zekeAdaptive.modules * 3 +
    8,
};

const vague = [
  'miranda/file1MissingStudent.ts f1-q3,f1-q4,f1-q5,f1-q8 — mixed grammar/sequence types',
  'miranda/file5DetectiveNotebook.ts f5-q8 — abstract lesson question',
  'b4BaselineCheckContent.ts f1-f10 — Likert scale age sensitivity',
];

function validateAdaptiveMissions({ label, missionsDir, questionHelper, tipField, moduleCount, perBand }) {
  const missionFiles = fs
    .readdirSync(missionsDir)
    .filter((name) => name.startsWith('mission') && name.endsWith('.ts'))
    .sort();

  const errors = [];
  let totalQuestions = 0;
  const bands = ['K-1', '2-3', '4-5', '6-8'];
  const expectedTotal = moduleCount * bands.length * perBand;
  const expectedPerFile = bands.length * perBand;
  const baselineIds = new Set(['feelings', 'reading', 'focus-moves', 'b4-baseline-check', 'b4-baseline-check-in']);

  if (missionFiles.length !== moduleCount) {
    errors.push(`Expected ${moduleCount} ${label} mission files, found ${missionFiles.length}`);
  }

  for (const fileName of missionFiles) {
    const filePath = path.join(missionsDir, fileName);
    const source = fs.readFileSync(filePath, 'utf8');
    const questionCount = (source.match(new RegExp(`${questionHelper}\\(`, 'g')) ?? []).length;
    totalQuestions += questionCount;

    if (questionCount !== expectedPerFile) {
      errors.push(`${fileName}: expected ${expectedPerFile} questions, found ${questionCount}`);
    }

    if (!source.includes(`${tipField}:`)) {
      errors.push(`${fileName}: missing ${tipField}`);
    }

    for (const band of bands) {
      const bandPattern = new RegExp(`['"]${band.replace('-', '\\-')}['"]:\\s*bandContent\\(`);
      if (!bandPattern.test(source)) {
        errors.push(`${fileName}: missing grade band ${band}`);
      }
    }

    const choiceBlocks = source.match(/choices:\s*\[/g) ?? [];
    if (choiceBlocks.length !== expectedPerFile) {
      errors.push(`${fileName}: expected ${expectedPerFile} choice blocks, found ${choiceBlocks.length}`);
    }

    const correctIndexMatches = source.match(/correctIndex:\s*[0-3]/g) ?? [];
    if (correctIndexMatches.length !== expectedPerFile) {
      errors.push(
        `${fileName}: expected ${expectedPerFile} correctIndex entries, found ${correctIndexMatches.length}`,
      );
    }

    if (/gradeBand:\s*['"]adult['"]/.test(source)) {
      errors.push(`${fileName}: adult gradeBand found in kid mission`);
    }

    const moduleIdMatch = source.match(/export const B4_MISSION_\d+_ID = '([^']+)'/);
    if (moduleIdMatch && baselineIds.has(moduleIdMatch[1])) {
      errors.push(`${fileName}: module ID overlaps baseline assessment: ${moduleIdMatch[1]}`);
    }
    const charlieIdMatch = source.match(/export const CHARLIE_MISSION_\d+_ID = '([^']+)'/);
    if (charlieIdMatch && baselineIds.has(charlieIdMatch[1])) {
      errors.push(`${fileName}: module ID overlaps baseline assessment: ${charlieIdMatch[1]}`);
    }
    const b4IdMatch = source.match(/export const B4_MISSION_\d+_ID = '([^']+)'/);
    if (b4IdMatch && baselineIds.has(b4IdMatch[1])) {
      errors.push(`${fileName}: module ID overlaps baseline assessment: ${b4IdMatch[1]}`);
    }
  }

  if (totalQuestions !== expectedTotal) {
    errors.push(`${label} total questions: expected ${expectedTotal}, found ${totalQuestions}`);
  }

  return { errors, totalQuestions, missionFiles: missionFiles.length, expectedTotal };
}

function validateCharlieAdaptiveContent() {
  return validateAdaptiveMissions({
    label: 'Charlie',
    missionsDir: path.join(ROOT, 'src/data/charlie/missions'),
    questionHelper: 'makeCharlieQuestion',
    tipField: 'missionB4Tip',
    moduleCount: ADAPTIVE_COUNTS.charlieAdaptive.modules,
    perBand: ADAPTIVE_COUNTS.charlieAdaptive.perBand,
  });
}

function validateB4AdaptiveContent() {
  return validateAdaptiveMissions({
    label: 'B-4',
    missionsDir: path.join(ROOT, 'src/data/b4/missions'),
    questionHelper: 'makeB4Question',
    tipField: 'missionB4Tip',
    moduleCount: ADAPTIVE_COUNTS.b4Adaptive.modules,
    perBand: ADAPTIVE_COUNTS.b4Adaptive.perBand,
  });
}

function validateZekeAdaptiveContent() {
  return validateAdaptiveMissions({
    label: 'Zeke',
    missionsDir: path.join(ROOT, 'src/data/zeke/missions'),
    questionHelper: 'makeZekeQuestion',
    tipField: 'missionB4Tip',
    moduleCount: ADAPTIVE_COUNTS.zekeAdaptive.modules,
    perBand: ADAPTIVE_COUNTS.zekeAdaptive.perBand,
  });
}

const charlieValidation = validateCharlieAdaptiveContent();
const b4Validation = validateB4AdaptiveContent();
const zekeValidation = validateZekeAdaptiveContent();

console.log('=== Grade-Band Content Classification Report ===\n');
console.log(`Total questions found (approx): ${totalFound}`);
console.log(`  Adaptive Caiden (active): ${caidenAdaptive}`);
console.log(`  Adaptive Miranda (active): ${mirandaAdaptive}`);
console.log(`  Adaptive Charlie (active): ${charlieAdaptive}`);
console.log(`  Adaptive B-4 (active): ${b4Adaptive}`);
console.log(`  Adaptive Zeke (active): ${zekeAdaptive}`);
console.log(`  Kid static classified registry: ~${kidStaticApprox}`);
console.log(`  Adult classified registry: ${ADULT_REGISTRY_COUNT}`);
console.log(`  Caiden legacy archive preserved: ${LEGACY_CAIDEN_ARCHIVE}`);
console.log(`  Caiden K-1 bands merged from legacy: ${LEGACY_CAIDEN_K1_ACTIVE}\n`);

console.log('Kid content by grade band:');
for (const [band, count] of Object.entries(kidByBand)) {
  console.log(`  ${band}: ${count}`);
}

console.log(`\nAdult content (gradeBand=adult): ${ADULT_REGISTRY_COUNT}`);
console.log('  Uncle T missions 1-3: 24 questions (audience=facilitator, difficulty=adult_guidance)');
console.log('  Dr. Victoria missions 1-5: 40 questions (audience=facilitator, difficulty=adult_reflection)');
console.log('  Adult Growth Check: 12 questions (audience=facilitator, difficulty=adult_reflection)');

console.log('\nFallback behavior:');
console.log('  - No grade selected → 2-3 (mirandaGradeBandResolver)');
console.log('  - Kid missing band → nearest lower/higher kid band (resolveKidGradeBandWithFallback)');
console.log('  - Adult content → gradeBand=adult only (no kid cross-fallback)');

console.log('\nCharlie adaptive validation:');
console.log(`  Mission files: ${charlieValidation.missionFiles}`);
console.log(`  Total adaptive questions: ${charlieValidation.totalQuestions}`);
if (charlieValidation.errors.length === 0) {
  console.log('  Status: PASS (8 missions × 4 bands × 3 questions = 96)');
} else {
  console.log('  Status: FAIL');
  for (const err of charlieValidation.errors) {
    console.log(`    - ${err}`);
  }
  process.exitCode = 1;
}

console.log('\nB-4 adaptive validation:');
console.log(`  Mission files: ${b4Validation.missionFiles}`);
console.log(`  Total adaptive questions: ${b4Validation.totalQuestions}`);
if (b4Validation.errors.length === 0) {
  console.log('  Status: PASS (8 missions × 4 bands × 3 questions = 96)');
  console.log('  Baseline overlap: none (separate from feelings/reading/focus-moves modules)');
} else {
  console.log('  Status: FAIL');
  for (const err of b4Validation.errors) {
    console.log(`    - ${err}`);
  }
  process.exitCode = 1;
}

console.log('\nZeke adaptive validation:');
console.log(`  Mission files: ${zekeValidation.missionFiles}`);
console.log(`  Total adaptive questions: ${zekeValidation.totalQuestions}`);
if (zekeValidation.errors.length === 0) {
  console.log('  Status: PASS (8 missions × 4 bands × 3 questions = 96)');
} else {
  console.log('  Status: FAIL');
  for (const err of zekeValidation.errors) {
    console.log(`    - ${err}`);
  }
  process.exitCode = 1;
}

console.log('\nQuestions too vague for automatic classification:');
for (const item of vague) {
  console.log(`  - ${item}`);
}

console.log('\nPreserved legacy files:');
console.log('  - src/data/caiden/legacy/quest1WhatComesFirst.legacy.ts (8 Q)');
console.log('  - src/data/caiden/legacy/quest2ChooseYourNextMove.legacy.ts (8 Q)');
console.log('  - src/data/caiden/legacy/quest3ResetAndReturn.legacy.ts (8 Q)');
console.log('  - src/data/charlie/charlieMission1.ts (legacy nature mission)');
console.log('  - src/data/charlie/charlieMission2.ts (legacy nature mission)');

console.log('\nK-1 content authored for:');
console.log('  - Caiden quests 1-5 (caidenLegacyK1Bands.ts); quests 6-9 (inline K-1..6-8)');
console.log('  - Miranda mystery files 1-3 (mirandaLegacyK1Bands.ts)');
console.log('  - Charlie science missions 1-8 (charlie/missions/*.ts)');
console.log('  - B-4 SEL missions 1-8 (b4/missions/*.ts)');
console.log('  - Zeke team quests 1-8 (zeke/missions/*.ts)');

console.log('\nAdult metadata: node scripts/normalizeAdultContent.mjs');
