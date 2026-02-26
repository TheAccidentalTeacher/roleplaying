'use client';

import { useRef, useEffect } from 'react';
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
}

export default function ChatArea({
  messages,
  isLoading = false,
  streamingContent,
  onActionClick,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

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

      {/* Message list */}
      <div className="max-w-3xl mx-auto space-y-1">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
            onActionClick={onActionClick}
          />
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
    </div>
  );
}
