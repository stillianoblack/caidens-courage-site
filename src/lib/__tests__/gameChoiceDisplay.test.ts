import {
  auditChoiceLabel,
  hasLetterPrefixInLabel,
  hasOptionIdConcatenatedInLabel,
  optionLetter,
  sanitizeChoiceDisplayLabel,
  wouldDisplayAsIdPlusLabel,
} from '../gameChoiceDisplay';

describe('gameChoiceDisplay', () => {
  describe('sanitizeChoiceDisplayLabel', () => {
    test('strips duplicate letter prefix from label text', () => {
      expect(sanitizeChoiceDisplayLabel('A. message', 'a', 0)).toBe('message');
      expect(sanitizeChoiceDisplayLabel('B) library', 'b', 1)).toBe('library');
    });

    test('strips option id prefix when id is a single letter', () => {
      expect(sanitizeChoiceDisplayLabel('a message', 'a', 0)).toBe('message');
      expect(sanitizeChoiceDisplayLabel('b library', 'b', 1)).toBe('library');
    });

    test('preserves article labels when id is semantic', () => {
      expect(sanitizeChoiceDisplayLabel('a reward', 'reward', 0)).toBe('a reward');
      expect(sanitizeChoiceDisplayLabel('a backpack', 'backpack', 1)).toBe('a backpack');
    });
  });

  describe('auditChoiceLabel', () => {
    test('flags letter prefix in label', () => {
      const issues = auditChoiceLabel('a', 'A. message', 0);
      expect(issues.some((issue) => issue.code === 'letter_prefix_in_label')).toBe(true);
    });

    test('flags id concatenated into label', () => {
      const issues = auditChoiceLabel('a', 'a message', 0);
      expect(issues.some((issue) => issue.code === 'option_id_concatenated')).toBe(true);
    });

    test('passes clean word-restoration labels', () => {
      const issues = auditChoiceLabel('a', 'message', 0);
      expect(issues).toHaveLength(0);
    });

    test('passes article vocabulary labels with semantic ids', () => {
      const issues = auditChoiceLabel('reward', 'a reward', 0);
      expect(issues).toHaveLength(0);
    });
  });

  describe('detection helpers', () => {
    test('does not flag English article phrases', () => {
      expect(hasLetterPrefixInLabel('A teacher or grown-up')).toBe(false);
      expect(hasOptionIdConcatenatedInLabel('a', 'A teacher or grown-up')).toBe(false);
      expect(auditChoiceLabel('a', 'A teacher or grown-up', 0)).toHaveLength(0);
    });

    test('flags lowercase id prefix in label', () => {
      expect(hasLetterPrefixInLabel('a message', 'a')).toBe(true);
      expect(hasLetterPrefixInLabel('a reward', 'reward')).toBe(false);
    });

    test('hasOptionIdConcatenatedInLabel', () => {
      expect(hasOptionIdConcatenatedInLabel('a', 'a message')).toBe(true);
      expect(hasOptionIdConcatenatedInLabel('reward', 'a reward')).toBe(false);
    });

    test('wouldDisplayAsIdPlusLabel rejects concatenated display', () => {
      expect(wouldDisplayAsIdPlusLabel('a', 'A. message', 0)).toBe(true);
      expect(wouldDisplayAsIdPlusLabel('a', 'message', 0)).toBe(false);
    });

    test('optionLetter maps indices to A-D', () => {
      expect(optionLetter(0)).toBe('A');
      expect(optionLetter(3)).toBe('D');
    });
  });
});
