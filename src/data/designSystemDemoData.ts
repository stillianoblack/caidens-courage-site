import type { BaselineBarRow } from '../components/portal-design-system/BaselineOverviewBars';
import type { PilotRosterRow } from '../hooks/usePilotRosterData';
import type { PilotNeedsAttentionCounts } from '../lib/pilotStudentProgress';
import type { StudentGalleryItem } from '../lib/studentGalleryService';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from '../lib/pilotTrackingLocalStorage';
import type { StudentParticipantRecord } from '../lib/pilotTrackingService';
import type { FamilyChildSummary } from '../lib/familyChildrenMetrics';
import type { FamilyRecentActivityItem } from '../lib/familyProgressMetrics';
import type { StudentFamilyLink } from '../lib/studentFamilyLinkService';

export const DEMO_PROGRAM_CODE = 'DEMO-PROGRAM';

export const DEMO_ROSTER_ROWS: PilotRosterRow[] = [
  {
    participantId: 'demo-student-001',
    childName: 'Alex Rivera',
    nickname: 'Al',
    parentGuardianName: 'Maria Rivera',
    parentGuardianShort: 'Maria R.',
    parentFirstName: 'Maria',
    parentLastName: 'Rivera',
    parentEmail: 'maria.rivera@example.com',
    parentPhone: '(555) 010-2001',
    emergencyContact: '—',
    campProgramCode: DEMO_PROGRAM_CODE,
    familyAccessCode: 'FAM-DEMO-01',
    familyProgramCode: 'FAM-DEMO-01',
    baselineStatus: 'Complete',
    status: 'active',
    moduleCompletions: 4,
    lastActivityAt: '2026-06-08T14:22:00.000Z',
  },
  {
    participantId: 'demo-student-002',
    childName: 'Jordan Lee',
    nickname: 'J',
    parentGuardianName: 'Sam Lee',
    parentGuardianShort: 'Sam L.',
    parentFirstName: 'Sam',
    parentLastName: 'Lee',
    parentEmail: 'sam.lee@example.com',
    parentPhone: '(555) 010-2002',
    emergencyContact: '—',
    campProgramCode: DEMO_PROGRAM_CODE,
    familyAccessCode: 'FAM-DEMO-01',
    familyProgramCode: 'FAM-DEMO-01',
    baselineStatus: 'Not Started',
    status: 'not-started',
    moduleCompletions: 0,
    lastActivityAt: null,
  },
];

export const DEMO_BASELINE_ROWS: BaselineBarRow[] = [
  { key: 'feelings', label: 'Feelings / Confidence', pct: 72, tone: 'feelings', labelDetail: '3 of 4 complete' },
  { key: 'reading', label: 'Reading', pct: 58, tone: 'reading', labelDetail: '2 of 4 complete' },
  { key: 'focus', label: 'Focus Moves', pct: 81, tone: 'focus', labelDetail: '4 of 5 complete' },
  { key: 'overall', label: 'Overall', pct: 68, tone: 'overall', labelDetail: '12 of 18 complete' },
];

export const DEMO_NEEDS_ATTENTION: PilotNeedsAttentionCounts = {
  missingBaseline: 2,
  inactive7PlusDays: 1,
  noModules: 3,
  certificateReady: 1,
};

export const DEMO_RECENT_ACTIVITY = [
  'Alex completed Focus Flame coloring page',
  'Jordan uploaded artwork — pending review',
  'Maria completed Adult Baseline',
  'Program goals saved',
  'Week 1 module completed',
];

export const DEMO_GALLERY_ITEM: StudentGalleryItem = {
  id: 'demo-gallery-001',
  created_at: '2026-06-07T10:00:00.000Z',
  title: 'Focus Flame coloring page',
  student_nickname: 'Alex',
  program_code: DEMO_PROGRAM_CODE,
  group_name: 'Demo Cohort',
  file_url: '/images/characters/caiden_photo_icon_game.webp',
  file_path: 'demo/focus-flame.webp',
  status: 'approved',
  caption: 'Completed after Week 1 reading activity.',
  upload_source: 'family',
  visibility: 'program_private',
  uploaded_by_role: 'family',
};

