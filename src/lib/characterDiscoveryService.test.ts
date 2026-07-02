import { earnedDiscoveriesFromProgressRows } from './characterDiscoveryService';

describe('earnedDiscoveriesFromProgressRows', () => {
  it('derives earned discoveries from existing mission progress rows', () => {
    const discoveries = earnedDiscoveriesFromProgressRows([
      {
        mission_id: 'miranda-week-1',
        completed_at: '2026-06-28T12:00:00.000Z',
      },
    ]);

    expect(discoveries).toHaveLength(1);
    expect(discoveries[0]).toMatchObject({
      id: 'miranda-voice-note',
      earnedAt: '2026-06-28T12:00:00.000Z',
      definition: {
        characterId: 'miranda',
        name: 'Miranda Voice Note',
      },
    });
  });

  it('does not duplicate discoveries already seen from reward claims', () => {
    const discoveries = earnedDiscoveriesFromProgressRows(
      [
        {
          mission_id: 'miranda-week-1',
          completed_at: '2026-06-28T12:00:00.000Z',
        },
      ],
      new Set(['miranda-voice-note']),
    );

    expect(discoveries).toEqual([]);
  });
});
