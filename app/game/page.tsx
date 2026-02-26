'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import type { Character as FullCharacter } from '@/lib/types/character';
import type { WorldRecord } from '@/lib/types/world';
import type { CombatState } from '@/lib/types/combat';
import TopBar from '@/components/game/TopBar';
import ChatArea from '@/components/game/ChatArea';
import InputBar from '@/components/game/InputBar';
import QuickActions from '@/components/game/QuickActions';
import CombatView from '@/components/game/CombatView';
import { User, Shield, Swords, BookOpen } from 'lucide-react';

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export default function GamePage() {
  const router = useRouter();
  const {
    // Legacy fields
    character,
    messages,
    addMessage,
    isLoading,
    setLoading,
    // New fields
    activeWorld,
    activeWorldId,
    setActiveWorld,
    setActiveCharacter,
    gameClock,
    weather,
    activeQuests,
    knownNPCs,
    combatState,
    updateLocation,
  } = useGameStore();

  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [fullCharacter, setFullCharacter] = useState<FullCharacter | null>(null);
  const [world, setWorld] = useState<WorldRecord | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load data from localStorage (set by WorldGenLoading) on mount
  useEffect(() => {
    // Try to load from localStorage first (fresh from character creation)
    const storedWorld = localStorage.getItem('rpg-active-world');
    const storedCharacter = localStorage.getItem('rpg-active-character');
    const storedOpeningScene = localStorage.getItem('rpg-opening-scene');
    const storedWorldId = localStorage.getItem('rpg-world-id');
    const storedCharId = localStorage.getItem('rpg-character-id');

    let loadedWorld: WorldRecord | null = null;
    let loadedChar: FullCharacter | null = null;

    if (storedWorld) {
      try {
        loadedWorld = JSON.parse(storedWorld);
        setWorld(loadedWorld);
        if (loadedWorld && storedWorldId) {
          setActiveWorld(loadedWorld, storedWorldId);
        }
      } catch { /* ignore */ }
    } else if (activeWorld) {
      loadedWorld = activeWorld;
      setWorld(activeWorld);
    }

    if (storedCharacter) {
      try {
        loadedChar = JSON.parse(storedCharacter);
        setFullCharacter(loadedChar);
        if (loadedChar) {
          setActiveCharacter(loadedChar);
        }
      } catch { /* ignore */ }
    }

    // If we have an opening scene and no messages yet, inject it
    if (storedOpeningScene && messages.length === 0) {
      const openingMsg: ChatMsg = {
        id: 'opening-scene',
        role: 'assistant',
        content: storedOpeningScene,
        timestamp: Date.now(),
      };
      setChatMessages([openingMsg]);
      addMessage({
        role: 'assistant',
        content: storedOpeningScene,
        timestamp: Date.now(),
      });
      // Update location from world if available
      if (loadedWorld?.geography?.[0]?.name) {
        updateLocation(loadedWorld.geography[0].name);
      }
      // Clear one-time localStorage
      localStorage.removeItem('rpg-opening-scene');
    } else if (messages.length > 0) {
      // Restore from persisted messages
      setChatMessages(
        messages.map((m, i) => ({
          id: `msg-${i}`,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        }))
      );
    }

    // Redirect if no character at all
    if (!storedCharacter && !character) {
      router.push('/character/new');
      return;
    }

    setInitialized(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync legacy messages → chatMessages when messages array grows
  useEffect(() => {
    if (!initialized) return;
    if (messages.length > chatMessages.length) {
      setChatMessages(
        messages.map((m, i) => ({
          id: `msg-${i}`,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        }))
      );
    }
  }, [messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(
    async (text: string) => {
      if (isLoading) return;

      const userMsg: ChatMsg = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };

      // Optimistic update
      setChatMessages((prev) => [...prev, userMsg]);
      addMessage({ role: 'user', content: text, timestamp: Date.now() });
      setLoading(true);
      setStreamingContent('');

      try {
        const apiMessages = [...messages, { role: 'user' as const, content: text, timestamp: Date.now() }].map(
          (m) => ({ role: m.role, content: m.content })
        );

        const response = await fetch('/api/dm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            characterId: localStorage.getItem('rpg-character-id') || undefined,
            worldId: localStorage.getItem('rpg-world-id') || activeWorldId || undefined,
            character: fullCharacter || undefined,
            world: world || undefined,
            activeQuests,
            knownNPCs,
            combatState,
            gameClock,
            weather,
          }),
        });

        if (!response.ok) throw new Error('Failed to get DM response');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            fullResponse += chunk;
            setStreamingContent(fullResponse);
          }
        }

        // Finalize message
        setStreamingContent('');
        const dmMsg: ChatMsg = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: fullResponse,
          timestamp: Date.now(),
        };
        setChatMessages((prev) => [...prev, dmMsg]);
        addMessage({
          role: 'assistant',
          content: fullResponse,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('DM Error:', error);
        setStreamingContent('');
        const errorMsg: ChatMsg = {
          id: `msg-error-${Date.now()}`,
          role: 'assistant',
          content:
            '*The magical connection to the Dungeon Master has been disrupted. The threads of fate resist your call. Try again...*',
          timestamp: Date.now(),
        };
        setChatMessages((prev) => [...prev, errorMsg]);
        addMessage({
          role: 'assistant',
          content: errorMsg.content,
          timestamp: Date.now(),
        });
      } finally {
        setLoading(false);
      }
    },
    [isLoading, messages, fullCharacter, world, activeQuests, knownNPCs, combatState, gameClock, weather, activeWorldId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleActionClick = (action: string) => {
    sendMessage(action);
  };

  // Handle combat ending — inject combat summary into chat
  const handleCombatEnd = useCallback(
    (endState: CombatState) => {
      if (endState.rewards) {
        const summary = [
          `**Combat ${endState.result === 'victory' ? 'Victory' : endState.result === 'fled' ? 'Escape' : 'Ended'}!**`,
          endState.rewards.xpEarned > 0 ? `✨ Gained ${endState.rewards.xpEarned} XP` : '',
          endState.rewards.goldFound > 0 ? `💰 Found ${endState.rewards.goldFound} gold` : '',
          endState.rewards.narrativeOutcome || '',
        ]
          .filter(Boolean)
          .join('\n\n');

        const combatMsg: ChatMsg = {
          id: `combat-end-${Date.now()}`,
          role: 'system',
          content: summary,
          timestamp: Date.now(),
        };
        setChatMessages((prev) => [...prev, combatMsg]);
        addMessage({ role: 'assistant', content: summary, timestamp: Date.now() });
      }
    },
    [addMessage]
  );

  // Is combat active?
  const inCombat = combatState && combatState.phase !== 'idle';

  // Show nothing until initialized
  if (!initialized) {
    return (
      <main className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-3 animate-fadeIn">
          <div className="text-4xl animate-pulse">⚔️</div>
          <p className="text-slate-500 text-sm">Loading your adventure...</p>
        </div>
      </main>
    );
  }

  // Derive display character info (prefer fullCharacter, fall back to legacy)
  const displayName = fullCharacter?.name || character?.name || 'Adventurer';
  const displayClass = fullCharacter?.class || character?.class || '';
  const displayLevel = fullCharacter?.level || character?.level || 1;
  const displayHP = fullCharacter
    ? fullCharacter.hitPoints
    : character?.hitPoints || { current: 10, max: 10 };

  return (
    <main className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Bar */}
      <TopBar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area + Input (or Combat View) */}
        <div className="flex-1 flex flex-col min-w-0">
          {inCombat && fullCharacter ? (
            <CombatView
              character={fullCharacter}
              onCombatEnd={handleCombatEnd}
            />
          ) : (
            <>
              <ChatArea
                messages={chatMessages}
                isLoading={isLoading}
                streamingContent={streamingContent || undefined}
                onActionClick={handleActionClick}
              />
              <QuickActions
                onAction={sendMessage}
                disabled={isLoading}
                compact
              />
              <InputBar onSend={sendMessage} disabled={isLoading} />
            </>
          )}
        </div>

        {/* Character Sidebar — Desktop */}
        <div className="hidden lg:flex w-72 xl:w-80 border-l border-slate-700/50 bg-slate-900/50 flex-col overflow-y-auto">
          <CharacterSidebar
            name={displayName}
            className={displayClass}
            level={displayLevel}
            hp={displayHP}
            character={fullCharacter}
            legacyCharacter={character}
          />
        </div>
      </div>

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="lg:hidden fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center shadow-lg"
        aria-label="Toggle character sheet"
      >
        <User className="w-5 h-5 text-sky-400" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSidebar(false)}
          />
          <div className="relative ml-auto w-80 max-w-[85vw] bg-slate-900 border-l border-slate-700 overflow-y-auto animate-slideUp">
            <div className="p-2 border-b border-slate-700 flex justify-between items-center">
              <span className="text-sm font-cinzel text-amber-400">
                Character Sheet
              </span>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-slate-500 hover:text-slate-300 px-2 py-1"
              >
                ✕
              </button>
            </div>
            <CharacterSidebar
              name={displayName}
              className={displayClass}
              level={displayLevel}
              hp={displayHP}
              character={fullCharacter}
              legacyCharacter={character}
            />
          </div>
        </div>
      )}
    </main>
  );
}

