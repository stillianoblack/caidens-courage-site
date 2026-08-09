import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CourageHeader from './CourageHeader';
import { PilotAccessProvider } from './PilotAccessProvider';

function renderHeader() {
  return render(<MemoryRouter><PilotAccessProvider><CourageHeader /></PilotAccessProvider></MemoryRouter>);
}

describe('shared Courage navigation refinement', () => {
  it('uses semantic, mutually exclusive dropdown buttons and preserves the portal destination', () => {
    renderHeader();
    const story = screen.getByRole('button', { name: 'The Story' });
    const kids = screen.getByRole('button', { name: 'Kids' });
    const forMenu = screen.getByRole('button', { name: 'For' });

    [story, kids, forMenu].forEach((trigger) => {
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    fireEvent.click(story);
    expect(story).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(kids);
    expect(story).toHaveAttribute('aria-expanded', 'false');
    expect(kids).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(kids);
    expect(kids).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(forMenu);
    expect(forMenu).toHaveAttribute('aria-expanded', 'true');
    fireEvent.mouseDown(document.body);
    expect(forMenu).toHaveAttribute('aria-expanded', 'false');

    expect(screen.getByRole('link', { name: /Enter the World/ })).toHaveAttribute('href', '/portal');
    expect(screen.getByRole('link', { name: /Enter the World/ })).toHaveClass('min-h-[50px]');
    expect(screen.getByRole('link', { name: 'Games' })).toHaveAttribute('href', '/games');
  });

  it('supports keyboard activation and returns focus after Escape', () => {
    renderHeader();
    const story = screen.getByRole('button', { name: 'The Story' });
    story.focus();
    fireEvent.keyDown(story, { key: 'Enter' });
    expect(story).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(story).toHaveAttribute('aria-expanded', 'false');
    expect(story).toHaveFocus();
    fireEvent.keyDown(story, { key: ' ' });
    expect(story).toHaveAttribute('aria-expanded', 'true');
  });
});
