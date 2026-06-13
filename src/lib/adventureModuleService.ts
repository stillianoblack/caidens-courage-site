import type { AdventureModuleInput, AdventureModuleRecord, AdventureModuleStatus } from '../types/adventureModule';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export const ADVENTURE_ASSETS_BUCKET = 'adventure-assets';

function normalizeRow(row: Record<string, unknown>): AdventureModuleRecord {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    subtitle: row.subtitle ? String(row.subtitle) : null,
    description: row.description ? String(row.description) : null,
    week_number: Number(row.week_number ?? 0),
    status: (row.status as AdventureModuleStatus) ?? 'draft',
    cta_text: row.cta_text ? String(row.cta_text) : null,
    hero_image_url: row.hero_image_url ? String(row.hero_image_url) : null,
    thumbnail_image_url: row.thumbnail_image_url ? String(row.thumbnail_image_url) : null,
    background_image_url: row.background_image_url ? String(row.background_image_url) : null,
    reward_value: Number(row.reward_value ?? 0),
    unlock_date: row.unlock_date ? String(row.unlock_date) : null,
    sort_order: Number(row.sort_order ?? 0),
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

export async function createAdventureModule(
  input: AdventureModuleInput,
): Promise<{ module?: AdventureModuleRecord; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase is not configured.' };
  }

  const now = new Date().toISOString();
  const payload = {
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || null,
    description: input.description?.trim() || null,
    week_number: input.week_number,
    status: input.status,
    cta_text: input.cta_text?.trim() || null,
    hero_image_url: input.hero_image_url?.trim() || null,
    thumbnail_image_url: input.thumbnail_image_url?.trim() || null,
    background_image_url: input.background_image_url?.trim() || null,
    reward_value: input.reward_value ?? 0,
    unlock_date: input.unlock_date || null,
    sort_order: input.sort_order ?? input.week_number,
    updated_at: now,
  };

  const { data, error } = await supabase.from('adventures').insert(payload).select('*').maybeSingle();

  if (error) {
    return { error: error.message };
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

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.subtitle !== undefined) payload.subtitle = input.subtitle?.trim() || null;
  if (input.description !== undefined) payload.description = input.description?.trim() || null;
  if (input.week_number !== undefined) payload.week_number = input.week_number;
  if (input.status !== undefined) payload.status = input.status;
  if (input.cta_text !== undefined) payload.cta_text = input.cta_text?.trim() || null;
  if (input.hero_image_url !== undefined) payload.hero_image_url = input.hero_image_url?.trim() || null;
  if (input.thumbnail_image_url !== undefined) {
    payload.thumbnail_image_url = input.thumbnail_image_url?.trim() || null;
  }
  if (input.background_image_url !== undefined) {
    payload.background_image_url = input.background_image_url?.trim() || null;
  }
  if (input.reward_value !== undefined) payload.reward_value = input.reward_value;
  if (input.unlock_date !== undefined) payload.unlock_date = input.unlock_date || null;
  if (input.sort_order !== undefined) payload.sort_order = input.sort_order;

  const { data, error } = await supabase
    .from('adventures')
    .update(payload)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  return { module: data ? normalizeRow(data as Record<string, unknown>) : undefined };
}

export async function archiveAdventureModule(id: string): Promise<{ error?: string }> {
  return updateAdventureModule(id, { status: 'archived' });
}

export async function setActiveAdventureModule(id: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase is not configured.' };
  }

  const { error: clearError } = await supabase
    .from('adventures')
    .update({ status: 'scheduled', updated_at: new Date().toISOString() })
    .eq('status', 'active');

  if (clearError) {
    return { error: clearError.message };
  }

  const result = await updateAdventureModule(id, { status: 'active' });
  return { error: result.error };
}

export async function uploadAdventureAsset(
  file: File,
  adventureId: string,
  kind: 'hero' | 'thumbnail' | 'background',
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
  return { url: data.publicUrl };
}

export function resolveActiveAdventureModule(
  modules: AdventureModuleRecord[],
): AdventureModuleRecord | null {
  const active = modules.filter((row) => row.status === 'active');
  if (active.length === 0) return null;
  return active.sort((a, b) => b.week_number - a.week_number)[0];
}
