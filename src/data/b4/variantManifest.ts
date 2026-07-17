export type B4VariantKey = 'courage' | 'pattern' | 'shield' | 'anchor' | 'fusion';
export type B4StateKey = 'idle' | 'happy' | 'hurt' | 'blinking';

export type B4VariantDefinition = {
  key: B4VariantKey;
  name: string;
  descriptor: string;
  colorName: string;
  accentToken: string;
  states: Record<B4StateKey, { src: string; srcSet?: string }>;
  default?: boolean;
};

export const B4_VARIANT_KEYS: readonly B4VariantKey[] = ['courage', 'pattern', 'shield', 'anchor', 'fusion'] as const;
export const B4_STATE_KEYS: readonly B4StateKey[] = ['idle', 'happy', 'hurt', 'blinking'] as const;

const statesFor = (variant: B4VariantKey): B4VariantDefinition['states'] => ({
  idle: { src: `/assets/b4/${variant}/idle/b4-${variant}-idle.png` },
  happy: { src: `/assets/b4/${variant}/happy/b4-${variant}-happy.png` },
  hurt: { src: `/assets/b4/${variant}/hurt/b4-${variant}-hurt.png` },
  blinking: { src: `/assets/b4/${variant}/blinking/b4-${variant}-blinking.png` },
});

export const B4_VARIANTS: Record<B4VariantKey, B4VariantDefinition> = {
  courage: { key: 'courage', name: 'B-4 Courage', descriptor: 'Brave Energy', colorName: 'blue', accentToken: 'var(--b4-courage, #2f6fdb)', states: statesFor('courage'), default: true },
  pattern: { key: 'pattern', name: 'B-4 Pattern', descriptor: 'Pattern Power', colorName: 'purple', accentToken: 'var(--b4-pattern, #7556c7)', states: statesFor('pattern') },
  shield: { key: 'shield', name: 'B-4 Shield', descriptor: 'Brave Protector', colorName: 'red', accentToken: 'var(--b4-shield, #cf4b54)', states: statesFor('shield') },
  anchor: { key: 'anchor', name: 'B-4 Anchor', descriptor: 'Calm Strength', colorName: 'orange', accentToken: 'var(--b4-anchor, #e47f32)', states: statesFor('anchor') },
  fusion: { key: 'fusion', name: 'B-4 Fusion', descriptor: 'Balanced Focus', colorName: 'green/teal', accentToken: 'var(--b4-fusion, #199b8c)', states: statesFor('fusion') },
};

export function isB4VariantKey(value: string | null | undefined): value is B4VariantKey {
  return B4_VARIANT_KEYS.includes(value as B4VariantKey);
}

export function normalizeB4Variant(value: string | null | undefined): B4VariantKey {
  if (value === 'spark') return 'courage';
  return B4_VARIANT_KEYS.includes(value as B4VariantKey) ? (value as B4VariantKey) : 'courage';
}

export function getB4Asset(variant: string | null | undefined, state: B4StateKey = 'idle'): string {
  return B4_VARIANTS[normalizeB4Variant(variant)].states[state].src;
}

export function getB4TextureKey(variant: B4VariantKey, state: B4StateKey): string {
  return `b4-${variant}-${state}`;
}
