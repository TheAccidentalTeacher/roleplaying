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
  onSpeak?: (text: string, messageId: string) => void;
  ttsState?: { isSpeaking: boolean; isPaused: boolean; isLoading: boolean };
  activeSpeakingId?: string | null;
  onPauseTTS?: () => void;
  onResumeTTS?: () => void;
  onStopTTS?: () => void;
  feedbackState?: Record<string, 'up' | 'down'>;
  onFeedback?: (messageId: string, rating: 'up' | 'down') => void;
}

export default function ChatArea({
  messages,
  isLoading = false,
  streamingContent,
  onActionClick,
  onRetry,
  onSpeak,
  ttsState,
  activeSpeakingId,
  onPauseTTS,
  onResumeTTS,
  onStopTTS,
  feedbackState,
  onFeedback,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  // Track which messages have been spoken at least once (so we can show "Replay" instead of "Listen")
  const [playedIds, setPlayedIds] = useState<Set<string>>(new Set());

  const triggerSpeak = useCallback((text: string, id: string) => {
    setPlayedIds(prev => new Set([...prev, id]));
    onSpeak?.(text, id);
  }, [onSpeak]);

  // Also catch auto-played messages (started by page.tsx, not through onSpeak)
  useEffect(() => {
    if (activeSpeakingId && ttsState?.isSpeaking) {
      setPlayedIds(prev => {
        if (prev.has(activeSpeakingId)) return prev;
        return new Set([...prev, activeSpeakingId]);
      });
    }
  }, [activeSpeakingId, ttsState?.isSpeaking]);

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
            {/* TTS speak button on DM messages */}
            {msg.role === 'assistant' && !msg.id.startsWith('msg-error-') && onSpeak && (() => {
              const isThisMsg = activeSpeakingId === msg.id;
              const isActive = isThisMsg && (ttsState?.isSpeaking || ttsState?.isPaused || ttsState?.isLoading);
              const wasPlayed = playedIds.has(msg.id);
              return (
                <div className="flex items-center gap-1.5 mt-1 mb-2 pl-7">
                  {/* Primary button: Listen / Pause / Resume / Loading */}
                  <button
                    onClick={() => {
                      if (isThisMsg && ttsState?.isSpeaking) {
                        onPauseTTS?.();
                      } else if (isThisMsg && ttsState?.isPaused) {
                        onResumeTTS?.();
                      } else if (isThisMsg && ttsState?.isLoading) {
                        onStopTTS?.();
                      } else {
                        triggerSpeak(msg.content, msg.id);
                      }
                    }}
                    className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                      isActive
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                        : wasPlayed && !isActive
                          ? 'bg-slate-800/50 border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700/50 hover:border-slate-500'
                          : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 hover:border-slate-600'
                    }`}
                    title={
                      isThisMsg && ttsState?.isSpeaking ? 'Pause narration' :
                      isThisMsg && ttsState?.isPaused   ? 'Resume narration' :
                      wasPlayed ? 'Replay with current voice' :
                      'Listen to this passage'
                    }
                  >
                    {isThisMsg && ttsState?.isLoading ? (
                      <><span className="animate-pulse">⏳</span> Loading…</>
                    ) : isThisMsg && ttsState?.isSpeaking ? (
                      <><span>⏸️</span> Pause</>
                    ) : isThisMsg && ttsState?.isPaused ? (
                      <><span>▶️</span> Resume</>
                    ) : wasPlayed ? (
                      <><span>🔁</span> Replay</>
                    ) : (
                      <><span>🔊</span> Listen</>
                    )}
                  </button>

                  {/* Stop button — only while active */}
                  {isActive && (
                    <button
                      onClick={() => onStopTTS?.()}
                      className="text-xs flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                      title="Stop"
                    >
                      ⏹️
                    </button>
                  )}

                  {/* Redo button — shown when active (restart with current voice) or when a different msg is speaking */}
                  {wasPlayed && !isActive && activeSpeakingId !== msg.id && (
                    <button
                      onClick={() => triggerSpeak(msg.content, msg.id)}
                      className="text-xs px-2 py-1.5 rounded-lg text-slate-600 hover:text-sky-400 hover:bg-slate-800/50 border border-transparent hover:border-slate-700 transition-all"
                      title="Re-narrate with current voice setting"
                    >
                      ↺
                    </button>
                  )}
                </div>
              );
            })()}
            {/* Thumbs feedback — DM messages only */}
            {msg.role === 'assistant' && !msg.id.startsWith('msg-error-') && onFeedback && (() => {
              const current = feedbackState?.[msg.id];
              return (
                <div className="flex items-center gap-1 mb-2 pl-7">
                  <button
                    onClick={() => onFeedback(msg.id, 'up')}
                    className={`text-xs px-1.5 py-1 rounded transition-all ${
                      current === 'up'
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                        : 'text-slate-600 hover:text-emerald-400 border border-transparent hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                    title="Good response"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => onFeedback(msg.id, 'down')}
                    className={`text-xs px-1.5 py-1 rounded transition-all ${
                      current === 'down'
                        ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                        : 'text-slate-600 hover:text-rose-400 border border-transparent hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                    title="Bad response"
                  >
                    👎
                  </button>
                </div>
              );
            })()}
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
