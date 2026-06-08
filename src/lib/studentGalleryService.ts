import { isSupabaseConfigured, supabase } from './supabaseClient';

export const STUDENT_GALLERY_BUCKET = 'student_gallery';
export const DEFAULT_GALLERY_PROGRAM_CODE = 'BlueRibbon2026';
export const FAMILY_GALLERY_PROGRAM_CODE = 'BlueRibbonFamily';

export type GalleryItemStatus = 'pending' | 'approved' | 'rejected' | 'needs_changes';

export type GalleryUploadSource = 'dashboard' | 'submit' | 'family';

export type StudentGalleryItem = {
  id: string;
  created_at: string;
  title: string;
  student_nickname: string;
  program_code: string;
  group_name: string;
  file_url: string;
  file_path: string;
  status: GalleryItemStatus | string;
  caption?: string | null;
  facilitator_note?: string | null;
  upload_source?: GalleryUploadSource | string | null;
  submitter_key?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
};

/** Status values written by the app. Legacy `pending_review` is treated as pending. */
export const GALLERY_PENDING_STATUSES = ['pending', 'pending_review', 'needs_changes'] as const;

export type GalleryUploadInput = {
  file: File;
  title: string;
  studentNickname: string;
  programCode?: string;
  groupName?: string;
  caption?: string;
  uploadSource?: GalleryUploadSource;
  submitterKey?: string;
};

export type GalleryUploadResult =
  | { success: true; item: StudentGalleryItem }
  | { success: false; error: string };

export type GalleryStatusUpdateResult =
  | { success: true; item: StudentGalleryItem }
  | { success: false; error: string };

export type GalleryReviewInput = {
  id: string;
  status: Extract<GalleryItemStatus, 'approved' | 'rejected' | 'needs_changes'>;
  facilitatorNote?: string;
  reviewedBy?: string;
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function isAllowedGalleryImageType(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.type);
}

function safeFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').toLowerCase();
  return base.slice(0, 80) || 'image';
}

export function buildGalleryStoragePath(fileName: string, prefix?: string): string {
  const folder = prefix ?? DEFAULT_GALLERY_PROGRAM_CODE;
  return `${folder}/${Date.now()}-${safeFileName(fileName)}`;
}

export function normalizeGalleryStatus(status: string | null | undefined): GalleryItemStatus {
  if (status === 'approved' || status === 'rejected' || status === 'needs_changes') return status;
  if (status === 'pending' || status === 'pending_review') return 'pending';
  return 'pending';
}

export function isPendingGalleryStatus(status: string | null | undefined): boolean {
  const normalized = normalizeGalleryStatus(status);
  return normalized === 'pending' || normalized === 'needs_changes';
}

export function getGalleryStatusLabel(status: string | null | undefined): string {
  const normalized = normalizeGalleryStatus(status);
  const labels: Record<GalleryItemStatus, string> = {
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    needs_changes: 'Needs Changes',
  };
  return labels[normalized];
}

function initialStatusForUploadSource(source: GalleryUploadSource): GalleryItemStatus {
  return source === 'dashboard' ? 'approved' : 'pending';
}

type ProgramScopedQuery<T> = {
  in(column: string, values: string[]): T;
  eq(column: string, value: string): T;
};

function applyGalleryProgramCodeFilter<T extends ProgramScopedQuery<T>>(
  query: T,
  programCode?: string,
): T {
  if (!programCode?.trim()) return query;

  const code = programCode.trim();
  const includeLegacyFamily =
    code === DEFAULT_GALLERY_PROGRAM_CODE || code.toLowerCase().includes('blueribbon');

  if (includeLegacyFamily) {
    return query.in('program_code', [code, FAMILY_GALLERY_PROGRAM_CODE]);
  }
  return query.eq('program_code', code);
}

export async function fetchFacilitatorPendingGalleryCount(programCode?: string): Promise<number> {
  if (!isSupabaseConfigured() || !supabase) return 0;

  try {
    let query = supabase
      .from('student_gallery_items')
      .select('*', { count: 'exact', head: true })
      .in('status', [...GALLERY_PENDING_STATUSES]);

    query = applyGalleryProgramCodeFilter(query, programCode);

    const { count, error } = await query;
    if (error) {
      console.error('[student_gallery] pending count failed:', error);
      return 0;
    }

    const total = count ?? 0;
    console.log('FACILITATOR_PENDING_COUNT', total, {
      program_code: programCode?.trim() || '(all programs)',
    });
    return total;
  } catch (err) {
    console.error('[student_gallery] pending count error:', err);
    return 0;
  }
}

