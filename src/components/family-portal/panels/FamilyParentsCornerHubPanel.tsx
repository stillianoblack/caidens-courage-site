import React, { Suspense, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FamilyGuidePanel from './FamilyGuidePanel';
import FamilyDownloadsPanel from './FamilyDownloadsPanel';
import FamilyGalleryPanel from './FamilyGalleryPanel';
import FamilyCertificatesPanel from './FamilyCertificatesPanel';

type ParentTab = 'at-home' | 'printables' | 'gallery' | 'certificates';

export default function FamilyParentsCornerHubPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const requested = searchParams.get('tab');
  const tab: ParentTab = requested === 'printables' || requested === 'gallery' || requested === 'certificates'
    ? requested : 'at-home';
  const selectTab = useCallback((next: ParentTab) => {
    const params = new URLSearchParams(location.search);
    if (next === 'at-home') params.delete('tab');
    else params.set('tab', next);
    navigate({ pathname: location.pathname, search: params.toString() ? `?${params}` : '' });
  }, [location.pathname, location.search, navigate]);

  return (
    <div className="family-panel family-consolidatedLayout">
      <div className="family-resourceLayout">
        <div className="family-resourceCategories" role="tablist" aria-label="Parents Corner sections">
          {([
            ['at-home', 'At Home'],
            ['printables', 'Printables'],
            ['gallery', 'Gallery'],
            ['certificates', 'Certificates'],
          ] as Array<[ParentTab, string]>).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id}
              className={`family-resourceCatBtn${tab === id ? ' family-resourceCatBtn--active' : ''}`}
              onClick={() => selectTab(id)}>{label}</button>
          ))}
        </div>
        <Suspense key={tab} fallback={<p className="family-panelLoading" role="status">Loading {tab}…</p>}>
          <div className="family-consolidatedContent">
            {tab === 'at-home' ? <FamilyGuidePanel /> : null}
            {tab === 'printables' ? <FamilyDownloadsPanel /> : null}
            {tab === 'gallery' ? <FamilyGalleryPanel /> : null}
            {tab === 'certificates' ? <FamilyCertificatesPanel /> : null}
          </div>
        </Suspense>
      </div>
    </div>
  );
}
