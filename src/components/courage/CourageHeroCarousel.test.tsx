import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CourageHeroCarousel from './CourageHeroCarousel';

function mockMotion(matches: boolean) {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? matches : false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

function renderCarousel() {
  return render(
    <MemoryRouter>
      <CourageHeroCarousel />
    </MemoryRouter>,
  );
}

describe('Courage homepage hero carousel', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts on the holiday slide, advances every seven seconds, and keeps the story hero as slide 3', () => {
    mockMotion(false);
    jest.useFakeTimers();
    renderCarousel();

    expect(screen.getByRole('heading', { name: 'Give the Gift of Courage This Holiday Season' })).toBeInTheDocument();
    expect(screen.getByText('Big imagination. Brave hearts. A little holiday magic.')).toBeInTheDocument();
    expect(screen.getByText('Give the kids in your life more than a gift. Give them a world to explore.')).toBeInTheDocument();
    expect(document.querySelectorAll('.cc-hero-slide')).toHaveLength(3);
    expect(document.querySelectorAll('.cc-hero-slide[aria-hidden="true"]')).toHaveLength(2);
    expect(screen.getByRole('img', { name: 'The Season of Courage' })).toHaveAttribute(
      'src',
      '/images/backgrounds/holidayseason_text.webp',
    );
    expect(document.querySelector('.cc-hero-slide-bg--holiday.is-active')?.getAttribute('style')).toContain(
      '/images/backgrounds/holiday_carousel_slide_1.webp',
    );

    act(() => {
      jest.advanceTimersByTime(7000);
    });
    expect(screen.getByRole('heading', { name: 'Story, play, and practice in one place.' })).toBeInTheDocument();
    expect(document.querySelector('.cc-hero-slide-bg--academy.is-active')?.getAttribute('style')).toContain(
      '/images/B-4FlightGame/background/GameplayBackgrounds.webp',
    );
    expect(screen.getByRole('img', { name: /desktop monitor, phone, and laptop/ })).toHaveAttribute(
      'src',
      '/images/backgrounds/Device-mocks.webp',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show Story-powered SEL' }));
    expect(screen.getByRole('heading', { name: 'The story where focus becomes a superpower.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Order the Book' })).toHaveAttribute('href', 'https://caidenvale.com/story/books');
    expect(screen.getByRole('img', { name: /hardcover graphic novel/ })).toHaveAttribute('src', '/images/backgrounds/caidenvale_book_hero.webp');
  });

  it('pauses on the pause control and moves with the arrows', () => {
    mockMotion(false);
    jest.useFakeTimers();
    renderCarousel();

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    act(() => {
      jest.advanceTimersByTime(14000);
    });
    expect(screen.getByRole('heading', { name: 'Give the Gift of Courage This Holiday Season' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(screen.getByRole('heading', { name: 'Story, play, and practice in one place.' })).toBeInTheDocument();
  });

  it('opens on the story hero and does not auto-advance when reduced motion is requested', () => {
    mockMotion(true);
    jest.useFakeTimers();
    renderCarousel();

    expect(screen.getByRole('heading', { name: 'The story where focus becomes a superpower.' })).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(14000);
    });
    expect(screen.getByRole('heading', { name: 'The story where focus becomes a superpower.' })).toBeInTheDocument();
  });
});
