import type { PilotProgramType } from '../types/pilotProgram';
import { INDEPENDENT_FAMILY_PROGRAM_TYPE } from './independentFamilyProgram';

export type PilotAccountContext =
  | 'household'
  | 'homeschool_group'
  | 'camp'
  | 'after_school'
  | 'classroom'
  | 'school'
  | 'district';

export type PilotPortalType = 'family' | 'facilitator';

export type PilotPortalPrep = {
  account_context: PilotAccountContext;
  portal_type: PilotPortalType;
};

/** Maps signup program type → account_context + portal_type (redirects unchanged). */
export function resolvePilotPortalPrep(programType: PilotProgramType): PilotPortalPrep {
  switch (programType) {
    case INDEPENDENT_FAMILY_PROGRAM_TYPE:
      return { account_context: 'household', portal_type: 'family' };
    case 'Homeschool Group':
      return { account_context: 'homeschool_group', portal_type: 'family' };
    case 'Camp / Youth Program':
      return { account_context: 'camp', portal_type: 'facilitator' };
    case 'After-School Program':
      return { account_context: 'after_school', portal_type: 'facilitator' };
    case 'Teacher / Classroom':
      return { account_context: 'classroom', portal_type: 'facilitator' };
    case 'School':
      return { account_context: 'school', portal_type: 'facilitator' };
    case 'District':
      return { account_context: 'district', portal_type: 'facilitator' };
    default:
      return { account_context: 'camp', portal_type: 'facilitator' };
  }
}

export function formatPilotPortalTypeLabel(portalType: PilotPortalType | string | null | undefined): string {
  if (portalType === 'family') return 'Family Portal';
  if (portalType === 'facilitator') return 'Facilitator Portal';
  return 'Portal';
}
