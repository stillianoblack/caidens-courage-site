import React, { Suspense, useCallback } from 'react';
import FamilyCharactersPanel from './FamilyCharactersPanel';
import FamilyInventoryPanel from './FamilyInventoryPanel';
import { useFamilyQueryTabLocation } from '../../../hooks/useFamilyQueryTabLocation';

type CharactersTab = 'characters' | 'collections';

export default function FamilyCharactersHubPanel() {
  const { search, navigateSearch } = useFamilyQueryTabLocation();
  const searchParams = new URLSearchParams(search);
  const tab: CharactersTab = searchParams.get('tab') === 'collections' ? 'collections' : 'characters';
  const selectTab = useCallback((next: CharactersTab) => {
    const params = new URLSearchParams(search);
    if (next === 'characters') params.delete('tab');
    else params.set('tab', next);
    navigateSearch(params);
  }, [navigateSearch, search]);

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
