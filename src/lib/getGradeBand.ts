import {
  normalizeGradeLevelStorage,
  type GradeLevel,
} from '../data/gradeLevelOptions';
import { isFamilyGradeBand, type FamilyGradeBand } from '../data/familyGradeBandOptions';
import {
  isMirandaGradeBand,
  type MirandaGradeBand,
} from '../types/mirandaAdaptiveQuest';

const BAND_ORDER: MirandaGradeBand[] = ['K-1', '2-3', '4-5', '6-8'];

function stretchBand(band: MirandaGradeBand): MirandaGradeBand {
  const index = BAND_ORDER.indexOf(band);
  if (index < 0) return '2-3';
  return BAND_ORDER[Math.min(index + 1, BAND_ORDER.length - 1)];
}

/** Map canonical grade_level → adaptive content band */
export function getGradeBand(gradeLevel: GradeLevel): MirandaGradeBand {
  switch (gradeLevel) {
    case 'kindergarten':
    case '1':
      return 'K-1';
    case '2':
    case '3':
      return '2-3';
    case '4':
    case '5':
      return '4-5';
    case '6':
    case '7':
    case '8':
      return '6-8';
    default:
      return '2-3';
  }
}

export function getGradeBandFromStorage(
  gradeLevel: string | null | undefined,
): MirandaGradeBand | null {
  const normalized = normalizeGradeLevelStorage(gradeLevel);
  return normalized ? getGradeBand(normalized) : null;
}

function mapFamilyGradeBandToMiranda(
  band: FamilyGradeBand,
  allowStretch: boolean,
): MirandaGradeBand {
  let resolved: MirandaGradeBand;
  switch (band) {
    case '2–3':
    case '3–4':
      resolved = '2-3';
      break;
    case '4–5':
      resolved = '4-5';
      break;
    case '5–6':
      resolved = '6-8';
      break;
    default:
      resolved = '2-3';
  }
  return allowStretch ? stretchBand(resolved) : resolved;
}

/** Resolve adaptive band for runtime — prefers grade_level, falls back to stored grade_band */
export function resolveAdaptiveGradeBand(input: {
  gradeLevel?: string | null;
  gradeBand?: string | null;
  allowStretch?: boolean;
  numericGrade?: number | null;
}): MirandaGradeBand {
  const allowStretch = Boolean(input.allowStretch);
  const fromLevel = getGradeBandFromStorage(input.gradeLevel);
  if (fromLevel) {
    return allowStretch ? stretchBand(fromLevel) : fromLevel;
  }

  if (typeof input.numericGrade === 'number' && Number.isFinite(input.numericGrade)) {
    const rounded = Math.round(input.numericGrade);
    const base =
      rounded <= 1 ? 'K-1' : rounded <= 3 ? '2-3' : rounded <= 5 ? '4-5' : '6-8';
    return allowStretch ? stretchBand(base) : base;
  }

  const band = input.gradeBand?.trim();
  if (band && isMirandaGradeBand(band)) {
    return allowStretch ? stretchBand(band) : band;
  }
  if (band && isFamilyGradeBand(band)) {
    return mapFamilyGradeBandToMiranda(band, allowStretch);
  }

  return '2-3';
}
