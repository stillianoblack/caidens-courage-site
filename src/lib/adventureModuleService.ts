import type {
  AdventureModuleInput,
  AdventureModuleRecord,
  AdventureModuleStatus,
  AdventureSpotRecord,
} from '../types/adventureModule';
import { buildDefaultAdventureModuleSeeds } from '../data/adventureModuleSeeds';
import type { AdventureVisibilityContext } from './adventureVisibility';
import { getFeaturedAdventure } from './getFeaturedAdventure';
import { resolveDefaultMonthNumber } from './adventureMonthService';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export const ADVENTURE_ASSETS_BUCKET = 'adventure-assets';

function normalizeJsonArray<T>(value: unknown): T[] | null {
  if (!Array.isArray(value)) return null;
  return value as T[];
}

function normalizeHotspot(spot: AdventureSpotRecord): AdventureSpotRecord {
  return {
    ...spot,
    label_text: spot.label_text || spot.label || spot.mission_title,
    mission_subtitle: spot.mission_subtitle ?? spot.mission_description ?? null,
    position_x: spot.position_x ?? spot.x,
    position_y: spot.position_y ?? spot.y,
  };
}

function normalizeHotspots(value: unknown): AdventureSpotRecord[] | null {
  const rows = normalizeJsonArray<AdventureSpotRecord>(value);
  return rows?.map(normalizeHotspot) ?? null;
}

function optionalString(value: unknown): string | null {
  return value ? String(value) : null;
}

function optionalNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function buildAdventurePayload(input: Partial<AdventureModuleInput>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.subtitle !== undefined) payload.subtitle = input.subtitle?.trim() || null;
  if (input.description !== undefined) payload.description = input.description?.trim() || null;
  if (input.week_number !== undefined) payload.week_number = input.week_number;
  if (input.month_number !== undefined) payload.month_number = input.month_number;
  if (input.adventure_month_id !== undefined) {
    payload.adventure_month_id = input.adventure_month_id || null;
  }
  if (input.status !== undefined) payload.status = input.status;
  if (input.cta_text !== undefined) payload.cta_text = input.cta_text?.trim() || null;
  if (input.comic_thumbnail_url !== undefined) {
    const url = input.comic_thumbnail_url?.trim() || null;
    payload.comic_thumbnail_url = url;
    payload.thumbnail_image_url = url;
    payload.thumbnail_url = url;
  }
  if (input.map_background_url !== undefined) {
    payload.map_background_url = input.map_background_url?.trim() || null;
  }
  if (input.thumbnail_image_url !== undefined && input.comic_thumbnail_url === undefined) {
    const url = input.thumbnail_image_url?.trim() || null;
    payload.comic_thumbnail_url = url;
    payload.thumbnail_image_url = url;
    payload.thumbnail_url = url;
  }
  if (input.thumbnail_url !== undefined && input.comic_thumbnail_url === undefined) {
    const url = input.thumbnail_url?.trim() || null;
    payload.comic_thumbnail_url = url;
    payload.thumbnail_url = url;
    payload.thumbnail_image_url = url;
  }
  if (input.background_image_url !== undefined && input.map_background_url === undefined) {
    payload.map_background_url = input.background_image_url?.trim() || null;
  }
  if (input.reward_value !== undefined) payload.reward_value = input.reward_value;
  if (input.unlock_date !== undefined) payload.unlock_date = input.unlock_date || null;
  if (input.sort_order !== undefined) payload.sort_order = input.sort_order;
  if (input.preview_activities !== undefined) payload.preview_activities = input.preview_activities ?? [];
  if (input.hotspots !== undefined) payload.hotspots = (input.hotspots ?? []).map(normalizeHotspot);
  if (input.weekly_reward_name !== undefined) {
    payload.weekly_reward_name = input.weekly_reward_name?.trim() || null;
  }
  if (input.weekly_reward_type !== undefined) payload.weekly_reward_type = input.weekly_reward_type || null;
  if (input.weekly_reward_svg_url !== undefined) {
    payload.weekly_reward_svg_url = input.weekly_reward_svg_url?.trim() || null;
  }
  if (input.weekly_reward_image_url !== undefined) {
    payload.weekly_reward_image_url = input.weekly_reward_image_url?.trim() || null;
  }
  if (input.weekly_reward_description !== undefined) {
    payload.weekly_reward_description = input.weekly_reward_description?.trim() || null;
  }
  if (input.weekly_reward_rarity !== undefined) {
    payload.weekly_reward_rarity = input.weekly_reward_rarity?.trim() || null;
  }
  if (input.weekly_reward_coin_value !== undefined) {
    payload.weekly_reward_coin_value = input.weekly_reward_coin_value ?? 0;
  }
  if (input.coloring_page_pdf_url !== undefined) {
    payload.coloring_page_pdf_url = input.coloring_page_pdf_url?.trim() || null;
  }
  if (input.weekly_module_pdf_url !== undefined) {
    payload.weekly_module_pdf_url = input.weekly_module_pdf_url?.trim() || null;
  }
  if (input.comic_pdf_url !== undefined) payload.comic_pdf_url = input.comic_pdf_url?.trim() || null;
  if (input.certificate_pdf_or_image_url !== undefined) {
    payload.certificate_pdf_or_image_url = input.certificate_pdf_or_image_url?.trim() || null;
  }
  if (input.facilitator_kit_pdf_url !== undefined) {
    payload.facilitator_kit_pdf_url = input.facilitator_kit_pdf_url?.trim() || null;
  }
  if (input.is_live !== undefined) payload.is_live = Boolean(input.is_live);
  if (input.is_admin_preview !== undefined) payload.is_admin_preview = Boolean(input.is_admin_preview);
  if (input.is_featured !== undefined) payload.is_featured = Boolean(input.is_featured);
  return payload;
}

