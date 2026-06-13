export type AdventureModuleStatus = 'draft' | 'scheduled' | 'active' | 'archived';

export type AdventureModuleRecord = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  week_number: number;
  status: AdventureModuleStatus;
  cta_text: string | null;
  hero_image_url: string | null;
  thumbnail_image_url: string | null;
  background_image_url: string | null;
  reward_value: number;
  unlock_date: string | null;
  sort_order: number;
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
  hero_image_url?: string | null;
  thumbnail_image_url?: string | null;
  background_image_url?: string | null;
  reward_value?: number;
  unlock_date?: string | null;
  sort_order?: number;
};
