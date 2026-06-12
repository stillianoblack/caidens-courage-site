import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  FAMILY_PARENT_RESOURCE_CATEGORIES,
  type FamilyParentResourceCategoryId,
} from '../../../data/familyPortalContent';
import {
  PILOT_ACTIVITY_ASSETS,
  PILOT_FOCUS_FLAME_LAB_CARD,
} from '../../../data/pilotDashboardContent';
import { familyPortalPath } from '../../../lib/familyPortalPaths';
import { trackDownload } from '../../../lib/analytics';
import { downloadAllColoringPages } from '../../../lib/downloadAllColoringPages';
import FamilyLinkedCampBadge from '../FamilyLinkedCampBadge';
import { useFamilyPortalShell } from '../../../hooks/useFamilyPortalShell';
import { PortalPageIntro } from '../../portal-design-system';

const DEFAULT_CATEGORY: FamilyParentResourceCategoryId = 'try-at-home';

function resolveResourceTab(value: string | null): FamilyParentResourceCategoryId {
  const match = FAMILY_PARENT_RESOURCE_CATEGORIES.find((cat) => cat.id === value);
  return match?.id ?? DEFAULT_CATEGORY;
}

export default function FamilyDownloadsPanel() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [category, setCategory] = useState<FamilyParentResourceCategoryId>(
    resolveResourceTab(tabParam),
  );
  const [downloadingAll, setDownloadingAll] = useState(false);
  const { linkedCampLabel } = useFamilyPortalShell();

  useEffect(() => {
    if (tabParam) {
      setCategory(resolveResourceTab(tabParam));
    }
  }, [tabParam]);

  const selectCategory = useCallback(
    (next: FamilyParentResourceCategoryId) => {
      setCategory(next);
      const nextParams = new URLSearchParams(searchParams);
      if (next === DEFAULT_CATEGORY) {
        nextParams.delete('tab');
      } else {
        nextParams.set('tab', next);
      }
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const handleDownloadAll = async () => {
    if (downloadingAll) return;
    setDownloadingAll(true);
    try {
      trackDownload('coloring_page_downloaded', 'All Coloring Pages', 'coloring');
      await downloadAllColoringPages();
    } finally {
      setDownloadingAll(false);
    }
  };

  const activeCategory = FAMILY_PARENT_RESOURCE_CATEGORIES.find((cat) => cat.id === category);
  const activityCategory = activeCategory?.activityCategory ?? 'weekly-activities';
  const assets =
    activityCategory === 'focus-flame-lab'
      ? []
      : PILOT_ACTIVITY_ASSETS[activityCategory as keyof typeof PILOT_ACTIVITY_ASSETS] ?? [];

  return (
    <div className="family-panel family-panel--downloads">
      {linkedCampLabel ? (
        <FamilyLinkedCampBadge label={linkedCampLabel} className="family-panelCampBadge" />
      ) : null}

      <PortalPageIntro>
        Parent Resource Library — activities and tools you can try at home with your child.
      </PortalPageIntro>

      <div className="family-resourceLayout">
        <div className="family-resourceCategories" role="tablist" aria-label="Parent resources">
          {FAMILY_PARENT_RESOURCE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={category === cat.id}
              className={`family-resourceCatBtn${category === cat.id ? ' family-resourceCatBtn--active' : ''}`}
              onClick={() => selectCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="family-resourceAssets">
          {category === 'try-at-home' ? (
            <>
              <div className="family-resourceHeroCard">
                <h2 className="family-panelBlockTitle">Weekly Adventures</h2>
                <p className="family-panelHelper">
                  Start with guided story activities and missions designed for families.
                </p>
                <Link
                  to={familyPortalPath('continue-learning', location.pathname)}
                  className="family-nextCta"
                >
                  Open Weekly Adventures
                </Link>
              </div>
              <div className="family-resourceHeroCard">
                <h2 className="family-panelBlockTitle">Focus Flame Lab</h2>
                <p className="family-panelHelper">{PILOT_FOCUS_FLAME_LAB_CARD.description}</p>
                <a href={PILOT_FOCUS_FLAME_LAB_CARD.href} className="family-nextCta family-nextCta--ghost">
                  {PILOT_FOCUS_FLAME_LAB_CARD.cta}
                </a>
              </div>
            </>
          ) : null}

          {category === 'coloring-pages' ? (
            <div className="family-downloadSectionHead">
              <button
                type="button"
                className="family-downloadAllBtn"
                onClick={handleDownloadAll}
                disabled={downloadingAll}
              >
                {downloadingAll ? 'Preparing…' : 'Download All Coloring Pages'}
              </button>
            </div>
          ) : null}

          {category !== 'try-at-home' ? (
            <ul className="family-downloadList">
              {assets.map((asset) => (
                <li key={asset.id} className="family-downloadRow">
                  <div className="family-downloadRowInfo">
                    <p className="family-downloadRowTitle">{asset.title}</p>
                    <span
                      className={`family-dash-pill family-dash-pill--${asset.status === 'available' ? 'available' : 'locked'}`}
                    >
                      {asset.status === 'available' ? 'Available' : 'Coming Soon'}
                    </span>
                  </div>
                  {asset.status === 'available' ? (
                    <a
                      href={asset.href}
                      className="family-downloadBtn"
                      download
                      onClick={() => trackDownload('activity_downloaded', asset.title, category)}
                    >
                      Download
                    </a>
                  ) : (
                    <span className="family-downloadBtn family-downloadBtn--disabled">Coming Soon</span>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
