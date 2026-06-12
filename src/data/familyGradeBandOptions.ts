export const FAMILY_GRADE_BAND_OPTIONS = ['2–3', '3–4', '4–5', '5–6'] as const;

export type FamilyGradeBand = (typeof FAMILY_GRADE_BAND_OPTIONS)[number];

export const FAMILY_GRADE_BAND_LABEL = 'Select Grade Level';

export const FAMILY_GRADE_STRETCH_LABEL =
  'Occasionally challenge my child with activities 1–2 grade bands higher.';

export function isFamilyGradeBand(value: string | null | undefined): value is FamilyGradeBand {
  return FAMILY_GRADE_BAND_OPTIONS.includes(value as FamilyGradeBand);
}
