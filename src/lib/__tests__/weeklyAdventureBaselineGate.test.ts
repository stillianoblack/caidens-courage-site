import {
  BASELINE_GATE_MESSAGE,
  isWeeklyMissionLocked,
} from '../launchWeeklyMission';
import type { CourageInTheDarkMission } from '../../data/courageInTheDarkMap';
import {
  resolveWeeklyAdventureBaselineLocked,
  resolveWeeklyAdventurePlayerHudGateMessage,
  resolveWeeklyAdventurePlayerHudWeekLabel,
  resolveWeeklyAdventureProgressSignal,
} from '../weeklyAdventureBaselineGate';

const sampleMission = {
  id: 'caiden',
  targetGameSlug: 'caiden-quest',
  locked: false,
} as CourageInTheDarkMission;

describe('weeklyAdventureBaselineGate', () => {
  test('new student with no baseline stays locked', () => {
    const progress = resolveWeeklyAdventureProgressSignal({
      completedByWeek: {},
      completedWeekNumbers: [],
    });

    expect(
      resolveWeeklyAdventureBaselineLocked({
        hasActiveChild: true,
        baselineComplete: false,
        ...progress,
      }),
    ).toBe(true);
  });

  test('returned student with Week 1 complete is not locked', () => {
    const progress = resolveWeeklyAdventureProgressSignal({
      completedByWeek: { 1: ['caiden', 'miranda', 'b4', 'charlie', 'zeke'] },
      completedWeekNumbers: [1],
    });

    expect(
      resolveWeeklyAdventureBaselineLocked({
        hasActiveChild: true,
        baselineComplete: false,
        ...progress,
      }),
    ).toBe(false);
  });

  test('returned student with Weeks 1–3 complete and Week 4 selected is not locked', () => {
    const progress = resolveWeeklyAdventureProgressSignal({
      completedByWeek: {
        1: ['caiden', 'miranda', 'b4', 'charlie', 'zeke'],
        2: ['caiden', 'miranda', 'b4', 'charlie', 'zeke'],
        3: ['caiden', 'miranda', 'b4', 'charlie', 'zeke'],
      },
      completedWeekNumbers: [1, 2, 3],
      requestedWeek: 4,
    });

    expect(progress.currentWeek).toBe(4);
    const baselineLocked = resolveWeeklyAdventureBaselineLocked({
      hasActiveChild: true,
      baselineComplete: false,
      ...progress,
    });
    expect(baselineLocked).toBe(false);
    expect(
      isWeeklyMissionLocked(sampleMission, {
        week: 4,
        baselineLocked,
        completedMissionIds: [],
      }),
    ).toBe(false);
  });

  test('stale baseline flag with completedWeeks > 0 is not locked', () => {
    const progress = resolveWeeklyAdventureProgressSignal({
      completedByWeek: { 2: ['caiden'] },
      completedWeekNumbers: [1],
    });

    expect(
      resolveWeeklyAdventureBaselineLocked({
        hasActiveChild: true,
        baselineComplete: false,
        b4CheckInComplete: false,
        ...progress,
      }),
    ).toBe(false);
  });

  test('stale baseline flag with only partial mission history is not locked', () => {
    const progress = resolveWeeklyAdventureProgressSignal({
      completedByWeek: { 1: ['caiden'] },
      completedWeekNumbers: [],
    });

    expect(progress.hasAnyMissionCompletion).toBe(true);
    expect(
      resolveWeeklyAdventureBaselineLocked({
        hasActiveChild: true,
        baselineComplete: false,
        ...progress,
      }),
    ).toBe(false);
  });

  test('player hud copy distinguishes returning and new users', () => {
    expect(
      resolveWeeklyAdventurePlayerHudWeekLabel({ weekNumber: 4, baselineLocked: false }),
    ).toBe('Week 4 • Continue your Focus Flame adventure.');
    expect(
      resolveWeeklyAdventurePlayerHudWeekLabel({ weekNumber: 1, baselineLocked: true }),
    ).toBe('Week 1');
    expect(
      resolveWeeklyAdventurePlayerHudGateMessage({ baselineLocked: true }),
    ).toBe(BASELINE_GATE_MESSAGE);
    expect(
      resolveWeeklyAdventurePlayerHudGateMessage({ baselineLocked: false }),
    ).toBeNull();
  });
});
