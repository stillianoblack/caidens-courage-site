import React, { useCallback, useRef, useState } from 'react';
import { safeOnce } from '../perf/defer';

type B4ChatWidgetComponent = React.ComponentType<unknown>;

/**
 * Hardened B-4 chat loader.
 *
 * Goals:
 * - Never block first paint or navigation.
 * - Do not load the chat bundle at startup.
 * - Load the real widget only when the user clicks "Chat with B-4".
 * - Ensure initialization happens at most once per tab.
 */
const DeferredB4ChatWidget: React.FC = () => {
  const [Widget, setWidget] = useState<B4ChatWidgetComponent | null>(null);
  const [shouldRenderWidget, setShouldRenderWidget] = useState(false);
  const loadOnceRef = useRef(false);

  const loadWidget = useCallback(() => {
    if (loadOnceRef.current) return;
    loadOnceRef.current = true;

    (window as any).__INIT_CHAT_RUNNING__ = true;

    import('./B4ChatWidget')
      .then((mod) => {
        setWidget(() => mod.default as B4ChatWidgetComponent);
        (window as any).__INIT_CHAT_LOADED__ = true;
      })
      .catch((error) => {
        // Fail silent for users; log for debugging.
        // Chat should never break the main app.
        // eslint-disable-next-line no-console
        console.error('[DeferredB4ChatWidget] Failed to load B-4 widget', error);
      })
      .finally(() => {
        (window as any).__INIT_CHAT_RUNNING__ = false;
      });
  }, []);

  const handleLauncherClick = () => {
    setShouldRenderWidget(true);
    safeOnce('b4-chat-load', () => {
      loadWidget();
    });
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

