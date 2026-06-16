/** Shared Miranda Mystery Files assets — update here when final art is ready. */
export const MIRANDA_AVATAR_SRC =
  '/images/caidenscourage/Character%20Hub/miranda_photo_icon_game.webp';

/** @deprecated Use MIRANDA_AVATAR_SRC */
export const MIRANDA_GAME_AVATAR_SRC = MIRANDA_AVATAR_SRC;

export const MIRANDA_AVATAR_ALT = 'Miranda, junior detective';

/** Shared avatar fields for all Miranda mission configs */
export const MIRANDA_MISSION_AVATAR = {
  avatarSrc: MIRANDA_AVATAR_SRC,
  quizAvatarSrc: MIRANDA_AVATAR_SRC,
  avatarAlt: MIRANDA_AVATAR_ALT,
} as const;

export const MIRANDA_HUB = {
  eyebrow: 'FOCUS FLAME ACADEMY',
  title: "Miranda's Mystery Files",
  subtitle: 'Pick a case. Read the clues. Solve the mystery.',
  intro:
    'Miranda keeps every investigation in her mystery files. Open a case, pay close attention, and help her follow the story.',
};
