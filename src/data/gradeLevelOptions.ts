import type { MirandaGradeBand } from '../types/mirandaAdaptiveQuest';
import { getGradeBand } from '../lib/getGradeBand';

/** Canonical values stored on participants.grade_level */
export const GRADE_LEVEL_VALUES = [
  'kindergarten',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
] as const;

export type GradeLevel = (typeof GRADE_LEVEL_VALUES)[number];

export type GradeLevelOption = {
  value: GradeLevel;
  label: string;
};

/** UI dropdown options — value is stored; label is displayed */
export const GRADE_LEVEL_OPTIONS: readonly GradeLevelOption[] = [
  { value: 'kindergarten', label: 'Kindergarten' },
  { value: '1', label: '1st Grade' },
  { value: '2', label: '2nd Grade' },
  { value: '3', label: '3rd Grade' },
  { value: '4', label: '4th Grade' },
  { value: '5', label: '5th Grade' },
  { value: '6', label: '6th Grade' },
  { value: '7', label: '7th Grade' },
  { value: '8', label: '8th Grade' },
];

export const GRADE_LEVEL_LABEL = 'Grade level';
export const GRADE_LEVEL_PROMPT = 'What grade are you in?';
export const GRADE_LEVEL_ENCOURAGE = 'Grade level helps us personalize activities.';
export const GRADE_LEVEL_UNKNOWN_LABEL = 'Grade unknown';

const LEGACY_DISPLAY_TO_CANONICAL: Record<string, GradeLevel> = {
  kindergarten: 'kindergarten',
  Kindergarten: 'kindergarten',
  '1st Grade': '1',
  '2nd Grade': '2',
  '3rd Grade': '3',
  '4th Grade': '4',
  '5th Grade': '5',
  '6th Grade': '6',
  '7th Grade': '7',
  '8th Grade': '8',
};

const CANONICAL_LABELS: Record<GradeLevel, string> = Object.fromEntries(
  GRADE_LEVEL_OPTIONS.map((option) => [option.value, option.label]),
) as Record<GradeLevel, string>;

export function isGradeLevel(value: string | null | undefined): value is GradeLevel {
  return GRADE_LEVEL_VALUES.includes(value as GradeLevel);
}

/** Normalize stored or legacy grade_level strings to canonical values */
export function normalizeGradeLevelStorage(
  value: string | null | undefined,
): GradeLevel | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (isGradeLevel(trimmed)) return trimmed;
  return LEGACY_DISPLAY_TO_CANONICAL[trimmed] ?? null;
}

export function formatGradeLevelLabel(gradeLevel: GradeLevel): string {
  return CANONICAL_LABELS[gradeLevel];
}

export function formatGradeLevelDisplay(gradeLevel: string | null | undefined): string {
  const normalized = normalizeGradeLevelStorage(gradeLevel);
  return normalized ? formatGradeLevelLabel(normalized) : GRADE_LEVEL_UNKNOWN_LABEL;
}

/** @deprecated Use getGradeBand from ../lib/getGradeBand */
export function mapGradeLevelToContentBand(gradeLevel: GradeLevel): MirandaGradeBand {
  return getGradeBand(gradeLevel);
}
