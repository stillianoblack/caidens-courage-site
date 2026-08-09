import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { B4_STATE_KEYS, B4_VARIANT_KEYS, B4_VARIANTS, getB4TextureKey, normalizeB4Variant } from '../../data/b4/variantManifest';
import { B4FlightStateMachine } from '../../games/b4-focus-flight/phaser/B4FlightStateMachine';
import {
  getB4FocusFlightUnlockState,
  getParticipantB4FlightStorageKey,
  markB4FocusFlightPlayed,
} from '../b4FocusFlightUnlock';

describe('B-4 variant manifest', () => {
  it('contains every variant and state with a valid runtime asset', () => {
    expect(B4_VARIANT_KEYS).toHaveLength(5);
    B4_VARIANT_KEYS.forEach((variant) => B4_STATE_KEYS.forEach((state) => {
      const definition = B4_VARIANTS[variant];
      expect(definition.states[state].src).toBe(`/assets/b4/${variant}/${state}/b4-${variant}-${state}.png`);
      expect(fs.existsSync(path.join(process.cwd(), 'public', definition.states[state].src))).toBe(true);
      expect(getB4TextureKey(variant, state)).toBe(`b4-${variant}-${state}`);
    }));
  });

  it('normalizes legacy and invalid values safely', () => {
    expect(normalizeB4Variant('spark')).toBe('courage');
    expect(normalizeB4Variant(undefined)).toBe('courage');
    expect(normalizeB4Variant('not-a-variant')).toBe('courage');
    expect(normalizeB4Variant('pattern')).toBe('pattern');
  });

  it('ships four byte-distinct Pattern runtime states with identical canvas dimensions', () => {
    const states = ['idle', 'happy', 'hurt', 'blinking'] as const;
    const runtimeHashes = new Set<string>();
    const dimensions: string[] = [];

    for (const state of states) {
      const runtimePath = path.join(
        process.cwd(),
        'public',
        B4_VARIANTS.pattern.states[state].src,
      );
      const runtime = fs.readFileSync(runtimePath);
      runtimeHashes.add(crypto.createHash('sha256').update(runtime).digest('hex'));
      dimensions.push(`${runtime.readUInt32BE(16)}x${runtime.readUInt32BE(20)}`);
    }

    expect(runtimeHashes.size).toBe(4);
    expect(new Set(dimensions)).toEqual(new Set(['1200x680']));
  });

  it('keeps profile/dashboard, Arcade, and Flight wired to the central asset manifest', () => {
    const files = [
      'src/components/family-portal/FamilyChildrenDashboardGrid.tsx',
      'src/components/family-portal/FamilyChildB4Control.tsx',
      'src/components/kid-play-shell/KidArcadePanel.tsx',
      'src/games/b4-focus-flight/B4FocusFlightPage.tsx',
      'src/games/b4-focus-flight/phaser/scenes/GameScene.ts',
    ];
    for (const file of files) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).toMatch(/getB4Asset|B4VariantSelector|getB4TextureKey/);
    }
  });
});

describe('B-4 onboarding migration safety', () => {
  const migration = fs.readFileSync(
    path.join(process.cwd(), 'supabase/migrations/20260715000400_b4_selection_onboarding.sql'),
    'utf8',
  );
  const executable = migration.replace(/--.*$/gm, '');

  it('normalizes only exact legacy spark rows and never confirms existing defaults', () => {
    expect(executable).toMatch(/set\s+b4_variant_key\s*=\s*'courage'\s+where\s+b4_variant_key\s*=\s*'spark'/i);
    expect(executable).not.toMatch(/set\s+b4_variant_selected_at\s*=/i);
    expect(executable).not.toMatch(/where\s+b4_variant_selected_at\s+is\s+null/i);
  });

  it('preserves the canonical allowlist and includes bounded pre/postchecks', () => {
    ['courage', 'pattern', 'shield', 'anchor', 'fusion'].forEach((variant) => {
      expect(migration).toContain(`'${variant}'`);
    });
    expect(migration).toContain('legacy_spark_rows');
    expect(migration).toContain('remaining_legacy_spark_rows');
    expect(migration).toContain('invalid_variant_rows');
  });
});

describe('B-4 Flight state precedence and cleanup', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const createMachine = (changes: string[]) => new B4FlightStateMachine(
    (state) => changes.push(state),
    (delay, callback) => setTimeout(callback, delay),
    (timer) => clearTimeout(timer as ReturnType<typeof setTimeout>),
  );

  it('returns temporary states to idle', () => {
    const changes: string[] = [];
    const machine = createMachine(changes);
    machine.request('happy', 250);
    jest.advanceTimersByTime(250);
    expect(changes).toEqual(['happy', 'idle']);
  });

  it('prevents blink and happy from interrupting hurt', () => {
    const changes: string[] = [];
    const machine = createMachine(changes);
    expect(machine.request('hurt', 500)).toBe(true);
    expect(machine.request('blinking', 100)).toBe(false);
    expect(machine.request('happy', 100)).toBe(false);
    jest.advanceTimersByTime(500);
    expect(changes).toEqual(['hurt', 'idle']);
  });

  it('supports idle to happy, happy to hurt, and idle to blinking transitions', () => {
    const changes: string[] = [];
    const machine = createMachine(changes);
    expect(machine.request('happy', 500)).toBe(true);
    expect(machine.request('hurt', 250)).toBe(true);
    jest.advanceTimersByTime(250);
    expect(machine.request('blinking', 100)).toBe(true);
    jest.advanceTimersByTime(100);
    expect(changes).toEqual(['happy', 'hurt', 'idle', 'blinking', 'idle']);
  });

  it('cancels stale callbacks on reset and dispose', () => {
    const changes: string[] = [];
    const machine = createMachine(changes);
    machine.request('happy', 250);
    machine.reset();
    machine.request('blinking', 100);
    machine.dispose();
    jest.runAllTimers();
    expect(changes).toEqual(['happy', 'idle', 'blinking']);
  });
});

describe('B-4 Flight participant isolation', () => {
  beforeEach(() => window.localStorage.clear());

  it('scopes scores, completion, and unlock flags to the canonical participant', () => {
    const scoreKey = 'b4-focus-flight:best-score';
    window.localStorage.setItem(getParticipantB4FlightStorageKey(scoreKey, 'child-one'), '596');
    expect(window.localStorage.getItem(getParticipantB4FlightStorageKey(scoreKey, 'child-two'))).toBeNull();

    markB4FocusFlightPlayed('child-one');
    expect(getB4FocusFlightUnlockState('child-one').played).toBe(true);
    expect(getB4FocusFlightUnlockState('child-two').played).toBe(false);
  });
});
