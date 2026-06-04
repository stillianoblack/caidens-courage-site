import React, { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CourageHeader from '../components/CourageHeader';
import CourageFooter from '../components/CourageFooter';
import PortalHero from '../components/courage/PortalHero';
import PortalPricingSection from '../components/courage/PortalPricingSection';
import { readPortalSessionUnlock } from '../config/portalAccess';
import {
  parsePortalAudienceParam,
  portalAccessTypeToAudience,
  type PortalAudienceTab,
} from '../config/portalAudience';
import { usePortalUnlock } from '../hooks/usePortalUnlock';

/**
 * Caiden's Courage Portal — MVP code-based gateway.
 *
 * FUTURE-PROOFING:
 * - Access validation is client-side only for pilot testing.
 * - Move code verification to Netlify Functions, Supabase, or similar before launch.
 * - Paid tiers must not rely on front-end checks alone.
 * - sessionStorage unlock is a convenience, not authentication.
 */
const Portal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { accessCode, error, handleSubmit, onAccessCodeChange } = usePortalUnlock('hero');

  const audience = parsePortalAudienceParam(searchParams.get('audience'));

  const setAudience = useCallback(
    (tab: PortalAudienceTab) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('audience', tab);
          return next;
        },
        { replace: true, preventScrollReset: true }
      );
    },
    [setSearchParams]
  );

  useEffect(() => {
    document.title = "Caiden's Courage Portal";
  }, []);

  // Sync tab to stored unlock tier on first load (e.g. returning visitor with session).
  useEffect(() => {
    const stored = readPortalSessionUnlock();
    if (stored && !searchParams.get('audience')) {
      setAudience(portalAccessTypeToAudience(stored));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip bg-cream font-body">
      <CourageHeader />

      <PortalHero
        accessCode={accessCode}
        error={error}
        onAccessCodeChange={onAccessCodeChange}
        onSubmit={handleSubmit}
      />

      <PortalPricingSection audience={audience} onAudienceChange={setAudience} />

      <CourageFooter />
    </div>
  );
};

export default Portal;
