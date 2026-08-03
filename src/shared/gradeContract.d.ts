export type CanonicalGradeLevel = 'kindergarten' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
export type AdaptiveGradeBand = 'K-1' | '2-3' | '4-5' | '6-8';
export type LegacyPersistedGradeBand = '2-3' | '3-4' | '4-5' | '5-6';

export const CANONICAL_GRADE_LEVELS: readonly CanonicalGradeLevel[];
export const ADAPTIVE_GRADE_BANDS: readonly AdaptiveGradeBand[];
export const LEGACY_PERSISTED_GRADE_BANDS: readonly LegacyPersistedGradeBand[];
export function normalizeGradeLevel(input: unknown): CanonicalGradeLevel | null;
export function getAdaptiveGradeBand(input: unknown): AdaptiveGradeBand | null;
export function getLegacyPersistedGradeBand(input: unknown): LegacyPersistedGradeBand | null;
export function isLegacyPersistedGradeBand(value: unknown): value is LegacyPersistedGradeBand | null;
export function formatGradeLevelLabel(input: unknown): string | null;
