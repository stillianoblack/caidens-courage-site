export type PilotProgramType =
  | 'Camp / Youth Program'
  | 'Teacher / Classroom'
  | 'After-School Program'
  | 'School'
  | 'District'
  | 'Homeschool Group';

export type PilotAgeRange = 'Ages 5–7' | 'Ages 8–10' | 'Ages 11–13' | 'Mixed Ages';

export type PilotPricingTier =
  | 'camp_pilot'
  | 'teacher'
  | 'school'
  | 'district'
  | 'family_group';

export type PilotPaymentStatus = 'pending' | 'paid' | 'waived';

export type PilotStatus = 'active' | 'paused' | 'completed';

export type PilotProgramSignupInput = {
  programType: PilotProgramType;
  programName: string;
  adminFirstName: string;
  adminEmail: string;
  estimatedStudents: number;
  ageRange: PilotAgeRange;
  groupName: string;
  agreedToTerms: boolean;
};

export type PilotProgramRecord = {
  id?: string;
  program_name: string;
  program_code: string;
  program_type: PilotProgramType;
  admin_first_name: string;
  admin_email: string;
  estimated_students: number;
  age_range: PilotAgeRange;
  group_name: string;
  family_access_code: string;
  facilitator_access_code: string;
  pricing_tier: PilotPricingTier;
  payment_status: PilotPaymentStatus;
  pilot_status: PilotStatus;
  agreed_to_terms: boolean;
  agreed_at: string;
  created_at?: string;
};

export type ActivePilotProgram = {
  id?: string;
  programName: string;
  programCode: string;
  programType: PilotProgramType;
  adminFirstName: string;
  adminEmail: string;
  estimatedStudents: number;
  ageRange: PilotAgeRange;
  groupName: string;
  familyAccessCode: string;
  facilitatorAccessCode: string;
  pricingTier: PilotPricingTier;
  paymentStatus: PilotPaymentStatus;
  pilotStatus: PilotStatus;
  agreedAt: string;
  createdAt?: string;
  pilotStartDate?: string;
};

export const PILOT_PROGRAM_TYPE_OPTIONS: PilotProgramType[] = [
  'Camp / Youth Program',
  'Teacher / Classroom',
  'After-School Program',
  'School',
  'District',
  'Homeschool Group',
];

export const PILOT_AGE_RANGE_OPTIONS: PilotAgeRange[] = [
  'Ages 5–7',
  'Ages 8–10',
  'Ages 11–13',
  'Mixed Ages',
];
