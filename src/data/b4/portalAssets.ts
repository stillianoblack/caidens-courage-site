import { B4_AVATAR_SRC } from './avatar';

export { B4_AVATAR_SRC as B4_GAME_AVATAR_SRC };

export const B4_PORTAL_HUB = {
  title: 'B-4 Focus Missions',
  subtitle: 'Practice focus moves, feelings check-ins, and brave choices.',
};

export const B4_PORTAL_MISSIONS = [
  {
    id: 'check-in',
    title: 'Start My B-4 Check-In',
    description: 'Answer a few questions so B-4 can learn how you focus.',
    cta: 'Start Check-In',
    route: '/portal/kids/b4/check-in',
  },
  {
    id: 'week-1',
    title: 'Week 1: Find Your Focus Flame',
    description: 'Practice focus, emotion, and brave choice skills with B-4.',
    cta: 'Start Week 1',
    route: '/portal/kids/b4/week-1',
  },
  {
    id: 'feeling-finder',
    title: 'Name That Feeling',
    description: 'Practice naming feelings, reading body signals, and choosing calming next steps.',
    cta: 'Start Mission',
    route: '/portal/kids/b4/feeling-finder',
  },
] as const;
