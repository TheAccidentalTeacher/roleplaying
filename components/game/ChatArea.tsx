'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import { Spinner } from '@/components/ui';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  streamingContent?: string;
  onActionClick?: (action: string) => void;
  onRetry?: () => void;
}

export default function ChatArea({
  messages,
  isLoading = false,
  streamingContent,
  onActionClick,
  onRetry,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Auto-scroll to bottom on new messages (only if already near bottom)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    // Auto-scroll if user is within 150px of the bottom
    if (distFromBottom < 150) {
      scrollToBottom();
    }
  }, [messages, streamingContent, scrollToBottom]);

  // Detect scroll position to show/hide "scroll to bottom" button
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distFromBottom > 200);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#334155 transparent',
      }}
    >
      {/* Welcome message if no messages */}
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-fadeIn">
          <div className="text-6xl">⚔️</div>
          <h2 className="text-xl font-cinzel text-amber-400">
            Your Adventure Awaits
          </h2>
          <p className="text-sm text-slate-500 max-w-md">
            The Dungeon Master is preparing your world. Describe what you want
            to do, and the story will unfold before you.
          </p>
        </div>
      )}

      {/* Onboarding tips — show after first DM message for new players */}
      {messages.length >= 1 && messages.length <= 3 && !isLoading && !streamingContent && (
        <div className="max-w-3xl mx-auto mb-4">
          <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl px-4 py-3 text-xs text-sky-300/80 space-y-1.5 animate-fadeIn">
            <p className="font-semibold text-sky-300">💡 Quick Tips</p>
            <p>• Type anything — <span className="text-slate-400 italic">&quot;I open the door&quot;</span>, <span className="text-slate-400 italic">&quot;I talk to the innkeeper&quot;</span>, <span className="text-slate-400 italic">&quot;I search for traps&quot;</span></p>
            <p>• Use the <span className="text-sky-400">action buttons</span> below for common actions like Attack, Search, or Rest</p>
            <p>• Click <span className="text-sky-400">numbered choices</span> or <span className="text-sky-400">🎲 dice buttons</span> when they appear in the story</p>
            <p>• Your HP ❤️ and gold 💰 are tracked in the top bar</p>
          </div>
        </div>
      )}

      {/* Message list */}
      <div className="max-w-3xl mx-auto space-y-1">
        {messages.map((msg, idx) => (
          <div key={msg.id}>
            <MessageBubble
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
              onActionClick={onActionClick}
            />
            {/* Retry button after an error message */}
            {msg.id.startsWith('msg-error-') && onRetry && idx === messages.length - 1 && (
              <div className="flex justify-center mt-2 mb-4">
                <button
                  onClick={onRetry}
                  className="px-4 py-2 text-sm bg-slate-800 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all flex items-center gap-2"
                >
                  🔄 Try again
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Streaming response */}
        {streamingContent && (
          <MessageBubble
            role="assistant"
            content={streamingContent}
          />
        )}

        {/* Loading indicator */}
        {isLoading && !streamingContent && (
          <div className="flex items-center gap-3 my-4 pl-2">
            <Spinner size="sm" />
            <span className="text-sm text-slate-500 italic animate-pulse">
              The Dungeon Master is writing...
            </span>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="sticky bottom-4 float-right mr-2 w-9 h-9 bg-slate-800 border border-slate-600 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white shadow-lg transition-all animate-fadeIn z-10"
          title="Scroll to bottom"
        >
          ↓
        </button>
      )}
    </div>
  );
}
