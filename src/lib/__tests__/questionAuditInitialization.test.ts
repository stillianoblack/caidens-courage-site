import { B4_ADAPTIVE_MISSION_FILES } from '../../data/b4/b4AdaptiveMissions';
import { CHARLIE_ADAPTIVE_MISSION_FILES } from '../../data/charlie/charlieAdaptiveMissions';
import { ZEKE_ADAPTIVE_MISSION_FILES } from '../../data/zeke/zekeAdaptiveMissions';
import { caidenAdaptiveQuests } from '../../data/caiden';
import { mirandaFiles } from '../../data/miranda';

describe('question-bank registry initialization', () => {
  it('initializes every adaptive registry without a circular dependency failure', () => {
    expect(B4_ADAPTIVE_MISSION_FILES).toHaveLength(8);
    expect(CHARLIE_ADAPTIVE_MISSION_FILES).toHaveLength(8);
    expect(ZEKE_ADAPTIVE_MISSION_FILES).toHaveLength(8);
    expect(caidenAdaptiveQuests).toHaveLength(9);
    expect(mirandaFiles.length).toBeGreaterThanOrEqual(6);
  });
});
