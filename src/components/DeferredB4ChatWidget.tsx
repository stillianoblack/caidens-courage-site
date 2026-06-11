import React, { useCallback, useEffect, useState } from 'react';
import { ENABLE_B4_CHAT } from '../config/featureFlags';
import B4LauncherButton from './B4LauncherButton';
import { markAskB4OpenPending, OPEN_ASK_B4_EVENT, type OpenAskB4Detail } from '../lib/openAskB4';
import { logAskB4Debug } from '../lib/askB4Debug';
import './ask-b4-chat.css';

type B4ChatWidgetComponent = React.ComponentType;

let widgetModulePromise: Promise<{ default: B4ChatWidgetComponent }> | null = null;

function loadB4ChatWidgetModule(): Promise<{ default: B4ChatWidgetComponent }> {
  if (!widgetModulePromise) {
    widgetModulePromise = import('./B4ChatWidget');
  }
  return widgetModulePromise;
}

function DeferredB4ChatWidgetActive() {
  const [Widget, setWidget] = useState<B4ChatWidgetComponent | null>(null);
  const [loadError, setLoadError] = useState(false);

  const ensureWidgetLoaded = useCallback(() => {
    (window as Window & { __INIT_CHAT_RUNNING__?: boolean }).__INIT_CHAT_RUNNING__ = true;

    return loadB4ChatWidgetModule()
      .then((mod) => {
        setWidget(() => mod.default);
        setLoadError(false);
        (window as Window & { __INIT_CHAT_LOADED__?: boolean }).__INIT_CHAT_LOADED__ = true;
        logAskB4Debug('widget module loaded');
      })
      .catch((error) => {
        setLoadError(true);
        widgetModulePromise = null;
        // eslint-disable-next-line no-console
        console.error('[DeferredB4ChatWidget] Failed to load B-4 widget', error);
      })
      .finally(() => {
        (window as Window & { __INIT_CHAT_RUNNING__?: boolean }).__INIT_CHAT_RUNNING__ = false;
      });
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let idleId: number | null = null;

    const loadAfterPaint = () => {
      void ensureWidgetLoaded();
    };

    if ('requestIdleCallback' in window) {
      idleId = (
        window as Window & {
          requestIdleCallback: (callback: () => void, options?: { timeout?: number }) => number;
        }
      ).requestIdleCallback(loadAfterPaint, { timeout: 2500 });
    } else {
      timeoutId = globalThis.setTimeout(loadAfterPaint, 1500);
    }

    return () => {
      if (timeoutId !== null) globalThis.clearTimeout(timeoutId);
      if (idleId !== null && 'cancelIdleCallback' in window) {
        (
          window as Window & {
            cancelIdleCallback: (id: number) => void;
          }
        ).cancelIdleCallback(idleId);
      }
    };
  }, [ensureWidgetLoaded]);

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const prompt = (event as CustomEvent<OpenAskB4Detail>).detail?.prompt?.trim();
      logAskB4Debug('open event received', { hasPrompt: Boolean(prompt) });
      markAskB4OpenPending();
      void ensureWidgetLoaded();
    };
    window.addEventListener(OPEN_ASK_B4_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_ASK_B4_EVENT, handleOpen);
  }, [ensureWidgetLoaded]);

  const handleLauncherClick = () => {
    logAskB4Debug('deferred launcher clicked');
    markAskB4OpenPending();
    window.dispatchEvent(new CustomEvent<OpenAskB4Detail>(OPEN_ASK_B4_EVENT));
    void ensureWidgetLoaded();
  };

  if (Widget) {
    return <Widget />;
  }

  if (loadError) {
    return (
      <B4LauncherButton
        className="askB4-launcher"
        onClick={() => void ensureWidgetLoaded()}
        aria-label="Retry Ask B-4"
      />
    );
  }

  return <B4LauncherButton className="askB4-launcher" onClick={handleLauncherClick} />;
}

/** Loads the full B-4 chat after first paint, with click-to-load as a fallback. */
const DeferredB4ChatWidget: React.FC = () => {
  if (!ENABLE_B4_CHAT) return null;
  return <DeferredB4ChatWidgetActive />;
};

export default DeferredB4ChatWidget;
