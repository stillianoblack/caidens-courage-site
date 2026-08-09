import React from 'react';
import { Link } from 'react-router-dom';
import CourageFooter from '../components/courage/CourageFooter';
import CourageHeader from '../components/courage/CourageHeader';
import Button from '../components/ui/Button';
import { PORTAL_PATH } from '../config/courageRoutes';
import './games-page.css';

const PLAY_PATH = `${PORTAL_PATH}?audience=students`;

export default function GamesPage() {
  return (
    <div className="gamesLanding">
      <CourageHeader />
      <main>
        <section className="gamesLanding__heroShell bg-cream px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5 lg:px-8 lg:pb-8">
          <div className="cc-site-container mx-auto">
            <div className="gamesLanding__hero cc-hero-mask cc-hero-mask--brand relative overflow-hidden rounded-[1.35rem] sm:rounded-[1.75rem] lg:rounded-[2rem]">
              <div className="gamesLanding__heroShade" />
              <div className="cc-hero-content relative z-10">
                <div className="cc-hero-layout gamesLanding__heroInner">
                  <div className="cc-hero-main">
                    <div className="cc-hero-copy gamesLanding__heroCopy">
                      <p className="gamesLanding__eyebrow text-[10px] font-semibold uppercase tracking-[0.22em] text-golden-600 sm:text-[11px]">Enter the Arcade</p>
                      <h1 className="cc-hero-title mt-2.5 font-display font-extrabold leading-[1.08] text-navy-500 sm:mt-4 sm:text-5xl lg:text-6xl">Help B-4 catch the Focus Flames.</h1>
                      <p className="cc-hero-subtitle mt-2.5 text-[0.9375rem] leading-snug text-[#B0E0E6] sm:mt-4 sm:max-w-none sm:text-lg sm:leading-relaxed lg:text-xl">Fly through the storm, stay focused, and collect as many Focus Flames as you can.</p>
                    </div>
                    <div className="cc-hero-ctas gamesLanding__actions">
                      <Button as={Link} to={PLAY_PATH} variant="primary" size="lg" leftIconSrc={null} className="cc-hero-cta">Play B-4 Focus Flight</Button>
                      <Button as={Link} to={PORTAL_PATH} variant="secondary" size="lg" className="cc-hero-cta cc-hero-secondary-cta">Already a member? Sign in</Button>
                    </div>
                  </div>
                  <div className="cc-hero-brand-visual gamesLanding__heroB4" aria-hidden="true">
                    <img src="/images/B-4FlightGame/Idle/Idle@4x-transparent.png" alt="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="gamesLanding__worlds px-4 sm:px-6 lg:px-8" aria-labelledby="games-heading">
          <div className="cc-site-container mx-auto">
            <div className="gamesLanding__sectionHeading">
              <p className="gamesLanding__eyebrow">Explore the Arcade</p>
              <h2 id="games-heading">Choose your next adventure</h2>
              <p>Each experience invites kids to play, wonder, and discover what their courage can do.</p>
            </div>
            <div className="gamesLanding__grid">
            <article className="gamesLanding__card gamesLanding__card--flight">
              <div className="gamesLanding__cardArt"><img src="/images/B-4FlightGame/Idle/Idle@4x-transparent.png" alt="B-4 flying through Caiden Vale" /></div>
              <div className="gamesLanding__cardBody"><span>Focus game</span><h3>B-4 Focus Flight</h3><p>Guide B-4 through a fast, playful focus challenge and keep the flame moving.</p><Link to={PLAY_PATH}>Play now <span aria-hidden>→</span></Link></div>
            </article>
            <article className="gamesLanding__card gamesLanding__card--story">
              <div className="gamesLanding__cardArt"><img src="/images/backgrounds/caidenvale_book_hero.webp" alt="Caiden Vale and the Focus Flame book" /></div>
              <div className="gamesLanding__cardBody"><span>Story challenge</span><h3>Story Quest</h3><p>Follow the clues, test your memory, and see how many Story Sparks you can earn.</p><Link to={PLAY_PATH}>Enter the story <span aria-hidden>→</span></Link></div>
            </article>
            <article className="gamesLanding__card gamesLanding__card--dragon">
              <div className="gamesLanding__cardArt"><img src="/images/characters/dragon_img_profile.webp" alt="Dragon from Caiden Vale" /></div>
              <div className="gamesLanding__cardBody"><span>Coming soon</span><h3>Dragon Flight</h3><p>A new test of memory, courage, and quick thinking is taking shape in Caiden Vale.</p><span className="gamesLanding__soon">Adventure in development</span></div>
            </article>
            </div>
          </div>
        </section>

        <section className="gamesLanding__final px-4 sm:px-6 lg:px-8"><div className="cc-site-container mx-auto"><div className="gamesLanding__finalContent"><p className="gamesLanding__eyebrow">Ready to enter?</p><h2>Your next brave move is waiting.</h2><Button as={Link} to={PLAY_PATH} variant="primary" size="lg" leftIconSrc={null}>Enter the World</Button></div></div></section>
      </main>
      <CourageFooter />
    </div>
  );
}
