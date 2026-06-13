import { DR_VICTORIA_GUIDE_SRC, UNCLE_T_GUIDE_SRC } from './adult/sharedAssets';
import { PORTAL_COLORING_PAGES } from './portalDownloadAssets';
import { getPortalRoute, resolvePortalKidsBasePath } from '../lib/portalGamePaths';
import { resolveFamilyBasePath } from '../lib/familyPortalNav';

export type CharacterProfileId =
  | 'caiden'
  | 'miranda'
  | 'b4'
  | 'charlie'
  | 'zeke'
  | 'dr-victoria'
  | 'uncle-t';

export type CharacterScanStats = {
  focus: number;
  courage: number;
  teamwork: number;
  curiosity: number;
};

export type CharacterScanContent = {
  powers: string[];
  loves: string[];
  teaches: string;
  specialTrait: string;
  stats: CharacterScanStats;
};

export type CharacterProfileContent = {
  id: CharacterProfileId;
  name: string;
  displayTitle: string;
  tagline: string;
  bio: string;
  likes: string[];
  strengths: string[];
  storyRole: string;
  learningFocus: string;
  imageSrc: string | null;
  theme: CharacterProfileId;
  missionsAvailable: boolean;
  missionsLabel: string;
  coloringAvailable: boolean;
};

const COLORING_BY_ID: Partial<Record<CharacterProfileId, string>> = {
  caiden: PORTAL_COLORING_PAGES.find((p) => p.id === 'caiden')?.href,
  miranda: PORTAL_COLORING_PAGES.find((p) => p.id === 'miranda')?.href,
  b4: PORTAL_COLORING_PAGES.find((p) => p.id === 'b4')?.href,
};

export const CHARACTER_SCAN_CONTENT: Record<CharacterProfileId, CharacterScanContent> = {
  caiden: {
    powers: ['Focus', 'Bravery'],
    loves: ['Drawing', 'Heroes'],
    teaches: 'Executive Function',
    specialTrait: 'Focus Flame Leader',
    stats: { focus: 90, courage: 85, teamwork: 70, curiosity: 75 },
  },
  miranda: {
    powers: ['Problem Solving', 'Observation'],
    loves: ['Mysteries', 'Reading'],
    teaches: 'Comprehension',
    specialTrait: 'Master Detective',
    stats: { focus: 88, courage: 72, teamwork: 68, curiosity: 92 },
  },
  b4: {
    powers: ['Check-Ins', 'Reflection'],
    loves: ['Helping Kids'],
    teaches: 'SEL',
    specialTrait: 'Guide Robot',
    stats: { focus: 82, courage: 70, teamwork: 88, curiosity: 74 },
  },
  charlie: {
    powers: ['Observation', 'Testing Ideas'],
    loves: ['Experiments', 'Robots'],
    teaches: 'Science Skills',
    specialTrait: 'Nature Scientist',
    stats: { focus: 78, courage: 65, teamwork: 80, curiosity: 95 },
  },
  zeke: {
    powers: ['Teamwork', 'Courage'],
    loves: ['Team Games', 'Friends'],
    teaches: 'Social Skills',
    specialTrait: 'Team Captain',
    stats: { focus: 70, courage: 88, teamwork: 92, curiosity: 68 },
  },
  'dr-victoria': {
    powers: ['Empathy', 'Patience'],
    loves: ['Helping Families', 'Questions'],
    teaches: 'Adult SEL',
    specialTrait: 'Family Guide',
    stats: { focus: 85, courage: 78, teamwork: 90, curiosity: 86 },
  },
  'uncle-t': {
    powers: ['Encouragement', 'Coaching'],
    loves: ['Coaching', 'Family Wisdom'],
    teaches: 'Confidence',
    specialTrait: 'Courage Coach',
    stats: { focus: 76, courage: 90, teamwork: 86, curiosity: 72 },
  },
};

