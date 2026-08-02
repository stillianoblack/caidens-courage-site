import fs from 'fs';
import path from 'path';

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('marketing and Enter the World reconciliation', () => {
  const header = read('src/components/courage/CourageHeader.tsx');
  const nav = read('src/config/courageNav.ts');
  const home = read('src/pages/Home.tsx');
  const app = read('src/App.tsx');
  const lazyPages = read('src/routes/lazyPages.tsx');
  const portal = read('src/pages/Portal.tsx');
  const portalForm = read('src/components/courage/PortalAccessForm.tsx');
  const portalHero = read('src/components/courage/PortalHero.tsx');
  const styles = read('src/index.css');

  it('keeps the approved shared marketing navigation', () => {
    expect(header).toContain('label="The Story"');
    expect(nav).toContain("label: 'Characters'");
    expect(nav).toContain("label: 'The World'");
    expect(nav).not.toContain('Read the First Chapter');
    expect(header).toContain('Enter the World <span className="ml-2"');
    expect(header).not.toContain('>\n              Portal\n');
    expect(header).toContain('onToggle={() =>');
    expect(header).toContain('courage-mobile-nav');
  });

  it('keeps the approved story-first homepage and lower video section', () => {
    expect(home).toContain('The story where focus becomes a superpower.');
    expect(home).toContain('/images/backgrounds/caidenvale_book_hero.webp');
    expect(styles).toContain('backgroundFocusFlame.webp');
    expect(home).toContain('Order the Book');
    expect(home).toContain('Explore Kids Activities');
    expect(home).toContain("See Caiden&apos;s Courage in Action");
    expect(home.indexOf('<ThreeWaysSection />')).toBeLessThan(home.indexOf('cc-home-video-section'));
    expect(home).not.toContain('cc-hero-video-preview');
  });

  it('routes the approved Story page and homepage through the active route tree', () => {
    expect(app).toContain('path={THE_STORY_PATH}');
    expect(lazyPages).toContain("import('../pages/TheStoryPage')");
    expect(lazyPages).toContain("import('../pages/Home')");
  });

  it('uses the same approved shared header on the homepage and portal', () => {
    expect(home).toContain("import CourageHeader from '../components/courage/CourageHeader'");
    expect(portal).toContain("import CourageHeader from '../components/courage/CourageHeader'");
    expect(home).toContain('<CourageHeader />');
    expect(portal).toContain('<CourageHeader />');
  });

  it('keeps the character gateway mapped onto the existing access form', () => {
    expect(portalHero).toContain('Choose your guide.');
    expect(portalForm).toContain("name: 'Caiden'");
    expect(portalForm).toContain("name: 'Dr. Victoria'");
    expect(portalForm).toContain("name: 'Uncle T'");
    expect(portalForm).toContain("title: 'Continue with Caiden'");
    expect(portalForm).toContain("title: 'Continue with Dr. Victoria'");
    expect(portalForm).toContain("title: 'Continue with Uncle T'");
    expect(portalForm).toContain('onSubmit={onSubmit}');
    expect(portalForm).toContain('aria-pressed={pendingIntent === item.id}');
    expect(styles).toContain(".cc-portal-characterOption[aria-pressed='true']");
  });

  it('keeps ambient B-4 decorative and reduced-motion safe', () => {
    expect(portalHero).toContain('cc-portal-b4Pass pointer-events-none');
    expect(portalHero).toContain('aria-hidden="true"');
    expect(portalHero).toContain('/images/B-4FlightGame/Idle/Idle@2x-transparent.png');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('.cc-portal-b4Pass');
    expect(styles).toContain('animation: none');
  });
});
