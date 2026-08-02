import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TheStoryPage from './TheStoryPage';
import { PilotAccessProvider } from '../components/courage/PilotAccessProvider';

it('renders exactly three editorial story-world cards with preserved destinations', () => {
  const { container } = render(<MemoryRouter><PilotAccessProvider><TheStoryPage /></PilotAccessProvider></MemoryRouter>);
  const section = container.querySelector('.story-world');
  expect(section?.querySelectorAll('.story-world__cards > a')).toHaveLength(3);
  expect(section?.querySelectorAll('img')).toHaveLength(0);
  expect(screen.getByRole('link', { name: /Meet the Characters/ })).toHaveAttribute('href', 'https://caidenvale.com/story/characters');
  expect(screen.getByRole('link', { name: /Discover Caiden Vale/ })).toHaveAttribute('href', 'https://caidenvale.com/world');
  expect(section?.querySelector('a[href="/portal"]')).toHaveTextContent('Enter the World');
});
