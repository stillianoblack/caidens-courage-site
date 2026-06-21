/**
 * Multiple-choice display helpers — keep option id, letter label, and answer text separate.
 */

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
const SINGLE_LETTER_ID = /^[a-d]$/i;

/** Matches labels that duplicate the UI letter badge, e.g. "A. message" or "B) library". */
const DUPLICATE_LETTER_PREFIX = /^([A-D])([.)]:?\s+)(?=\S)/;

/** Uppercase B–D followed by a word — never a valid English article prefix. */
const UPPERCASE_BCD_PREFIX = /^[B-D]\s+\S/;

export type ChoiceLabelIssueCode =
  | 'letter_prefix_in_label'
  | 'option_id_concatenated'
  | 'label_equals_id'
  | 'label_exposes_internal_id'
  | 'empty_label';

export type ChoiceLabelIssue = {
  code: ChoiceLabelIssueCode;
  message: string;
};

export function optionLetter(index: number): string {
  return OPTION_LETTERS[index] ?? String(index + 1);
}

export function hasOptionIdConcatenatedInLabel(optionId: string, label: string): boolean {
  if (!SINGLE_LETTER_ID.test(optionId)) return false;
  const trimmed = label.trim();
  const prefix = `${optionId} `;
  // Case-sensitive: "a message" is a leak; "A teacher" is a valid English phrase.
  return trimmed.startsWith(prefix) && trimmed.length > prefix.length;
}

export function hasLetterPrefixInLabel(label: string, optionId?: string): boolean {
  const trimmed = label.trim();
  if (DUPLICATE_LETTER_PREFIX.test(trimmed)) return true;
  if (UPPERCASE_BCD_PREFIX.test(trimmed)) return true;
  if (optionId && hasOptionIdConcatenatedInLabel(optionId, trimmed)) return true;
  return false;
}

export function wouldDisplayAsIdPlusLabel(optionId: string, label: string, letterIndex: number): boolean {
  const letter = optionLetter(letterIndex);
  const trimmed = label.trim();
  const sanitized = sanitizeChoiceDisplayLabel(label, optionId, letterIndex);

  if (trimmed === `${optionId}${sanitized}`) return true;
  if (trimmed === `${letter}${sanitized}`) return true;
  if (trimmed === `${letter}. ${sanitized}`) return true;
  if (trimmed === `${letter}) ${sanitized}`) return true;

  return false;
}

export function auditChoiceLabel(
  optionId: string,
  label: string,
  letterIndex: number,
): ChoiceLabelIssue[] {
  const issues: ChoiceLabelIssue[] = [];
  const trimmed = label.trim();

  if (!trimmed) {
    issues.push({ code: 'empty_label', message: 'Choice label is empty.' });
    return issues;
  }

  if (trimmed.toLowerCase() === optionId.toLowerCase() && SINGLE_LETTER_ID.test(optionId)) {
    issues.push({
      code: 'label_equals_id',
      message: `Label "${trimmed}" equals option id "${optionId}".`,
    });
    issues.push({
      code: 'label_exposes_internal_id',
      message: `Label exposes internal option id "${optionId}".`,
    });
  }

  if (hasLetterPrefixInLabel(trimmed, optionId)) {
    issues.push({
      code: 'letter_prefix_in_label',
      message: `Label "${trimmed}" begins with an answer letter (A/B/C/D) that should render separately.`,
    });
  }

  if (hasOptionIdConcatenatedInLabel(optionId, trimmed)) {
    issues.push({
      code: 'option_id_concatenated',
      message: `Label "${trimmed}" concatenates option id "${optionId}" with answer text.`,
    });
  }

  if (wouldDisplayAsIdPlusLabel(optionId, trimmed, letterIndex)) {
    issues.push({
      code: 'option_id_concatenated',
      message: `Displayed answer would equal option id/letter plus answer text for "${trimmed}".`,
    });
  }

  return issues;
}

/**
 * Strip duplicate letter/id prefixes from labels before rendering.
 * Letter badges are rendered separately via showLetterPrefix.
 */
export function sanitizeChoiceDisplayLabel(
  label: string,
  optionId: string,
  _letterIndex?: number,
): string {
  let text = label.trim();
  if (!text) return text;

  text = text.replace(DUPLICATE_LETTER_PREFIX, '');

  if (SINGLE_LETTER_ID.test(optionId)) {
    const idPrefix = new RegExp(`^${optionId}\\s+`);
    if (idPrefix.test(text)) {
      text = text.replace(idPrefix, '');
    }
  }

  return text.trim();
}
