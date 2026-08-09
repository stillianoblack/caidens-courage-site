import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CourageHeader from './CourageHeader';

jest.mock('./PilotAccessNavLink', () => ({ label, className }: { label: string; className?: string }) => (
  <button type="button" className={className}>{label}</button>
));

describe('CourageHeader', () => {
  it('renders the current shared navigation and removes the retired portal item', () => {
    render(
      <MemoryRouter initialEntries={['/brave-mind-club']}>
        <CourageHeader />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Caiden\'s Courage home' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /the story/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kids/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^for/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Games' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Enter the World' })).toHaveAttribute('href', '/story');
    expect(screen.queryByText('Portal')).not.toBeInTheDocument();
  });
});
