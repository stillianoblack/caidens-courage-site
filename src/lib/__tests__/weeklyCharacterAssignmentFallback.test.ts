import { resolveWeeklyAdventureThumbnail } from '../weeklyAdventureThumbnail';

describe('weekly character assignment fallback', () => {
  it('uses configured character artwork when supplied by the week', () => {
    const resolution = resolveWeeklyAdventureThumbnail({
      weekNumber: 5,
      cmsModule: {
        week_number: 5,
        title: 'Miranda Week',
        hotspots: [{ character_key: 'miranda', character_image_url: '/miranda-week.webp' }],
      } as never,
    });
    expect(resolution.url).toBe('/miranda-week.webp');
    expect(resolution.source).toBe('cms_mission_image');
  });

  it('uses a neutral empty placeholder instead of Caiden when artwork is missing', () => {
    const resolution = resolveWeeklyAdventureThumbnail({
      weekNumber: 6,
      cmsModule: {
        week_number: 6,
        title: 'Unconfigured Week',
        hotspots: [],
      } as never,
    });
    expect(resolution.url).toBe('');
    expect(resolution.source).toBe('generic_placeholder');
    expect(resolution.fallbackReason).toMatch(/No CMS thumbnail/);
  });

  it('does not treat the first hotspot as a lead character for a mixed-character week', () => {
    const resolution = resolveWeeklyAdventureThumbnail({
      weekNumber: 7,
      cmsModule: {
        week_number: 7,
        title: 'Mixed Week',
        hotspots: [
          { character_key: 'caiden', character_image_url: '/caiden.webp' },
          { character_key: 'miranda', character_image_url: '/miranda.webp' },
        ],
      } as never,
    });
    expect(resolution.url).toBe('');
    expect(resolution.source).toBe('generic_placeholder');
  });
});
