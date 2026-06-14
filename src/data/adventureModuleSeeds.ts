import { COURAGE_IN_THE_DARK_BG } from '../data/courageInTheDarkMap';
import { FAMILY_WEEKLY_ADVENTURE_WEEKS } from '../data/familyWeeklyAdventures';
import { buildDefaultHotspotsForWeek } from '../lib/adventureMapMissions';
import type { AdventureModuleInput } from '../types/adventureModule';

const DEFAULT_PATHS = {
  kidsBasePath: '/family-hub/kids',
  downloadsPath: '/family-hub/downloads',
  certificatesPath: '/family-hub/certificates',
};

function weekOneHotspots() {
  return buildDefaultHotspotsForWeek(1, DEFAULT_PATHS, 'Courage in the Dark').map((spot) => {
    if (spot.character_key === 'caiden') {
      return { ...spot, route_slug: 'caiden-courage-in-the-dark', label_text: 'Courage by the Bridge' };
    }
    if (spot.character_key === 'miranda') {
      return { ...spot, route_slug: 'miranda-mystery', label_text: "Miranda's Mystery" };
    }
    if (spot.character_key === 'zeke') {
      return { ...spot, route_slug: 'zeke-bridge-challenge', label_text: "Zeke's Cave Challenge" };
    }
    if (spot.character_key === 'charlie') {
      return { ...spot, route_slug: 'charlie-discovery-zone', label_text: "Charlie's Discovery Zone" };
    }
    if (spot.character_key === 'b4') {
      return { ...spot, route_slug: 'b4-self-check-in', label_text: 'B-4 Check-In Station' };
    }
    return spot;
  });
}

/** Default CMS rows extracted from existing hardcoded weekly adventure metadata. */
export function buildDefaultAdventureModuleSeeds(): AdventureModuleInput[] {
  return FAMILY_WEEKLY_ADVENTURE_WEEKS.map((weekMeta) => ({
    title: weekMeta.title,
    subtitle: weekMeta.selFocus,
    description: `Week ${weekMeta.week} Focus Flame adventure — ${weekMeta.selFocus}.`,
    week_number: weekMeta.week,
    status: weekMeta.week === 1 ? 'active' : 'draft',
    cta_text: weekMeta.week === 1 ? 'Start Adventure' : 'Coming Soon',
    hero_image_url: weekMeta.week === 1 ? COURAGE_IN_THE_DARK_BG : null,
    thumbnail_image_url: weekMeta.week === 1 ? '/images/caidenscourage/Game-Hub/courage-in-the-dark.webp' : null,
    background_image_url: weekMeta.week === 1 ? COURAGE_IN_THE_DARK_BG : null,
    reward_value: 25,
    unlock_date: null,
    sort_order: weekMeta.week,
    preview_activities: weekMeta.previewActivities,
    hotspots:
      weekMeta.week === 1
        ? weekOneHotspots()
        : buildDefaultHotspotsForWeek(weekMeta.week, DEFAULT_PATHS, weekMeta.title),
    weekly_reward_name: weekMeta.week === 1 ? 'Focus Flame Explorer Badge' : `Week ${weekMeta.week} Reward`,
    weekly_reward_type: weekMeta.week === 1 ? 'badge' : 'sticker',
    weekly_reward_coin_value: 25,
    weekly_module_pdf_url:
      weekMeta.week === 1 ? '/downloads/pilot/journals/week-1.pdf' : null,
    certificate_pdf_or_image_url:
      weekMeta.week === 1 ? '/downloads/pilot/camp-completion-certificate.pdf' : null,
    facilitator_kit_pdf_url:
      weekMeta.week === 1
        ? '/downloads/Weekly%20Module/CaidensCourage_Weekly%201_CourageInTheDark.pdf'
        : null,
  }));
}
