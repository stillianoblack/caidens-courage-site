import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import FacilitatorAdventureSnapshot from '../FacilitatorAdventureSnapshot';
import { OPEN_PROGRAM_GOALS_EVENT } from '../../../lib/openProgramGoals';

const snapshot = {
  studentsEnrolled: 17,
  learnersWithCompletedAdventure: 14,
  completedAdventures: 29,
  readyToPlay: 16,
  parentConnected: 12,
  warning: false,
};

describe('FacilitatorAdventureSnapshot', () => {
  it('renders the existing defensible metrics without changing their values', () => {
    render(<FacilitatorAdventureSnapshot data={snapshot} placement="rail" />);

    expect(screen.getByText('Students enrolled').nextSibling).toHaveTextContent('17');
    expect(screen.getByText('Completed an adventure').nextSibling).toHaveTextContent('14');
    expect(screen.getByText('Completed adventures').nextSibling).toHaveTextContent('29');
    expect(screen.getByText('Ready to play').nextSibling).toHaveTextContent('16');
    expect(screen.getByText('Parent connected').nextSibling).toHaveTextContent('12');
  });

  it('opens the existing goals drawer through the shared event', () => {
    const listener = jest.fn();
    window.addEventListener(OPEN_PROGRAM_GOALS_EVENT, listener);
    render(<FacilitatorAdventureSnapshot data={snapshot} placement="inline" />);

    fireEvent.click(screen.getByRole('button', { name: 'What would you like to improve?' }));
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(OPEN_PROGRAM_GOALS_EVENT, listener);
  });

  it('keeps the roster usable when snapshot activity is unavailable', () => {
    render(
      <FacilitatorAdventureSnapshot data={{ ...snapshot, warning: true }} placement="inline" />,
    );
    expect(screen.getByText(/couldn’t load the latest snapshot/i)).toBeInTheDocument();
  });
});
