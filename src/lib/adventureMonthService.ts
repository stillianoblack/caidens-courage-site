import { DEFAULT_ADVENTURE_MONTH_SEEDS } from '../data/adventureMonthSeeds';
import type { AdventureMonthInput, AdventureMonthRecord, CertificateAssetType } from '../types/adventureMonth';
import { ADVENTURE_ASSETS_BUCKET } from './adventureModuleService';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const WEEKS_PER_MONTH_DEFAULT = 4;

export function resolveDefaultMonthNumber(weekNumber: number): number {
  if (weekNumber <= 0) return 1;
  return Math.max(1, Math.ceil(weekNumber / WEEKS_PER_MONTH_DEFAULT));
}

export function formatAdventureMonthLabel(month: Pick<AdventureMonthRecord, 'month_number' | 'month_title'>): string {
  return `Month ${month.month_number}: ${month.month_title}`;
}

function optionalString(value: unknown): string | null {
  return value ? String(value) : null;
}

function optionalNumber(value: unknown, fallback = 0): number {
  if (value == null || value === '') return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeMonthRow(row: Record<string, unknown>): AdventureMonthRecord {
  return {
    id: String(row.id ?? `fallback-month-${row.month_number}`),
    month_number: Number(row.month_number ?? 0),
    month_title: String(row.month_title ?? ''),
    month_subtitle: optionalString(row.month_subtitle),
    month_description: optionalString(row.month_description),
    month_hero_image_url: optionalString(row.month_hero_image_url),
    certificate_title: optionalString(row.certificate_title),
    certificate_reward_name: optionalString(row.certificate_reward_name),
    certificate_required_weeks: optionalNumber(row.certificate_required_weeks, 4),
    certificate_asset_url: optionalString(row.certificate_asset_url),
    certificate_asset_type:
      (optionalString(row.certificate_asset_type) as CertificateAssetType | null) ?? 'image',
    is_published: Boolean(row.is_published),
    sort_order: optionalNumber(row.sort_order, Number(row.month_number ?? 0)),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

function fallbackMonthsFromSeeds(): AdventureMonthRecord[] {
  const now = new Date().toISOString();
  return DEFAULT_ADVENTURE_MONTH_SEEDS.map((seed) => ({
    id: `fallback-month-${seed.month_number}`,
    month_number: seed.month_number,
    month_title: seed.month_title,
    month_subtitle: seed.month_subtitle ?? null,
    month_description: seed.month_description ?? null,
    month_hero_image_url: null,
    certificate_title: seed.certificate_title ?? null,
    certificate_reward_name: seed.certificate_reward_name ?? null,
    certificate_required_weeks: seed.certificate_required_weeks ?? 4,
    certificate_asset_url: null,
    certificate_asset_type: 'image' as const,
    is_published: Boolean(seed.is_published),
    sort_order: seed.sort_order ?? seed.month_number,
    created_at: now,
    updated_at: now,
  }));
}

function buildMonthPayload(input: Partial<AdventureMonthInput>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (input.month_number !== undefined) payload.month_number = input.month_number;
  if (input.month_title !== undefined) payload.month_title = input.month_title.trim();
  if (input.month_subtitle !== undefined) payload.month_subtitle = input.month_subtitle?.trim() || null;
  if (input.month_description !== undefined) {
    payload.month_description = input.month_description?.trim() || null;
  }
  if (input.month_hero_image_url !== undefined) {
    payload.month_hero_image_url = input.month_hero_image_url?.trim() || null;
  }
  if (input.certificate_title !== undefined) {
    payload.certificate_title = input.certificate_title?.trim() || null;
  }
  if (input.certificate_reward_name !== undefined) {
    payload.certificate_reward_name = input.certificate_reward_name?.trim() || null;
  }
  if (input.certificate_required_weeks !== undefined) {
    payload.certificate_required_weeks = Math.max(1, input.certificate_required_weeks);
  }
  if (input.certificate_asset_url !== undefined) {
    payload.certificate_asset_url = input.certificate_asset_url?.trim() || null;
  }
  if (input.certificate_asset_type !== undefined) {
    payload.certificate_asset_type = input.certificate_asset_type || 'image';
  }
  if (input.is_published !== undefined) payload.is_published = Boolean(input.is_published);
  if (input.sort_order !== undefined) payload.sort_order = input.sort_order;
  return payload;
}

export async function fetchAdventureMonths(): Promise<{
  months: AdventureMonthRecord[];
  error?: string;
  fromFallback?: boolean;
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return { months: fallbackMonthsFromSeeds(), fromFallback: true };
  }

  const { data, error } = await supabase
    .from('adventure_months')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('month_number', { ascending: true });

  if (error) {
    const missingTable =
      error.message.includes('adventure_months') ||
      error.message.includes('schema cache') ||
      error.code === '42P01';
    if (missingTable) {
      return { months: fallbackMonthsFromSeeds(), fromFallback: true };
    }
    return { months: fallbackMonthsFromSeeds(), error: error.message, fromFallback: true };
  }

  if (!data?.length) {
    return { months: fallbackMonthsFromSeeds(), fromFallback: true };
  }

  return { months: data.map((row) => normalizeMonthRow(row as Record<string, unknown>)) };
}

export async function fetchFamilyAdventureMonths(): Promise<{
  months: AdventureMonthRecord[];
  error?: string;
  fromFallback?: boolean;
}> {
  const result = await fetchAdventureMonths();
  return {
    ...result,
    months: result.months.filter((month) => month.is_published || month.id.startsWith('fallback-')),
  };
}

export async function updateAdventureMonth(
  id: string,
  input: Partial<AdventureMonthInput>,
): Promise<{ month?: AdventureMonthRecord; error?: string }> {
  if (id.startsWith('fallback-')) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[ADVENTURE_MONTHS] Month metadata not persisted — run supabase/adventure_months_migration.sql.',
        input,
      );
    }
    return { error: 'Run supabase/adventure_months_migration.sql to enable month editing.' };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase is not configured.' };
  }

  const payload = {
    ...buildMonthPayload(input),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('adventure_months')
    .update(payload)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  return { month: data ? normalizeMonthRow(data as Record<string, unknown>) : undefined };
}

