import React, { useCallback, useRef, useState } from 'react';
import B4LauncherButton from './B4LauncherButton';
import { safeOnce } from '../perf/defer';

type B4ChatWidgetComponent = React.ComponentType<{ defaultOpen?: boolean }>;

/**
 * Lazy-loads Ask B-4 on first click. Passes defaultOpen so one tap opens the drawer
 * (no second click after the bundle loads).
 */
const DeferredB4ChatWidget: React.FC = () => {
  const [Widget, setWidget] = useState<B4ChatWidgetComponent | null>(null);
  const [openOnMount, setOpenOnMount] = useState(false);
  const loadOnceRef = useRef(false);

  const loadWidget = useCallback(() => {
    if (loadOnceRef.current) return;
    loadOnceRef.current = true;

    (window as Window & { __INIT_CHAT_RUNNING__?: boolean }).__INIT_CHAT_RUNNING__ = true;

    import('./B4ChatWidget')
      .then((mod) => {
        setWidget(() => mod.default as B4ChatWidgetComponent);
        (window as Window & { __INIT_CHAT_LOADED__?: boolean }).__INIT_CHAT_LOADED__ = true;
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[DeferredB4ChatWidget] Failed to load B-4 widget', error);
      })
      .finally(() => {
        (window as Window & { __INIT_CHAT_RUNNING__?: boolean }).__INIT_CHAT_RUNNING__ = false;
      });
  }, []);

  const handleLauncherClick = () => {
    setOpenOnMount(true);
    safeOnce('b4-chat-load', () => {
      loadWidget();
    });
  };

  if (Widget) {
    return <Widget defaultOpen={openOnMount} />;
  }

  return <B4LauncherButton onClick={handleLauncherClick} />;
};

export default DeferredB4ChatWidget;
