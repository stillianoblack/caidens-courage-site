/** Canonical Caiden's Courage route paths — single source for nav, footer, and redirects. */

export const STORY_PATH = '/story';
export const STORY_BOOKS_PATH = '/story/books';
export const STORY_CHARACTERS_PATH = '/story/characters';
export const STORY_MODE_PATH = '/story-mode';

export const BRAVE_MIND_CLUB_PATH = '/brave-mind-club';
export const BMC_COLORING_PATH = '/brave-mind-club/coloring-pages';
export const BMC_RESET_TOOLS_PATH = '/brave-mind-club/reset-tools';
export const BMC_ACTIVITIES_PATH = '/brave-mind-club/activities';

export const FOCUS_FLAME_LAB_PATH = '/focus-flame-lab';
export const WEEK_0_ASSESSMENT_PATH = '/focus-flame-lab/week-0';
export const B4_BASELINE_CHECK_PATH = '/b4-baseline-check';
export const B4_RESULTS_ADMIN_PATH = '/b4-results-admin';
export const WEEK_0_ASSESSMENT_ALIAS_PATH = '/week-0-assessment';
export const B4_GUIDE_PATH = '/b4-guide';
export const MIRANDA_MYSTERY_FILES_PATH = '/miranda-mystery-files';
/** @deprecated Use MIRANDA_MYSTERY_FILES_PATH — kept for legacy redirects */
export const MIRANDA_FIRST_DAY_PATH = '/miranda-first-day';

export const PARENTS_PATH = '/parents';
export const TEACHERS_PATH = '/teachers';
export const CAMPS_PATH = '/camps';
export const SCHOOLS_PATH = '/schools';

export const PORTAL_PATH = '/portal';
/** Public parent claim deep link — scoped claim code only (?code=CLAIM-…). */
export const FAMILY_CLAIM_PATH = '/claim';
export const ADMIN_PORTAL_PATH = '/admin';
export const DESIGN_SYSTEM_PATH = '/admin/design-system';

export const FAMILY_PORTAL_PATH = '/portal/family';
export const FAMILY_HUB_PATH = '/family-hub';
export const FAMILY_HUB_KIDS_BASE = `${FAMILY_HUB_PATH}/kids`;
export const FAMILY_PARENT_CORNER_PATH = `${FAMILY_PORTAL_PATH}/parent-corner`;
export const FAMILY_DR_VICTORIA_MISSION_BASE = `${FAMILY_PARENT_CORNER_PATH}/dr-victoria`;
export const FAMILY_DR_VICTORIA_MISSION_1_PATH = `${FAMILY_DR_VICTORIA_MISSION_BASE}/mission-1`;
export const FAMILY_DR_VICTORIA_MISSION_2_PATH = `${FAMILY_DR_VICTORIA_MISSION_BASE}/mission-2`;
export const FAMILY_DR_VICTORIA_MISSION_3_PATH = `${FAMILY_DR_VICTORIA_MISSION_BASE}/mission-3`;
export const FAMILY_DR_VICTORIA_HUB_PATH = FAMILY_DR_VICTORIA_MISSION_BASE;

export function familyDrVictoriaMissionPath(missionId: string): string {
  return `${FAMILY_DR_VICTORIA_MISSION_BASE}/${missionId}`;
}
export const KIDS_PORTAL_PATH = '/portal/kids';
export const STUDENT_PIN_LOGIN_PATH = '/kids/login';
export const CAIDEN_QUEST_HUB_PATH = `${KIDS_PORTAL_PATH}/caiden`;
export const CAIDEN_QUEST_1_PATH = `${CAIDEN_QUEST_HUB_PATH}/quest-1`;

export const FACILITATOR_PORTAL_PATH = '/portal/facilitator';
export const FACILITATOR_ADULT_TRAINING_PATH = `${FACILITATOR_PORTAL_PATH}/adult-training`;
export const FACILITATOR_DR_VICTORIA_MISSION_BASE = `${FACILITATOR_ADULT_TRAINING_PATH}/dr-victoria`;
export const FACILITATOR_DR_VICTORIA_MISSION_1_PATH = `${FACILITATOR_DR_VICTORIA_MISSION_BASE}/mission-1`;
export const FACILITATOR_DR_VICTORIA_MISSION_2_PATH = `${FACILITATOR_DR_VICTORIA_MISSION_BASE}/mission-2`;
export const FACILITATOR_DR_VICTORIA_MISSION_3_PATH = `${FACILITATOR_DR_VICTORIA_MISSION_BASE}/mission-3`;
export const FACILITATOR_DR_VICTORIA_HUB_PATH = FACILITATOR_DR_VICTORIA_MISSION_BASE;

