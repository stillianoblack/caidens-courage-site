export type CharacterArchetype = 'guide' | 'expert' | 'story_hero' | 'story_villain' | 'story_support';

export type PortalUsage = 'facilitator' | 'family' | 'kid' | 'all';

export type CharacterDefinition = {
  id: string;
  displayName: string;
  role: string;
  archetype: CharacterArchetype;
  avatarSrc: string;
  themeColor: string;
  accentColor: string;
  portalUsage: PortalUsage[];
  description: string;
  voiceNotes: string;
};

export const CHARACTER_REGISTRY: Record<string, CharacterDefinition> = {
  b4: {
    id: 'b4',
    displayName: 'B-4',
    role: 'Focus Flame guide',
    archetype: 'guide',
    avatarSrc: '/images/characters/b-4_photo_icon_game.webp',
    themeColor: '#050b18',
    accentColor: '#f0ce6e',
    portalUsage: ['all'],
    description: 'Navigation, encouragement, lock-in tips, and activity support.',
    voiceNotes: 'Upbeat, concise, encouraging, practical.',
  },
  caiden: {
    id: 'caiden',
    displayName: 'Caiden',
    role: 'Focus journey hero',
    archetype: 'story_hero',
    avatarSrc: '/images/characters/caiden_photo_icon_game.webp',
    themeColor: '#243e70',
    accentColor: '#e5c06a',
    portalUsage: ['kid', 'family', 'facilitator'],
    description: 'Kid-facing quests about courage, focus, and first steps.',
    voiceNotes: 'Brave, curious, relatable.',
  },
  miranda: {
    id: 'miranda',
    displayName: 'Miranda',
    role: 'Mystery files / perspective guide',
    archetype: 'story_hero',
    avatarSrc: '/images/characters/miranda_photo_icon_game.webp',
    themeColor: '#5c3d6e',
    accentColor: '#c4b5fd',
    portalUsage: ['kid', 'family', 'facilitator'],
    description: 'Observation, pattern recognition, and autistic perspective tools.',
    voiceNotes: 'Thoughtful, precise, warm.',
  },
  'dr-victoria': {
    id: 'dr-victoria',
    displayName: 'Dr. Victoria',
    role: 'Adult learning guide',
    archetype: 'expert',
    avatarSrc: '/images/caidenscourage/Character%20Hub/dr-victoria-guide.webp',
    themeColor: '#1a3a5c',
    accentColor: '#93c5fd',
    portalUsage: ['facilitator', 'family'],
    description: 'Facilitator tips, parent education, and reflection cards.',
    voiceNotes: 'Calm, validating, practical, research-informed.',
  },
  'uncle-t': {
    id: 'uncle-t',
    displayName: 'Uncle T',
    role: 'Adult coaching guide',
    archetype: 'expert',
    avatarSrc: '/images/caidenscourage/Character%20Hub/uncle-t-guide.webp',
    themeColor: '#c9732d',
    accentColor: '#e5c06a',
    portalUsage: ['facilitator', 'family'],
    description: 'Coaching moments for courage, confidence, and follow-through.',
    voiceNotes: 'Warm, encouraging, practical, relatable.',
  },
  'camp-coach': {
    id: 'camp-coach',
    displayName: 'Camp Coach',
    role: 'Program facilitator coach',
    archetype: 'expert',
    avatarSrc: '/images/icons/B4_Chat_Icon.webp',
    themeColor: '#1a2f52',
    accentColor: '#c8922e',
    portalUsage: ['facilitator'],
    description: 'Camp pacing, group management, and program flow coaching.',
    voiceNotes: 'Direct, supportive, action-oriented.',
  },
  'school-counselor': {
    id: 'school-counselor',
    displayName: 'School Counselor',
    role: 'School support specialist',
    archetype: 'expert',
    avatarSrc: '/images/icons/B4_Chat_Icon.webp',
    themeColor: '#1e3a5f',
    accentColor: '#86efac',
    portalUsage: ['facilitator', 'family'],
    description: 'SEL framing for school and home collaboration.',
    voiceNotes: 'Warm, structured, collaborative.',
  },
  'parent-mentor': {
    id: 'parent-mentor',
    displayName: 'Parent Mentor',
    role: 'Family coaching guide',
    archetype: 'expert',
    avatarSrc: '/images/icons/B4_Chat_Icon.webp',
    themeColor: '#3d2c4a',
    accentColor: '#f9a8d4',
    portalUsage: ['family'],
    description: 'Parent-friendly coaching for trying strategies at home.',
    voiceNotes: 'Gentle, empowering, non-judgmental.',
  },
  zeke: {
    id: 'zeke',
    displayName: 'Zeke',
    role: 'Team Quest guide',
    archetype: 'story_support',
    avatarSrc: '/images/characters/zeke_photo_icon_game.webp',
    themeColor: '#1a2f52',
    accentColor: '#e5c06a',
    portalUsage: ['kid', 'family'],
    description: 'Social courage, teamwork, and speaking up through adaptive team quests.',
    voiceNotes: 'Encouraging, socially smart, warm, practical — never preachy.',
  },
  ollie: {
    id: 'ollie',
    displayName: 'Ollie Buck',
    role: 'Reading & creativity guide',
    archetype: 'story_hero',
    avatarSrc: '/images/gallery/olliebuck_bre.webp',
    themeColor: '#4a3728',
    accentColor: '#fcd34d',
    portalUsage: ['kid', 'family'],
    description: 'Reading confidence, creativity, and expressive story moments.',
    voiceNotes: 'Expressive, humorous, encouraging.',
  },
  'ollie-buck': {
    id: 'ollie-buck',
    displayName: 'Ollie Buck',
    role: 'Story character',
    archetype: 'story_support',
    avatarSrc: '/images/gallery/olliebuck_bre.webp',
    themeColor: '#4a3728',
    accentColor: '#fcd34d',
    portalUsage: ['kid'],
    description: 'Narrative gameplay moments inside Focus Flame stories.',
    voiceNotes: 'Expressive, humorous, grounded.',
  },
  genesis: {
    id: 'genesis',
    displayName: 'Genesis',
    role: 'Leadership guide',
    archetype: 'story_hero',
    avatarSrc: '/images/gallery/genesis_bre.webp',
    themeColor: '#4c1d95',
    accentColor: '#c4b5fd',
    portalUsage: ['kid', 'family'],
    description: 'Leadership stories that build confidence and initiative.',
    voiceNotes: 'Bold, supportive, empowering.',
  },
  leviathan: {
    id: 'leviathan',
    displayName: 'Leviathan',
    role: 'Story challenge',
    archetype: 'story_villain',
    avatarSrc: '/images/focus-flame-lab/thecave_block_image.webp',
    themeColor: '#1e1b4b',
    accentColor: '#818cf8',
    portalUsage: ['kid'],
    description: 'Represents overwhelm and distraction in narrative beats.',
    voiceNotes: 'Dramatic but not frightening; metaphorical.',
  },
  'breath-of-life': {
    id: 'breath-of-life',
    displayName: 'Breath of Life',
    role: 'Calm-down guide',
    archetype: 'story_support',
    avatarSrc: '/images/focus-flame-lab/thepath.webp',
    themeColor: '#0f766e',
    accentColor: '#5eead4',
    portalUsage: ['kid', 'family'],
    description: 'Breathing, reset, and regulation story moments.',
    voiceNotes: 'Soft, steady, reassuring.',
  },
};

export const GUIDE_CHARACTERS = ['b4', 'caiden', 'miranda'] as const;
export const EXPERT_CHARACTERS = ['dr-victoria', 'uncle-t', 'camp-coach', 'school-counselor', 'parent-mentor'] as const;
export const STORY_CHARACTERS = ['caiden', 'miranda', 'zeke', 'ollie-buck', 'leviathan', 'breath-of-life'] as const;

export function getCharacter(id: string): CharacterDefinition | undefined {
  return CHARACTER_REGISTRY[id];
}

export function getCharactersByArchetype(archetype: CharacterArchetype): CharacterDefinition[] {
  return Object.values(CHARACTER_REGISTRY).filter((c) => c.archetype === archetype);
}
