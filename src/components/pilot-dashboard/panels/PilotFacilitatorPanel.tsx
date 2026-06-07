import React from 'react';
import { Link } from 'react-router-dom';
import { PILOT_FACILITATOR_CENTER } from '../../../data/pilotDashboardContent';

export default function PilotFacilitatorPanel() {
  return (
    <div className="pilot-panel">
      <div className="pilot-dash-grid pilot-dash-grid--2">
        {PILOT_FACILITATOR_CENTER.map((item) => {
          const isDownload = item.href.startsWith('/downloads');

          if (isDownload) {
            return (
              <a
                key={item.title}
                href={item.href}
                className="pilot-dash-card pilot-facilitatorCard"
                target="_blank"
                rel="noopener noreferrer"
              >
                <h3 className="pilot-dash-cardTitle">{item.title}</h3>
                <span className="pilot-dash-cta">Download Template</span>
              </a>
            );
          }

          return (
            <Link key={item.title} to={item.href} className="pilot-dash-card pilot-facilitatorCard">
              <h3 className="pilot-dash-cardTitle">{item.title}</h3>
              <span className="pilot-dash-cta">Open Guide</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
