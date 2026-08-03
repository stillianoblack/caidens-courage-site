const CANONICAL_GRADE_LEVELS = Object.freeze([
  'kindergarten',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
]);

const ADAPTIVE_GRADE_BANDS = Object.freeze(['K-1', '2-3', '4-5', '6-8']);
const LEGACY_PERSISTED_GRADE_BANDS = Object.freeze(['2-3', '3-4', '4-5', '5-6']);

const GRADE_ALIASES = Object.freeze({
  kindergarten: 'kindergarten',
  k: 'kindergarten',
  '0': 'kindergarten',
  '1': '1',
  '1st grade': '1',
  '2': '2',
  '2nd grade': '2',
  '3': '3',
  '3rd grade': '3',
  '4': '4',
  '4th grade': '4',
  '5': '5',
  '5th grade': '5',
  '6': '6',
  '6th grade': '6',
  '7': '7',
  '7th grade': '7',
  '8': '8',
  '8th grade': '8',
});

/**
 * grade_level is canonical. Adaptive bands are derived application behavior.
 * participants.grade_band is legacy constrained storage; do not persist an
 * adaptive band there without a deliberate schema migration.
 */
function normalizeGradeLevel(input) {
  const normalized = String(input ?? '').trim().toLowerCase();
  return GRADE_ALIASES[normalized] || null;
}

function getAdaptiveGradeBand(input) {
  const gradeLevel = normalizeGradeLevel(input);
  if (!gradeLevel) return null;
  if (gradeLevel === 'kindergarten' || gradeLevel === '1') return 'K-1';
  if (gradeLevel === '2' || gradeLevel === '3') return '2-3';
  if (gradeLevel === '4' || gradeLevel === '5') return '4-5';
  return '6-8';
}

function getLegacyPersistedGradeBand(input) {
  const gradeLevel = normalizeGradeLevel(input);
  if (!gradeLevel || gradeLevel === 'kindergarten' || gradeLevel === '1') return null;
  if (gradeLevel === '2') return '2-3';
  if (gradeLevel === '3') return '3-4';
  if (gradeLevel === '4') return '4-5';
  if (gradeLevel === '5') return '5-6';
  return null;
}

function isLegacyPersistedGradeBand(value) {
  return value == null || LEGACY_PERSISTED_GRADE_BANDS.includes(value);
}

function formatGradeLevelLabel(input) {
  const gradeLevel = normalizeGradeLevel(input);
  if (!gradeLevel) return null;
  if (gradeLevel === 'kindergarten') return 'Kindergarten';
  const suffix = gradeLevel === '1' ? 'st' : gradeLevel === '2' ? 'nd' : gradeLevel === '3' ? 'rd' : 'th';
  return `${gradeLevel}${suffix} Grade`;
}

module.exports = {
  ADAPTIVE_GRADE_BANDS,
  CANONICAL_GRADE_LEVELS,
  LEGACY_PERSISTED_GRADE_BANDS,
  formatGradeLevelLabel,
  getAdaptiveGradeBand,
  getLegacyPersistedGradeBand,
  isLegacyPersistedGradeBand,
  normalizeGradeLevel,
};
