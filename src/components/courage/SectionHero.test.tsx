import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SectionHero from './SectionHero';

describe('SectionHero', () => {
  it('places an optional visual before the hero copy', () => {
    const { container } = render(
      <MemoryRouter>
        <SectionHero
          eyebrow="Brave Mind Club"
          title="Brave Mind Club"
          description="Free resources."
          visual={<img src="/student-b4.webp" alt="Student B-4" />}
        />
      </MemoryRouter>,
    );

    const visual = container.querySelector('.cc-section-hero-visual');
    const heading = screen.getByRole('heading', { name: 'Brave Mind Club' }).closest('.cc-section-hero-copy');
    expect(visual).not.toBeNull();
    expect(heading).not.toBeNull();
    expect(visual!.compareDocumentPosition(heading as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
