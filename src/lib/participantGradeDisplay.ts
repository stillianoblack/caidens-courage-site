import {
  GRADE_LEVEL_UNKNOWN_LABEL,
  formatGradeLevelDisplay,
  formatGradeLevelLabel,
  isGradeLevel,
  normalizeGradeLevelStorage,
  type GradeLevel,
} from '../data/gradeLevelOptions';
import { resolveAdaptiveGradeBand } from './getGradeBand';
import { isMirandaGradeBand } from '../types/mirandaAdaptiveQuest';
import { isFamilyGradeBand } from '../data/familyGradeBandOptions';

export type ParticipantGradeDisplay = {
  /** Canonical grade_level if known */
  gradeLevel: GradeLevel | null;
  /** Human label e.g. "4th Grade" or "Grade unknown" */
  displayGrade: string;
  /** Adaptive band e.g. "4-5" — derived from level or legacy band */
  adaptiveBand: string | null;
  /** True when only a legacy band exists — prompt for exact grade */
  needsGradeSelection: boolean;
  /** True when neither level nor band is configured */
  missingGrade: boolean;
};

export function resolveParticipantGradeDisplay(input: {
  gradeLevel?: string | null;
  gradeBand?: string | null;
  allowStretch?: boolean;
}): ParticipantGradeDisplay {
  const gradeLevel = normalizeGradeLevelStorage(input.gradeLevel);
  const storedBand = input.gradeBand?.trim() || null;
  const hasLegacyBand =
    Boolean(storedBand) &&
    (isMirandaGradeBand(storedBand!) || isFamilyGradeBand(storedBand!));

  const adaptiveBand = resolveAdaptiveGradeBand({
    gradeLevel,
    gradeBand: storedBand,
    allowStretch: input.allowStretch,
  });

  if (gradeLevel) {
    return {
      gradeLevel,
      displayGrade: formatGradeLevelLabel(gradeLevel),
      adaptiveBand,
      needsGradeSelection: false,
      missingGrade: false,
    };
  }

  if (hasLegacyBand) {
    return {
      gradeLevel: null,
      displayGrade: GRADE_LEVEL_UNKNOWN_LABEL,
      adaptiveBand,
      needsGradeSelection: true,
      missingGrade: false,
    };
  }

  return {
    gradeLevel: null,
    displayGrade: 'Not configured',
    adaptiveBand: null,
    needsGradeSelection: true,
    missingGrade: true,
  };
}

export function hasCanonicalGradeLevel(gradeLevel: string | null | undefined): boolean {
  return isGradeLevel(normalizeGradeLevelStorage(gradeLevel) ?? '');
}

export { formatGradeLevelDisplay, GRADE_LEVEL_UNKNOWN_LABEL };
