import React, { useCallback, useEffect, useRef, useState } from 'react';
import { afterPaint } from '../lib/afterPaint';

type B4ChatWidgetComponent = React.ComponentType<unknown>;

/**
 * Hardened B-4 chat loader.
 *
 * Goals:
 * - Never block first paint or navigation.
 * - Do not load the chat bundle at startup.
 * - Load the real widget only:
 *     - when the user clicks "Chat with B-4", OR
 *     - after first paint + ~3s idle (preload only, without opening UI).
 * - Ensure initialization happens at most once per tab.
 */
const DeferredB4ChatWidget: React.FC = () => {
  const [Widget, setWidget] = useState<B4ChatWidgetComponent | null>(null);
  const [shouldRenderWidget, setShouldRenderWidget] = useState(false);
  const loadOnceRef = useRef(false);

  const loadWidget = useCallback(() => {
    if (loadOnceRef.current) return;
    loadOnceRef.current = true;

    import('./B4ChatWidget')
      .then((mod) => {
        setWidget(() => mod.default as B4ChatWidgetComponent);
      })
      .catch((error) => {
        // Fail silent for users; log for debugging.
        // Chat should never break the main app.
        // eslint-disable-next-line no-console
        console.error('[DeferredB4ChatWidget] Failed to load B-4 widget', error);
      });
  }, []);

  // Idle-time preload only: after first paint, wait ~3s then load the bundle,
  // but do NOT open the UI. This keeps first interaction fast while avoiding
  // any work on the initial critical path.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    afterPaint(() => {
      window.setTimeout(() => {
        loadWidget();
      }, 3000);
    });
  }, [loadWidget]);

  const handleLauncherClick = () => {
    setShouldRenderWidget(true);
    loadWidget();
  };

  // Once the real widget bundle is loaded and the user has expressed intent,
  // render the full B-4 experience (which includes its own floating button).
  if (Widget && shouldRenderWidget) {
    return <Widget />;
  }

  // Lightweight launcher button shown before the full widget is loaded.
  // This button has no network side effects; it only triggers the lazy import.
  return (
    <button
      onClick={handleLauncherClick}
      className="fixed bottom-6 right-6 z-50 bg-golden-500 hover:bg-golden-400 text-navy-500 font-bold py-3 px-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 group"
      aria-label="Chat with B-4"
      style={{ boxShadow: '0 4px 12px rgba(240, 206, 110, 0.4)' }}
    >
      <span className="text-lg">💬</span>
      <span>Chat with B-4</span>
    </button>
  );
};

export default DeferredB4ChatWidget;

