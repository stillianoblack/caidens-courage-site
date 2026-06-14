import type { PilotWeek } from '../data/pilotDashboardContent';
import { PILOT_WEEKLY_JOURNEY } from '../data/pilotDashboardContent';
import type { ActivityAsset } from '../data/pilotDashboardContent';
import type { AdventureModuleRecord, WeeklyRewardType } from '../types/adventureModule';
import type { Week1ExtrasPaths } from '../components/courage-in-the-dark/Week1ExtrasCards';

export type WeeklyQuestRewardConfig = {
  rewardName: string;
  rewardKind: 'badge' | 'chest' | 'item' | 'coins';
  rewardImageUrl?: string | null;
  rewardSvgUrl?: string | null;
  coinsAwarded?: number;
  rewardType?: WeeklyRewardType | null;
};

const WEEK1_FALLBACK_DISCUSSION = '/downloads/pilot/journals/week-1.pdf';
const WEEK1_FALLBACK_CERTIFICATE = '/downloads/pilot/camp-completion-certificate.pdf';
const WEEK1_FALLBACK_MODULE =
  '/downloads/Weekly%20Module/CaidensCourage_Weekly%201_CourageInTheDark.pdf';

/** Weekly activity download paths — always returns a paths object for the Activities tab. */
export function resolveWeekExtrasPaths(
  module: AdventureModuleRecord | null | undefined,
  base: Pick<Week1ExtrasPaths, 'downloadsPath' | 'certificatesPath'>,
): Week1ExtrasPaths {
  const week = module?.week_number ?? 1;
  const modulePdf = module?.weekly_module_pdf_url?.trim() || null;
  const coloringHref = module?.coloring_page_pdf_url?.trim() || null;
  const comicPdfHref = module?.comic_pdf_url?.trim() || null;
  const certificateHref =
    module?.certificate_pdf_or_image_url?.trim() ||
    module?.certificate_url?.trim() ||
    (week === 1 ? WEEK1_FALLBACK_CERTIFICATE : null);

  const discussionHref =
    modulePdf ||
    (week === 1 ? WEEK1_FALLBACK_MODULE : null) ||
    (week === 1 ? WEEK1_FALLBACK_DISCUSSION : null);

  return {
    ...base,
    weekNumber: week,
    week1DiscussionHref: discussionHref ?? undefined,
    week1CertificateHref: certificateHref ?? undefined,
    coloringPageHref: coloringHref,
    comicPdfHref,
  };
}

export function resolveWeeklyQuestReward(
  module: AdventureModuleRecord | null | undefined,
): WeeklyQuestRewardConfig | null {
  if (!module?.weekly_reward_name?.trim()) return null;

  const rewardType = module.weekly_reward_type ?? 'badge';
  const imageSrc = module.weekly_reward_svg_url?.trim() || module.weekly_reward_image_url?.trim() || null;
  const coins = module.weekly_reward_coin_value ?? module.reward_value ?? 0;

  let rewardKind: WeeklyQuestRewardConfig['rewardKind'] = 'badge';
  if (rewardType === 'coins') rewardKind = 'coins';
  else if (rewardType === 'certificate' || rewardType === 'decoration') rewardKind = 'item';
  else if (rewardType === 'sticker') rewardKind = 'chest';

  return {
    rewardName: module.weekly_reward_name.trim(),
    rewardKind,
    rewardImageUrl: imageSrc,
    rewardSvgUrl: module.weekly_reward_svg_url?.trim() || null,
    coinsAwarded: coins > 0 ? coins : undefined,
    rewardType,
  };
}

export function mergePilotWeeksWithCms(modules: AdventureModuleRecord[]): PilotWeek[] {
  return PILOT_WEEKLY_JOURNEY.map((week) => {
    const cms = modules.find((row) => row.week_number === week.week);
    if (!cms) return week;

    const kitHref =
      cms.facilitator_kit_pdf_url?.trim() ||
      cms.weekly_module_pdf_url?.trim() ||
      (week.week === 1 ? WEEK1_FALLBACK_MODULE : week.kitHref);

    return {
      ...week,
      title: cms.title || week.title,
      selFocus: cms.subtitle || week.selFocus,
      kitHref,
      kitCta: kitHref && kitHref !== '#' ? `Download Week ${week.week} Kit` : week.kitCta,
    };
  });
}

export function buildCmsActivityAssets(modules: AdventureModuleRecord[]): ActivityAsset[] {
  const assets: ActivityAsset[] = [];

  for (const module of modules) {
    const locked = module.status === 'draft' || module.status === 'archived';
    const weekLabel = `Week ${module.week_number}`;

    if (module.coloring_page_pdf_url?.trim()) {
      assets.push({
        id: `cms-coloring-${module.week_number}`,
        title: `${weekLabel} Coloring Page`,
        status: locked ? 'locked' : 'available',
        href: module.coloring_page_pdf_url.trim(),
      });
    }
    if (module.comic_pdf_url?.trim()) {
      assets.push({
        id: `cms-comic-${module.week_number}`,
        title: `${weekLabel} Comic`,
        status: locked ? 'locked' : 'available',
        href: module.comic_pdf_url.trim(),
      });
    }
    if (module.weekly_module_pdf_url?.trim()) {
      assets.push({
        id: `cms-module-${module.week_number}`,
        title: `${weekLabel} Activity Module`,
        status: locked ? 'locked' : 'available',
        href: module.weekly_module_pdf_url.trim(),
      });
    }
    if (module.certificate_pdf_or_image_url?.trim()) {
      assets.push({
        id: `cms-cert-${module.week_number}`,
        title: `${weekLabel} Certificate`,
        status: locked ? 'locked' : 'available',
        href: module.certificate_pdf_or_image_url.trim(),
      });
    }
  }

  return assets;
}
