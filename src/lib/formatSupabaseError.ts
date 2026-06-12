type SupabaseErrorShape = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

export function formatSupabaseError(error: unknown): string {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  if (error instanceof Error) {
    const shaped = error as SupabaseErrorShape;
    const parts = [
      error.message,
      shaped.code ? `code=${shaped.code}` : '',
      shaped.details ? `details=${shaped.details}` : '',
      shaped.hint ? `hint=${shaped.hint}` : '',
    ].filter(Boolean);
    return parts.join(' | ');
  }
  if (typeof error === 'object') {
    const shaped = error as SupabaseErrorShape;
    const parts = [
      shaped.message,
      shaped.code ? `code=${shaped.code}` : '',
      shaped.details ? `details=${shaped.details}` : '',
      shaped.hint ? `hint=${shaped.hint}` : '',
    ].filter(Boolean);
    if (parts.length) return parts.join(' | ');
    try {
      return JSON.stringify(error);
    } catch {
      return 'Unknown Supabase error';
    }
  }
  return String(error);
}

export function formatMissionSaveErrorMessage(debugError?: string): string {
  if (process.env.NODE_ENV === 'development' && debugError) {
    return `Progress could not save: ${debugError}`;
  }
  return 'Progress could not save. Please try again.';
}
