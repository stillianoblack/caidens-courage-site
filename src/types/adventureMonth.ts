export type CertificateAssetType = 'image' | 'pdf';

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
  sort_order?: number;
};
