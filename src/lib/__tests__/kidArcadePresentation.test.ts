import fs from 'fs';
import path from 'path';

const read = (relativePath: string): string =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Kid Arcade presentation', () => {
  const arcade = read('src/components/kid-play-shell/KidArcadePanel.tsx');
  const intro = read('src/pages/StoryQuestIntroPage.tsx');
  const introCss = read('src/pages/story-quest-intro.css');

  it('shows only the three approved playable or unlockable experiences', () => {
    expect(arcade).toContain('Story Quest');
    expect(arcade).toContain('B-4 Focus Flight');
    expect(arcade).toContain('Dragon Flight');
    expect(arcade).not.toContain('Memory Match');
    expect(arcade).not.toContain('Focus Builder');
    expect(arcade).not.toContain('Mystery Game');
  });

  it('uses approved game artwork rather than generic initials', () => {
    expect(arcade).toContain('/images/B-4FlightGame/background/GameplayBackgrounds.webp');
    expect(arcade).toContain('/images/characters/dragon_img_profile.webp');
    expect(arcade).not.toContain('artLabel="DF"');
  });

  it('routes Enter Story through one splash with dynamic progress copy', () => {
    expect(arcade).toContain('const storyQuestPath = storyQuestBasePath');
    expect(introCss).toContain('storygame_thumbnail.webp');
    expect(intro).toContain("hasProgress ? 'Continue Story Quest' : 'Start Story Quest'");
    expect(intro).toContain('Back to Arcade');
    expect(intro).toMatch(/to=\{`\$\{storyBasePath\}\/\$\{targetChapterId\}`\}/);
  });

  it('ships the exact Story Quest splash asset', () => {
    expect(fs.existsSync(path.join(
      process.cwd(),
      'public/images/caidenscourage/Game assets/storygame_thumbnail.webp',
    ))).toBe(true);
  });
});
