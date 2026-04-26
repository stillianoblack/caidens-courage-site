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
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 h-14 px-4 sm:px-5 rounded-full bg-[#050B18]/95 text-white font-bold border border-golden-500/60 shadow-[0_0_0_1px_rgba(240,206,110,0.14),0_14px_36px_-18px_rgba(240,206,110,0.55)] hover:border-golden-500/80 hover:shadow-[0_0_0_1px_rgba(240,206,110,0.18),0_18px_44px_-18px_rgba(240,206,110,0.7)] transition-all duration-200 flex items-center gap-3"
      aria-label="Talk to B-4"
    >
      <img
        src="/images/icons/B4_Chat_Icon.webp"
        alt=""
        aria-hidden="true"
        className="h-[42px] w-auto object-contain flex-shrink-0"
        decoding="async"
      />
      <span className="leading-none">Talk to B-4</span>
      <span className="ml-1 w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-golden-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        </svg>
      </span>
    </button>
  );
};

export default DeferredB4ChatWidget;

