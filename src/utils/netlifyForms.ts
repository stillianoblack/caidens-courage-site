/**
 * Netlify Forms submission helper for React SPA.
 * POSTs to "/" with form-urlencoded body.
 */

export function encodeForm(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

export async function submitNetlifyForm(
  formName: string,
  data: Record<string, string>
): Promise<Response> {
  const payload = { 'form-name': formName, ...data };
  return fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encodeForm(payload),
  });
}
