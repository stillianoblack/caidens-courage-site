import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PILOT_ACTIVITY_ASSETS,
  PILOT_ACTIVITY_CATEGORIES,
  PILOT_FOCUS_FLAME_LAB_CARD,
  type ActivityAsset,
  type ActivityCategoryId,
} from '../../../data/pilotDashboardContent';
import { useAdventureModules } from '../../../hooks/useAdventureModules';
import { buildCmsActivityAssets } from '../../../lib/adventureWeekAssets';
import { isActivityLibraryTab } from '../../../lib/askB4DeepLinks';
import { trackDownload } from '../../../lib/analytics';
import { downloadAllColoringPages } from '../../../lib/downloadAllColoringPages';
import { programDashboardTabPath } from '../../../lib/programDashboardNav';
import { setPortalReturnPath } from '../../../lib/portalReturnNav';
import PilotStatusPill from '../PilotStatusPill';

const DEFAULT_CATEGORY: ActivityCategoryId = 'coloring-pages';

export default function PilotActivitiesPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialCategory = tabParam && isActivityLibraryTab(tabParam) ? tabParam : DEFAULT_CATEGORY;
  const [category, setCategory] = useState<ActivityCategoryId>(initialCategory);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const { modules } = useAdventureModules('all');

  const activityAssets = useMemo(() => {
    const cmsAssets = buildCmsActivityAssets(modules);
    const merged: Record<Exclude<ActivityCategoryId, 'focus-flame-lab'>, ActivityAsset[]> = {
      ...PILOT_ACTIVITY_ASSETS,
      'coloring-pages': [...PILOT_ACTIVITY_ASSETS['coloring-pages'], ...cmsAssets.filter((a) => a.id.includes('coloring'))],
      'printable-activities': [...PILOT_ACTIVITY_ASSETS['printable-activities'], ...cmsAssets.filter((a) => a.id.includes('module') || a.id.includes('comic'))],
      'reflection-journals': PILOT_ACTIVITY_ASSETS['reflection-journals'],
      'weekly-activities': [...PILOT_ACTIVITY_ASSETS['weekly-activities'], ...cmsAssets],
      'b4-reset-tools': PILOT_ACTIVITY_ASSETS['b4-reset-tools'],
    };
    return merged;
  }, [modules]);

  useEffect(() => {
    if (tabParam && isActivityLibraryTab(tabParam) && tabParam !== category) {
      setCategory(tabParam);
    }
  }, [tabParam, category]);

  const selectCategory = useCallback(
    (next: ActivityCategoryId) => {
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

  return (
    <div className="pilot-panel">
      <div className="pilot-activitiesLayout">
        <div className="pilot-activitiesCategories">
          {PILOT_ACTIVITY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`pilot-activityCatBtn${category === cat.id ? ' pilot-activityCatBtn--active' : ''}`}
              onClick={() => selectCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="pilot-activitiesAssets">
          {category === 'focus-flame-lab' ? (
            <div className="pilot-activitySpecialCard">
              <h3 className="pilot-dash-cardTitle">Focus Flame Lab</h3>
              <p className="pilot-dash-cardDesc">{PILOT_FOCUS_FLAME_LAB_CARD.description}</p>
              <Link
                to={PILOT_FOCUS_FLAME_LAB_CARD.href}
                className="pilot-dash-cta"
                onClick={() => setPortalReturnPath(programDashboardTabPath('activities-library'))}
              >
                {PILOT_FOCUS_FLAME_LAB_CARD.cta}
              </Link>
            </div>
          ) : category === 'coloring-pages' ? (
            <>
              <div className="pilot-downloadSectionHead">
                <button
                  type="button"
                  className="pilot-downloadAllBtn"
                  onClick={handleDownloadAll}
                  disabled={downloadingAll}
                >
                  {downloadingAll ? 'Preparing…' : 'Download All Coloring Pages'}
                </button>
              </div>
              <ul className="pilot-assetList">
                {activityAssets[category].map((asset) => (
                  <li key={asset.id} className="pilot-assetRow">
                    <div className="pilot-assetInfo">
                      <p className="pilot-assetTitle">{asset.title}</p>
                      <PilotStatusPill
                        status={asset.status === 'available' ? 'Available' : 'Coming Soon'}
                        tone={asset.status === 'available' ? 'available' : 'locked'}
                        showLock={asset.status === 'locked'}
                      />
                    </div>
                    {asset.status === 'available' ? (
                      <a
                        href={asset.href}
                        className="pilot-assetDownload"
                        download
                        onClick={() => {
                          const eventName =
                            category === 'coloring-pages'
                              ? 'coloring_page_downloaded'
                              : category === 'printable-activities' ||
                                  category === 'reflection-journals'
                                ? 'worksheet_downloaded'
                                : 'activity_downloaded';
                          trackDownload(eventName, asset.title, category);
                        }}
                      >
                        Download
                      </a>
                    ) : (
                      <span className="pilot-assetDownload pilot-assetDownload--disabled">
                        Coming Soon
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <ul className="pilot-assetList">
              {activityAssets[category].map((asset) => (
                <li key={asset.id} className="pilot-assetRow">
                  <div className="pilot-assetInfo">
                    <p className="pilot-assetTitle">{asset.title}</p>
                    <PilotStatusPill
                      status={asset.status === 'available' ? 'Available' : 'Coming Soon'}
                      tone={asset.status === 'available' ? 'available' : 'locked'}
                      showLock={asset.status === 'locked'}
                    />
                  </div>
                  {asset.status === 'available' ? (
                    <a
                      href={asset.href}
                      className="pilot-assetDownload"
                      download
                      onClick={() => {
                        const eventName =
                          category === 'printable-activities' ||
                          category === 'reflection-journals'
                            ? 'worksheet_downloaded'
                            : 'activity_downloaded';
                        trackDownload(eventName, asset.title, category);
                      }}
                    >
                      Download
                    </a>
                  ) : (
                    <span className="pilot-assetDownload pilot-assetDownload--disabled">
                      {asset.status === 'locked' ? 'Coming Soon' : 'Locked'}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <section className="pilot-gameLibraryPreview" aria-labelledby="pilot-game-library-heading">
        <h3 id="pilot-game-library-heading" className="pilot-dash-cardTitle">
          Facilitator Game Library
          <PilotStatusPill status="Preview" tone="locked" />
        </h3>
        <p className="pilot-dash-cardDesc">
          Facilitator-only preview of character games, answer keys, and discussion prompts.
          Not visible in Family or Student portals.
        </p>
        <ul className="pilot-gameLibraryPreviewList">
          <li>Preview game</li>
          <li>View questions</li>
          <li>View correct answers</li>
          <li>Skill tags &amp; grade level</li>
          <li>Discussion prompts</li>
        </ul>
      </section>
    </div>
  );
}
