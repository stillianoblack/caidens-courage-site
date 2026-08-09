export async function establishAdminAnalyticsSession(email: string, passcode: string): Promise<boolean> {
  try {
    const response = await fetch('/.netlify/functions/admin-passcode-session', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, passcode }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function clearAdminAnalyticsSession(): Promise<void> {
  try {
    await fetch('/.netlify/functions/admin-passcode-session', {
      method: 'DELETE',
      credentials: 'same-origin',
    });
  } catch {
    // The local Admin session still clears when the server endpoint is unavailable.
  }
}