function normalizeRow(row: Record<string, unknown>): AdventureModuleRecord {
  const mapBackground =
    optionalString(row.map_background_url) ?? optionalString(row.background_image_url);
  const comicThumbnail =
    optionalString(row.comic_thumbnail_url) ??
    optionalString(row.thumbnail_url) ??
    optionalString(row.thumbnail_image_url);

  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    subtitle: row.subtitle ? String(row.subtitle) : null,
    description: row.description ? String(row.description) : null,
    week_number: Number(row.week_number ?? 0),
    month_number:
      row.month_number != null
        ? Number(row.month_number)
        : resolveDefaultMonthNumber(Number(row.week_number ?? 0)),
    adventure_month_id: optionalString(row.adventure_month_id),
    status: (row.status as AdventureModuleStatus) ?? 'draft',
    cta_text: row.cta_text ? String(row.cta_text) : null,
    interactive_header_url: mapBackground,
    comic_thumbnail_url: comicThumbnail,
    map_background_url: mapBackground,
    hero_image_url: mapBackground,
    thumbnail_image_url: comicThumbnail,
    thumbnail_url: comicThumbnail,
    background_image_url: mapBackground,
    reward_value: Number(row.reward_value ?? 0),
    unlock_date: row.unlock_date ? String(row.unlock_date) : null,
    sort_order: Number(row.sort_order ?? 0),
    preview_activities: normalizeJsonArray<string>(row.preview_activities),
    hotspots: normalizeHotspots(row.hotspots),
    weekly_reward_name:
      optionalString(row.weekly_reward_name) ?? optionalString(row.reward_name),
    weekly_reward_type:
      (optionalString(row.weekly_reward_type) ??
        optionalString(row.reward_type)) as AdventureModuleRecord['weekly_reward_type'],
    weekly_reward_svg_url:
      optionalString(row.weekly_reward_svg_url) ?? optionalString(row.reward_svg_url),
    weekly_reward_image_url:
      optionalString(row.weekly_reward_image_url) ?? optionalString(row.reward_image_url),
    weekly_reward_description: optionalString(row.weekly_reward_description),
    weekly_reward_rarity: optionalString(row.weekly_reward_rarity),
    weekly_reward_coin_value: optionalNumber(row.weekly_reward_coin_value),
    coloring_page_pdf_url: optionalString(row.coloring_page_pdf_url),
    weekly_module_pdf_url: optionalString(row.weekly_module_pdf_url),
    comic_pdf_url: optionalString(row.comic_pdf_url),
    certificate_pdf_or_image_url:
      optionalString(row.certificate_pdf_or_image_url) ?? optionalString(row.certificate_url),
    certificate_url:
      optionalString(row.certificate_url) ?? optionalString(row.certificate_pdf_or_image_url),
    facilitator_kit_pdf_url: optionalString(row.facilitator_kit_pdf_url),
    reward_svg_url: optionalString(row.reward_svg_url),
    reward_image_url: optionalString(row.reward_image_url),
    reward_name: optionalString(row.reward_name),
    reward_type: optionalString(row.reward_type),
    is_live: Boolean(row.is_live),
    is_admin_preview: Boolean(row.is_admin_preview),
    is_featured: Boolean(row.is_featured),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

export async function fetchAdventureModules(): Promise<{
  modules: AdventureModuleRecord[];
  error?: string;
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return { modules: [], error: 'Supabase is not configured.' };
  }

  const { data, error } = await supabase
    .from('adventures')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('week_number', { ascending: true });

  if (error) {
    return { modules: [], error: error.message };
  }

  return { modules: (data ?? []).map((row) => normalizeRow(row as Record<string, unknown>)) };
}

