import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { rosterFilterPath } from '../../../lib/askB4DeepLinks';
import { usePilotRosterData } from '../../../hooks/usePilotRosterData';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import { PILOT_CERTIFICATE_MIN_MODULES } from '../../../lib/pilotStudentProgress';
import { PILOT_CERTIFICATES } from '../../../data/pilotDashboardContent';
import { trackDownload, trackEvent } from '../../../lib/analytics';
import { PortalPageIntro } from '../../portal-design-system';

export default function PilotCertificatesPanel() {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  const activeProgram = readActivePilotProgram();
  const { rows } = usePilotRosterData(activeProgram?.programCode, filter === 'ready');
  const readyCount = rows.filter(
    (row) => row.baselineStatus === 'Complete' && row.moduleCompletions >= PILOT_CERTIFICATE_MIN_MODULES,
  ).length;

  useEffect(() => {
    trackEvent('certificate_viewed');
  }, []);

  return (
    <div className="pilot-panel pilot-panel--certificates">
      {filter === 'ready' ? (
        <div className="pilot-rosterFilterBanner">
          <span className="pilot-rosterFilterChip">
            {readyCount} student{readyCount === 1 ? '' : 's'} ready for certificates
          </span>
          <Link to={rosterFilterPath('certificate-ready')} className="pilot-rosterFilterClear">
            View roster list
          </Link>
        </div>
      ) : null}
      <PortalPageIntro>
        Download printable celebration templates for students and facilitators.
      </PortalPageIntro>
      <div className="pilot-dash-grid pilot-dash-grid--2">
        {PILOT_CERTIFICATES.map((cert) => (
          <a
            key={cert.title}
            href={cert.href}
            className="pilot-dash-card"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackDownload('certificate_downloaded', cert.title, 'certificate')}
          >
            <h3 className="pilot-dash-cardTitle">{cert.title}</h3>
            <p className="pilot-dash-cardDesc">Download a printable template for your pilot celebration.</p>
            <span className="pilot-dash-cta">{cert.cta}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
