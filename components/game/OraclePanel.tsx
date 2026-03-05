'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { WorldRecord } from '@/lib/types/world';
import type { Character } from '@/lib/types/character';
import type { Quest } from '@/lib/types/quest';
import type { NPC } from '@/lib/types/npc';
import type { CombatState } from '@/lib/types/combat';
import type { GameClock, Weather } from '@/lib/types/exploration';

interface OracleMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface OraclePanelProps {
  open: boolean;
  onClose: () => void;
  // Game state for context
  character: Character | null;
  world: WorldRecord | null;
  activeQuests: Quest[];
  knownNPCs: NPC[];
  combatState: CombatState | null;
  gameClock?: GameClock;
  weather?: Weather;
  // DM conversation for analysis
  dmMessages: { role: string; content: string }[];
}

const SUGGESTED_PROMPTS = [
  { label: '📊 Status report', text: 'Give me a full status report on my game — progression, context health, and what the DM seems to be tracking.' },
  { label: '🎭 Campaign arc', text: 'Where am I in the campaign arc? What acts/beats have I hit and what\'s coming next?' },
  { label: '🗺️ Undiscovered', text: 'What locations, companions, or quests exist in my world that I haven\'t found yet?' },
  { label: '🧠 DM analysis', text: 'Analyze the DM\'s recent messages. Is it maintaining continuity? Are there any inconsistencies?' },
  { label: '⚔️ Combat ready?', text: 'Am I prepared for upcoming challenges? What should I do to get stronger?' },
  { label: '🔍 Hidden lore', text: 'What hidden world lore, villain plans, or faction secrets exist that I don\'t know about yet?' },
];

export default function OraclePanel({
  open,
  onClose,
  character,
  world,
  activeQuests,
  knownNPCs,
  combatState,
  gameClock,
  weather,
  dmMessages,
}: OraclePanelProps) {
  const [messages, setMessages] = useState<OracleMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  // Focus input when panel opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const sendToOracle = useCallback(async (text: string) => {
    if (loading || !text.trim()) return;

    const userMsg: OracleMessage = {
      id: `oracle-${Date.now()}`,
      role: 'user',
      content: text.trim(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setStreaming('');

    try {
      const response = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          dmMessages: dmMessages.slice(-40), // Last 40 DM messages for analysis
          characterId: localStorage.getItem('rpg-character-id') || undefined,
          worldId: localStorage.getItem('rpg-world-id') || undefined,
          character: character || undefined,
          world: world || undefined,
          activeQuests,
          knownNPCs,
          combatState,
          gameClock,
          weather,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Oracle returned ${response.status}: ${errorBody.slice(0, 200)}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          fullResponse += chunk;
          setStreaming(fullResponse);
        }
      }

      setStreaming('');
      const assistantMsg: OracleMessage = {
        id: `oracle-${Date.now()}-reply`,
        role: 'assistant',
        content: fullResponse,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('[Oracle] Error:', err);
      const errorMsg: OracleMessage = {
        id: `oracle-error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Oracle connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, character, world, activeQuests, knownNPCs, combatState, gameClock, weather, dmMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendToOracle(input);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — slides from left */}
      <div className="relative w-full max-w-lg bg-slate-900 border-r border-purple-700/50 flex flex-col animate-slideRight shadow-2xl shadow-purple-900/30">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-purple-700/30 bg-slate-900/95">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔮</span>
            <div>
              <h2 className="text-sm font-cinzel font-bold text-purple-300">The Oracle</h2>
              <p className="text-[10px] text-slate-500">Game state analyst · Fourth wall breaker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 px-2 py-1 transition-colors"
            aria-label="Close Oracle"
          >
            ✕
          </button>
        </div>

        {/* Suggested Prompts — shown when no messages */}
        {messages.length === 0 && !streaming && (
          <div className="px-4 py-4 border-b border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-3">
              Ask me anything about your game
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => sendToOracle(prompt.text)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-full bg-purple-900/30 border border-purple-700/30 text-purple-300 hover:bg-purple-800/40 hover:border-purple-600/40 transition-all disabled:opacity-50"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${
                msg.role === 'user'
                  ? 'ml-auto max-w-[85%]'
                  : 'mr-auto max-w-[95%]'
              }`}
            >
              {msg.role === 'user' ? (
                <div className="bg-purple-900/40 border border-purple-700/30 rounded-lg px-3 py-2 text-sm text-purple-100">
                  {msg.content}
                </div>
              ) : (
                <div className="bg-slate-800/80 border border-slate-700/40 rounded-lg px-3 py-2 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  <span className="text-purple-400 text-xs font-semibold block mb-1">🔮 Oracle</span>
                  {msg.content}
                </div>
              )}
            </div>
          ))}

          {/* Streaming content */}
          {streaming && (
            <div className="mr-auto max-w-[95%]">
              <div className="bg-slate-800/80 border border-slate-700/40 rounded-lg px-3 py-2 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                <span className="text-purple-400 text-xs font-semibold block mb-1">🔮 Oracle</span>
                {streaming}
                <span className="inline-block w-1.5 h-4 bg-purple-400 ml-0.5 animate-pulse" />
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {loading && !streaming && (
            <div className="mr-auto">
              <div className="bg-slate-800/80 border border-slate-700/40 rounded-lg px-3 py-2 text-sm text-slate-400 flex items-center gap-2">
                <span className="text-purple-400 animate-pulse">🔮</span>
                <span>Consulting the Oracle...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick prompts — shown after conversation started */}
        {messages.length > 0 && !loading && (
          <div className="px-4 py-2 border-t border-slate-800/50 flex gap-2 overflow-x-auto scrollbar-hide">
            {SUGGESTED_PROMPTS.slice(0, 4).map((prompt) => (
              <button
                key={prompt.label}
                onClick={() => sendToOracle(prompt.text)}
                className="text-[10px] px-2 py-1 rounded-full bg-purple-900/20 border border-purple-800/20 text-purple-400 hover:bg-purple-800/30 transition-all whitespace-nowrap flex-shrink-0"
              >
                {prompt.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-purple-700/30 bg-slate-900/95">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the Oracle anything..."
              disabled={loading}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-600 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-sm font-semibold text-white transition-colors"
            >
              Ask
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
