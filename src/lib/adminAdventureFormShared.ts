import type { AdventureModuleInput, AdventureModuleRecord, AdventureModuleStatus, WeeklyRewardType } from '../types/adventureModule';
import type { AdventureMonthInput, AdventureMonthRecord } from '../types/adventureMonth';
import { resolveDefaultMonthNumber } from './adventureMonthService';

export const ADMIN_ADVENTURE_STATUS_OPTIONS: AdventureModuleStatus[] = [
  'draft',
  'scheduled',
  'active',
  'archived',
];

export const ADMIN_WEEKLY_REWARD_TYPE_OPTIONS: WeeklyRewardType[] = [
  'badge',
  'sticker',
  'decoration',
  'certificate',
  'coins',
];

export const EMPTY_ADVENTURE_MODULE_FORM: AdventureModuleInput = {
  title: '',
  subtitle: '',
  description: '',
  week_number: 1,
  month_number: 1,
  status: 'draft',
  cta_text: 'Start Adventure',
  interactive_header_url: '',
  comic_thumbnail_url: '',
  map_background_url: '',
  hero_image_url: '',
  thumbnail_image_url: '',
  background_image_url: '',
  reward_value: 0,
  unlock_date: '',
  sort_order: 1,
  preview_activities: [],
  hotspots: [],
  weekly_reward_name: '',
  weekly_reward_type: 'badge',
  weekly_reward_svg_url: '',
  weekly_reward_image_url: '',
  weekly_reward_description: '',
  weekly_reward_rarity: '',
  weekly_reward_coin_value: 0,
  coloring_page_pdf_url: '',
  weekly_module_pdf_url: '',
  comic_pdf_url: '',
  certificate_pdf_or_image_url: '',
  facilitator_kit_pdf_url: '',
  is_live: false,
  is_admin_preview: false,
  is_featured: false,
};

export function adventureModuleToForm(module: AdventureModuleRecord): AdventureModuleInput {
  return {
    title: module.title,
    subtitle: module.subtitle ?? '',
    description: module.description ?? '',
    week_number: module.week_number,
    month_number: module.month_number ?? resolveDefaultMonthNumber(module.week_number),
    adventure_month_id: module.adventure_month_id ?? null,
    status: module.status,
    cta_text: module.cta_text ?? '',
    interactive_header_url: '',
    comic_thumbnail_url: module.comic_thumbnail_url ?? module.thumbnail_image_url ?? '',
    map_background_url: module.map_background_url ?? module.background_image_url ?? '',
    hero_image_url: '',
    thumbnail_image_url: module.comic_thumbnail_url ?? module.thumbnail_image_url ?? '',
    background_image_url: module.map_background_url ?? module.background_image_url ?? '',
    reward_value: module.reward_value,
    unlock_date: module.unlock_date ?? '',
    sort_order: module.sort_order,
    preview_activities: module.preview_activities ?? [],
    hotspots: module.hotspots ?? [],
    weekly_reward_name: module.weekly_reward_name ?? '',
    weekly_reward_type: module.weekly_reward_type ?? 'badge',
    weekly_reward_svg_url: module.weekly_reward_svg_url ?? '',
    weekly_reward_image_url: module.weekly_reward_image_url ?? '',
    weekly_reward_description: module.weekly_reward_description ?? '',
    weekly_reward_rarity: module.weekly_reward_rarity ?? '',
    weekly_reward_coin_value: module.weekly_reward_coin_value ?? 0,
    coloring_page_pdf_url: module.coloring_page_pdf_url ?? '',
    weekly_module_pdf_url: module.weekly_module_pdf_url ?? '',
    comic_pdf_url: module.comic_pdf_url ?? '',
    certificate_pdf_or_image_url: module.certificate_pdf_or_image_url ?? '',
    facilitator_kit_pdf_url: module.facilitator_kit_pdf_url ?? '',
    is_live: module.is_live ?? false,
    is_admin_preview: module.is_admin_preview ?? false,
    is_featured: module.is_featured ?? false,
  };
}

export function adventureMonthToForm(month: AdventureMonthRecord): AdventureMonthInput {
  return {
    month_number: month.month_number,
    month_title: month.month_title,
    month_subtitle: month.month_subtitle ?? '',
    month_description: month.month_description ?? '',
    month_hero_image_url: month.month_hero_image_url ?? '',
    certificate_title: month.certificate_title ?? '',
    certificate_reward_name: month.certificate_reward_name ?? '',
    certificate_required_weeks: month.certificate_required_weeks,
    certificate_asset_url: month.certificate_asset_url ?? '',
    certificate_asset_type: month.certificate_asset_type ?? 'image',
    is_published: month.is_published,
    sort_order: month.sort_order,
  };
}

export function inferCertificateAssetType(filename: string): 'image' | 'pdf' {
  return filename.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image';
}
