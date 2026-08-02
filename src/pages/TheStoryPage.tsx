import { useEffect } from 'react';
import CourageHeader from '../components/courage/CourageHeader';
import CourageFooter from '../components/courage/CourageFooter';
import { VALE_CHARACTERS_URL, VALE_COMICBOOK_URL, VALE_WORLD_URL } from '../config/valeLinks';
import './the-story.css';

const synopsis = `Eleven-year-old Caiden has always felt out of step with the world around him. But when a mysterious flame awakens and draws him into the hidden realm of Caiden Vale, the qualities that once made him feel different become the very strengths he needs to survive. With a loyal companion at his side and darkness closing in, Caiden must learn to trust himself, protect both worlds, and discover the courage already burning within him.`;

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
              <a href={VALE_CHARACTERS_URL}><img src="/images/CoolCaiden_header.webp" alt="Caiden in his story world" /><span>Meet Characters <b aria-hidden>→</b></span></a>
              <a href={VALE_WORLD_URL}><img src="/images/world_card_other_960w.webp" alt="The fantasy landscape of Caiden Vale" /><span>Discover Caiden Vale <b aria-hidden>→</b></span></a>
              <a href="https://caidenvale.com/"><img src="/images/TheWorldIsJustBeginning_img.webp" alt="A gateway into the world of Caiden Vale" /><span>Enter the World <b aria-hidden>→</b></span></a>
            </div>
          </div>
        </section>
      </main>
      <CourageFooter />
    </div>
  );
}
