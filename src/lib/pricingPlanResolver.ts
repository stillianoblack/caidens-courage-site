import type { PilotProgramType } from '../types/pilotProgram';
import type { PricingPlanGroup, PricingPlanRecord } from '../types/pricingPlans';
import { getActivePricingPlans } from './pricingPlansService';

const SMALL_GROUP_PROGRAM_TYPES = new Set<PilotProgramType>([
  'Camp / Youth Program',
  'After-School Program',
  'Homeschool Group',
  'Teacher / Classroom',
]);

const LARGE_ORG_PROGRAM_TYPES = new Set<PilotProgramType>(['School', 'District']);

export function resolvePricingPlanGroup(
  programType: PilotProgramType | undefined | null,
): PricingPlanGroup {
  if (!programType || programType === 'Independent Family') return 'family';
  if (LARGE_ORG_PROGRAM_TYPES.has(programType)) return 'large_organization';
  if (SMALL_GROUP_PROGRAM_TYPES.has(programType)) return 'small_group';
  return 'small_group';
}

export function resolvePricingPlansForProgramType(
  programType: PilotProgramType | undefined | null,
): PricingPlanRecord[] {
  return getActivePricingPlans(resolvePricingPlanGroup(programType));
}

export function resolvePricingPlansForFamilyPortal(): PricingPlanRecord[] {
  return getActivePricingPlans('family');
}

export function resolvePricingPlansForFacilitatorPortal(
  programType: PilotProgramType | undefined | null,
): PricingPlanRecord[] {
  const group = resolvePricingPlanGroup(programType);
  if (group === 'family') {
    return getActivePricingPlans('family');
  }
  return getActivePricingPlans(group);
}
