export type ReflectionOption = {
  id: string;
  label: string;
  isCorrect: boolean;
};

export const FOCUS_REFLECTION_HEADER = 'Focus Flame Reflection';

export const FOCUS_REFLECTION_B4 = {
  intro: 'Caiden’s flame got steadier because he slowed down and listened to himself.',
  correct: 'Exactly. When we slow down, we understand ourselves better.',
  wrongFirst: 'Almost. Try again.',
  revealed: 'Exactly. When we slow down, we understand ourselves better.',
} as const;

export const FOCUS_REFLECTION_PROMPT = 'What happens when we steady our flame?';

export const FOCUS_REFLECTION_OPTIONS: readonly ReflectionOption[] = [
  { id: 'understand', label: 'We understand our feelings better', isCorrect: true },
  { id: 'disappear', label: 'We disappear', isCorrect: false },
  { id: 'stop-caring', label: 'We stop caring', isCorrect: false },
  { id: 'loud', label: 'We become loud', isCorrect: false },
] as const;
