import { useEffect } from 'react';
import CourageHeader from '../components/courage/CourageHeader';
import CourageFooter from '../components/courage/CourageFooter';
import { VALE_COMICBOOK_URL, VALE_WORLD_URL } from '../config/valeLinks';
import { PORTAL_PATH } from '../config/courageRoutes';
import './the-story.css';

const synopsis = `Eleven-year-old Caiden has always felt out of step with the world around him. But when a mysterious flame awakens and draws him into the hidden realm of Caiden Vale, the qualities that once made him feel different become the very strengths he needs to survive. With a loyal companion at his side and darkness closing in, Caiden must learn to trust himself, protect both worlds, and discover the courage already burning within him.`;

type StoryCardIconName = 'characters' | 'world' | 'portal';

function StoryCardIcon({ name }: { name: StoryCardIconName }) {
  const paths = {
    characters: <><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3.5 20c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M14 15c3.5-.8 5.7.8 6.5 4"/></>,
    world: <><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.8 2.6 4.2 5.4 4.2 8.5S14.8 17.9 12 20.5C9.2 17.9 7.8 15.1 7.8 12S9.2 6.1 12 3.5Z"/></>,
    portal: <><path d="M6 21V5.5A2.5 2.5 0 0 1 8.5 3h8A1.5 1.5 0 0 1 18 4.5V21M3 21h18"/><path d="M10 12h7m-3-3 3 3-3 3"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>;
}

export default function TheStoryPage() {
  useEffect(() => {
    const previous = document.title;
    document.title = "The Dragon's Nest | Caiden's Courage";
    return () => { document.title = previous; };
  }, []);

  return (
    <div className="story-page">
      <CourageHeader />
      <main>
        <section className="story-hero" aria-labelledby="story-title">
          <div className="story-hero__backdrop" aria-hidden />
          <div className="story-container story-hero__content">
            <div className="story-hero__copy">
              <p className="story-eyebrow">Caiden’s Courage — Volume One</p>
              <h1 id="story-title">The Dragon’s Nest</h1>
              <p className="story-hero__lead">An eleven-year-old boy. A hidden world. A flame that could change everything.</p>
              <div className="story-actions">
                <a className="story-button story-button--gold" href={VALE_COMICBOOK_URL}>Order the Book <span aria-hidden>→</span></a>
                <a className="story-button story-button--glass" href="https://caidenvale.com/">Explore Caiden Vale <span aria-hidden>→</span></a>
              </div>
            </div>
          </div>
        </section>

        <section className="story-book" aria-labelledby="book-heading">
          <div className="story-container story-book__grid">
            <div className="story-book__visual">
              <img src="/images/Caiden-vale-book/Caiden-vale-book.webp" alt="Caiden Vale and the Focus Flame graphic novel displayed on a stand" />
            </div>
            <div className="story-book__copy">
              <p className="story-eyebrow story-eyebrow--navy">The first adventure</p>
              <h2 id="book-heading">A hidden world is calling.</h2>
              <div className="story-meta" aria-label="Book details">
                <span>Ages 8–12</span><span>132 pages</span><span>Full-color graphic novel</span><span>By Tarus D. Stills</span>
              </div>
              <p>{synopsis}</p>
              <div className="story-actions">
                <a className="story-button story-button--navy" href={VALE_COMICBOOK_URL}>Order Book <span aria-hidden>→</span></a>
                <a className="story-button story-button--outline" href="https://caidenvale.com/">Learn More About Caiden Vale <span aria-hidden>→</span></a>
              </div>
            </div>
          </div>
        </section>

        <section className="story-world" aria-labelledby="world-heading">
          <div className="story-container">
            <p className="story-eyebrow story-eyebrow--navy">Beyond the page</p>
            <h2 id="world-heading">Step into the story world</h2>
            <div className="story-world__cards">
              <a href="https://caidenvale.com/story/characters"><span className="story-world__icon"><StoryCardIcon name="characters" /></span><h3>Meet the Characters</h3><p>Meet Caiden, B-4, Miranda, Zeke, and the guardians who shape the adventure.</p><span className="story-world__action">Explore <b aria-hidden>→</b></span></a>
              <a href={VALE_WORLD_URL}><span className="story-world__icon"><StoryCardIcon name="world" /></span><h3>Discover Caiden Vale</h3><p>Explore the hidden places, creatures, mysteries, and lore beyond the page.</p><span className="story-world__action">Explore <b aria-hidden>→</b></span></a>
              <a href={PORTAL_PATH}><span className="story-world__icon"><StoryCardIcon name="portal" /></span><h3>Enter the World</h3><p>Continue the experience through interactive adventures, activities, and games.</p><span className="story-world__action">Explore <b aria-hidden>→</b></span></a>
            </div>
          </div>
        </section>
      </main>
      <CourageFooter />
    </div>
  );
}
