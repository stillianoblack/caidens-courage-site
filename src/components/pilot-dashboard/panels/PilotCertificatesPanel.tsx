import React, { useEffect } from 'react';
import { PILOT_CERTIFICATES } from '../../../data/pilotDashboardContent';
import { trackDownload, trackEvent } from '../../../lib/analytics';

export default function PilotCertificatesPanel() {
  useEffect(() => {
    trackEvent('certificate_viewed');
  }, []);

  return (
    <div className="pilot-panel">
      <p className="pilot-panelIntro">Download printable celebration templates for students and facilitators.</p>
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
