/**
 * Ask B-4 local knowledge base — editable structured content for portal guidance.
 *
 * Phase 2 TODO: Connect Ask B-4 to authenticated student profiles, activity
 * completion, and personalized recommendations after authentication and privacy
 * rules are implemented.
 */

import {
  B4_BASELINE_CHECK_PATH,
  CAIDEN_QUEST_HUB_PATH,
  FACILITATOR_B4_RESULTS_PATH,
  FACILITATOR_PORTAL_PATH,
  FAMILY_PORTAL_PATH,
  KIDS_PORTAL_PATH,
} from '../config/courageRoutes';
import {
  FACILITATOR_PORTAL_SEARCH_RESOURCES,
  FAMILY_PORTAL_SEARCH_RESOURCES,
  type PortalSearchResource,
} from './portalSearchResources';
import type { AskB4Mode } from '../lib/askB4Mode';

export type AskB4Action = {
  label: string;
  href: string;
  grantFamilyAccess?: boolean;
};

export type AskB4KnowledgeEntry = {
  id: string;
  title: string;
  category: string;
  modes: AskB4Mode[];
  summary: string;
  tags: string[];
  relatedRoutes?: string[];
  recommendedResources?: AskB4Action[];
  /** Mode-specific answer override (short). Falls back to summary. */
  kidAnswer?: string;
  familyAnswer?: string;
  facilitatorAnswer?: string;
};

function facilitatorHash(section: string): string {
  return `${FACILITATOR_PORTAL_PATH}#${section}`;
}

function portalResourceToEntry(
  resource: PortalSearchResource,
  modes: AskB4Mode[],
): AskB4KnowledgeEntry {
  return {
    id: `portal-${resource.id}`,
    title: resource.title,
    category: resource.category,
    modes,
    summary: resource.description,
    tags: [...resource.tags, resource.category.toLowerCase(), resource.title.toLowerCase()],
    relatedRoutes: [resource.href],
    recommendedResources: [
      {
        label: resource.title,
        href: resource.href,
        grantFamilyAccess: resource.grantFamilyAccess,
      },
    ],
  };
}

const PORTAL_KNOWLEDGE: AskB4KnowledgeEntry[] = [
  ...FAMILY_PORTAL_SEARCH_RESOURCES.map((r) =>
    portalResourceToEntry(r, ['family', 'kid']),
  ),
  ...FACILITATOR_PORTAL_SEARCH_RESOURCES.map((r) =>
    portalResourceToEntry(r, ['facilitator', 'family']),
  ),
];

