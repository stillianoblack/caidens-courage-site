import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ADMIN_TOKEN_KEY = 'cc-admin-server-session';

type AdminAuthValue = {
  token: string | null;
  loading: boolean;
  authorized: boolean;
  error: string | null;
  signIn(email: string, passcode: string): Promise<boolean>;
  signOut(): Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

function readToken(): string | null {
  try {
    return window.sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string | null) {
  try {
    if (token) window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    else window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    /* session storage unavailable */
  }
}

async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('/.netlify/functions/admin-session', {
      headers: { Authorization: `Bearer ${token}` },
    });
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
    const existing = readToken();
    if (!existing) {
      setLoading(false);
      return;
    }
    void validateToken(existing).then((valid) => {
      if (valid) setToken(existing);
      else storeToken(null);
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (email: string, passcode: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/.netlify/functions/admin-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), passcode }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || typeof payload.token !== 'string') {
        setError(response.status === 403
          ? 'The email or passcode was not recognized.'
          : 'Admin sign-in is temporarily unavailable.');
        setLoading(false);
        return false;
      }
      storeToken(payload.token);
      setToken(payload.token);
      setLoading(false);
      return true;
    } catch {
      setError('Admin sign-in is temporarily unavailable.');
      setLoading(false);
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    storeToken(null);
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
