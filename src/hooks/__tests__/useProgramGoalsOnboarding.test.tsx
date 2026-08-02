import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useProgramGoalsOnboarding } from '../useProgramGoalsOnboarding';
import { fetchProgramGoals, saveProgramGoals } from '../../lib/programGoalsService';

jest.mock('../../lib/programGoalsService', () => ({
  fetchProgramGoals: jest.fn(),
  saveProgramGoals: jest.fn(),
  writeProgramGoalsSkippedLocal: jest.fn(),
}));

const existingRecord = {
  program_code: 'BLUE-RIBBON',
  portal_type: 'facilitator' as const,
  selected_goals: ['Build focus'],
  custom_goal: null,
  completed_at: null,
  dismissed_until: null,
};

function Harness() {
  const goals = useProgramGoalsOnboarding({
    programCode: 'BLUE-RIBBON',
    portalType: 'facilitator',
  });
  return (
    <div>
      <span data-testid="open">{String(goals.open)}</span>
      <span data-testid="selection">{goals.record?.selected_goals.join(',') ?? ''}</span>
      <button type="button" onClick={goals.openDrawer}>Open goals</button>
      <button type="button" onClick={() => void goals.closeDrawer()}>Close goals</button>
      <button type="button" onClick={() => void goals.saveGoals(['Build courage'])}>Save goals</button>
    </div>
  );
}

describe('useProgramGoalsOnboarding facilitator behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchProgramGoals as jest.Mock).mockResolvedValue(existingRecord);
    (saveProgramGoals as jest.Mock).mockImplementation(async (record) => record);
  });

  it('loads missing or existing goals without opening automatically', async () => {
    jest.useFakeTimers();
    render(<Harness />);
    await act(async () => Promise.resolve());
    act(() => jest.advanceTimersByTime(10_000));
    expect(screen.getByTestId('open')).toHaveTextContent('false');
    jest.useRealTimers();
  });

  it('opens only by deliberate action and stays closed after closing', async () => {
    render(<Harness />);
    await waitFor(() => expect(screen.getByTestId('selection')).toHaveTextContent('Build focus'));
    fireEvent.click(screen.getByRole('button', { name: 'Open goals' }));
    expect(screen.getByTestId('open')).toHaveTextContent('true');
    fireEvent.click(screen.getByRole('button', { name: 'Close goals' }));
    await waitFor(() => expect(screen.getByTestId('open')).toHaveTextContent('false'));
    expect(saveProgramGoals).not.toHaveBeenCalled();
  });

  it('saves through the existing API contract', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Save goals' }));
    await waitFor(() => expect(saveProgramGoals).toHaveBeenCalledTimes(1));
    expect(saveProgramGoals).toHaveBeenCalledWith(expect.objectContaining({
      program_code: 'BLUE-RIBBON',
      portal_type: 'facilitator',
      selected_goals: ['Build courage'],
    }));
  });
});