/** Family portal — active and scheduled adventures only. */
export async function fetchFamilyAdventureModules(): Promise<{
  modules: AdventureModuleRecord[];
  error?: string;
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return { modules: [], error: 'Supabase is not configured.' };
  }

  const { data, error } = await supabase
    .from('adventures')
    .select('*')
    .in('status', ['active', 'scheduled'])
    .order('sort_order', { ascending: true })
    .order('week_number', { ascending: true });

  if (error) {
    return { modules: [], error: error.message };
  }

  return { modules: (data ?? []).map((row) => normalizeRow(row as Record<string, unknown>)) };
}

/** Fetch family adventures and resolve the featured hero row for the current visibility context. */
export async function fetchFeaturedAdventure(
  ctx: AdventureVisibilityContext = {},
): Promise<{ adventure: AdventureModuleRecord | null; error?: string }> {
  const result = await fetchFamilyAdventureModules();
  if (result.error) {
    return { adventure: null, error: result.error };
  }
  return { adventure: getFeaturedAdventure(result.modules, ctx) };
}

export async function createAdventureModule(
  input: AdventureModuleInput,
): Promise<{ module?: AdventureModuleRecord; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase is not configured.' };
  }

  const now = new Date().toISOString();
  const payload = {
    ...buildAdventurePayload(input),
    month_number: input.month_number ?? resolveDefaultMonthNumber(input.week_number),
    updated_at: now,
  };

  const { data, error } = await supabase.from('adventures').insert(payload).select('*').maybeSingle();

  if (error) {
    const message = error.message.includes('hotspots')
      ? `${error.message} — run supabase/adventures_cms_full_migration.sql in Supabase.`
      : error.message;
    console.error('[adventures] create failed:', message);
    return { error: message };
  }

  return { module: data ? normalizeRow(data as Record<string, unknown>) : undefined };
}

export async function updateAdventureModule(
  id: string,
  input: Partial<AdventureModuleInput>,
): Promise<{ module?: AdventureModuleRecord; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase is not configured.' };
  }

  const payload: Record<string, unknown> = {
    ...buildAdventurePayload(input),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('adventures')
    .update(payload)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) {
    const message = error.message.includes('hotspots')
      ? `${error.message} — run supabase/adventures_cms_full_migration.sql in Supabase.`
      : error.message;
    console.error('[adventures] update failed:', message);
    return { error: message };
  }

  return { module: data ? normalizeRow(data as Record<string, unknown>) : undefined };
}

