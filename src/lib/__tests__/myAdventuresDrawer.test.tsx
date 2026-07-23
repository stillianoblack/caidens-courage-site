import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyAdventuresDrawer from '../../components/kid-play-shell/MyAdventuresDrawer';
import KidPlayShellNav from '../../components/kid-play-shell/KidPlayShellNav';
import { MyAdventuresProvider, useMyAdventures } from '../../context/MyAdventuresContext';
import type { AdventureJourneyMonthView } from '../weeklyAdventureJourneyMonths';

jest.mock('../../hooks/useInventoryNotificationBadge', () => ({
  useInventoryNotificationBadge: () => 0,
}));

jest.mock('../../hooks/useB4Variant', () => ({
  useB4Variant: () => ({
    variant: 'pattern',
    selectionRequired: false,
    loading: false,
    error: null,
    save: jest.fn(),
    refresh: jest.fn(),
  }),
}));

function month(monthNumber: number, completed: number): AdventureJourneyMonthView {
  return {
    monthNumber,
    title: `Month ${monthNumber}: Journey ${monthNumber}`,
    weekNumbers: [monthNumber * 4 - 3, monthNumber * 4 - 2, monthNumber * 4 - 1, monthNumber * 4],
    certificateRequiredWeeks: 4,
    comingSoon: false,
    completedWeekNumbers: Array.from({ length: completed }, (_, index) => monthNumber * 4 - 3 + index),
    progress: {
      monthNumber,
      title: `Journey ${monthNumber}`,
      tagline: 'Keep going',
      description: 'Complete the required weeks to finish this journey.',
      monthlyBadgeName: 'Journey Badge',
      certificateName: 'Journey Certificate',
      weeksCompleted: completed,
      weeksTotal: 4,
      monthChallengeStarted: completed > 0,
      monthChallengeCompleted: completed === 4,
      certificateEarned: completed === 4,
      monthlyBadgeEarned: completed === 4,
      completedWeekNumbers: [],
    },
  };
}

function DrawerHarness({ onSelectMonth }: { onSelectMonth: jest.Mock }) {
  const { openDrawer, triggerRef } = useMyAdventures();
  return (
    <>
      <button ref={triggerRef} type="button" onClick={openDrawer}>Open adventures</button>
      <MyAdventuresDrawer
        participantId="child-1"
        displayName="Nova"
        currentWeek={5}
        focusCoins={42}
        focusCoinsLoading={false}
        months={[
          { month: month(1, 4), locked: false },
          { month: month(2, 1), locked: false },
          { month: month(3, 0), locked: true },
        ]}
        selectedMonthNumber={2}
        currentMonthNumber={2}
        selectedMonthRecord={null}
        onSelectMonth={onSelectMonth}
      />
    </>
  );
}

describe('My Adventures drawer', () => {
  beforeEach(() => window.localStorage.clear());

  test('shows NEW before first open and removes it after acknowledgment', () => {
    render(
      <MemoryRouter>
        <MyAdventuresProvider participantId="child-1">
          <KidPlayShellNav
            sessionId="session-1"
            activeModule="weekly-adventures"
            participantId="child-1"
            displayName="Nova"
            onExitClick={jest.fn()}
          />
        </MyAdventuresProvider>
      </MemoryRouter>,
    );

    const trigger = screen.getByRole('button', { name: /My Adventures/ });
    expect(trigger).toHaveTextContent('NEW');
    fireEvent.click(trigger);
    expect(trigger).not.toHaveTextContent('NEW');
    expect(window.localStorage.getItem('kid-play:my-adventures-seen:child-1')).toBe('true');
  });

  test('opens accessibly, traps focus, restores focus, and keeps locked months disabled', async () => {
    const onSelectMonth = jest.fn();
    render(
      <MyAdventuresProvider participantId="child-1">
        <DrawerHarness onSelectMonth={onSelectMonth} />
      </MyAdventuresProvider>,
    );

    const trigger = screen.getByRole('button', { name: 'Open adventures' });
    fireEvent.click(trigger);
    const drawer = screen.getByRole('dialog', { name: 'My Adventures' });
    expect(drawer).toBeInTheDocument();
    expect(document.body).toHaveStyle({ position: 'fixed', overflow: 'hidden' });
    expect(screen.getByRole('button', { name: /Month 2/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /Month 3/ })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Month 1/ }));
    expect(onSelectMonth).toHaveBeenCalledWith(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'My Adventures' })).not.toBeInTheDocument();
    expect(document.body).not.toHaveStyle({ position: 'fixed', overflow: 'hidden' });
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  test('disables discovery motion for reduced-motion users', () => {
    const css = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/components/kid-play-shell/kid-play-shell-nav.css'),
      'utf8',
    );
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('.kidPlayShellNavBtn--discovery { animation: none; }');
  });

  test('keeps the B-4 avatar circular instead of stretching it as flex content', () => {
    const css = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/components/kid-play-shell/my-adventures-drawer.css'),
      'utf8',
    );
    expect(css).toContain('.myAdventuresPlayer__b4Name {');
    expect(css).not.toContain('.myAdventuresPlayer__b4 > span {');
  });
});
