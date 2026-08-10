import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import FamilyCharactersPanel from './FamilyCharactersPanel';
import FamilyInventoryPanel from './FamilyInventoryPanel';

type CharactersTab = 'characters' | 'collections';

export default function FamilyCharactersHubPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: CharactersTab = searchParams.get('tab') === 'collections' ? 'collections' : 'characters';
  const selectTab = useCallback((next: CharactersTab) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'characters') params.delete('tab');
    else params.set('tab', next);
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

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
        <div className="family-consolidatedContent">
          {tab === 'characters' ? <FamilyCharactersPanel /> : <FamilyInventoryPanel />}
        </div>
      </div>
    </div>
  );
}
