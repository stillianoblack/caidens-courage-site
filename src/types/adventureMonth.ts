export type CertificateAssetType = 'image' | 'pdf';

export type AdventureMonthReleaseMode =
  | 'all_available'
  | 'sequential_after_completion'
  | 'timed_interval';

export const ADVENTURE_MONTH_RELEASE_MODE_OPTIONS: AdventureMonthReleaseMode[] = [
  'all_available',
  'sequential_after_completion',
  'timed_interval',
];

export type AdventureMonthRecord = {
  id: string;
  month_number: number;
  month_title: string;
  month_subtitle: string | null;
  month_description: string | null;
  month_hero_image_url: string | null;
  certificate_title: string | null;
  certificate_reward_name: string | null;
  certificate_required_weeks: number;
  certificate_asset_url: string | null;
  certificate_asset_type: CertificateAssetType | null;
  is_published: boolean;
  release_mode: AdventureMonthReleaseMode;
  release_interval_days: number | null;
  release_start_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AdventureMonthInput = {
  month_number: number;
  month_title: string;
  month_subtitle?: string | null;
  month_description?: string | null;
  month_hero_image_url?: string | null;
  certificate_title?: string | null;
  certificate_reward_name?: string | null;
  certificate_required_weeks?: number;
  certificate_asset_url?: string | null;
  certificate_asset_type?: CertificateAssetType | null;
  is_published?: boolean;
  release_mode?: AdventureMonthReleaseMode;
  release_interval_days?: number | null;
  release_start_at?: string | null;
  sort_order?: number;
};
