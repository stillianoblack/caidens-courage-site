import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ActiveParticipantProvider, useActiveParticipantContext } from '../ActiveParticipantContext';
import { loadFamilyChildrenRoster } from '../../lib/familyChildrenRosterService';

jest.mock('../../lib/familyChildrenRosterService', () => ({
  loadFamilyChildrenRoster: jest.fn(),
}));

const mockedLoadRoster = loadFamilyChildrenRoster as jest.MockedFunction<typeof loadFamilyChildrenRoster>;

function Probe() {
  const state = useActiveParticipantContext();
  return (
    <div>
      <span data-testid="loading">{String(state.loading)}</span>
      <span data-testid="needs-selection">{String(state.needsSelection)}</span>
      <span data-testid="participant-id">{state.participantId}</span>
      <span data-testid="error">{state.error ?? ''}</span>
    </div>
  );
}

describe('ActiveParticipantProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockedLoadRoster.mockReset();
  });

  test('parent with one child does not need the child picker', async () => {
    mockedLoadRoster.mockResolvedValue({
      programCode: 'FAMILY-GDI-LONDON-Q4M2',
      claimRequired: false,
      errors: [],
      roster: [
        {
          participantId: 'child-1',
          displayName: 'London 5th Grade',
          firstName: 'London',
          gradeLevel: '5',
          gradeLabel: '5th Grade',
        },
      ],
    });

    render(
      <ActiveParticipantProvider programCode="FAMILY-GDI-LONDON-Q4M2">
        <Probe />
      </ActiveParticipantProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('participant-id')).toHaveTextContent('child-1'));
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('needs-selection')).toHaveTextContent('false');
  });

  test('/portal loader exits to error state instead of hanging forever', async () => {
    mockedLoadRoster.mockRejectedValueOnce(new Error('participant_hydration_timeout'));

    render(
      <ActiveParticipantProvider programCode="FAMILY-GDI-LONDON-Q4M2">
        <Probe />
      </ActiveParticipantProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('error')).toHaveTextContent('participant_hydration_timeout');
  });
});
