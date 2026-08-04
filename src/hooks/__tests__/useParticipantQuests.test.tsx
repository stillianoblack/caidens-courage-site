import { act, renderHook, waitFor } from '@testing-library/react';
import { loadParticipantQuests } from '../../lib/participantQuestService';
import {
  QUEST_LOAD_TIMEOUT_MS,
  useParticipantQuests,
} from '../useParticipantQuests';

jest.mock('../../lib/participantQuestService', () => ({
  ...jest.requireActual('../../lib/participantQuestService'),
  loadParticipantQuests: jest.fn(),
  claimParticipantQuest: jest.fn(),
}));

const mockedLoadParticipantQuests = loadParticipantQuests as jest.MockedFunction<typeof loadParticipantQuests>;

const quest = {
  questKey: 'complete_one_adventure',
  period: 'daily' as const,
  progressCount: 0,
  targetCount: 1,
  rewardLabel: '+10 Focus Coins',
  rewardCoins: 10,
  icon: 'flame' as const,
  claimed: false,
  claimable: false,
};

const input = {
  participantId: 'participant-1',
  weekId: 'week-2',
  completedWeekMissions: 0,
  monthlyCoinsEarned: 0,
  dailyAdventureComplete: false,
};

describe('useParticipantQuests', () => {
  beforeEach(() => {
    mockedLoadParticipantQuests.mockReset();
  });

  test('clears loading when quests load successfully', async () => {
    mockedLoadParticipantQuests.mockResolvedValue([quest]);
    const { result } = renderHook(() => useParticipantQuests(input));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockedLoadParticipantQuests).toHaveBeenCalledTimes(1);
    expect(result.current.quests).toEqual([quest]);
    expect(result.current.error).toBeNull();
  });

  test('clears loading on failure and retry recovers', async () => {
    mockedLoadParticipantQuests
      .mockRejectedValueOnce(new Error('network unavailable'))
      .mockResolvedValueOnce([quest]);
    const { result } = renderHook(() => useParticipantQuests(input));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("We couldn't load quests right now.");

    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.quests).toEqual([quest]);
  });

  test('transitions a stalled request to a recoverable timeout', async () => {
    jest.useFakeTimers();
    mockedLoadParticipantQuests.mockReturnValue(new Promise(() => undefined));
    const { result, unmount } = renderHook(() => useParticipantQuests(input));

    await act(async () => {
      jest.advanceTimersByTime(QUEST_LOAD_TIMEOUT_MS + 1);
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Quests took too long to load.');
    unmount();
    jest.useRealTimers();
  });
});