export const DEMO_PENDING_GALLERY_ITEM: StudentGalleryItem = {
  ...DEMO_GALLERY_ITEM,
  id: 'demo-gallery-002',
  title: 'Reflection journal page',
  student_nickname: 'Jordan',
  status: 'pending',
  file_url: '/images/characters/miranda_photo_icon_game.webp',
};

export const DEMO_PARTICIPANTS: StudentParticipantRecord[] = [
  {
    id: 'demo-student-001',
    nickname: 'Al',
    first_name: 'Alex',
    role: 'student',
    program_code: DEMO_PROGRAM_CODE,
    created_at: '2026-05-01T12:00:00.000Z',
  },
];

export const DEMO_FAMILY_LINKS: StudentFamilyLink[] = [
  {
    id: 'demo-link-001',
    student_id: 'demo-student-001',
    camp_program_code: DEMO_PROGRAM_CODE,
    family_program_code: 'FAM-DEMO-01',
    parent_email: 'maria.rivera@example.com',
    parent_first_name: 'Maria',
    parent_last_name: 'Rivera',
    parent_phone: '(555) 010-2001',
    relationship: 'parent',
    parent_claimed: true,
    claimed_at: '2026-05-02T09:00:00.000Z',
    created_at: '2026-05-01T12:00:00.000Z',
  },
];

export const DEMO_ASSESSMENTS: LocalAssessmentV2Record[] = [];
export const DEMO_MODULES: LocalModuleResultRecord[] = [
  {
    id: 'demo-module-001',
    participant_id: 'demo-student-001',
    role: 'student',
    program_code: DEMO_PROGRAM_CODE,
    module_id: 'week-1-focus',
    module_title: 'Week 1 — Focus Moves',
    character: 'b4',
    score: 88,
    max_score: 100,
    percent_score: 88,
    attempt_number: 1,
    completed_at: '2026-06-05T16:00:00.000Z',
  },
];

export const DEMO_FAMILY_CHILD_SUMMARY: FamilyChildSummary = {
  key: 'demo-student-001',
  participantId: 'demo-student-001',
  displayName: 'Alex Rivera',
  nickname: 'Al',
  baselineStatus: 'Complete',
  latestActivity: 'Jun 8, 2026',
  progressPct: 68,
  completedCount: 4,
  totalCount: 6,
  progressLabel: '4 of 6 modules',
  createdAt: '2026-05-01T12:00:00.000Z',
};

export const DEMO_FAMILY_RECENT_ACTIVITY: FamilyRecentActivityItem[] = [
  {
    id: 'demo-activity-001',
    label: 'Alex completed B-4 Check-In',
    kind: 'baseline',
    timestamp: '2026-06-08T10:00:00.000Z',
  },
  {
    id: 'demo-activity-002',
    label: 'Certificate earned — Week 1 Focus Moves',
    kind: 'certificate',
    timestamp: '2026-06-07T16:00:00.000Z',
  },
  {
    id: 'demo-activity-003',
    label: 'Gallery submission uploaded — Focus Flame coloring page',
    kind: 'gallery',
    timestamp: '2026-06-07T10:00:00.000Z',
  },
  {
    id: 'demo-activity-004',
    label: 'Family goals saved (3 selected)',
    kind: 'goals',
    timestamp: '2026-06-06T09:00:00.000Z',
  },
  {
    id: 'demo-activity-005',
    label: 'Alex linked to your family',
    kind: 'linked',
    timestamp: '2026-06-05T12:00:00.000Z',
  },
];

export const DEMO_MODULE_ROWS = [
  { student: 'Alex Rivera', module: 'Week 1 — Focus Moves', score: '88%', status: 'Complete' },
  { student: 'Alex Rivera', module: 'Week 1 — Reading', score: '76%', status: 'Complete' },
  { student: 'Jordan Lee', module: 'Week 1 — Focus Moves', score: '—', status: 'Not Started' },
];
