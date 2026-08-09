import React from 'react';
import PortalRouteLoader from './portal/PortalRouteLoader';

/**
 * Global branded route transition. Reuses the approved Focus Flame loader so
 * lazy destinations never reveal an intermediate skeleton screen.
 */
const NavigationLoader: React.FC = () => (
  <PortalRouteLoader message="Loading Focus Flame Academy..." academy fullScreen />
);

export default NavigationLoader;
