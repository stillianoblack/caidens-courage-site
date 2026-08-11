import React, { Suspense, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FamilyCharactersPanel from './FamilyCharactersPanel';
import FamilyInventoryPanel from './FamilyInventoryPanel';

type CharactersTab = 'characters' | 'collections';

export default function FamilyCharactersHubPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tab: CharactersTab = searchParams.get('tab') === 'collections' ? 'collections' : 'characters';
  const selectTab = useCallback((next: CharactersTab) => {
    const params = new URLSearchParams(location.search);
    if (next === 'characters') params.delete('tab');
    else params.set('tab', next);
    navigate({ pathname: location.pathname, search: params.toString() ? `?${params}` : '' });
  }, [location.pathname, location.search, navigate]);

  return (
    <div className="family-panel family-consolidatedLayout">
      <div className="family-resourceLayout">
        <div className="family-resourceCategories" role="tablist" aria-label="Characters sections">
          {(['characters', 'collections'] as CharactersTab[]).map((item) => (
            <button key={item} type="button" role="tab" aria-selected={tab === item}
              className={`family-resourceCatBtn${tab === item ? ' family-resourceCatBtn--active' : ''}`}
              onClick={() => selectTab(item)}>
              {item === 'characters' ? 'Characters' : 'Collections'}
            </button>
          ))}
        </div>
        <Suspense key={tab} fallback={<p className="family-panelLoading" role="status">Loading {tab}…</p>}>
          <div className="family-consolidatedContent">
            {tab === 'characters' ? <FamilyCharactersPanel /> : <FamilyInventoryPanel />}
          </div>
        </Suspense>
      </div>
    </div>
  );
}
