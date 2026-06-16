export type FormatGrowthDeltaOptions = {
  /** Suffix after the numeric value. Default: ` pts` */
  suffix?: string;
};

/**
 * Formats a growth delta for display across Family Portal, Facilitator Portal, and exports.
 *
 * +25 → ↑ 25 pts
 * -43 → ↓ 43 pts
 * 0   → 0 pts
 * null → —
 */
export function formatGrowthDelta(
  value: number | null | undefined,
  options?: FormatGrowthDeltaOptions,
): string {
  const suffix = options?.suffix ?? ' pts';
  if (value == null || Number.isNaN(value)) return '—';
  const rounded = Math.round(value);
  if (rounded === 0) return `0${suffix}`;
  if (rounded > 0) return `↑ ${rounded}${suffix}`;
  return `↓ ${Math.abs(rounded)}${suffix}`;
}
