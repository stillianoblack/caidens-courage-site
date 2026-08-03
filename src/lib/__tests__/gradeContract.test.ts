import {
  ADAPTIVE_GRADE_BANDS,
  LEGACY_PERSISTED_GRADE_BANDS,
  formatGradeLevelLabel,
  getAdaptiveGradeBand,
  getLegacyPersistedGradeBand,
  isLegacyPersistedGradeBand,
  normalizeGradeLevel,
} from '../../shared/gradeContract';

const matrix = [
  ['Kindergarten', 'kindergarten', 'K-1', null, 'Kindergarten'],
  ['K', 'kindergarten', 'K-1', null, 'Kindergarten'],
  ['0', 'kindergarten', 'K-1', null, 'Kindergarten'],
  ['1', '1', 'K-1', null, '1st Grade'],
  ['2', '2', '2-3', '2-3', '2nd Grade'],
  ['3', '3', '2-3', '3-4', '3rd Grade'],
  ['4', '4', '4-5', '4-5', '4th Grade'],
  ['5', '5', '4-5', '5-6', '5th Grade'],
  ['6', '6', '6-8', null, '6th Grade'],
  ['7', '7', '6-8', null, '7th Grade'],
  ['8', '8', '6-8', null, '8th Grade'],
] as const;

describe('canonical grade contract', () => {
  test.each(matrix)(
    '%s normalizes to %s, resolves adaptive %s, and legacy %s',
    (input, canonical, adaptive, legacy, label) => {
      expect(normalizeGradeLevel(input)).toBe(canonical);
      expect(getAdaptiveGradeBand(input)).toBe(adaptive);
      expect(getLegacyPersistedGradeBand(input)).toBe(legacy);
      expect(formatGradeLevelLabel(input)).toBe(label);
      expect(isLegacyPersistedGradeBand(legacy)).toBe(true);
    },
  );

  test('keeps adaptive and legacy persisted bands explicitly separate', () => {
    expect(ADAPTIVE_GRADE_BANDS).toEqual(['K-1', '2-3', '4-5', '6-8']);
    expect(LEGACY_PERSISTED_GRADE_BANDS).toEqual(['2-3', '3-4', '4-5', '5-6']);
    expect(LEGACY_PERSISTED_GRADE_BANDS).not.toContain('k-2');
    expect(LEGACY_PERSISTED_GRADE_BANDS).not.toContain('3-5');
    expect(LEGACY_PERSISTED_GRADE_BANDS).not.toContain('6-8');
  });

  test('rejects unsupported grade input', () => {
    expect(normalizeGradeLevel('9')).toBeNull();
    expect(getAdaptiveGradeBand('unknown')).toBeNull();
  });
});