export const CHARACTER_PROFILE_CONTENT: Record<CharacterProfileId, CharacterProfileContent> = {
  caiden: {
    id: 'caiden',
    name: 'Caiden',
    displayTitle: "Caiden's Focus Flame Journey",
    tagline: 'The boy learning how to turn focus into power.',
    bio: 'Caiden is brave, creative, and sometimes overwhelmed by big feelings and distractions. His journey helps kids practice focus, courage, planning, and emotional reset skills.',
    likes: ['Drawing', 'Superhero stories', 'Helping friends', 'Learning how his Focus Flame works'],
    strengths: ['Focus', 'Courage', 'Creativity', 'Emotional reset'],
    storyRole: 'Caiden is the main hero of the Focus Flame story.',
    learningFocus: 'Executive function, focus, courage, emotional regulation.',
    imageSrc: '/images/caidenscourage/Game-Hub/characters/caiden-hotspot.webp',
    theme: 'caiden',
    missionsAvailable: true,
    missionsLabel: 'Start Missions',
    coloringAvailable: true,
  },
  miranda: {
    id: 'miranda',
    name: 'Miranda',
    displayTitle: "Miranda's Mystery Files",
    tagline: 'A brilliant pattern-finder who notices what others miss.',
    bio: 'Miranda sees patterns, clues, and details that help the team solve problems. Her missions help kids build reading comprehension, vocabulary, observation, and confidence.',
    likes: ['Mysteries', 'Patterns', 'Reading clues', 'Solving puzzles'],
    strengths: ['Observation', 'Pattern recognition', 'Confidence', 'Deduction'],
    storyRole: 'Miranda helps Caiden understand clues, choices, and hidden meaning.',
    learningFocus: 'Reading comprehension, language arts, pattern recognition, confidence.',
    imageSrc: '/images/caidenscourage/Game-Hub/characters/miranda-hotspot.webp',
    theme: 'miranda',
    missionsAvailable: true,
    missionsLabel: 'Start Missions',
    coloringAvailable: true,
  },
  b4: {
    id: 'b4',
    name: 'B-4',
    displayTitle: 'B-4 Focus Missions',
    tagline: 'The guide who helps kids pause, check in, and choose their next move.',
    bio: 'B-4 helps kids understand feelings, focus signals, and brave choices. B-4 turns check-ins into simple steps kids can practice.',
    likes: ['Check-ins', 'Helpful reminders', 'Focus moves', 'Encouraging kids'],
    strengths: ['Self-awareness', 'Reflection', 'Encouragement', 'Focus strategies'],
    storyRole: 'B-4 is the guide and support companion.',
    learningFocus: 'SEL, self-awareness, focus strategies, reflection.',
    imageSrc: '/images/caidenscourage/Game-Hub/characters/b4-hotspot.webp',
    theme: 'b4',
    missionsAvailable: true,
    missionsLabel: 'Start Missions',
    coloringAvailable: true,
  },
  charlie: {
    id: 'charlie',
    name: 'Charlie Perk',
    displayTitle: "Charlie Perk\u2019s Science Lab",
    tagline: 'A curious scientist who turns experiments into clever adventures.',
    bio: 'Charlie Perk brings science-based missions that teach observation, testing ideas, evidence, and problem solving — with humor that stays smart and kid-friendly.',
    likes: ['Experiments', 'Mystery clues', 'Robot debugging', 'Science fair projects'],
    strengths: ['Observation', 'Critical thinking', 'Curiosity', 'Teamwork'],
    storyRole: 'Charlie brings science-based learning and playful experimentation to the program.',
    learningFocus: 'Science, observation, evidence, problem solving, critical thinking.',
    imageSrc: '/images/caidenscourage/Game-Hub/characters/charlie-hotspot.webp',
    theme: 'charlie',
    missionsAvailable: true,
    missionsLabel: 'Start Missions',
    coloringAvailable: false,
  },
  zeke: {
    id: 'zeke',
    name: 'Zeke',
    displayTitle: "Zeke's Team Quest",
    tagline: 'The friend who helps kids speak up, join in, and work as a team.',
    bio: 'Zeke is brave, energetic, and loyal. His missions help kids practice social skills, courage, teamwork, friendship repair, and speaking up respectfully.',
    likes: ['Team games', 'Helping friends', 'Trying new things', 'Fair play'],
    strengths: ['Courage', 'Teamwork', 'Leadership', 'Social awareness'],
    storyRole: 'Zeke helps the team navigate social challenges and grow together.',
    learningFocus: 'Social skills, teamwork, courage, friendship repair, inclusion.',
    imageSrc: '/images/caidenscourage/Game-Hub/characters/zeke-hotspot.webp',
    theme: 'zeke',
    missionsAvailable: true,
    missionsLabel: 'Start Missions',
    coloringAvailable: false,
  },
  'dr-victoria': {
    id: 'dr-victoria',
    name: 'Dr. Victoria',
    displayTitle: 'Dr. Victoria Learning Hub',
    tagline: 'A caring adult guide who helps families understand different minds.',
    bio: 'Dr. Victoria helps parents, teachers, and counselors look beyond behavior and support children with curiosity, patience, and empathy.',
    likes: [
      'Helping kids feel understood',
      'Asking better questions',
      'Supporting families',
      'Teaching adults with care',
    ],
    strengths: ['Empathy', 'Patience', 'Communication', 'Understanding'],
    storyRole: 'Dr. Victoria supports adult learning and family understanding.',
    learningFocus: 'Adult SEL, ADHD/autism awareness, supportive communication.',
    imageSrc: DR_VICTORIA_GUIDE_SRC,
    theme: 'dr-victoria',
    missionsAvailable: true,
    missionsLabel: 'Start Missions',
    coloringAvailable: false,
  },
  'uncle-t': {
    id: 'uncle-t',
    name: 'Uncle T',
    displayTitle: 'Uncle T Coaching Hub',
    tagline: 'A steady coach who helps kids build courage and confidence.',
    bio: 'Uncle T helps kids and adults practice encouragement, resilience, and brave choices at home and in the community.',
    likes: ['Coaching', 'Encouragement', 'Family wisdom', 'Helping kids try again'],
    strengths: ['Encouragement', 'Resilience', 'Coaching', 'Confidence-building'],
    storyRole: 'Uncle T brings warmth, guidance, and confidence-building support.',
    learningFocus: 'Confidence, resilience, home support, adult coaching.',
    imageSrc: UNCLE_T_GUIDE_SRC,
    theme: 'uncle-t',
    missionsAvailable: true,
    missionsLabel: 'Start Missions',
    coloringAvailable: false,
  },
};

