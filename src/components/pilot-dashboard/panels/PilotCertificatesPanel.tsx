import React from 'react';
import { PILOT_CERTIFICATES } from '../../../data/pilotDashboardContent';

export default function PilotCertificatesPanel() {
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
