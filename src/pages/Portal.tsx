import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CourageHeader from '../components/courage/CourageHeader';
import CourageFooter from '../components/courage/CourageFooter';
import PortalHero from '../components/courage/PortalHero';
import { parsePortalAudienceParam, type PortalAudienceTab } from '../config/portalAudience';
import { usePortalUnlock } from '../hooks/usePortalUnlock';

/**
 * Caiden's Courage Portal — access/login gateway only.
 * Pricing and persona offers live on /parents, /teachers, /camps, and /schools.
 */
const Portal: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { accessCode, error, handleSubmit, onAccessCodeChange } = usePortalUnlock('hero');

  const audienceParam = searchParams.get('audience');
  const audience: PortalAudienceTab | null = audienceParam
    ? parsePortalAudienceParam(audienceParam)
    : null;

  useEffect(() => {
    document.title = "Caiden's Courage Portal";
  }, []);

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-cream font-body">
      <CourageHeader />

      <PortalHero
        audience={audience}
        accessCode={accessCode}
        error={error}
        onAccessCodeChange={onAccessCodeChange}
        onSubmit={handleSubmit}
      />

      <CourageFooter />
    </div>
  );
};

export default Portal;