export async function fetchFamilyNewApprovedGalleryCount(
  programCode?: string,
  lastViewedAt?: string | null,
): Promise<number> {
  if (!isSupabaseConfigured() || !supabase) return 0;

  try {
    let query = supabase
      .from('student_gallery_items')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    query = applyGalleryProgramCodeFilter(query, programCode);

    if (lastViewedAt) {
      query = query.gt('reviewed_at', lastViewedAt);
    }

    const { count, error } = await query;
    if (error) {
      console.error('[student_gallery] family approved count failed:', error);
      return 0;
    }

    const total = count ?? 0;
    console.log('GALLERY_APPROVED_COUNT', total, {
      program_code: programCode?.trim() || '(all programs)',
      since: lastViewedAt ?? '(all time)',
    });
    return total;
  } catch (err) {
    console.error('[student_gallery] family approved count error:', err);
    return 0;
  }
}

export async function fetchFacilitatorPendingGalleryItems(
  programCode?: string,
): Promise<StudentGalleryItem[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  try {
    let query = supabase
      .from('student_gallery_items')
      .select('*')
      .in('status', [...GALLERY_PENDING_STATUSES])
      .order('created_at', { ascending: false });

    query = applyGalleryProgramCodeFilter(query, programCode);

    const { data, error } = await query;

    if (error) {
      console.error('[student_gallery] pending fetch failed:', error);
      return [];
    }

    const items = (data ?? []) as StudentGalleryItem[];
    console.log('FACILITATOR_PENDING_COUNT', items.length, {
      program_code: programCode?.trim() || '(all programs)',
      statuses: GALLERY_PENDING_STATUSES,
    });
    return items;
  } catch (err) {
    console.error('[student_gallery] pending fetch error:', err);
    return [];
  }
}

export async function fetchFacilitatorApprovedGalleryItems(
  programCode?: string,
): Promise<StudentGalleryItem[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  try {
    let query = supabase
      .from('student_gallery_items')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    query = applyGalleryProgramCodeFilter(query, programCode);

    const { data, error } = await query;

    if (error) {
      console.error('[student_gallery] facilitator approved fetch failed:', error);
      return [];
    }

    const items = (data ?? []) as StudentGalleryItem[];
    console.log('GALLERY_APPROVED_COUNT', items.length, {
      program_code: programCode?.trim() || '(all programs)',
    });
    return items;
  } catch (err) {
    console.error('[student_gallery] facilitator approved fetch error:', err);
    return [];
  }
}

export async function fetchStudentGalleryItems(programCode?: string): Promise<StudentGalleryItem[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  try {
    let query = supabase.from('student_gallery_items').select('*').order('created_at', { ascending: false });

    if (programCode?.trim()) {
      query = query.eq('program_code', programCode.trim());
    }

    const { data, error } = await query;

    if (error) {
      console.error('[student_gallery] fetch failed:', error);
      return [];
    }

    return (data ?? []) as StudentGalleryItem[];
  } catch (err) {
    console.error('[student_gallery] fetch error:', err);
    return [];
  }
}

export async function fetchApprovedStudentGalleryItems(): Promise<StudentGalleryItem[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('student_gallery_items')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[student_gallery] approved fetch failed:', error);
      return [];
    }

    return (data ?? []) as StudentGalleryItem[];
  } catch (err) {
    console.error('[student_gallery] approved fetch error:', err);
    return [];
  }
}

export async function fetchFamilyGallerySubmissions(
  submitterKey: string,
): Promise<StudentGalleryItem[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('student_gallery_items')
      .select('*')
      .eq('submitter_key', submitterKey)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[student_gallery] family fetch failed:', error);
      return [];
    }

    return (data ?? []) as StudentGalleryItem[];
  } catch (err) {
    console.error('[student_gallery] family fetch error:', err);
    return [];
  }
}

function buildReviewTimestampFields(
  status: GalleryReviewInput['status'],
  now: string,
): Record<string, string | null> {
  if (status === 'approved') {
    return { approved_at: now, rejected_at: null };
  }
  if (status === 'rejected') {
    return { rejected_at: now, approved_at: null };
  }
  return {};
}

function isMissingReviewTimestampColumn(message: string): boolean {
  return (
    /approved_at|rejected_at/i.test(message) &&
    /schema cache|could not find/i.test(message)
  );
}

