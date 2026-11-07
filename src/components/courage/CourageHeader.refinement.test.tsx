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
    const academy = screen.getByRole('button', { name: 'Focus Flame Academy' });
    const audiences = screen.getByRole('button', { name: 'Who We Serve' });

    [story, academy, audiences].forEach((trigger) => {
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    fireEvent.click(story);
    expect(story).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(academy);
    expect(story).toHaveAttribute('aria-expanded', 'false');
    expect(academy).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Games' })).toHaveAttribute('href', '/games');
    expect(screen.getByRole('link', { name: 'Coloring Pages' })).toHaveAttribute('href', '/brave-mind-club/coloring-pages');
    fireEvent.click(academy);
    expect(academy).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(audiences);
    expect(audiences).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Parents' })).toHaveAttribute('href', '/parents');
    expect(screen.getByRole('menuitem', { name: 'Schools & Districts' })).toHaveAttribute('href', '/schools');
    fireEvent.mouseDown(document.body);
    expect(audiences).toHaveAttribute('aria-expanded', 'false');

    expect(screen.getByRole('link', { name: /Enter the World/ })).toHaveAttribute('href', '/portal');
    expect(screen.getByRole('link', { name: /Enter the World/ })).toHaveClass('min-h-[50px]');
    expect(screen.getByRole('link', { name: 'Shop' })).toHaveAttribute('href', 'https://caidenvale.com/story/books');
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
