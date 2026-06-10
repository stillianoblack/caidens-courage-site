import { isSupabaseConfigured, supabase } from './supabaseClient';

export type GalleryProgramSettings = {
  programGalleryEnabled: boolean;
  communityGallerySharing: boolean;
  allowFamilySubmit: boolean;
  requireFacilitatorApproval: boolean;
};

export const DEFAULT_GALLERY_PROGRAM_SETTINGS: GalleryProgramSettings = {
  programGalleryEnabled: true,
  communityGallerySharing: false,
  allowFamilySubmit: true,
  requireFacilitatorApproval: true,
};

const STORAGE_PREFIX = 'facilitator_gallery_settings_';

function storageKey(programCode: string): string {
  return `${STORAGE_PREFIX}${programCode.trim()}`;
}

export function readGalleryProgramSettingsLocal(programCode: string): GalleryProgramSettings {
  if (!programCode.trim() || typeof window === 'undefined') {
    return DEFAULT_GALLERY_PROGRAM_SETTINGS;
  }
  try {
    const raw = window.localStorage.getItem(storageKey(programCode));
    if (!raw) return DEFAULT_GALLERY_PROGRAM_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<GalleryProgramSettings>;
    return {
      programGalleryEnabled: parsed.programGalleryEnabled ?? true,
      communityGallerySharing: parsed.communityGallerySharing ?? false,
      allowFamilySubmit: parsed.allowFamilySubmit ?? true,
      requireFacilitatorApproval: parsed.requireFacilitatorApproval ?? true,
    };
  } catch {
    return DEFAULT_GALLERY_PROGRAM_SETTINGS;
  }
}

export function writeGalleryProgramSettingsLocal(
  programCode: string,
  settings: GalleryProgramSettings,
): void {
  if (!programCode.trim() || typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(programCode), JSON.stringify(settings));
}

function mapDbRow(row: Record<string, unknown>): GalleryProgramSettings {
  return {
    programGalleryEnabled: row.gallery_enabled !== false,
    communityGallerySharing: row.gallery_community_sharing === true,
    allowFamilySubmit: row.gallery_family_submit_enabled !== false,
    requireFacilitatorApproval: row.gallery_require_approval !== false,
  };
}

export async function fetchGalleryProgramSettings(
  programCode: string,
): Promise<GalleryProgramSettings> {
  const local = readGalleryProgramSettingsLocal(programCode);
  if (!programCode.trim() || !isSupabaseConfigured() || !supabase) {
    return local;
  }

  try {
    const { data, error } = await supabase
      .from('pilot_programs')
      .select(
        'gallery_enabled, gallery_community_sharing, gallery_family_submit_enabled, gallery_require_approval',
      )
      .eq('program_code', programCode.trim())
      .maybeSingle();

    if (error) {
      if (/gallery_/i.test(error.message)) {
        return local;
      }
      console.warn('[gallery_settings] fetch failed:', error.message);
      return local;
    }

    if (!data) return local;
    const mapped = mapDbRow(data as Record<string, unknown>);
    writeGalleryProgramSettingsLocal(programCode, mapped);
    return mapped;
  } catch (err) {
    console.warn('[gallery_settings] fetch error:', err);
    return local;
  }
}

export async function saveGalleryProgramSettings(
  programCode: string,
  settings: GalleryProgramSettings,
): Promise<void> {
  writeGalleryProgramSettingsLocal(programCode, settings);
  if (!programCode.trim() || !isSupabaseConfigured() || !supabase) return;

  try {
    const { error } = await supabase
      .from('pilot_programs')
      .update({
        gallery_enabled: settings.programGalleryEnabled,
        gallery_community_sharing: settings.communityGallerySharing,
        gallery_family_submit_enabled: settings.allowFamilySubmit,
        gallery_require_approval: settings.requireFacilitatorApproval,
      })
      .eq('program_code', programCode.trim());

    if (error && !/gallery_/i.test(error.message)) {
      console.warn('[gallery_settings] save failed:', error.message);
    }
  } catch (err) {
    console.warn('[gallery_settings] save error:', err);
  }
}
