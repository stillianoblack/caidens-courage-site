import { fireEvent, render, screen } from '@testing-library/react';
import CourageQuestListPanel from './CourageQuestListPanel';

describe('CourageQuestListPanel states', () => {
  test('renders a recoverable error and retries', () => {
    const retry = jest.fn();
    render(
      <CourageQuestListPanel
        quests={[]}
        loading={false}
        error="We couldn't load quests right now."
        onRetry={retry}
      />,
    );

    expect(screen.queryByText('Loading quests…')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent("We couldn't load quests right now.");
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  test('renders the explicit empty state', () => {
    render(<CourageQuestListPanel quests={[]} loading={false} />);
    expect(screen.getByText('No quests available yet.')).toBeInTheDocument();
  });
});
