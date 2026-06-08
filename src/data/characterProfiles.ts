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
    imageSrc: '/images/characters/caiden_photo_icon_game.webp',
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
    imageSrc: '/images/characters/miranda_photo_icon_game.webp',
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
    imageSrc: '/images/characters/b-4_photo_icon_game.webp',
    theme: 'b4',
    missionsAvailable: true,
    missionsLabel: 'Start Missions',
    coloringAvailable: true,
  },
  charlie: {
    id: 'charlie',
    name: 'Charlie Perk',
    displayTitle: "Charlie Perk\u2019s Nature Nook",
    tagline: 'A curious turtle who helps kids explore nature and safe choices.',
    bio: 'Charlie Perk brings fun outdoor lessons, animal facts, and camp safety moments into the Focus Flame world.',
    likes: ['Nature trails', 'Turtles', 'Camp adventures', 'Funny discoveries'],
    strengths: ['Curiosity', 'Nature awareness', 'Safe choices', 'Camp confidence'],
    storyRole: 'Charlie brings nature-based learning and curiosity to the program.',
    learningFocus: 'Nature, safety, observation, curiosity, SEL.',
    imageSrc: '/images/characters/charlieperk_photo_icon_game.webp',
    theme: 'charlie',
    missionsAvailable: true,
    missionsLabel: 'Start Missions',
    coloringAvailable: false,
  },
  zeke: {
    id: 'zeke',
    name: 'Zeke',
    displayTitle: "Zeke's Logic Lab",
    tagline: 'A logic-minded problem solver who helps kids think step by step.',
    bio: 'Zeke loves patterns, puzzles, numbers, and clever solutions. His games help kids practice math thinking, logic, and problem solving.',
    likes: ['Math puzzles', 'Strategy', 'Patterns', 'Solving hard problems'],
    strengths: ['Logic', 'Strategy', 'Problem solving', 'Critical thinking'],
    storyRole: 'Zeke helps the team think through challenges and make smart choices.',
    learningFocus: 'Math, logic, problem solving, critical thinking.',
    imageSrc: null,
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

export type ResolvedCharacterProfile = CharacterProfileContent & {
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
