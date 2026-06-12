import {
  ADULT_GRADE_BAND,
  KID_GRADE_BAND_ORDER,
  isAdultGradeBand,
  isFacilitatorAudience,
  isKidGradeBand,
  type ContentAudience,
  type ContentGradeBand,
  type StudentGradeBand,
} from '../types/gradeBandContentMetadata';

/**
 * Resolve kid grade-band content with fallback (K-1 through 6-8 only):
 * 1. exact match
 * 2. nearest lower band
 * 3. nearest higher band
 * 4. legacy default (2-3)
 *
 * Never falls back to or from adult content.
 */
export function resolveKidGradeBandWithFallback<T>(
  available: Partial<Record<StudentGradeBand, T>>,
  requested: StudentGradeBand,
  legacyDefault: StudentGradeBand = '2-3',
): { content: T; resolvedBand: StudentGradeBand } {
  if (requested === 'adult' as StudentGradeBand) {
    throw new Error('resolveKidGradeBandWithFallback does not accept adult grade band');
  }

  if (available[requested]) {
    return { content: available[requested]!, resolvedBand: requested };
  }

  const requestIndex = KID_GRADE_BAND_ORDER.indexOf(requested);
  if (requestIndex >= 0) {
    for (let i = requestIndex - 1; i >= 0; i -= 1) {
      const lower = KID_GRADE_BAND_ORDER[i];
      if (available[lower]) {
        return { content: available[lower]!, resolvedBand: lower };
      }
    }

    for (let i = requestIndex + 1; i < KID_GRADE_BAND_ORDER.length; i += 1) {
      const higher = KID_GRADE_BAND_ORDER[i];
      if (available[higher]) {
        return { content: available[higher]!, resolvedBand: higher };
      }
    }
  }

  if (available[legacyDefault]) {
    return { content: available[legacyDefault]!, resolvedBand: legacyDefault };
  }

  for (const band of KID_GRADE_BAND_ORDER) {
    if (available[band]) {
      return { content: available[band]!, resolvedBand: band };
    }
  }

  throw new Error('No kid grade-band content available');
}

/** @deprecated Use resolveKidGradeBandWithFallback */
export function resolveGradeBandWithFallback<T>(
  available: Partial<Record<StudentGradeBand, T>>,
  requested: StudentGradeBand,
  legacyDefault: StudentGradeBand = '2-3',
): { content: T; resolvedBand: StudentGradeBand } {
  return resolveKidGradeBandWithFallback(available, requested, legacyDefault);
}

/**
 * Resolve adult instructional content. Only searches gradeBand = adult.
 * No fallback to kid bands.
 */
export function resolveAdultContentWithFallback<T>(
  available: Partial<Record<'adult', T>>,
): { content: T; resolvedBand: 'adult' } {
  if (available.adult) {
    return { content: available.adult, resolvedBand: ADULT_GRADE_BAND };
  }
  throw new Error('No adult content available');
}

/**
 * Route resolution by audience — kid and adult pools never cross-fallback.
 */
export function resolveContentByAudience<T>(input: {
  audience: ContentAudience;
  requestedGradeBand: ContentGradeBand;
  kidContent?: Partial<Record<StudentGradeBand, T>>;
  adultContent?: Partial<Record<'adult', T>>;
  kidLegacyDefault?: StudentGradeBand;
}): { content: T; resolvedBand: ContentGradeBand } {
  const { audience, requestedGradeBand, kidContent, adultContent, kidLegacyDefault = '2-3' } = input;

  if (isFacilitatorAudience(audience) || isAdultGradeBand(requestedGradeBand)) {
    if (!adultContent?.adult) {
      throw new Error(`Adult content required for audience=${audience}, gradeBand=${requestedGradeBand}`);
    }
    return resolveAdultContentWithFallback(adultContent);
  }

  if (!isKidGradeBand(requestedGradeBand)) {
    throw new Error(`Kid content required for gradeBand=${requestedGradeBand}`);
  }

  if (!kidContent) {
    throw new Error(`Kid content pool missing for gradeBand=${requestedGradeBand}`);
  }

  return resolveKidGradeBandWithFallback(kidContent, requestedGradeBand, kidLegacyDefault);
}

export function listAvailableKidGradeBands<T>(
  available: Partial<Record<StudentGradeBand, T>>,
): StudentGradeBand[] {
  return KID_GRADE_BAND_ORDER.filter((band) => Boolean(available[band]));
}

/** @deprecated Use listAvailableKidGradeBands */
export function listAvailableGradeBands<T>(
  available: Partial<Record<StudentGradeBand, T>>,
): StudentGradeBand[] {
  return listAvailableKidGradeBands(available);
}
