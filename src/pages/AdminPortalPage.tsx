import React, { useCallback, useEffect, useState } from 'react';
import {
  clearAdminSession,
  isAdminAccessConfigured,
  readAdminSession,
  verifyAdminCredentials,
  writeAdminSession,
} from '../config/adminAccess';
import { fetchAllPilotProgramsForAdmin } from '../lib/pilotProgramService';
import type { PilotProgramRecord } from '../types/pilotProgram';
import AdminPilotProgramCard from '../components/admin/AdminPilotProgramCard';
import '../components/admin/admin-portal.css';

export default function AdminPortalPage() {
  const [unlocked, setUnlocked] = useState(() => readAdminSession());
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [programs, setPrograms] = useState<PilotProgramRecord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const configured = isAdminAccessConfigured();

  useEffect(() => {
    document.title = "Pilot Admin | Caiden's Courage";
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleCopied = useCallback((message: string) => {
    setToast(message);
  }, []);

  const loadPrograms = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const result = await fetchAllPilotProgramsForAdmin();
    setPrograms(result.programs);
    setLoadError(result.error ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (unlocked && configured) {
      void loadPrograms();
    }
  }, [configured, loadPrograms, unlocked]);

  const handleUnlock = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);

    if (!configured) {
      setAuthError('Admin access is not configured.');
      return;
    }

    if (!verifyAdminCredentials(email, passcode)) {
      setAuthError('Invalid admin email or passcode.');
      return;
    }

    writeAdminSession();
    setUnlocked(true);
    setPasscode('');
  };

  const handleSignOut = () => {
    clearAdminSession();
    setUnlocked(false);
    setPrograms([]);
    setLoadError(null);
    setEmail('');
    setPasscode('');
  };

  return (
    <div className="adminPortal-page font-body">
      <header className="adminPortal-hero">
        <h1 className="adminPortal-heroTitle">Pilot Admin</h1>
        <p className="adminPortal-heroSub">
          Manage pilot programs, access codes, and dashboard links.
        </p>
      </header>

      <main className="adminPortal-main">
        {!configured ? (
          <section className="adminPortal-card">
            <h2 className="adminPortal-cardTitle">Admin access is not configured.</h2>
            <p className="adminPortal-cardSub">
              Set <code>REACT_APP_ADMIN_EMAIL</code> and <code>REACT_APP_ADMIN_PASSCODE</code> in your
              environment, then restart the app.
            </p>
          </section>
        ) : !unlocked ? (
          <section className="adminPortal-card">
            <h2 className="adminPortal-cardTitle">Admin unlock</h2>
            <p className="adminPortal-cardSub">Enter your admin email and passcode to manage pilot programs.</p>
            <form className="adminPortal-form" onSubmit={handleUnlock}>
              <div className="adminPortal-field">
                <label htmlFor="admin-email">Admin Email</label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="adminPortal-field">
                <label htmlFor="admin-passcode">Admin Passcode</label>
                <input
                  id="admin-passcode"
                  type="password"
                  autoComplete="current-password"
                  value={passcode}
                  onChange={(event) => setPasscode(event.target.value)}
                  required
                />
              </div>
              {authError ? <p className="adminPortal-error">{authError}</p> : null}
              <button type="submit" className="adminPortal-btn adminPortal-btn--primary">
                Unlock Admin Portal
              </button>
            </form>
          </section>
        ) : (
          <section className="adminPortal-card">
            <div className="adminPortal-toolbar">
              <p className="adminPortal-count">
                {loading ? 'Loading pilot programs…' : `${programs.length} pilot program${programs.length === 1 ? '' : 's'}`}
              </p>
              <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={handleSignOut}>
                Sign out
              </button>
            </div>

            {loadError ? <p className="adminPortal-error">{loadError}</p> : null}

            {!loading && !loadError && programs.length === 0 ? (
              <p className="adminPortal-empty">No pilot programs found in Supabase.</p>
            ) : null}

            <div className="adminPortal-programList">
              {programs.map((program) => (
                <AdminPilotProgramCard
                  key={program.id ?? program.program_code}
                  program={program}
                  onCopied={handleCopied}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {toast ? (
        <div className="adminPortal-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
