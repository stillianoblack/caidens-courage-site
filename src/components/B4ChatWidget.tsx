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

    try {
      const response = await fetch("/.netlify/functions/b4-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      abortControllerRef.current = null;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData?.error || errorData?.message;
        throw new Error(msg ? `code ${response.status}: ${msg}` : `code ${response.status}`);
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
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-golden-500 hover:bg-golden-400 text-navy-500 font-bold py-3 px-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 group"
        aria-label="Chat with B-4"
        style={{ boxShadow: '0 4px 12px rgba(240, 206, 110, 0.4)' }}
      >
        <span className="text-lg">💬</span>
        <span>Chat with B-4</span>
      </button>

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
            className={`fixed bottom-0 right-0 z-50 bg-white rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
              isOpen ? 'translate-y-0' : 'translate-y-full sm:translate-y-0 sm:translate-x-full'
            }`}
            style={{
              height: window.innerWidth < 640 ? '90vh' : '520px',
              width: window.innerWidth < 640 ? '100%' : '380px',
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="b4-chat-title"
          >
            {/* Header */}
            <div className="bg-navy-500 text-white px-4 py-3 rounded-t-2xl sm:rounded-tl-2xl sm:rounded-tr-none flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                {/* B-4 Avatar */}
                <div className="w-10 h-10 rounded-full bg-golden-500 flex items-center justify-center overflow-hidden border-2 border-white flex-shrink-0">
                  <img
                    src="/images/B-4@4x-100.webp"
                    alt="B-4"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.textContent = 'B-4';
                        parent.className = 'w-10 h-10 rounded-full bg-golden-500 flex items-center justify-center text-navy-500 font-bold text-sm border-2 border-white flex-shrink-0';
                      }
                    }}
                  />
                </div>
                <div>
                  <h2 id="b4-chat-title" className="font-display text-lg font-bold">Chat with B-4</h2>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                aria-label="Close chat"
              >
                <span className="text-2xl leading-none">×</span>
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-white">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                      message.role === 'user'
                        ? 'bg-golden-500 text-navy-500 rounded-br-sm'
                        : 'bg-navy-100 text-navy-700 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-navy-100 text-navy-700 rounded-2xl rounded-bl-sm px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 pt-2 pb-2 flex flex-wrap gap-2 bg-white border-t border-navy-100">
                {QUICK_SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs px-3 py-1.5 bg-navy-50 hover:bg-navy-100 text-navy-700 rounded-full transition-colors border border-navy-200"
                    aria-label={`Ask: ${suggestion}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-navy-200 bg-white px-4 py-3 flex-shrink-0">
              <form onSubmit={handleFormSubmit} className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask B-4 something…"
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 px-4 py-2.5 rounded-full border-2 border-navy-300 focus:border-navy-500 focus:outline-none text-navy-700 placeholder-navy-400 disabled:opacity-50 disabled:cursor-not-allowed resize-none text-sm leading-relaxed"
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
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-navy-300 disabled:cursor-not-allowed text-white rounded-full w-11 h-11 flex items-center justify-center transition-colors shadow-md flex-shrink-0"
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
              <p className="text-xs text-navy-500 mt-1.5 px-1">
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
