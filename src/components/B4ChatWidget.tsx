import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_SUGGESTIONS = [
  "How do I use these in class?",
  "Are resources free?",
  "Best calm-down routine?",
  "What is Camp Courage?",
  "Printables for ages 7–12?",
  "How do I request educator access?"
];

const B4ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm B-4 — here to help with Camp Courage, resources, and SEL tools. Ask me anything."
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [isOpen, messages, scrollToBottom]);

  // Abort in-flight B-4 request on unmount (e.g. user navigates away) to avoid setState after unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, []);

  // Focus management and keyboard shortcuts
  useEffect(() => {
    if (isOpen) {
      // Focus input when drawer opens
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Focus trapping and Esc key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      // Focus trapping: if Tab is pressed and focus leaves the drawer, bring it back
      if (e.key === 'Tab' && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (typeof window !== 'undefined' && (window as any).__SAFE_MODE__) return null;

  // Single send path - all sends must go through this function
  const sendMessage = async (rawText?: string) => {
    console.log("B4 SEND TRIGGERED");

    // Get text from argument or input value
    const text = (rawText ?? inputValue).trim();

    // Guard: prevent sending if empty
    if (!text) return;

    // Guard: prevent sending if already sending (sending lock) — temporarily commented for debugging
    // if (isSendingRef.current || isLoading) return;

    // Debug log
    console.log('[B4ChatWidget] sending:', text);

    // Set sending lock and loading UI immediately so the button updates right away
    isSendingRef.current = true;
    setIsLoading(true);

    const userMessage: Message = {
      role: 'user',
      content: text
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Yield one frame so the loading state can paint before we block on the network
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const endpoint = "/.netlify/functions/b4-chat";
    const history = [...messages, userMessage].map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      abortControllerRef.current = null;

      if (!response.ok) {
        const status = response.status;
        let displayMessage: string;
        if (status === 404) {
          displayMessage = "B-4 is offline right now (server not found).";
        } else if (status === 500) {
          displayMessage = "B-4 needs a server key configured.";
        } else {
          const errorData = await response.json().catch(() => ({}));
          const msg = errorData?.error || errorData?.message;
          displayMessage = msg ? `B-4 couldn't connect (${status}): ${msg}` : `B-4 couldn't connect (code ${status}).`;
        }
        setMessages((prev) => [...prev, { role: "assistant", content: displayMessage }]);
        return;
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply || "I'm not sure how to respond to that. Can you try asking in a different way?"
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      clearTimeout(timeoutId);
      abortControllerRef.current = null;
      console.error('[B4ChatWidget] Error:', error);

      let displayMessage: string;
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          displayMessage = "B-4 couldn't connect (timeout).";
        } else {
          const codeMatch = error.message.match(/code (\d+)(?::\s*(.+))?/);
          const code = codeMatch ? codeMatch[1] : '???';
          const detail = codeMatch?.[2]?.trim();
          displayMessage = detail
            ? `B-4 couldn't connect (${code}): ${detail}`
            : `B-4 couldn't connect (code ${code}).`;
        }
      } else {
        displayMessage = "B-4 couldn't connect (code ???).";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: displayMessage }]);
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
      isSendingRef.current = false; // Release sending lock
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent Enter from submitting if already sending
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && !isSendingRef.current) {
        sendMessage();
      }
    }
    // Shift+Enter allows newline (default behavior)
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoading && !isSendingRef.current) {
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Suggestion click should ONLY call sendMessage with explicit text
    if (!isLoading && !isSendingRef.current) {
      sendMessage(suggestion);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
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
      )}

      {/* Chat Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            ref={drawerRef}
            className={`b4-chat-drawer fixed bottom-0 right-0 z-50 bg-[#050B18] rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none shadow-2xl flex flex-col border border-white/10 transition-transform duration-300 ease-out ${
              isOpen ? 'translate-y-0' : 'translate-y-full sm:translate-y-0 sm:translate-x-full'
            }`}
            style={{
              height: '520px',
              width: '380px',
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="b4-chat-title"
          >
            {/* Header */}
            <div className="bg-[#071426]/80 text-white px-4 py-3 rounded-t-2xl sm:rounded-tl-2xl sm:rounded-tr-none flex items-center justify-between flex-shrink-0 border-b border-golden-500/25">
              <div className="flex items-center gap-3">
                {/* B-4 Avatar */}
                <img
                  src="/images/icons/B4_Chat_Icon.webp"
                  alt="B-4"
                  className="h-10 w-auto object-contain flex-shrink-0"
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <h2 id="b4-chat-title" className="font-display text-lg font-bold text-white/95">Chat with B-4</h2>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-11 h-11 sm:w-9 sm:h-9 rounded-full hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-white/90"
                aria-label="Close chat"
              >
                <span className="text-2xl leading-none">×</span>
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#050B18]">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                      message.role === 'user'
                        ? 'bg-[#071426]/80 text-white/95 border border-golden-500/30 rounded-br-sm'
                        : 'bg-[#0B1E3A]/80 text-white/95 border border-white/10 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#0B1E3A]/80 text-white/90 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-golden-500/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-golden-500/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-golden-500/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 pt-2 pb-2 flex flex-wrap gap-2 bg-[#050B18] border-t border-white/10">
                {QUICK_SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs px-3 py-1.5 bg-[#071426]/60 hover:bg-[#071426]/80 text-white/90 rounded-full transition-colors border border-golden-500/25"
                    aria-label={`Ask: ${suggestion}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-white/10 bg-[#071426]/70 px-4 py-3 flex-shrink-0" style={{ position: 'sticky', bottom: 0 }}>
              <form onSubmit={handleFormSubmit} className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask B-4 something…"
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 px-4 py-2.5 rounded-full border border-golden-500/35 focus:border-golden-500 focus:outline-none bg-[#050B18]/70 text-white/90 placeholder-white/50 disabled:opacity-50 disabled:cursor-not-allowed resize-none text-sm leading-relaxed"
                  style={{ 
                    minHeight: '44px',
                    maxHeight: '120px',
                    overflowY: 'auto'
                  }}
                  aria-label="Message input"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading || isSendingRef.current}
                  className="ml-3 bg-gradient-to-br from-[#F6D06F] via-[#E6B94C] to-[#C8922E] hover:scale-105 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed text-[#0B1A2B] rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 ease-out shadow-[0_0_12px_rgba(230,185,76,0.35)] hover:shadow-[0_0_18px_rgba(230,185,76,0.5)] flex-shrink-0"
                  aria-label={isLoading ? 'Sending…' : 'Send message'}
                >
                  {isLoading ? (
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden />
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  )}
                </button>
              </form>
              <p className="text-xs text-white/50 mt-1.5 px-1">
                Press Enter to send, Shift+Enter for newline
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default B4ChatWidget;
