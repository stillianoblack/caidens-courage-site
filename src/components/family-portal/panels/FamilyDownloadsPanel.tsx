import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FAMILY_PORTAL_PATH } from '../../../config/courageRoutes';
import {
  PORTAL_COLORING_PAGES,
  PORTAL_PRINTABLE_ACTIVITIES,
} from '../../../data/portalDownloadAssets';
import { downloadAllColoringPages } from '../../../lib/downloadAllColoringPages';

export default function FamilyDownloadsPanel() {
  const [downloadingAll, setDownloadingAll] = useState(false);

  const handleDownloadAll = async () => {
    if (downloadingAll) return;
    setDownloadingAll(true);
    try {
      await downloadAllColoringPages();
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <div className="family-panel family-panel--downloads">
      <section className="family-downloadSection">
        <div className="family-downloadSectionHead">
          <h2 className="family-panelBlockTitle">Coloring Pages</h2>
          <button
            type="button"
            className="family-downloadAllBtn"
            onClick={handleDownloadAll}
            disabled={downloadingAll}
          >
            {downloadingAll ? 'Preparing…' : 'Download All Coloring Pages'}
          </button>
        </div>
        <p className="family-downloadSectionDesc">
          Print and color brave characters and story scenes.
        </p>
        <ul className="family-downloadList">
          {PORTAL_COLORING_PAGES.map((page) => (
            <li key={page.id} className="family-downloadRow">
              <div className="family-downloadRowInfo">
                <p className="family-downloadRowTitle">{page.title}</p>
                <span
                  className={`family-dash-pill family-dash-pill--${page.status === 'available' ? 'available' : 'locked'}`}
                >
                  {page.status === 'available' ? 'Available' : 'Coming Soon'}
                </span>
              </div>
              {page.status === 'available' ? (
                <a href={page.href} className="family-downloadBtn" download>
                  Download
                </a>
              ) : (
                <span className="family-downloadBtn family-downloadBtn--disabled">Coming Soon</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="family-downloadSection">
        <h2 className="family-panelBlockTitle">Printable Activities</h2>
        <p className="family-downloadSectionDesc">
          Hands-on worksheets and creative activities for families.
        </p>
        <ul className="family-downloadList">
          {PORTAL_PRINTABLE_ACTIVITIES.map((activity) => (
            <li key={activity.id} className="family-downloadRow">
              <div className="family-downloadRowInfo">
                <p className="family-downloadRowTitle">{activity.title}</p>
                <span
                  className={`family-dash-pill family-dash-pill--${activity.status === 'available' ? 'available' : 'locked'}`}
                >
                  {activity.status === 'available' ? 'Available' : 'Coming Soon'}
                </span>
              </div>
              {activity.status === 'available' ? (
                <a href={activity.href} className="family-downloadBtn" download>
                  Download
                </a>
              ) : (
                <span className="family-downloadBtn family-downloadBtn--disabled">Coming Soon</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="family-downloadSection">
        <h2 className="family-panelBlockTitle">More Resources</h2>
        <div className="family-dash-grid family-dash-grid--2">
          <Link to={`${FAMILY_PORTAL_PATH}/guide`} className="family-dash-card">
            <h3 className="family-dash-cardTitle">Family Guide</h3>
            <p className="family-dash-cardDesc">
              Discussion prompts and activity instructions for home learning.
            </p>
            <div className="family-dash-cardFoot">
              <span />
              <span className="family-dash-cta">Open Guide</span>
            </div>
          </Link>
          <Link to={`${FAMILY_PORTAL_PATH}/certificates`} className="family-dash-card">
            <h3 className="family-dash-cardTitle">Certificates</h3>
            <p className="family-dash-cardDesc">
              Celebrate progress with printable courage certificates.
            </p>
            <div className="family-dash-cardFoot">
              <span />
              <span className="family-dash-cta">View Certificates</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
