import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ensureFacilitatorPortalAccess, ensureFamilyPortalAccess } from '../config/blueRibbonPortalAccess';
import type { AskB4Action } from '../data/askB4Knowledge';
import { answerAskB4Question } from '../lib/askB4Answer';
import {
  ASK_B4_DISCLAIMERS,
  ASK_B4_MODE_LABELS,
  ASK_B4_MODES,
  ASK_B4_STARTER_PROMPTS,
  type AskB4StarterPrompt,
  detectAskB4Mode,
  getAskB4Welcome,
  type AskB4Mode,
} from '../lib/askB4Mode';
import { trackEvent } from '../lib/analytics';
import { consumeAskB4OpenPending, OPEN_ASK_B4_EVENT, type OpenAskB4Detail } from '../lib/openAskB4';
import { logAskB4Debug } from '../lib/askB4Debug';
import B4LauncherButton from './B4LauncherButton';
import './ask-b4-chat.css';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  actions?: AskB4Action[];
};

function AskB4ActionButtons({
  actions,
  onNavigate,
}: {
  actions: AskB4Action[];
  onNavigate: (action: AskB4Action) => void;
}) {
  if (actions.length === 0) return null;
  return (
    <div className="askB4-actions">
      {actions.map((action) => (
        <button
          key={`${action.label}-${action.href}`}
          type="button"
          className="askB4-actionBtn"
          onClick={() => onNavigate(action)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

const ASK_B4_MOBILE_MQ = '(max-width: 639px)';

const B4ChatWidget: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [mode, setMode] = useState<AskB4Mode>(() => detectAskB4Mode(location.pathname));
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const resetConversation = useCallback((nextMode: AskB4Mode) => {
    setMessages([
      {
        role: 'assistant',
        content: getAskB4Welcome(nextMode),
      },
    ]);
  }, []);

  const openAssistant = useCallback(() => {
    const nextMode = detectAskB4Mode(location.pathname);
    logAskB4Debug('openAssistant', {
      isOpenBefore: isOpen,
      isLoading,
      messageCount: messages.length,
    });
    setIsLoading(false);
    setInputValue('');
    setMode(nextMode);
    if (messages.length === 0) {
      resetConversation(nextMode);
    }
    setIsOpen(true);
    trackEvent('ask_b4_opened');
  }, [isLoading, isOpen, location.pathname, messages.length, resetConversation]);

  const closeAssistant = useCallback(() => {
    logAskB4Debug('closeAssistant', {
      isOpenBefore: isOpen,
      isLoading,
      messageCount: messages.length,
    });
    setIsOpen(false);
    setIsLoading(false);
    document.body.removeAttribute('data-ask-b4-open');
    document.body.style.overflow = '';
  }, [isLoading, isOpen, messages.length]);

  const handleLauncherClick = useCallback(() => {
    logAskB4Debug('launcher clicked', { isOpen, isLoading });
    if (isOpen) {
      closeAssistant();
      return;
    }
    openAssistant();
  }, [closeAssistant, isLoading, isOpen, openAssistant]);

  useEffect(() => {
    if (consumeAskB4OpenPending()) {
      openAssistant();
    }
  }, [openAssistant]);

  useEffect(() => {
    if (!isOpen) return;
    setMode(detectAskB4Mode(location.pathname));
  }, [isOpen, location.pathname]);

  useEffect(() => {
    const mq = window.matchMedia(ASK_B4_MOBILE_MQ);
    const syncViewport = () => setIsMobileViewport(mq.matches);
    syncViewport();
    mq.addEventListener('change', syncViewport);
    return () => mq.removeEventListener('change', syncViewport);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      document.body.removeAttribute('data-ask-b4-open');
      return;
    }
    document.body.setAttribute('data-ask-b4-open', 'true');
    return () => document.body.removeAttribute('data-ask-b4-open');
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isOpen, messages]);

  useEffect(() => {
    if (!isOpen) return;
    const isMobile = window.matchMedia('(max-width: 639px)').matches;
    if (!isMobile) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !drawerRef.current || typeof window === 'undefined') return;
    const isMobile = window.matchMedia(ASK_B4_MOBILE_MQ).matches;
    if (!isMobile) return;

    const drawer = drawerRef.current;
    const vv = window.visualViewport;
    if (!vv) return;

    const launcherClearancePx = 92;

    const syncDrawerHeight = () => {
      const insetTop = Math.max(0, vv.offsetTop);
      const visibleHeight = vv.height;
      const maxHeight = visibleHeight - insetTop - launcherClearancePx;
      drawer.style.maxHeight = `${Math.max(200, maxHeight)}px`;
      drawer.style.top = insetTop > 0 ? `${insetTop}px` : '';
    };

    syncDrawerHeight();
    vv.addEventListener('resize', syncDrawerHeight);
    vv.addEventListener('scroll', syncDrawerHeight);
    return () => {
      vv.removeEventListener('resize', syncDrawerHeight);
      vv.removeEventListener('scroll', syncDrawerHeight);
      drawer.style.maxHeight = '';
      drawer.style.top = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAssistant();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeAssistant, isOpen]);

  const pendingPromptRef = useRef<string | null>(null);

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const prompt = (event as CustomEvent<OpenAskB4Detail>).detail?.prompt?.trim();
      pendingPromptRef.current = prompt || null;
      openAssistant();
    };
    window.addEventListener(OPEN_ASK_B4_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_ASK_B4_EVENT, handleOpen);
  }, [openAssistant]);

  const handleActionNavigate = useCallback(
    (action: AskB4Action) => {
      ensureFacilitatorPortalAccess();
      ensureFamilyPortalAccess();
      if (action.grantFamilyAccess) {
        ensureFamilyPortalAccess();
      }
      closeAssistant();
      navigate(action.href);
    },
    [closeAssistant, navigate],
  );

  const handleModeChange = (nextMode: AskB4Mode) => {
    setMode(nextMode);
    resetConversation(nextMode);
  };

  const sendMessage = async (rawText?: string) => {
    const text = (rawText ?? inputValue).trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    trackEvent('ask_b4_question_submitted', { question_length: text.length });
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInputValue('');

    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      const response = answerAskB4Question(text, mode, location.pathname);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer,
          actions: response.actions,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !pendingPromptRef.current) return;
    const prompt = pendingPromptRef.current;
    pendingPromptRef.current = null;
    void sendMessage(prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire queued prompt once when panel opens
  }, [isOpen]);

  const handleStarterClick = (starter: AskB4StarterPrompt) => {
    if (starter.href) {
      ensureFacilitatorPortalAccess();
      ensureFamilyPortalAccess();
      closeAssistant();
      navigate(starter.href);
      return;
    }
    void sendMessage(starter.text);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  if (typeof window !== 'undefined' && (window as Window & { __SAFE_MODE__?: boolean }).__SAFE_MODE__) {
    return null;
  }

  return (
    <div
      className={`askB4-root${isOpen ? ' is-open' : ''}`}
      data-ask-b4-open={isOpen ? 'true' : undefined}
    >
      <B4LauncherButton
        className="askB4-launcher"
        onClick={handleLauncherClick}
        ariaExpanded={isOpen}
      />

      {isOpen ? (
        <>
          {isMobileViewport ? (
            <div
              className="askB4-backdrop"
              onClick={closeAssistant}
              aria-hidden="true"
            />
          ) : null}

          <div
            ref={drawerRef}
            className="askB4-drawer askB4-panel b4-chat-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ask-b4-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="askB4-header">
              <div className="askB4-headerMain">
                <div className="askB4-avatarWrap" aria-hidden="true">
                  <img
                    src="/images/icons/B4_Chat_Icon.webp"
                    alt=""
                    className="askB4-avatar"
                    decoding="async"
                  />
                </div>
                <div>
                  <h2 id="ask-b4-title" className="askB4-title">
                    Ask B-4
                  </h2>
                  <p className="askB4-subtitle">
                    Your Focus Flame guide for games, activities, and family support.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="askB4-closeBtn"
                onClick={closeAssistant}
                aria-label="Close Ask B-4"
              >
                ×
              </button>
            </header>

            <div className="askB4-modeRow" role="tablist" aria-label="Ask B-4 mode">
              {ASK_B4_MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  className={`askB4-modePill${mode === m ? ' askB4-modePill--active' : ''}`}
                  onClick={() => handleModeChange(m)}
                >
                  {ASK_B4_MODE_LABELS[m]}
                </button>
              ))}
            </div>

            <div className="askB4-body">
              <div className="askB4-messages">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`askB4-messageRow askB4-messageRow--${message.role}`}
                >
                  <div className={`askB4-bubble askB4-bubble--${message.role}`}>
                    <p className="askB4-bubbleText">{message.content}</p>
                    {message.role === 'assistant' && message.actions?.length ? (
                      <AskB4ActionButtons actions={message.actions} onNavigate={handleActionNavigate} />
                    ) : null}
                  </div>
                </div>
              ))}

              {isLoading ? (
                <div className="askB4-messageRow askB4-messageRow--assistant">
                  <div className="askB4-bubble askB4-bubble--assistant">
                    <div className="askB4-typing" aria-label="B-4 is thinking">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              ) : null}

              <div ref={messagesEndRef} />
              </div>

              {messages.length <= 1 && !isLoading ? (
                <div className="askB4-starters">
                  {ASK_B4_STARTER_PROMPTS[mode].map((starter) => (
                    <button
                      key={starter.text}
                      type="button"
                      className={`askB4-starterBtn${starter.href ? ' askB4-starterBtn--link' : ''}`}
                      onClick={() => handleStarterClick(starter)}
                    >
                      {starter.text}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <footer className="askB4-footer">
              <form onSubmit={handleFormSubmit} className="askB4-form">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about games, activities, downloads, or focus skills…"
                  disabled={isLoading}
                  rows={2}
                  className="askB4-input"
                  aria-label="Ask B-4 a question"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="askB4-sendBtn"
                  aria-label="Send"
                >
                  {isLoading ? '…' : '↑'}
                </button>
              </form>
              <p className="askB4-disclaimer">{ASK_B4_DISCLAIMERS[mode]}</p>
            </footer>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default B4ChatWidget;