export async function seedDefaultAdventureMonths(): Promise<{ count: number; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { count: 0, error: 'Supabase is not configured.' };
  }

  let count = 0;
  for (const seed of DEFAULT_ADVENTURE_MONTH_SEEDS) {
    const { data: existing } = await supabase
      .from('adventure_months')
      .select('id')
      .eq('month_number', seed.month_number)
      .maybeSingle();

    const payload = {
      ...buildMonthPayload(seed),
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      const { error } = await supabase.from('adventure_months').update(payload).eq('id', existing.id);
      if (error) return { count, error: error.message };
      count += 1;
      continue;
    }

    const { error } = await supabase.from('adventure_months').insert({
      ...payload,
      created_at: new Date().toISOString(),
    });
    if (error) return { count, error: error.message };
    count += 1;
  }

  return { count };
}

export type AdventureMonthAssetKind = 'month_hero' | 'certificate_asset';

export async function uploadAdventureMonthAsset(
  file: File,
  monthId: string,
  kind: AdventureMonthAssetKind = 'month_hero',
): Promise<{ url?: string; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase is not configured.' };
  }

  const ext = file.name.split('.').pop() || 'png';
  const path = `months/${monthId}/${kind}-${Date.now()}.${ext}`;

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

export function resolveMonthForWeek(
  weekNumber: number,
  months: AdventureMonthRecord[],
  monthNumberHint?: number | null,
): AdventureMonthRecord | null {
  const targetMonthNumber = monthNumberHint ?? resolveDefaultMonthNumber(weekNumber);
  return months.find((month) => month.month_number === targetMonthNumber) ?? null;
}

export function groupModulesByMonth<T extends { week_number: number; month_number?: number | null; sort_order: number }>(
  modules: T[],
  months: AdventureMonthRecord[],
): Array<{ month: AdventureMonthRecord; modules: T[] }> {
  const monthByNumber = new Map(months.map((month) => [month.month_number, month]));
  const grouped = new Map<number, T[]>();

  for (const module of modules) {
    const monthNumber = module.month_number ?? resolveDefaultMonthNumber(module.week_number);
    const bucket = grouped.get(monthNumber) ?? [];
    bucket.push(module);
    grouped.set(monthNumber, bucket);
  }

  const sortedMonthNumbers = Array.from(grouped.keys()).sort((a, b) => a - b);

  return sortedMonthNumbers.map((monthNumber) => {
    const month =
      monthByNumber.get(monthNumber) ??
      ({
        id: `fallback-month-${monthNumber}`,
        month_number: monthNumber,
        month_title: `Month ${monthNumber}`,
        month_subtitle: null,
        month_description: null,
        month_hero_image_url: null,
        certificate_title: null,
        certificate_reward_name: null,
        certificate_required_weeks: 4,
        certificate_asset_url: null,
        certificate_asset_type: 'image',
        is_published: false,
        sort_order: monthNumber,
        created_at: '',
        updated_at: '',
      } satisfies AdventureMonthRecord);

    const monthModules = [...(grouped.get(monthNumber) ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order || a.week_number - b.week_number,
    );

    return { month, modules: monthModules };
  });
}