// ---- Inline Character Sidebar (to be extracted to its own component in Phase 2.4) ----
interface CharacterSidebarProps {
  name: string;
  className: string;
  level: number;
  hp: { current: number; max: number };
  character: FullCharacter | null;
  legacyCharacter: {
    stats: Record<string, number>;
    gold: number;
    inventory: string[];
  } | null;
}

function CharacterSidebar({
  name,
  className,
  level,
  hp,
  character,
  legacyCharacter,
}: CharacterSidebarProps) {
  const hpPercent = hp.max > 0 ? (hp.current / hp.max) * 100 : 100;
  const hpColor =
    hpPercent > 60 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-amber-500' : 'bg-red-500';

  // Ability scores (prefer full character)
  const abilities = character
    ? [
        { key: 'STR', val: character.abilityScores.str.score },
        { key: 'DEX', val: character.abilityScores.dex.score },
        { key: 'CON', val: character.abilityScores.con.score },
        { key: 'INT', val: character.abilityScores.int.score },
        { key: 'WIS', val: character.abilityScores.wis.score },
        { key: 'CHA', val: character.abilityScores.cha.score },
      ]
    : legacyCharacter
    ? Object.entries(legacyCharacter.stats).map(([k, v]) => ({
        key: k.slice(0, 3).toUpperCase(),
        val: v,
      }))
    : [];

  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Identity */}
      <div className="text-center space-y-1">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-2xl">
          ⚔️
        </div>
        <h3 className="font-cinzel text-amber-400 text-lg font-bold">{name}</h3>
        <p className="text-xs text-slate-400">
          Level {level} {className}
        </p>
      </div>

      {/* HP Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Shield className="w-3 h-3" /> HP
          </span>
          <span className="text-slate-300">
            {hp.current} / {hp.max}
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${hpColor} rounded-full transition-all duration-500`}
            style={{ width: `${Math.max(0, Math.min(100, hpPercent))}%` }}
          />
        </div>
      </div>

      {/* Mana Bar (if applicable) */}
      {character?.mana && character.mana.max > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">✨ Mana</span>
            <span className="text-slate-300">
              {character.mana.current} / {character.mana.max}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{
                width: `${(character.mana.current / character.mana.max) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Ability Scores */}
      <div>
        <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
          <Swords className="w-3 h-3" /> Abilities
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {abilities.map((a) => (
            <div
              key={a.key}
              className="bg-slate-800/60 rounded-lg p-2 text-center border border-slate-700/30"
            >
              <div className="text-[10px] text-slate-500 font-bold">{a.key}</div>
              <div className="text-lg font-bold text-slate-200">{a.val}</div>
              <div className="text-xs text-sky-400">{getModifier(a.val)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* XP */}
      {character && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">⭐ XP</span>
            <span className="text-slate-300">{character.xp}</span>
          </div>
        </div>
      )}

      {/* Gold */}
      <div className="flex items-center justify-between bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-700/30">
        <span className="text-xs text-slate-400">💰 Gold</span>
        <span className="text-amber-400 font-bold">
          {character?.gold ?? legacyCharacter?.gold ?? 0}
        </span>
      </div>

      {/* Quick Inventory */}
      <div>
        <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
          <BookOpen className="w-3 h-3" /> Inventory
        </h4>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {(character?.inventory || legacyCharacter?.inventory || []).map(
            (item, i) => (
              <div
                key={i}
                className="text-xs text-slate-400 bg-slate-800/30 rounded px-2 py-1"
              >
                • {item}
              </div>
            )
          )}
          {(character?.inventory || legacyCharacter?.inventory || []).length === 0 && (
            <p className="text-xs text-slate-600 italic">Empty</p>
          )}
        </div>
      </div>
    </div>
  );
}
