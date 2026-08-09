import {
  activateCheckpoint,
  collectFocusFlame,
  completeDragonNest,
  createDragonNestRunState,
  findBabyDragon,
  loseCourage,
} from './state';

describe('Dragon Nest Rescue local run state', () => {
  it('tracks Focus Flames without exceeding the level total', () => {
    let state = createDragonNestRunState();
    for (let count = 0; count < 20; count += 1) state = collectFocusFlame(state);
    expect(state.flames).toBe(12);
  });

  it('decrements Courage without violent or negative values', () => {
    let state = createDragonNestRunState();
    state = loseCourage(loseCourage(loseCourage(loseCourage(state))));
    expect(state.courage).toBe(0);
  });

  it('stores the latest checkpoint and restores one Courage Heart', () => {
    const hurt = loseCourage(createDragonNestRunState());
    const state = activateCheckpoint(hurt, 1, { x: 800, y: 420 });
    expect(state.checkpoint).toEqual({ x: 800, y: 420 });
    expect(state.courage).toBe(3);
  });

  it('changes the objective when the baby dragon is found', () => {
    expect(findBabyDragon(createDragonNestRunState()).objective).toBe("REACH THE DRAGON'S NEST");
  });

  it('completes only after the baby dragon is found', () => {
    const initial = createDragonNestRunState();
    expect(completeDragonNest(initial).complete).toBe(false);
    expect(completeDragonNest(findBabyDragon(initial)).complete).toBe(true);
  });
});
