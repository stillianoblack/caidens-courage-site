import { addDistance, collectFlame, createFlameRunState, isRunOver, loseCourage, scrollSpeedFor } from './state';

describe('B-4 Flame Run state', () => {
  test('adds distance and distance score', () => {
    expect(addDistance(createFlameRunState(), 10)).toMatchObject({ distance: 10, score: 20 });
  });

  test('collects Focus Flames and increases score', () => {
    expect(collectFlame(createFlameRunState(), 1000)).toMatchObject({ flames: 1, streak: 1, score: 100 });
  });

  test('builds x2, x3, and Focus Mode multipliers', () => {
    let state = createFlameRunState();
    for (let index = 0; index < 20; index += 1) state = collectFlame(state, 500);
    expect(state).toMatchObject({ streak: 20, multiplier: 4, focusModeUntil: 5500 });
  });

  test('loses Courage and resets the streak', () => {
    const streaking = collectFlame(collectFlame(createFlameRunState(), 0), 0);
    expect(loseCourage(streaking)).toMatchObject({ courage: 2, streak: 0, multiplier: 1 });
  });

  test('ends the run at zero Courage', () => {
    let state = createFlameRunState();
    state = loseCourage(loseCourage(loseCourage(state)));
    expect(isRunOver(state)).toBe(true);
  });

  test('increases difficulty smoothly and caps speed', () => {
    expect(scrollSpeedFor(0)).toBe(355);
    expect(scrollSpeedFor(30)).toBe(387);
    expect(scrollSpeedFor(60)).toBe(419);
    expect(scrollSpeedFor(90)).toBe(451);
    expect(scrollSpeedFor(999)).toBe(660);
  });
});
