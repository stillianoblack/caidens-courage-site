export const FEELING_OPTIONS = ['Nervous', 'Excited', 'Embarrassed', 'Angry'] as const;
export type Feeling = (typeof FEELING_OPTIONS)[number];

export const BODY_SIGNAL_OPTIONS = ['Head', 'Chest', 'Hands', 'Stomach'] as const;
export type BodySignal = (typeof BODY_SIGNAL_OPTIONS)[number];
