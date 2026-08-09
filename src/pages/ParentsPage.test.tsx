import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ParentsPage from './ParentsPage';

jest.mock('../components/courage/PilotAccessNavLink', () => ({ label, className }: { label: string; className?: string }) => (
  <button type="button" className={className}>{label}</button>
));
jest.mock('../components/courage/RelatedPathCards', () => () => null);

describe('ParentsPage', () => {
  it('uses the green family B-4 hero while preserving navigation, CTAs, and audience content', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/parents']}>
        <ParentsPage />
      </MemoryRouter>,
    );

    const hero = container.querySelector('.persona-familyHero');
    const character = hero?.querySelector<HTMLImageElement>('.persona-familyHeroB4');
    const copy = hero?.querySelector('.cc-section-hero-copy');

    expect(hero).not.toBeNull();
    expect(character).toHaveAttribute('src', '/images/Choose-Your-Guide/b-4facilitator-hover.webp');
    expect(character!.compareDocumentPosition(copy as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(screen.getAllByRole('link', { name: 'Start with the Family Portal' })[0]).toHaveAttribute(
      'href',
      '/portal?audience=parents',
    );
    expect(screen.getAllByRole('link', { name: 'Explore Kids Activities' })[0]).toHaveAttribute('href', '/kids');
    expect(screen.getByText('Parents and caregivers')).toBeInTheDocument();
    expect(screen.getByText('Tools to support everyday conversations and stronger connections.')).toBeInTheDocument();
    expect(screen.getByText('Neurodivergent-friendly home learning')).toBeInTheDocument();
    expect(screen.getByText('Builds confidence and self-advocacy')).toBeInTheDocument();
    expect(screen.getAllByText('Brave affirmation prompts').length).toBeGreaterThan(0);
    expect(screen.getByText('Cancel anytime. You’ll keep access to all resources and downloads as long as your subscription is active.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Enter the World' })).toHaveAttribute('href', '/story');
    expect(screen.queryByText('Portal', { selector: 'header *' })).not.toBeInTheDocument();
  });
});