export type ResolvedCharacterProfile = CharacterProfileContent & CharacterScanContent & {
  profilePath: string;
  missionsPath: string;
  coloringHref: string | null;
  activitiesPath: string;
};

export function isCharacterProfileId(value: string): value is CharacterProfileId {
  return value in CHARACTER_PROFILE_CONTENT;
}

export function resolveCharacterMissionsPath(id: CharacterProfileId, pathname: string): string {
  const basePath = resolveFamilyBasePath(pathname);
  const kidsBase = resolvePortalKidsBasePath(pathname);

  switch (id) {
    case 'caiden':
      return `${kidsBase}/caiden`;
    case 'miranda':
      return `${kidsBase}/miranda`;
    case 'b4':
      return `${kidsBase}/b4`;
    case 'charlie':
      return `${kidsBase}/charlie`;
    case 'zeke':
      return `${kidsBase}/zeke`;
    case 'dr-victoria':
      return `${basePath}/guide/dr-victoria`;
    case 'uncle-t':
      return `${basePath}/guide/uncle-t`;
    default:
      return getPortalRoute('characters', pathname);
  }
}

export function buildCharacterProfile(
  id: CharacterProfileId,
  pathname: string,
): ResolvedCharacterProfile {
  const content = CHARACTER_PROFILE_CONTENT[id];
  const basePath = resolveFamilyBasePath(pathname);

  return {
    ...content,
    ...CHARACTER_SCAN_CONTENT[id],
    profilePath: `${basePath}/characters/${id}`,
    missionsPath: resolveCharacterMissionsPath(id, pathname),
    coloringHref: content.coloringAvailable ? COLORING_BY_ID[id] ?? null : null,
    activitiesPath: getPortalRoute('downloads', pathname),
  };
}

export function resolveCharacterProfileTitle(pathname: string): string | null {
  const match = pathname.match(/\/characters\/([^/]+)/);
  if (!match || !isCharacterProfileId(match[1])) return null;
  return CHARACTER_PROFILE_CONTENT[match[1]].name;
}
