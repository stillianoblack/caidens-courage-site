import type { AdventureModuleInput } from '../types/adventureModule';
import type { AdventureMonthInput } from '../types/adventureMonth';

export const ADVENTURE_IMAGE_UPLOAD_WARNING =
  'Image is still uploading. Please wait before saving.';

export type AdventureImageUploadKind = 'month_hero' | 'week_thumbnail' | 'week_hero';

export type AdventureImageUploadLog = {
  uploadType: AdventureImageUploadKind;
  fileName: string;
  publicUrl: string | null;
  dbField: string;
  savePayloadUrl: string | null;
  success: boolean;
  failure?: string;
};

const MODULE_IMAGE_FIELDS: (keyof AdventureModuleInput)[] = [
  'comic_thumbnail_url',
  'thumbnail_image_url',
  'thumbnail_url',
  'map_background_url',
  'background_image_url',
  'hero_image_url',
  'weekly_reward_image_url',
  'weekly_reward_svg_url',
  'certificate_pdf_or_image_url',
  'coloring_page_pdf_url',
  'weekly_module_pdf_url',
  'comic_pdf_url',
  'facilitator_kit_pdf_url',
];

const MONTH_IMAGE_FIELDS: (keyof AdventureMonthInput)[] = [
  'month_hero_image_url',
  'certificate_asset_url',
];

export function isBlobPreviewUrl(value: unknown): boolean {
  return typeof value === 'string' && value.trim().startsWith('blob:');
}

export function findBlobImageFields(
  values: Record<string, unknown>,
  fieldNames: readonly string[],
): string[] {
  return fieldNames.filter((field) => isBlobPreviewUrl(values[field]));
}

export function findBlobFieldsInModuleInput(form: Partial<AdventureModuleInput>): string[] {
  return findBlobImageFields(form as Record<string, unknown>, MODULE_IMAGE_FIELDS);
}

export function findBlobFieldsInMonthInput(form: Partial<AdventureMonthInput>): string[] {
  return findBlobImageFields(form as Record<string, unknown>, MONTH_IMAGE_FIELDS);
}

/** Strip blob preview URLs so they are never persisted accidentally. */
export function stripBlobUrlsFromModuleInput<T extends Partial<AdventureModuleInput>>(form: T): T {
  const next = { ...form };
  for (const field of MODULE_IMAGE_FIELDS) {
    if (isBlobPreviewUrl(next[field])) {
      delete next[field];
    }
  }
  return next;
}

export function stripBlobUrlsFromMonthInput<T extends Partial<AdventureMonthInput>>(form: T): T {
  const next = { ...form };
  for (const field of MONTH_IMAGE_FIELDS) {
    if (isBlobPreviewUrl(next[field])) {
      delete next[field];
    }
  }
  return next;
}

export function resolveAdventureAssetUploadKind(
  kind: string,
): AdventureImageUploadKind {
  if (kind === 'month_hero') return 'month_hero';
  if (kind === 'comic_thumbnail' || kind === 'thumbnail') return 'week_thumbnail';
  return 'week_hero';
}

export function resolveAdventureAssetDbField(
  kind: string,
  field?: keyof AdventureModuleInput,
): string {
  if (field) return String(field);
  if (kind === 'month_hero') return 'month_hero_image_url';
  if (kind === 'comic_thumbnail' || kind === 'thumbnail') {
    return 'comic_thumbnail_url';
  }
  if (kind === 'certificate_asset') return 'certificate_asset_url';
  return 'map_background_url';
}

export function logAdventureImageUpload(payload: AdventureImageUploadLog): void {
  if (process.env.NODE_ENV !== 'development') return;
  console.info('[ADVENTURE_IMAGE_UPLOAD]', {
    uploadType: payload.uploadType,
    fileName: payload.fileName,
    returnedPublicUrl: payload.publicUrl,
    dbFieldUpdated: payload.dbField,
    savePayloadImageUrl: payload.savePayloadUrl,
    success: payload.success,
    failure: payload.failure ?? null,
  });
}
