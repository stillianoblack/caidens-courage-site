export type PilotProgramType =
  | 'Camp / Youth Program'
  | 'Teacher / Classroom'
  | 'After-School Program'
  | 'School'
  | 'District'
  | 'Homeschool Group'
  | 'Independent Family';

export type PilotAgeRange = 'Ages 5–7' | 'Ages 8–10' | 'Ages 11–13' | 'Mixed Ages';

export type AgeGradeBand =
  | 'Pre-K/K'
  | '1st–2nd'
  | '3rd–5th'
  | '6th–8th'
  | 'Mixed Ages'
  | 'Other';

export const AGE_GRADE_BAND_OPTIONS: AgeGradeBand[] = [
  'Pre-K/K',
  '1st–2nd',
  '3rd–5th',
  '6th–8th',
  'Mixed Ages',
  'Other',
];

export type PilotProgramFeatureFlags = {
  can_manage_students: boolean;
  can_invite_families: boolean;
  can_view_group_progress: boolean;
  can_print_modules: boolean;
  can_upload_homework: boolean;
  can_manage_certificates: boolean;
  can_send_notifications: boolean;
  can_access_facilitator_portal: boolean;
};

export type PilotPricingTier =
  | 'camp_pilot'
  | 'teacher'
  | 'school'
  | 'district'
  | 'family_group'
  | 'independent_family';

export type PilotPaymentStatus = 'pending' | 'paid' | 'waived';

export type PilotStatus = 'active' | 'paused' | 'completed' | 'archived' | 'testing';
export type PilotProgramProtectionLevel = 'testing' | 'internal' | 'pilot' | 'production';

export type EstimatedStudentCountRange =
  | '1 child'
  | '2–4 children'
  | '5–10 students'
  | '11–25 students'
  | '26–50 students'
  | '50+ students';

export const ESTIMATED_STUDENT_COUNT_RANGE_OPTIONS: EstimatedStudentCountRange[] = [
  '1 child',
  '2–4 children',
  '5–10 students',
  '11–25 students',
  '26–50 students',
  '50+ students',
];

export const INDEPENDENT_FAMILY_STUDENT_COUNT_RANGE: EstimatedStudentCountRange = '1 child';

export type PilotProgramSignupInput = {
  programType: PilotProgramType;
  programName: string;
  adminFirstName: string;
  adminEmail: string;
  /** @deprecated Legacy numeric estimate — derived from range when provided. */
  estimatedStudents: number | null;
  estimatedStudentCountRange: EstimatedStudentCountRange | null;
  ageGradeBand: AgeGradeBand;
  ageGradeNotes: string;
  /** @deprecated Legacy column — mapped from ageGradeBand on insert. */
  ageRange: PilotAgeRange;
  groupName: string;
  agreedToTerms: boolean;
};

export type PilotProgramRecord = {
  id?: string;
  program_name: string;
  program_code: string;
  /** Supabase stores `independent_family` for Independent Family programs. */
  program_type: PilotProgramType | 'independent_family';
  admin_first_name: string;
  admin_email: string;
  estimated_students: number;
  estimated_student_count_range?: string | null;
  account_context?: string | null;
  portal_type?: string | null;
  age_grade_band?: string | null;
  age_grade_notes?: string | null;
  feature_flags?: PilotProgramFeatureFlags | null;
  age_range: PilotAgeRange;
  group_name: string;
  family_access_code: string;
  /** Null for `independent_family` programs — no facilitator portal. */
  facilitator_access_code: string | null;
  pricing_tier: PilotPricingTier;
  payment_status: PilotPaymentStatus;
  pilot_status: PilotStatus;
  protection_level?: PilotProgramProtectionLevel | null;
  archived_at?: string | null;
  archived_by?: string | null;
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
  facilitatorAccessCode: string | null;
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
  'Independent Family',
];

export const PILOT_AGE_RANGE_OPTIONS: PilotAgeRange[] = [
  'Ages 5–7',
  'Ages 8–10',
  'Ages 11–13',
  'Mixed Ages',
];
