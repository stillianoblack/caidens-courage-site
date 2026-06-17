import type { AgeGradeBand, PilotAgeRange } from '../types/pilotProgram';

/** Maps new signup band to legacy `age_range` column for backward compatibility. */
export function mapAgeGradeBandToLegacyAgeRange(band: AgeGradeBand): PilotAgeRange {
  switch (band) {
    case 'Pre-K/K':
    case '1st–2nd':
      return 'Ages 5–7';
    case '3rd–5th':
      return 'Ages 8–10';
    case '6th–8th':
      return 'Ages 11–13';
    case 'Mixed Ages':
    case 'Other':
    default:
      return 'Mixed Ages';
  }
}
