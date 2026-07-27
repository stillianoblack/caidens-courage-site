import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AdminAuthValue = {
  token: string | null;
  loading: boolean;
  authorized: boolean;
  error: string | null;
  signIn(email: string, passcode: string): Promise<boolean>;
  signOut(): Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

async function validateSession(): Promise<boolean> {
  try {
    const response = await fetch('/.netlify/functions/admin-session', { credentials: 'same-origin' });
    return response.ok;
  } catch {
    return false;
  }
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void validateSession().then((valid) => {
      if (valid) setToken('http-only-session');
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (email: string, passcode: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/.netlify/functions/admin-session', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), passcode }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.authenticated !== true) {
        setError(response.status === 403
          ? 'The email or passcode was not recognized.'
          : 'Admin sign-in is temporarily unavailable.');
        setLoading(false);
        return false;
      }
      setToken('http-only-session');
      setLoading(false);
      return true;
    } catch {
      setError('Admin sign-in is temporarily unavailable.');
      setLoading(false);
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    await fetch('/.netlify/functions/admin-session', {
      method: 'DELETE',
      credentials: 'same-origin',
    }).catch(() => undefined);
    setToken(null);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({ token, loading, authorized: Boolean(token), error, signIn, signOut }),
    [token, loading, error, signIn, signOut],
  );
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error('useAdminAuth requires AdminAuthProvider');
  return value;
}
