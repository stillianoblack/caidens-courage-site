import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import CourageHeader from '../components/courage/CourageHeader';
import CourageFooter from '../components/courage/CourageFooter';
import PortalResourceCard from '../components/courage/PortalResourceCard';
import SectionHero from '../components/courage/SectionHero';
import { PORTAL_PATH } from '../config/courageNav';
import {
  clearPortalSessionUnlock,
  getDashboardHeroTitle,
  getDashboardPathForTier,
  getDashboardResources,
  getPortalTierByType,
  readPortalSessionUnlock,
} from '../config/portalAccess';
import { parsePortalAudienceParam, portalAccessTypeToAudience } from '../config/portalAudience';

/**
 * Unlocked portal dashboard — MVP client-side access only.
 *
 * TODO: Move portal access checks server-side before protecting paid or sensitive materials.
 */
const PortalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionType = readPortalSessionUnlock();
  const isPilotAccess =
    searchParams.get('access') === 'pilot' || sessionType === 'pilot';

  useEffect(() => {
    document.title = "Caiden's Courage Portal — Dashboard";
  }, []);

  useEffect(() => {
    if (!sessionType) {
      navigate(PORTAL_PATH, { replace: true });
      return;
    }

    const tier = getPortalTierByType(sessionType);
    if (!tier) {
      clearPortalSessionUnlock();
      navigate(PORTAL_PATH, { replace: true });
      return;
    }

    const expectedAudience = portalAccessTypeToAudience(sessionType);
    const audienceParam = parsePortalAudienceParam(searchParams.get('audience'));
    if (audienceParam !== expectedAudience) {
      navigate(getDashboardPathForTier(tier), { replace: true });
    }
  }, [navigate, searchParams, sessionType]);

  if (!sessionType) {
    return null;
  }

  const resources = getDashboardResources(sessionType);
  const heroTitle = getDashboardHeroTitle(sessionType);

  const handleUseDifferentCode = () => {
    clearPortalSessionUnlock();
    navigate(PORTAL_PATH);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-cream font-body">
      <CourageHeader />

      <SectionHero
        eyebrow="PORTAL UNLOCKED"
        title={heroTitle}
        description="Welcome — your Caiden's Courage resources are ready below."
      >
        <div className="flex flex-wrap items-center gap-3">
          {isPilotAccess ? (
            <span className="inline-flex rounded-full border border-golden-400/40 bg-golden-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-golden-300 sm:text-[11px]">
              Pilot Partner Access
            </span>
          ) : null}
          <button
            type="button"
            onClick={handleUseDifferentCode}
            className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-white/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/10"
          >
            Use a different code
          </button>
        </div>
      </SectionHero>

      <section className="cc-portal-dashboard-content border-t border-navy-100/80 bg-white px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="cc-site-container mx-auto">
          <div className="cc-portal-resource-grid grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {resources.map((resource) => (
              <PortalResourceCard key={resource.title} {...resource} />
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-navy-500/80">
            Need help?{' '}
            <Link to="/contact" className="font-semibold text-golden-700 hover:text-golden-600">
              Contact the team
            </Link>
          </p>
        </div>
      </section>

      <CourageFooter />
    </div>
  );
};

export default PortalDashboard;
