import { useCallback, useSyncExternalStore } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const FAMILY_QUERY_TAB_LOCATION_EVENT = 'cc-family-query-tab-location-change';

function subscribeToBrowserLocation(onStoreChange: () => void) {
  window.addEventListener('popstate', onStoreChange);
  window.addEventListener(FAMILY_QUERY_TAB_LOCATION_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('popstate', onStoreChange);
    window.removeEventListener(FAMILY_QUERY_TAB_LOCATION_EVENT, onStoreChange);
  };
}

/**
 * BrowserRouter schedules location updates as transitions. Family tab panels load
 * asynchronous portal data, so query-only transitions can leave the previous panel
 * visible after history has already changed. Observe the browser URL directly while
 * retaining React Router navigation and deep-link semantics.
 */
export function useFamilyQueryTabLocation() {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const search = useSyncExternalStore(
    subscribeToBrowserLocation,
    () => window.location.search,
    () => routerLocation.search,
  );

  const navigateSearch = useCallback((params: URLSearchParams) => {
    navigate({
      pathname: routerLocation.pathname,
      search: params.toString() ? `?${params}` : '',
    });
    window.dispatchEvent(new Event(FAMILY_QUERY_TAB_LOCATION_EVENT));
  }, [navigate, routerLocation.pathname]);

  return { search, navigateSearch };
}
