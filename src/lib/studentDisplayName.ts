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

/** Preferred student label: nickname → first name → display name → child name. */
export function resolveStudentDisplayName(fields: StudentNameFields): string | null {
  return (
    fields.nickname?.trim() ||
    fields.first_name?.trim() ||
    fields.firstName?.trim() ||
    fields.displayName?.trim() ||
    fields.display_name?.trim() ||
    fields.child_name?.trim() ||
    fields.childName?.trim() ||
    null
  );
}

export function resolveStudentDisplayNameOrFallback(
  fields: StudentNameFields,
  fallback = 'Student',
): string {
  return resolveStudentDisplayName(fields) ?? fallback;
}

export function formatStudentDisplayNameWithGrade(
  fields: StudentNameFields & { gradeLevel?: string | null; grade_level?: string | null },
): string {
  const name = resolveStudentDisplayNameOrFallback(fields);
  const grade = fields.gradeLevel?.trim() || fields.grade_level?.trim();
  return grade ? `${name} (${grade})` : name;
}
