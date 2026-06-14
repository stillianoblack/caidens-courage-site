/** Strip duplicate "SEL Focus:" prefix from CMS subtitle values. */
export function normalizeSelFocusLabel(value?: string | null): string {
  let trimmed = value?.trim() ?? '';
  if (!trimmed) return '';
  while (/^sel focus:\s*/i.test(trimmed)) {
    trimmed = trimmed.replace(/^sel focus:\s*/i, '').trim();
  }
  return trimmed;
}

export function formatSelFocusLine(value?: string | null): string | null {
  const label = normalizeSelFocusLabel(value);
  return label ? `SEL Focus: ${label}` : null;
}
