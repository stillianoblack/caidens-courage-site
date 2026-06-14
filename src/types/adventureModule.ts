export type AdventureModuleStatus = 'draft' | 'scheduled' | 'active' | 'archived';

export type AdventureSpotCharacterKey = 'caiden' | 'miranda' | 'zeke' | 'charlie' | 'b4';

export type AdventureSpotStatus = 'locked' | 'available' | 'complete';

export type WeeklyRewardType = 'badge' | 'sticker' | 'decoration' | 'certificate' | 'coins';

export type AdventureSpotRecord = {
  id?: string;
  character_key: AdventureSpotCharacterKey;
  mission_title: string;
  mission_subtitle?: string | null;
  /** Alias for mission_subtitle in CMS JSON */
  mission_description?: string | null;
  label_text: string;
  /** Alias for label_text */
  label?: string | null;
  reward_coins?: number;
  reward_badge?: string | null;
  reward_name?: string | null;
  reward_type?: WeeklyRewardType | null;
  reward_image_url?: string | null;
  position_x?: number;
  position_y?: number;
  /** Aliases for position_x / position_y */
  x?: number;
  y?: number;
  size_width?: number;
  size_height?: number;
  character_image_url?: string | null;
  status?: AdventureSpotStatus;
  route_slug?: string | null;
};

export type AdventureModuleRecord = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  week_number: number;
  status: AdventureModuleStatus;
  cta_text: string | null;
  /** Large weekly map / interactive header image (Supabase CMS). */
  interactive_header_url: string | null;
  /** Comic / module thumbnail for week cards (Supabase CMS). */
  comic_thumbnail_url: string | null;
  /** Optional full map canvas background beneath hotspots. */
  map_background_url: string | null;
  hero_image_url: string | null;
  thumbnail_image_url: string | null;
  background_image_url: string | null;
  reward_value: number;
  unlock_date: string | null;
  sort_order: number;
  preview_activities?: string[] | null;
  hotspots?: AdventureSpotRecord[] | null;
  weekly_reward_name?: string | null;
  weekly_reward_type?: WeeklyRewardType | null;
  weekly_reward_svg_url?: string | null;
  weekly_reward_image_url?: string | null;
  weekly_reward_description?: string | null;
  weekly_reward_rarity?: string | null;
  weekly_reward_coin_value?: number | null;
  coloring_page_pdf_url?: string | null;
  weekly_module_pdf_url?: string | null;
  comic_pdf_url?: string | null;
  certificate_pdf_or_image_url?: string | null;
  facilitator_kit_pdf_url?: string | null;
  thumbnail_url?: string | null;
  reward_svg_url?: string | null;
  reward_image_url?: string | null;
  reward_name?: string | null;
  reward_type?: string | null;
  certificate_url?: string | null;
  is_live?: boolean;
  is_admin_preview?: boolean;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
};

export type AdventureModuleInput = {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  week_number: number;
  status: AdventureModuleStatus;
  cta_text?: string | null;
  interactive_header_url?: string | null;
  comic_thumbnail_url?: string | null;
  map_background_url?: string | null;
  hero_image_url?: string | null;
  thumbnail_image_url?: string | null;
  background_image_url?: string | null;
  reward_value?: number;
  unlock_date?: string | null;
  sort_order?: number;
  preview_activities?: string[] | null;
  hotspots?: AdventureSpotRecord[] | null;
  weekly_reward_name?: string | null;
  weekly_reward_type?: WeeklyRewardType | null;
  weekly_reward_svg_url?: string | null;
  weekly_reward_image_url?: string | null;
  weekly_reward_description?: string | null;
  weekly_reward_rarity?: string | null;
  weekly_reward_coin_value?: number | null;
  coloring_page_pdf_url?: string | null;
  weekly_module_pdf_url?: string | null;
  comic_pdf_url?: string | null;
  certificate_pdf_or_image_url?: string | null;
  facilitator_kit_pdf_url?: string | null;
  thumbnail_url?: string | null;
  is_live?: boolean;
  is_admin_preview?: boolean;
  is_featured?: boolean;
};
