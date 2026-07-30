import type {
  AcademyOutcomePayload,
  PilotOutcomeProgram,
  PilotOutcomeSummary,
} from '../types/pilotOutcomes';

async function authorizedJson<T>(url: string, _token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: 'same-origin',
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Pilot outcomes are temporarily unavailable.');
  return payload as T;
}

export function fetchPilotOutcomes(token: string) {
  return authorizedJson<{
    summary: PilotOutcomeSummary;
    programs: PilotOutcomeProgram[];
    unavailableSources: string[];
  }>('/.netlify/functions/admin-pilot-outcomes', token);
}

export function fetchPilotOutcomeProgram(token: string, programId: string) {
  return authorizedJson<{ program: PilotOutcomeProgram; unavailableSources: string[] }>(
    `/.netlify/functions/admin-pilot-outcomes?programId=${encodeURIComponent(programId)}`,
    token,
  );
}

export function fetchPilotRollout(token: string, programId: string) {
  return authorizedJson<{
    state: Record<string, unknown> | null;
    notes: Array<Record<string, unknown>>;
    reports: Array<Record<string, unknown>>;
    persistenceAvailable: boolean;
  }>(
    `/.netlify/functions/admin-pilot-rollout?programId=${encodeURIComponent(programId)}`,
    token,
  );
}

export function savePilotRollout(
  token: string,
  payload: Record<string, unknown>,
) {
  return authorizedJson<{ state?: Record<string, unknown>; note?: Record<string, unknown> }>(
    '/.netlify/functions/admin-pilot-rollout',
    token,
    { method: 'POST', body: JSON.stringify(payload) },
  );
}

export async function downloadPilotOutcomesReport(
  _token: string,
  payload: Record<string, unknown>,
) {
  const response = await fetch('/.netlify/functions/admin-pilot-outcomes-report', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'The report could not be generated.');
  }
  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const encodedName = disposition.match(/filename\\*=UTF-8''([^;]+)/)?.[1];
  return { blob, filename: encodedName ? decodeURIComponent(encodedName) : 'pilot-outcomes-report.pdf' };
}

export function fetchAcademyOutcomes(token: string) {
  return authorizedJson<{ academy: AcademyOutcomePayload; unavailableSources: string[] }>(
    '/.netlify/functions/admin-academy-outcomes',
    token,
  );
}

export function saveAcademyReportingOverride(
  token: string,
  payload: {
    participantId: string;
    reportingOverride: 'automatic' | 'include' | 'exclude';
    reason?: string;
  },
) {
  return authorizedJson<{ override: Record<string, unknown> }>(
    '/.netlify/functions/admin-academy-outcomes',
    token,
    { method: 'PATCH', body: JSON.stringify(payload) },
  );
}

export async function downloadAcademyReport(format: 'pdf' | 'html' = 'pdf') {
  const response = await fetch(`/.netlify/functions/admin-academy-report?format=${format}`, {
    method: 'POST',
    credentials: 'same-origin',
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || 'The Academy report could not be generated.');
  }
  if (format === 'html') return { html: await response.text() };
  return {
    blob: await response.blob(),
    filename: `focus-flame-academy-overview-${new Date().toISOString().slice(0, 10)}.pdf`,
  };
}