/** Core curated knowledge — characters, games, skills, lore. */
export const ASK_B4_CORE_KNOWLEDGE: AskB4KnowledgeEntry[] = [
  {
    id: 'char-caiden',
    title: 'Caiden',
    category: 'Characters',
    modes: ['kid', 'family', 'facilitator'],
    summary:
      'Caiden is the main hero of Caiden\'s Courage. He learns that focus is a superpower through the Focus Flame Journey.',
    tags: ['caiden', 'character', 'hero', 'focus flame', 'story'],
    recommendedResources: [
      { label: "Open Caiden's Journey", href: CAIDEN_QUEST_HUB_PATH },
    ],
    kidAnswer:
      'Caiden is the brave hero who learns that focus is like a superpower! You can play his Focus Flame Journey in the portal.',
  },
  {
    id: 'char-miranda',
    title: 'Miranda',
    category: 'Characters',
    modes: ['kid', 'family', 'facilitator'],
    summary:
      'Miranda is a detective reader who solves mysteries while building vocabulary, context clues, and comprehension.',
    tags: ['miranda', 'character', 'reading', 'mystery', 'detective'],
    recommendedResources: [
      { label: "Open Miranda's Mystery Files", href: `${KIDS_PORTAL_PATH}/miranda` },
    ],
  },
  {
    id: 'char-b4',
    title: 'B-4',
    category: 'Characters',
    modes: ['kid', 'family', 'facilitator'],
    summary:
      'B-4 is a friendly robot guide who helps with feelings check-ins, focus moves, and brave choices.',
    tags: ['b-4', 'b4', 'robot', 'guide', 'focus moves'],
    recommendedResources: [
      { label: 'Start B-4 Check-In', href: `${KIDS_PORTAL_PATH}/b4/check-in` },
      { label: 'B-4 Focus Missions', href: `${KIDS_PORTAL_PATH}/b4` },
    ],
    kidAnswer:
      'B-4 is your robot buddy! B-4 helps with focus moves, feelings check-ins, and picking brave choices.',
  },
  {
    id: 'char-zeke',
    title: 'Zeke',
    category: 'Characters',
    modes: ['kid', 'family', 'facilitator'],
    summary:
      'Zeke leads Logic Lab — patterns, puzzles, and critical-thinking challenges (coming soon in the pilot).',
    tags: ['zeke', 'character', 'logic', 'puzzles'],
    recommendedResources: [
      { label: "Preview Zeke's Logic Lab", href: `${KIDS_PORTAL_PATH}/zeke` },
    ],
  },
  {
    id: 'hub-caiden-journey',
    title: "Caiden's Focus Flame Journey",
    category: 'Character Hubs',
    modes: ['kid', 'family', 'facilitator'],
    summary:
      'Interactive story quests where Caiden practices planning, prioritizing, and bringing attention back.',
    tags: ['caiden', 'focus flame journey', 'quest', 'executive function', 'planning'],
    recommendedResources: [
      { label: "Open Caiden's Journey", href: CAIDEN_QUEST_HUB_PATH },
    ],
    facilitatorAnswer:
      'Preview Caiden\'s Focus Flame Journey to assign story quests. Quest 1 builds planning; Quest 2 builds decision-making.',
  },
  {
    id: 'hub-miranda-files',
    title: "Miranda's Mystery Files",
    category: 'Character Hubs',
    modes: ['kid', 'family', 'facilitator'],
    summary:
      'Five reading mystery cases that build vocabulary, context clues, inference, and comprehension.',
    tags: ['miranda', 'mystery files', 'reading', 'comprehension', 'inference', 'context clues'],
    recommendedResources: [
      { label: "Open Miranda's Mystery Files", href: `${KIDS_PORTAL_PATH}/miranda` },
    ],
    familyAnswer:
      'Miranda\'s Mystery Files are the best reading games in the portal. Start with File #1 and move through cases together.',
    facilitatorAnswer:
      'Assign Miranda\'s Mystery Files for reading comprehension practice. Cases build from vocabulary toward inference.',
  },
  {
    id: 'hub-b4-missions',
    title: 'B-4 Focus Missions',
    category: 'Character Hubs',
    modes: ['kid', 'family', 'facilitator'],
    summary:
      'B-4 check-ins, focus moves, and brave-choice activities for SEL and self-regulation.',
    tags: ['b-4', 'focus missions', 'check-in', 'sel', 'self-regulation'],
    recommendedResources: [
      { label: 'B-4 Focus Missions', href: `${KIDS_PORTAL_PATH}/b4` },
      { label: 'Start B-4 Check-In', href: `${KIDS_PORTAL_PATH}/b4/check-in` },
    ],
  },
  {
    id: 'game-caiden-quest-1',
    title: 'Caiden Quest 1: What Comes First?',
    category: 'Games',
    modes: ['kid', 'family', 'facilitator'],
    summary:
      'Caiden Quest 1 teaches planning and prioritization — what step comes first when a task feels big.',
    tags: ['caiden', 'quest 1', 'planning', 'prioritization', 'executive function'],
    recommendedResources: [
      { label: 'Start Quest 1', href: `${CAIDEN_QUEST_HUB_PATH}/quest-1` },
    ],
  },
  {
    id: 'game-caiden-quest-2',
    title: 'Caiden Quest 2: Choose Your Next Move',
    category: 'Games',
    modes: ['kid', 'family', 'facilitator'],
    summary:
      'Caiden Quest 2 builds decision-making and flexible thinking — choosing the best next move under pressure.',
    tags: ['caiden', 'quest 2', 'decision making', 'flexible thinking'],
    recommendedResources: [
      { label: 'Start Quest 2', href: `${CAIDEN_QUEST_HUB_PATH}/quest-2` },
    ],
  },
  {
    id: 'game-miranda-file-1',
    title: 'Miranda File #1',
    category: 'Games',
    modes: ['kid', 'family', 'facilitator'],
    summary: 'First mystery case — builds vocabulary and basic reading clues.',
    tags: ['miranda', 'file 1', 'reading', 'vocabulary', 'mystery'],
    recommendedResources: [
      { label: 'Open Mystery Files', href: `${KIDS_PORTAL_PATH}/miranda` },
    ],
  },
  {
    id: 'game-miranda-file-4',
    title: 'Miranda File #4 — Context Clues',
    category: 'Games',
    modes: ['kid', 'family', 'facilitator'],
    summary: 'Miranda File #4 focuses on context clues — figuring out word meaning from surrounding text.',
    tags: ['miranda', 'file 4', 'context clues', 'reading comprehension', 'vocabulary'],
    recommendedResources: [
      { label: "Open Miranda's Mystery Files", href: `${KIDS_PORTAL_PATH}/miranda` },
    ],
    familyAnswer:
      'Miranda File #4 is great for context clues — figuring out tricky words from the words around them.',
  },
  {
    id: 'game-miranda-file-5',
    title: 'Miranda File #5 — Inference',
    category: 'Games',
    modes: ['kid', 'family', 'facilitator'],
    summary: 'Miranda File #5 builds inference — reading between the lines for story details.',
    tags: ['miranda', 'file 5', 'inference', 'reading comprehension', 'details'],
    recommendedResources: [
      { label: "Open Miranda's Mystery Files", href: `${KIDS_PORTAL_PATH}/miranda` },
    ],
    familyAnswer:
      'Miranda File #5 helps with inference — using clues to figure out what the story doesn\'t say out loud.',
  },
  {
    id: 'game-b4-checkin',
    title: 'B-4 Check-In',
    category: 'Games',
    modes: ['kid', 'family', 'facilitator'],
    summary:
      'Feelings and focus check-in with B-4. Uses nickname and group for pilot data — not required for adventure games.',
    tags: ['b-4', 'check-in', 'feelings', 'baseline', 'assessment'],
    recommendedResources: [
      { label: 'Start B-4 Check-In', href: `${KIDS_PORTAL_PATH}/b4/check-in` },
    ],
  },
  {
    id: 'game-focus-flame-lab',
    title: 'Focus Flame Lab Adventures',
    category: 'Games',
    modes: ['kid', 'family', 'facilitator'],
    summary:
      'Story adventures — The Path, The Camp, and The Cave — for focus and courage practice with Caiden.',
    tags: ['focus flame lab', 'adventure', 'caiden', 'story', 'camp', 'cave', 'path'],
    recommendedResources: [
      { label: "Open Caiden's Journey", href: CAIDEN_QUEST_HUB_PATH },
    ],
  },
  {
    id: 'skill-reading-comprehension',
    title: 'Reading Comprehension',
    category: 'Skills',
    modes: ['family', 'facilitator'],
    summary:
      'Miranda\'s Mystery Files are the best place to build reading comprehension, inference, and context clues.',
    tags: ['reading', 'comprehension', 'inference', 'context clues', 'miranda', 'skills'],
    recommendedResources: [
      { label: "Open Miranda's Mystery Files", href: `${KIDS_PORTAL_PATH}/miranda` },
    ],
    familyAnswer:
      'Miranda\'s Mystery Files are the best place to start. File #4 helps with context clues, and File #5 helps with inference and story details.',
    facilitatorAnswer:
      'Assign Miranda\'s Mystery Files for comprehension. Sequence from early cases toward Files #4 (context clues) and #5 (inference).',
  },
  {
    id: 'skill-self-regulation',
    title: 'Self-Regulation',
    category: 'Skills',
    modes: ['family', 'facilitator'],
    summary:
      'B-4 Focus Missions and Check-In support self-regulation, feelings awareness, and focus moves.',
    tags: ['self-regulation', 'sel', 'b-4', 'feelings', 'focus moves'],
    recommendedResources: [
      { label: 'B-4 Focus Missions', href: `${KIDS_PORTAL_PATH}/b4` },
      { label: 'B-4 SEL Scan Worksheet', href: `${FAMILY_PORTAL_PATH}/downloads` },
    ],
    facilitatorAnswer:
      'Start with B-4 Check-In for feelings awareness, then B-4 Focus Missions for focus moves. The B-4 SEL Scan Worksheet supports classroom reflection.',
  },
  {
    id: 'skill-executive-function',
    title: 'Executive Function',
    category: 'Skills',
    modes: ['family', 'facilitator'],
    summary:
      'Caiden\'s quests build planning, prioritization, organization, and decision-making — core executive function skills.',
    tags: ['executive function', 'planning', 'prioritization', 'organization', 'caiden'],
    recommendedResources: [
      { label: "Open Caiden's Journey", href: CAIDEN_QUEST_HUB_PATH },
    ],
  },
  {
    id: 'skill-focus-moves',
    title: 'Focus Moves',
    category: 'Skills',
    modes: ['kid', 'family', 'facilitator'],
    summary:
      'Focus Moves are quick body-and-breath strategies B-4 teaches to bring attention back.',
    tags: ['focus moves', 'focus', 'b-4', 'calm', 'attention'],
    kidAnswer:
      'Focus Moves are quick tricks B-4 teaches — like breathing or grounding — to help your brain come back to the task.',
    recommendedResources: [
      { label: 'B-4 Focus Missions', href: `${KIDS_PORTAL_PATH}/b4` },
    ],
  },
  {
    id: 'skill-planning',
    title: 'Planning',
    category: 'Skills',
    modes: ['family', 'facilitator'],
    summary: 'Caiden Quest 1: What Comes First? targets planning and breaking tasks into steps.',
    tags: ['planning', 'executive function', 'caiden', 'quest'],
    recommendedResources: [
      { label: 'Start Quest 1', href: `${CAIDEN_QUEST_HUB_PATH}/quest-1` },
    ],
  },
  {
    id: 'download-coloring',
    title: 'Coloring Pages',
    category: 'Downloads',
    modes: ['kid', 'family', 'facilitator'],
    summary:
      'Printable coloring pages for B-4, Caiden, Miranda, and Ollie Buck are in Family Portal Downloads and Facilitator Activities Library.',
    tags: ['coloring', 'downloads', 'print', 'art'],
    recommendedResources: [
      { label: 'View Coloring Pages', href: `${FAMILY_PORTAL_PATH}/downloads` },
    ],
  },
  {
    id: 'download-sel-worksheet',
    title: 'B-4 SEL Scan Worksheet',
    category: 'Downloads',
    modes: ['family', 'facilitator'],
    summary:
      'Printable B-4 SEL Scan Worksheet for feelings and focus reflection — in Downloads under Printable Activities.',
    tags: ['worksheet', 'sel', 'b-4', 'scan', 'printable', 'download'],
    recommendedResources: [
      { label: 'Download B-4 SEL Scan Worksheet', href: `${FAMILY_PORTAL_PATH}/downloads` },
    ],
  },
  {
    id: 'lore-focus-flame',
    title: 'Focus Flame',
    category: 'Lore',
    modes: ['kid', 'family', 'facilitator'],
    summary:
      'The Focus Flame is Caiden\'s inner power — courage and attention that grows when you practice brave choices.',
    tags: ['focus flame', 'lore', 'story', 'caiden', 'courage'],
    kidAnswer:
      'The Focus Flame is like Caiden\'s inner spark! It grows when you practice focus and brave choices.',
  },
  {
    id: 'lore-focus-flame-academy',
    title: 'Focus Flame Academy',
    category: 'Lore',
    modes: ['family', 'facilitator'],
    summary:
      'Focus Flame Academy is the pilot program hub — Family Portal for play at home, Facilitator Portal for camp and classroom leadership.',
    tags: ['focus flame academy', 'pilot', 'portal', 'blue ribbon'],
    recommendedResources: [
      { label: 'Family Portal', href: FAMILY_PORTAL_PATH },
      { label: 'Facilitator Portal', href: FACILITATOR_PORTAL_PATH },
    ],
  },
  {
    id: 'lore-caiden-vale',
    title: 'Caiden Vale',
    category: 'Lore',
    modes: ['family', 'facilitator'],
    summary:
      'Caiden Vale is the story world behind Caiden\'s Courage — books, characters, and adventures about focus and courage.',
    tags: ['caiden vale', 'story', 'world', 'book'],
  },
  {
    id: 'facilitator-baseline',
    title: 'B-4 Baseline Check',
    category: 'Assessments',
    modes: ['facilitator', 'family'],
    summary:
      'The B-4 Baseline Check captures starting feelings, reading, and focus-move data using nickname and group. It does not diagnose children.',
    tags: ['baseline', 'assessment', 'b-4', 'check', 'measure'],
    relatedRoutes: [B4_BASELINE_CHECK_PATH],
    recommendedResources: [
      { label: 'Open B-4 Baseline Check', href: B4_BASELINE_CHECK_PATH },
      { label: 'View Baseline Results', href: FACILITATOR_B4_RESULTS_PATH },
    ],
    facilitatorAnswer:
      'The B-4 Baseline Check measures starting points for feelings/confidence, reading, and focus moves using nickname and group. It supports pilot progress tracking — it does not diagnose or replace professional advice.',
  },
  {
    id: 'facilitator-gallery-approval',
    title: 'Gallery Approval',
    category: 'Portal Help',
    modes: ['facilitator'],
    summary:
      'In Facilitator Portal → Student Gallery, review pending uploads. Approve, reject, or request changes with an optional note to families.',
    tags: ['gallery', 'approval', 'upload', 'review', 'pending', 'facilitator'],
    relatedRoutes: [facilitatorHash('student-gallery')],
    recommendedResources: [
      { label: 'Open Student Gallery', href: facilitatorHash('student-gallery') },
    ],
    facilitatorAnswer:
      'Go to Facilitator Portal → Student Gallery. Pending family uploads appear first. Approve to publish, reject to decline, or request changes with a note families will see.',
  },
  {
    id: 'facilitator-week-1',
    title: 'Starting Week 1',
    category: 'Facilitator Guidance',
    modes: ['facilitator'],
    summary:
      'Pilot flow: have learners complete the B-4 Baseline Check, then Week 1 kit activities, Caiden/Miranda games, and coloring pages.',
    tags: ['week 1', 'start', 'pilot', 'sequence', 'facilitator'],
    recommendedResources: [
      { label: 'Open Assessments', href: facilitatorHash('assessments') },
      { label: 'Weekly Modules', href: facilitatorHash('weekly-modules') },
    ],
    facilitatorAnswer:
      'Start Week 1 by running the B-4 Baseline Check, then open Weekly Modules for the Week 1 kit. Assign Caiden or Miranda games and share coloring pages from Activities Library.',
  },
  {
    id: 'family-first-activity',
    title: 'What to Try First',
    category: 'Family Guidance',
    modes: ['family'],
    summary:
      'A great first path: B-4 Check-In for feelings, then Caiden Quest 1 or Miranda File #1 for skill play.',
    tags: ['first', 'start', 'family', 'what should we try'],
    recommendedResources: [
      { label: 'Continue Learning', href: `${FAMILY_PORTAL_PATH}/continue-learning` },
      { label: 'Game Hub', href: `${FAMILY_PORTAL_PATH}/games` },
    ],
    familyAnswer:
      'Try B-4 Check-In first for a quick feelings warm-up, then pick Caiden Quest 1 for planning or Miranda File #1 for reading.',
  },
  {
    id: 'kid-calm-down',
    title: 'Calming Down When Frustrated',
    category: 'Kid Support',
    modes: ['kid'],
    summary:
      'Try a Focus Move with B-4 — slow breath, name the feeling, then pick one small next step.',
    tags: ['calm', 'frustrated', 'feelings', 'focus move', 'kid'],
    kidAnswer:
      'When frustration shows up, try a Focus Move! Take a slow breath, name what you feel, then pick one tiny next step. B-4 Focus Missions can walk you through it.',
    recommendedResources: [
      { label: 'B-4 Focus Missions', href: `${KIDS_PORTAL_PATH}/b4` },
    ],
  },
  {
    id: 'kid-what-to-play',
    title: 'What Should I Play Next?',
    category: 'Kid Support',
    modes: ['kid'],
    summary:
      'Pick by mood: Caiden for story focus quests, Miranda for reading mysteries, B-4 for feelings and focus moves.',
    tags: ['play', 'next', 'game', 'what should i'],
    kidAnswer:
      'Want a story quest? Try Caiden! Want reading mysteries? Try Miranda! Want focus moves and feelings? Try B-4!',
    recommendedResources: [
      { label: 'Game Hub', href: `${FAMILY_PORTAL_PATH}/games` },
    ],
  },
];

/** Merged index — portal resources + curated knowledge (dedupe by id). */
export function getAskB4KnowledgeIndex(): AskB4KnowledgeEntry[] {
  const byId = new Map<string, AskB4KnowledgeEntry>();
  for (const entry of [...PORTAL_KNOWLEDGE, ...ASK_B4_CORE_KNOWLEDGE]) {
    if (!byId.has(entry.id)) {
      byId.set(entry.id, entry);
    }
  }
  return Array.from(byId.values());
}
