export type StudentNameFields = {
  nickname?: string | null;
  first_name?: string | null;
  firstName?: string | null;
  last_name?: string | null;
  displayName?: string | null;
  display_name?: string | null;
  child_name?: string | null;
  childName?: string | null;
};

export const ROSTER_STUDENT_NAME_FALLBACK = 'Unnamed Student';

const PLACEHOLDER_PARENT_NAMES = new Set(['pending', 'family', 'guardian', 'parent']);

/** Stub values written before a real parent claims — must not appear in roster or claim forms. */
export function isPlaceholderParentName(value?: string | null): boolean {
  const normalized = value?.trim().toLowerCase() ?? '';
  if (!normalized) return false;
  return PLACEHOLDER_PARENT_NAMES.has(normalized);
}

/** Roster / slideout label: display_name → nickname → first_name → fallback. */
export function resolveStudentDisplayName(fields: StudentNameFields): string | null {
  return (
    fields.display_name?.trim() ||
    fields.displayName?.trim() ||
    fields.nickname?.trim() ||
    fields.first_name?.trim() ||
    fields.firstName?.trim() ||
    fields.child_name?.trim() ||
    fields.childName?.trim() ||
    null
  );
}

export function resolveStudentDisplayNameOrFallback(
  fields: StudentNameFields,
  fallback = ROSTER_STUDENT_NAME_FALLBACK,
): string {
  return resolveStudentDisplayName(fields) ?? fallback;
}

export function warnIfStudentMissingDisplayName(
  participantId: string,
  fields: StudentNameFields,
  context: string,
): void {
  if (resolveStudentDisplayName(fields)) return;
  console.warn('[STUDENT_IDENTITY] missing_display_name', {
    participant_id: participantId,
    context,
    fields,
  });
}

export type ParentGuardianNameFields = {
  full_name?: string | null;
  fullName?: string | null;
  parent_first_name?: string | null;
  parent_last_name?: string | null;
  parentFirstName?: string | null;
  parentLastName?: string | null;
  parent_email?: string | null;
  parentEmail?: string | null;
};

export function resolveParentGuardianDisplayName(fields: ParentGuardianNameFields): string {
  const full =
    fields.full_name?.trim() ||
    fields.fullName?.trim() ||
    '';
  if (full && !isPlaceholderParentName(full)) return full;

  const first = fields.parent_first_name?.trim() || fields.parentFirstName?.trim() || '';
  let last = fields.parent_last_name?.trim() || fields.parentLastName?.trim() || '';
  if (isPlaceholderParentName(last)) last = '';

  const combined = [first, last].filter(Boolean).join(' ');
  if (combined) return combined;

  const email = fields.parent_email?.trim() || fields.parentEmail?.trim() || '';
  return email || '—';
}

export function formatStudentDisplayNameWithGrade(
  fields: StudentNameFields & { gradeLevel?: string | null; grade_level?: string | null },
): string {
  const name = resolveStudentDisplayNameOrFallback(fields);
  const grade = fields.gradeLevel?.trim() || fields.grade_level?.trim();
  return grade ? `${name} (${grade})` : name;
}
