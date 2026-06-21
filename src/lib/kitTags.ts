export const KIT_TAG_PARENT = 'Parent';
export const KIT_TAG_FACILITATOR = 'Facilitator';
export const KIT_TAG_COMPLETED_WEEK_1 = 'Completed Week 1';
export const KIT_TAG_COMPLETED_WEEK_2 = 'Completed Week 2';
export const KIT_TAG_COMPLETED_WEEK_3 = 'Completed Week 3';
export const KIT_TAG_COMPLETED_WEEK_4 = 'Completed Week 4';
export const KIT_TAG_MONTH_1_GRADUATE = 'Month 1 Graduate';

export const KIT_WEEK_COMPLETION_TAGS: Record<number, string> = {
  1: KIT_TAG_COMPLETED_WEEK_1,
  2: KIT_TAG_COMPLETED_WEEK_2,
  3: KIT_TAG_COMPLETED_WEEK_3,
  4: KIT_TAG_COMPLETED_WEEK_4,
};

export function kitTagForCompletedWeek(weekNumber: number): string | null {
  return KIT_WEEK_COMPLETION_TAGS[weekNumber] ?? null;
}

export type KitEventName =
  | 'parent_signup'
  | 'parent_claim'
  | 'parent_claim_by_code'
  | 'independent_family_signup'
  | 'facilitator_signup'
  | 'facilitator_unlock'
  | 'completed_week_1'
  | 'completed_week_2'
  | 'completed_week_3'
  | 'completed_week_4'
  | 'month_1_graduate';
