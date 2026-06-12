import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  clearAdminSession,
  isAdminAccessConfigured,
  readAdminSession,
  verifyAdminCredentials,
  writeAdminSession,
} from '../config/adminAccess';
import AdminManageAccountsTab from '../components/admin/tabs/AdminManageAccountsTab';
import AdminDesignSystemTab from '../components/admin/tabs/AdminDesignSystemTab';
import AdminPilotProgramsTab from '../components/admin/tabs/AdminPilotProgramsTab';
import AdminDataCleanupTab from '../components/admin/tabs/AdminDataCleanupTab';
import SettingsPageLayout from '../components/family-portal/settings/SettingsPageLayout';
import {
  ADMIN_PORTAL_PAGE,
  ADMIN_PORTAL_TABS,
  type AdminPortalTabId,
} from '../data/adminPortalContent';
import { fetchAllPilotProgramsForAdmin } from '../lib/pilotProgramService';
import { resolveAdminPortalTab } from '../lib/adminPortalPaths';
import type { PilotProgramRecord } from '../types/pilotProgram';
import '../components/family-portal/family-dashboard.css';
import '../components/portal-design-system/portal-design-system.css';
import '../components/admin/admin-portal.css';

export default function AdminPortalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<AdminPortalTabId>(resolveAdminPortalTab(tabParam));
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
    document.title = "Admin Portal | Caiden's Courage";
  }, []);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(resolveAdminPortalTab(tabParam));
    }
  }, [tabParam]);

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

  const selectTab = useCallback(
    (next: AdminPortalTabId) => {
      setActiveTab(next);
      const nextParams = new URLSearchParams(searchParams);
      if (next === 'manage-accounts') {
        nextParams.delete('tab');
      } else {
        nextParams.set('tab', next);
      }
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

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

  const renderTab = () => {
    switch (activeTab) {
      case 'manage-accounts':
        return <AdminManageAccountsTab programs={programs} onCopied={handleCopied} />;
      case 'design-system':
        return <AdminDesignSystemTab />;
      case 'pilot-programs':
        return (
          <AdminPilotProgramsTab
            programs={programs}
            loading={loading}
            loadError={loadError}
            onCopied={handleCopied}
            onChanged={() => void loadPrograms()}
          />
        );
      case 'data-cleanup':
        return <AdminDataCleanupTab onChanged={() => void loadPrograms()} />;
      default:
        return null;
    }
  };

  return (
    <div className="adminPortal-page font-body">
      <main className="adminPortal-main adminPortal-main--settings">
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
            <h2 className="adminPortal-cardTitle">Admin Portal</h2>
            <p className="adminPortal-cardSub">Enter your admin email and passcode to continue.</p>
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
          <SettingsPageLayout
            title={ADMIN_PORTAL_PAGE.title}
            subtitle={ADMIN_PORTAL_PAGE.subtitle}
            tabs={ADMIN_PORTAL_TABS}
            activeTab={activeTab}
            onSelectTab={selectTab}
            showPageTitle
            panelClassName="family-panel family-panel--settings adminPortal-settingsPanel"
            tabAriaLabel="Admin portal sections"
            toolbar={
              <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={handleSignOut}>
                Sign out
              </button>
            }
          >
            {renderTab()}
          </SettingsPageLayout>
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
