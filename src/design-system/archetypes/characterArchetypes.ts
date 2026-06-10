import { getCharacter } from '../characters/characterRegistry';

export type ApprovedComponentType =
  | 'LearningMomentCard.B4_LOCK_IN'
  | 'LearningMomentCard.B4_PARENT_COACH'
  | 'LearningMomentCard.FACILITATOR_INSIGHT'
  | 'QuestionCard'
  | 'GameShell'
  | 'AnswerChoiceList';

export type CharacterArchetypeProfile = {
  id: string;
  name: string;
  role: string;
  purpose: string;
  description: string;
  avatar: string;
  portalUsage: Array<'kid' | 'family' | 'facilitator' | 'all'>;
  approvedComponentTypes: ApprovedComponentType[];
};

export const CHARACTER_ARCHETYPE_PROFILES: Record<string, CharacterArchetypeProfile> = {
  b4: {
    id: 'b4',
    name: 'B-4',
    role: 'Universal coach',
    purpose: 'Universal coach for students, parents, and facilitators',
    description:
      'Navigation, lock-in tips, parent coaching, and activity support across all portals.',
    avatar: '/images/characters/b-4_photo_icon_game.webp',
    portalUsage: ['all'],
    approvedComponentTypes: [
      'LearningMomentCard.B4_LOCK_IN',
      'LearningMomentCard.B4_PARENT_COACH',
      'GameShell',
      'AnswerChoiceList',
    ],
  },
  caiden: {
    id: 'caiden',
    name: 'Caiden',
    role: 'Focus journey hero',
    purpose: 'Focus, persistence, problem solving',
    description: 'Kid-facing quests about first steps, courage, and bringing attention back.',
    avatar: '/images/characters/caiden_photo_icon_game.webp',
    portalUsage: ['kid', 'family', 'facilitator'],
    approvedComponentTypes: ['QuestionCard', 'GameShell', 'LearningMomentCard.B4_LOCK_IN'],
  },
  miranda: {
    id: 'miranda',
    name: 'Miranda',
    role: 'Mystery perspective guide',
    purpose: 'Emotional intelligence, self-awareness',
    description: 'Observation, pattern recognition, and autistic perspective in mystery files.',
    avatar: '/images/characters/miranda_photo_icon_game.webp',
    portalUsage: ['kid', 'family', 'facilitator'],
    approvedComponentTypes: ['QuestionCard', 'GameShell', 'LearningMomentCard.B4_LOCK_IN'],
  },
  ollie: {
    id: 'ollie',
    name: 'Ollie Buck',
    role: 'Reading & creativity guide',
    purpose: 'Reading confidence, creativity',
    description: 'Story moments that build reading confidence and creative expression.',
    avatar: '/images/gallery/olliebuck_bre.webp',
    portalUsage: ['kid', 'family'],
    approvedComponentTypes: ['QuestionCard', 'LearningMomentCard.B4_LOCK_IN'],
  },
  genesis: {
    id: 'genesis',
    name: 'Genesis',
    role: 'Leadership guide',
    purpose: 'Leadership and confidence',
    description: 'Leadership stories that help kids practice confidence and initiative.',
    avatar: '/images/gallery/genesis_bre.webp',
    portalUsage: ['kid', 'family'],
    approvedComponentTypes: ['QuestionCard', 'LearningMomentCard.B4_LOCK_IN'],
  },
  'dr-victoria': {
    id: 'dr-victoria',
    name: 'Dr. Victoria',
    role: 'Professional educator guide',
    purpose: 'Professional educator guidance',
    description: 'Facilitator training, reflection cards, and research-informed SEL coaching.',
    avatar: '/images/caidenscourage/Character%20Hub/dr-victoria-guide.webp',
    portalUsage: ['facilitator'],
    approvedComponentTypes: [
      'LearningMomentCard.FACILITATOR_INSIGHT',
      'QuestionCard',
      'GameShell',
    ],
  },
};

export function getArchetypeProfile(id: string): CharacterArchetypeProfile | undefined {
  return CHARACTER_ARCHETYPE_PROFILES[id] ?? mapRegistryToArchetype(id);
}

function mapRegistryToArchetype(id: string): CharacterArchetypeProfile | undefined {
  const character = getCharacter(id);
  if (!character) return undefined;
  return {
    id: character.id,
    name: character.displayName,
    role: character.role,
    purpose: character.description,
    description: character.description,
    avatar: character.avatarSrc,
    portalUsage: character.portalUsage.includes('all')
      ? ['all']
      : (character.portalUsage as CharacterArchetypeProfile['portalUsage']),
    approvedComponentTypes: ['QuestionCard'],
  };
}