export function facilitatorDrVictoriaMissionPath(missionId: string): string {
  return `${FACILITATOR_DR_VICTORIA_MISSION_BASE}/${missionId}`;
}

export const FACILITATOR_UNCLE_T_MISSION_BASE = `${FACILITATOR_ADULT_TRAINING_PATH}/uncle-t`;
export const FAMILY_UNCLE_T_MISSION_BASE = `${FAMILY_PARENT_CORNER_PATH}/uncle-t`;
export const FAMILY_UNCLE_T_MISSION_1_PATH = `${FAMILY_UNCLE_T_MISSION_BASE}/mission-1`;
export const FACILITATOR_UNCLE_T_MISSION_1_PATH = `${FACILITATOR_UNCLE_T_MISSION_BASE}/mission-1`;

export function facilitatorUncleTMissionPath(missionId: string): string {
  return `${FACILITATOR_UNCLE_T_MISSION_BASE}/${missionId}`;
}

export function familyUncleTMissionPath(missionId: string): string {
  return `${FAMILY_UNCLE_T_MISSION_BASE}/${missionId}`;
}
export const FACILITATOR_B4_RESULTS_PATH = `${FACILITATOR_PORTAL_PATH}/results/b4`;
/** @deprecated Use FACILITATOR_B4_RESULTS_PATH */
export const FACILITATOR_B4_BASELINE_RESULTS_PATH = `${FACILITATOR_PORTAL_PATH}/results/b4-baseline`;

export const PROGRAM_DASHBOARD_PATH = '/program-dashboard';
export const PROGRAM_DASHBOARD_KIDS_BASE = `${PROGRAM_DASHBOARD_PATH}/kids`;
export const FACILITATOR_BASELINE_CHECK_PATH = `${FACILITATOR_PORTAL_PATH}/baseline-check`;
export const PROGRAM_BASELINE_CHECK_PATH = `${PROGRAM_DASHBOARD_PATH}/baseline-check`;
export const FAMILY_HUB_BASELINE_CHECK_PATH = `${FAMILY_HUB_PATH}/baseline-check`;
export const FAMILY_PORTAL_BASELINE_CHECK_PATH = `${FAMILY_PORTAL_PATH}/baseline-check`;

export const FACILITATOR_ADULT_ASSESSMENT_BASE = `${FACILITATOR_PORTAL_PATH}/adult-assessment`;
export const FACILITATOR_ADULT_BASELINE_PATH = `${FACILITATOR_ADULT_ASSESSMENT_BASE}/baseline`;
export const FACILITATOR_ADULT_GROWTH_PATH = `${FACILITATOR_ADULT_ASSESSMENT_BASE}/growth`;
export const PROGRAM_ADULT_ASSESSMENT_BASE = `${PROGRAM_DASHBOARD_PATH}/adult-assessment`;
export const PROGRAM_ADULT_BASELINE_PATH = `${PROGRAM_ADULT_ASSESSMENT_BASE}/baseline`;
export const PROGRAM_ADULT_GROWTH_PATH = `${PROGRAM_ADULT_ASSESSMENT_BASE}/growth`;

export const PILOT_PROGRAM_SIGNUP_PATH = '/pilot-program-signup';
export const PILOT_INFO_PATH = '/pilot-info';
export const PILOT_TERMS_PATH = '/pilot-terms';

export const PILOT_DASHBOARD_PATH = '/pilot-dashboard';
export const BLUE_RIBBON_PILOT_PATH = '/portal/blueribbon2026';
export const ACADEMY_DASHBOARD_ALIAS_PATH = '/academy-dashboard';
export const STUDENT_GALLERY_SUBMIT_PATH = '/student-gallery-submit';
export const STUDENT_GALLERY_PUBLIC_PATH = '/student-gallery';

/** Legacy paths — keep redirecting to canonical routes. */
export const LEGACY_BRAVE_MINDS_PATH = '/braveminds';
export const LEGACY_B4_TOOLS_PATH = '/b4-tools';
export const LEGACY_COMICBOOK_PATH = '/comicbook';
export const LEGACY_CHARACTERS_PATH = '/characters';

/** Facilitator-launched shared-device kid play shell (no portal chrome). */
export const KID_PLAY_SESSION_PATH = '/play/session';

export function kidPlaySessionPath(sessionId: string): string {
  const id = sessionId.trim();
  return id ? `${KID_PLAY_SESSION_PATH}/${id}` : KID_PLAY_SESSION_PATH;
}

export function kidPlaySessionStartPath(sessionId: string): string {
  const id = sessionId.trim();
  return id ? `${KID_PLAY_SESSION_PATH}/${id}/weekly-adventures` : KID_PLAY_SESSION_PATH;
}