function buildReviewUpdatePayload(
  input: GalleryReviewInput,
  now: string,
  includeReviewTimestamps: boolean,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    status: input.status,
    reviewed_at: now,
  };

  if (includeReviewTimestamps) {
    Object.assign(payload, buildReviewTimestampFields(input.status, now));
  }

  if (input.facilitatorNote !== undefined) {
    payload.facilitator_note = input.facilitatorNote.trim() || null;
  }
  if (input.reviewedBy) {
    payload.reviewed_by = input.reviewedBy;
  }

  return payload;
}

export async function updateStudentGalleryItemReview(
  input: GalleryReviewInput,
): Promise<GalleryStatusUpdateResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase is not configured.' };
  }

  const now = new Date().toISOString();

  try {
    let payload = buildReviewUpdatePayload(input, now, true);
    let { data, error } = await supabase
      .from('student_gallery_items')
      .update(payload)
      .eq('id', input.id)
      .select('*');

    if (error && isMissingReviewTimestampColumn(error.message)) {
      console.warn(
        '[student_gallery] approved_at/rejected_at columns missing; retrying with reviewed_at only. Run supabase/student_gallery_review_timestamps.sql.',
      );
      payload = buildReviewUpdatePayload(input, now, false);
      ({ data, error } = await supabase
        .from('student_gallery_items')
        .update(payload)
        .eq('id', input.id)
        .select('*'));
    }

    if (error) {
      console.error('[student_gallery] review update failed:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      const policyHint =
        'No rows updated. Run supabase/student_gallery_update_policy.sql in the SQL Editor.';
      console.error('[student_gallery] review update returned no rows:', input.id);
      return { success: false, error: policyHint };
    }

    return { success: true, item: data[0] as StudentGalleryItem };
  } catch (err) {
    console.error('[student_gallery] review update error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Review update failed.',
    };
  }
}

/** @deprecated Use updateStudentGalleryItemReview */
export async function updateStudentGalleryItemStatus(
  id: string,
  status: Extract<GalleryItemStatus, 'approved' | 'rejected'>,
): Promise<GalleryStatusUpdateResult> {
  return updateStudentGalleryItemReview({ id, status });
}

export async function uploadStudentGalleryItem(
  input: GalleryUploadInput,
): Promise<GalleryUploadResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase is not configured.' };
  }

  if (!isAllowedGalleryImageType(input.file)) {
    return { success: false, error: 'Please upload a JPG, PNG, or WEBP image.' };
  }

  const programCode = input.programCode?.trim() || DEFAULT_GALLERY_PROGRAM_CODE;
  const uploadSource = input.uploadSource ?? 'submit';
  const status = initialStatusForUploadSource(uploadSource);
  const storagePrefix = programCode;
  const filePath = buildGalleryStoragePath(input.file.name, storagePrefix);

  try {
    const { error: uploadError } = await supabase.storage
      .from(STUDENT_GALLERY_BUCKET)
      .upload(filePath, input.file, {
        cacheControl: '3600',
        upsert: false,
        contentType: input.file.type,
      });

    if (uploadError) {
      console.error('[student_gallery] storage upload failed:', uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data: publicData } = supabase.storage.from(STUDENT_GALLERY_BUCKET).getPublicUrl(filePath);
    const fileUrl = publicData.publicUrl;

    const row: Record<string, unknown> = {
      title: input.title.trim(),
      student_nickname: input.studentNickname.trim(),
      program_code: programCode,
      group_name: input.groupName?.trim() ?? '',
      caption: input.caption?.trim() ?? '',
      file_url: fileUrl,
      file_path: filePath,
      status,
      upload_source: uploadSource,
    };

    if (input.submitterKey) {
      row.submitter_key = input.submitterKey;
    }

    const { data, error: insertError } = await supabase
      .from('student_gallery_items')
      .insert(row)
      .select('*')
      .single();

    if (insertError) {
      console.error('[student_gallery] metadata insert failed:', insertError);
      return { success: false, error: insertError.message };
    }

    const item = data as StudentGalleryItem;
    if (uploadSource === 'family' || uploadSource === 'submit') {
      console.log('FAMILY_UPLOAD_CREATED', {
        id: item.id,
        upload_source: uploadSource,
        program_code: programCode,
        status,
        bucket: STUDENT_GALLERY_BUCKET,
        file_path: filePath,
      });
    }

    return { success: true, item };
  } catch (err) {
    console.error('[student_gallery] upload error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Upload failed.',
    };
  }
}
