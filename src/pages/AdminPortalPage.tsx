import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AdminAddStudentTab from '../components/admin/tabs/AdminAddStudentTab';
import AdminManageAccountsTab from '../components/admin/tabs/AdminManageAccountsTab';
import AdminDesignSystemTab from '../components/admin/tabs/AdminDesignSystemTab';
import AdminPilotProgramsTab from '../components/admin/tabs/AdminPilotProgramsTab';
import AdminPilotOutcomesTab from '../components/admin/tabs/AdminPilotOutcomesTab';
import AdminDataCleanupTab from '../components/admin/tabs/AdminDataCleanupTab';
import AdminAdventuresTab from '../components/admin/tabs/AdminAdventuresTab';
import AdminCommerceTab, {
  resolveAdminCommerceSubtab,
  type AdminCommerceSubtab,
} from '../components/admin/tabs/AdminCommerceTab';
import SettingsPageLayout from '../components/family-portal/settings/SettingsPageLayout';
import {
  ADMIN_PORTAL_PAGE,
  ADMIN_PORTAL_TABS,
  type AdminPortalTabId,
} from '../data/adminPortalContent';
import { fetchAllPilotProgramsForAdmin } from '../lib/pilotProgramService';
import { resolveAdminPortalTab } from '../lib/adminPortalPaths';
import type { AdminProgramDirectoryRecord } from '../types/adminProgramDirectory';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../components/family-portal/family-dashboard.css';
import '../components/portal-design-system/portal-design-system.css';
import '../components/admin/admin-portal.css';

export default function AdminPortalPage() {
  const adminAuth = useAdminAuth();
  const adminAccessToken = adminAuth.token;
  const adminAuthorized = adminAuth.authorized;
  const adminSignOut = adminAuth.signOut;
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const tabParam = searchParams.get('tab');
  const isCommerceRoute = location.pathname.endsWith('/commerce');
  const [activeTab, setActiveTab] = useState<AdminPortalTabId>(
    isCommerceRoute ? 'commerce' : resolveAdminPortalTab(tabParam),
  );
  const [activeCommerceSubtab, setActiveCommerceSubtab] = useState<AdminCommerceSubtab>(
    resolveAdminCommerceSubtab(isCommerceRoute ? tabParam : searchParams.get('commerceTab')),
  );
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [programs, setPrograms] = useState<AdminProgramDirectoryRecord[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Admin Portal | Caiden's Courage";
  }, []);

  useEffect(() => {
    if (!isCommerceRoute && tabParam === 'pricing-plans') {
      navigate('/admin/commerce?tab=memberships', { replace: true });
      return;
    }
    if (!isCommerceRoute && tabParam === 'commerce-products') {
      navigate('/admin/commerce?tab=products', { replace: true });
      return;
    }
    if (isCommerceRoute) {
      setActiveTab('commerce');
      setActiveCommerceSubtab(resolveAdminCommerceSubtab(tabParam));
    } else if (tabParam) {
      setActiveTab(resolveAdminPortalTab(tabParam));
      setActiveCommerceSubtab(resolveAdminCommerceSubtab(searchParams.get('commerceTab')));
    } else {
      setActiveTab(resolveAdminPortalTab(null));
    }
  }, [isCommerceRoute, navigate, searchParams, tabParam]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleCopied = useCallback((message: string) => {
    setToast(message);
  }, []);

  const loadPrograms = useCallback(async () => {
    if (!adminAccessToken) return;
    setLoading(true);
    setLoadError(false);
    const result = await fetchAllPilotProgramsForAdmin(adminAccessToken);
    if (result.error === 'unauthenticated') {
      await adminSignOut();
      setPrograms([]);
      setLoading(false);
      return;
    }
    setPrograms(result.programs);
    setLoadError(Boolean(result.error));
    setLoading(false);
  }, [adminAccessToken, adminSignOut]);

  useEffect(() => {
    if (adminAuthorized) {
      void loadPrograms();
    }
  }, [adminAuthorized, loadPrograms]);

  const selectTab = useCallback(
    (next: AdminPortalTabId) => {
      setActiveTab(next);
      if (next === 'commerce') {
        navigate('/admin/commerce?tab=products');
        return;
      }
      const nextParams = new URLSearchParams(searchParams);
      if (next === 'manage-accounts') {
        nextParams.delete('tab');
      } else {
        nextParams.set('tab', next);
      }
      setSearchParams(nextParams, { replace: true });
    },
    [navigate, searchParams, setSearchParams],
  );

  const selectCommerceSubtab = useCallback(
    (next: AdminCommerceSubtab) => {
      setActiveCommerceSubtab(next);
      navigate(`/admin/commerce?tab=${next}`);
    },
    [navigate],
  );

  const handleUnlock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    const authorized = await adminAuth.signIn(email, passcode);
    if (!authorized) setAuthError(adminAuth.error || 'Admin access could not be verified.');
    setPasscode('');
  };

  const handleSignOut = async () => {
    await adminAuth.signOut();
    setPrograms([]);
    setLoadError(false);
    setEmail('');
    setPasscode('');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'manage-accounts':
        return <AdminManageAccountsTab programs={programs} onCopied={handleCopied} />;
      case 'add-student':
        return <AdminAddStudentTab programs={programs} onCopied={handleCopied} />;
      case 'design-system':
        return <AdminDesignSystemTab />;
      case 'pilot-programs':
        return (
          <AdminPilotProgramsTab
            programs={programs}
            loading={loading}
            loadError={loadError}
            onRetry={() => void loadPrograms()}
          />
        );
      case 'pilot-outcomes':
        return adminAccessToken ? <AdminPilotOutcomesTab token={adminAccessToken} /> : null;
      case 'adventures':
        return <AdminAdventuresTab onCopied={handleCopied} />;
      case 'data-cleanup':
        return <AdminDataCleanupTab programs={programs} onChanged={() => void loadPrograms()} />;
      case 'commerce':
        return (
          <AdminCommerceTab
            activeSubtab={activeCommerceSubtab}
            onSelectSubtab={selectCommerceSubtab}
            onCopied={handleCopied}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="adminPortal-page font-body">
      <main className="adminPortal-main adminPortal-main--settings">
        {adminAuth.loading ? (
          <section className="adminPortal-card">
            <h2 className="adminPortal-cardTitle">Checking admin access…</h2>
          </section>
        ) : !adminAuth.authorized ? (
          <section className="adminPortal-card">
            <h2 className="adminPortal-cardTitle">Admin Portal</h2>
            <p className="adminPortal-cardSub">Sign in with your authorized admin account.</p>
            <form className="adminPortal-form" onSubmit={(event) => void handleUnlock(event)}>
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
              {authError || adminAuth.error ? (
                <p className="adminPortal-error">{authError || adminAuth.error}</p>
              ) : null}
              <button type="submit" className="adminPortal-btn adminPortal-btn--primary">
                Sign in
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
              <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={() => void handleSignOut()}>
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
