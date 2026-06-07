import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ensureFacilitatorPortalAccess, ensureFamilyPortalAccess } from '../../config/blueRibbonPortalAccess';
import {
  getPortalSearchResources,
  type PortalSearchPortal,
  type PortalSearchResource,
} from '../../data/portalSearchResources';
import { searchPortalResources } from '../../lib/portalResourceSearch';
import './portal-resource-search.css';

type PortalResourceSearchProps = {
  portal: PortalSearchPortal;
};

const SEARCH_DEBOUNCE_MS = 200;

export default function PortalResourceSearch({ portal }: PortalResourceSearchProps) {
  const navigate = useNavigate();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const resources = getPortalSearchResources(portal);
  const results = searchPortalResources(debouncedQuery, resources);
  const showDropdown = open && debouncedQuery.trim().length > 0;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setActiveIndex(results.length > 0 ? 0 : -1);
  }, [debouncedQuery, results.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectResult = useCallback(
    (item: PortalSearchResource) => {
      if (portal === 'facilitator') {
        ensureFacilitatorPortalAccess();
      } else {
        ensureFamilyPortalAccess();
      }
      if (item.grantFamilyAccess) {
        ensureFamilyPortalAccess();
      }

      navigate(item.href);
      setQuery('');
      setDebouncedQuery('');
      setOpen(false);
      inputRef.current?.blur();
    },
    [navigate, portal],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (event.key === 'ArrowDown' && query.trim()) {
        setOpen(true);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (results.length === 0 ? -1 : (i + 1) % results.length));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (results.length === 0 ? -1 : (i - 1 + results.length) % results.length));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        selectResult(results[activeIndex]);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const variantClass = portal === 'facilitator' ? 'portal-search--pilot' : 'portal-search--family';

  return (
    <div className={`portal-search ${variantClass}`} ref={rootRef}>
      <label className="portal-searchField">
        <span className="sr-only">Search portal resources</span>
        <svg className="portal-searchIcon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
        <input
          ref={inputRef}
          type="search"
          placeholder="Search resources…"
          className="portal-searchInput"
          value={query}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
      </label>

      {showDropdown ? (
        <ul className="portal-searchMenu" id={listboxId} role="listbox">
          {results.length === 0 ? (
            <li className="portal-searchEmpty" role="option" aria-selected={false}>
              No matching resources found.
            </li>
          ) : (
            results.map((item, index) => (
              <li key={item.id} role="option" aria-selected={index === activeIndex}>
                <button
                  type="button"
                  className={`portal-searchResult${index === activeIndex ? ' portal-searchResult--active' : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectResult(item)}
                >
                  <span className="portal-searchResultTitle">{item.title}</span>
                  <span className="portal-searchResultDesc">{item.description}</span>
                  <span className="portal-searchResultCategory">{item.category}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
