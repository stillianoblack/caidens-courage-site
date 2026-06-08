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
  detectAskB4Mode,
  getAskB4Welcome,
  type AskB4Mode,
} from '../lib/askB4Mode';
import { trackEvent } from '../lib/analytics';
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

const B4ChatWidget: React.FC<{ defaultOpen?: boolean }> = ({ defaultOpen = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [mode, setMode] = useState<AskB4Mode>(() => detectAskB4Mode(location.pathname));
  const [messages, setMessages] = useState<Message[]>(() =>
    defaultOpen
      ? [{ role: 'assistant', content: getAskB4Welcome(detectAskB4Mode(location.pathname)) }]
      : [],
  );
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

  useEffect(() => {
    if (isOpen) {
      const detected = detectAskB4Mode(location.pathname);
      setMode(detected);
      resetConversation(detected);
    }
  }, [isOpen, location.pathname, resetConversation]);

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isOpen, messages]);

  useEffect(() => {
    if (!isOpen) return;
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
    const drawer = drawerRef.current;
    const vv = window.visualViewport;

    const syncDrawerHeight = () => {
      if (!vv) return;
      const insetTop = Math.max(0, vv.offsetTop);
      const visibleHeight = vv.height;
      drawer.style.maxHeight = `${visibleHeight - insetTop}px`;
      drawer.style.top = insetTop > 0 ? `${insetTop}px` : '';
    };

    if (vv) {
      syncDrawerHeight();
      vv.addEventListener('resize', syncDrawerHeight);
      vv.addEventListener('scroll', syncDrawerHeight);
      return () => {
        vv.removeEventListener('resize', syncDrawerHeight);
        vv.removeEventListener('scroll', syncDrawerHeight);
        drawer.style.maxHeight = '';
        drawer.style.top = '';
      };
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleActionNavigate = useCallback(
    (action: AskB4Action) => {
      ensureFacilitatorPortalAccess();
      ensureFamilyPortalAccess();
      if (action.grantFamilyAccess) {
        ensureFamilyPortalAccess();
      }
      navigate(action.href);
      setIsOpen(false);
    },
    [navigate],
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

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const response = answerAskB4Question(text, mode);
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: response.answer,
        actions: response.actions,
      },
    ]);
    setIsLoading(false);
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
    <>
      {!isOpen ? (
        <B4LauncherButton
          onClick={() => {
            trackEvent('ask_b4_opened');
            setIsOpen(true);
          }}
        />
      ) : null}

      {isOpen ? (
        <>
          <div
            className="askB4-backdrop"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            ref={drawerRef}
            className="askB4-drawer b4-chat-drawer"
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
                onClick={() => setIsOpen(false)}
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
                  {ASK_B4_STARTER_PROMPTS[mode].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="askB4-starterBtn"
                      onClick={() => void sendMessage(prompt)}
                    >
                      {prompt}
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
    </>
  );
};

export default B4ChatWidget;
