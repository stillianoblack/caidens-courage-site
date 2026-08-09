import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GamesPage from './GamesPage';

jest.mock('../components/courage/CourageFooter', () => () => null);
jest.mock('../components/courage/CourageHeader', () => () => null);

describe('GamesPage', () => {
  it('is a public discovery page that sends playable adventures through the student gateway', () => {
    render(<MemoryRouter><GamesPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Help B-4 catch the Focus Flames.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'B-4 Focus Flight' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Story Quest' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dragon Flight' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Play B-4 Focus Flight' })).toHaveAttribute('href', '/portal?audience=students');
    expect(screen.getByRole('link', { name: 'Already a member? Sign in' })).toHaveAttribute('href', '/portal');
  });
});