export async function archiveAdventureModule(id: string): Promise<{ error?: string }> {
  return updateAdventureModule(id, { status: 'archived' });
}

export async function scheduleAdventureModule(
  id: string,
  unlockDate: string,
): Promise<{ error?: string }> {
  const result = await updateAdventureModule(id, {
    status: 'scheduled',
    unlock_date: unlockDate,
  });
  return { error: result.error };
}

export async function scheduleAdventureForTomorrow(id: string): Promise<{ error?: string }> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return scheduleAdventureModule(id, tomorrow.toISOString());
}

/** Publish an adventure — multiple weeks can be published (status=active) at once. */
export async function publishAdventureModule(id: string): Promise<{ error?: string }> {
  const result = await updateAdventureModule(id, { status: 'active' });
  return { error: result.error };
}

/** @deprecated Use publishAdventureModule — no longer demotes other published weeks. */
export async function setActiveAdventureModule(id: string): Promise<{ error?: string }> {
  return publishAdventureModule(id);
}

/** Set one adventure as the featured hero/header week; clears featured on all others. */
export async function setFeaturedAdventureModule(id: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase is not configured.' };
  }

  const now = new Date().toISOString();
  const { error: clearError } = await supabase
    .from('adventures')
    .update({ is_featured: false, updated_at: now })
    .eq('is_featured', true);

  if (clearError) {
    return { error: clearError.message };
  }

  const result = await updateAdventureModule(id, { is_featured: true });
  return { error: result.error };
}

export async function fetchAdventureModuleById(
  id: string,
): Promise<{ module?: AdventureModuleRecord; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase is not configured.' };
  }

  const { data, error } = await supabase.from('adventures').select('*').eq('id', id.trim()).maybeSingle();

  if (error) {
    return { error: error.message };
  }

  return { module: data ? normalizeRow(data as Record<string, unknown>) : undefined };
}

export type AdventureAssetUploadKind =
  | 'interactive_header'
  | 'comic_thumbnail'
  | 'map_background'
  | 'hero'
  | 'thumbnail'
  | 'background'
  | 'weekly_reward_svg'
  | 'weekly_reward_image'
  | 'coloring_page_pdf'
  | 'weekly_module_pdf'
  | 'comic_pdf'
  | 'certificate_pdf'
  | 'facilitator_kit_pdf';

export async function uploadAdventureAsset(
  file: File,
  adventureId: string,
  kind: AdventureAssetUploadKind,
): Promise<{ url?: string; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase is not configured.' };
  }

  const ext = file.name.split('.').pop() || 'png';
  const path = `${adventureId}/${kind}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(ADVENTURE_ASSETS_BUCKET).upload(path, file, {
    upsert: true,
    cacheControl: '3600',
  });

  if (error) {
    return { error: error.message };
  }

  const { data } = supabase.storage.from(ADVENTURE_ASSETS_BUCKET).getPublicUrl(path);
  return { url: `${data.publicUrl}?t=${Date.now()}` };
}

export async function seedDefaultAdventureModules(): Promise<{ count: number; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { count: 0, error: 'Supabase is not configured.' };
  }

  const seeds = buildDefaultAdventureModuleSeeds();
  let count = 0;

  for (const seed of seeds) {
    const { data: existing } = await supabase
      .from('adventures')
      .select('id')
      .eq('week_number', seed.week_number)
      .maybeSingle();

    if (existing?.id) {
      const result = await updateAdventureModule(existing.id, seed);
      if (result.error) return { count, error: result.error };
      count += 1;
      continue;
    }

    const result = await createAdventureModule(seed);
    if (result.error) return { count, error: result.error };
    count += 1;
  }

  return { count };
}

export { getFeaturedAdventure, logFeaturedAdventureDiagnostics } from './getFeaturedAdventure';

/** @deprecated Use getFeaturedAdventure — status=active is no longer exclusive. */
export function resolveActiveAdventureModule(
  modules: AdventureModuleRecord[],
): AdventureModuleRecord | null {
  return getFeaturedAdventure(modules);
}
